import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase'
import { extractTextFromPdf } from '@/lib/pdfExtract'
import { extrairDadosFatura } from '@/lib/analise/extrator'
import { analisarFatura } from '@/lib/analise/engine'

// Aumenta o timeout para 60s (Vercel Hobby suporta até 60s em API Routes)
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const clerkUser = await currentUser()
  if (!clerkUser) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const email = clerkUser.emailAddresses?.[0]?.emailAddress
  if (!email) return NextResponse.json({ error: 'Nenhum e-mail associado à conta Clerk.' }, { status: 400 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Erro ao ler o formulário.' }, { status: 400 })
  }

  const arquivo = formData.get('arquivo') as File | null
  if (!arquivo || arquivo.size === 0) return NextResponse.json({ error: 'Nenhum arquivo selecionado.' }, { status: 400 })
  if (arquivo.type !== 'application/pdf') return NextResponse.json({ error: 'Somente arquivos PDF são aceitos.' }, { status: 400 })
  if (arquivo.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'Arquivo muito grande. Máximo 10 MB.' }, { status: 400 })

  const bytes = await arquivo.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // ── 1. OCR + Extração ──────────────────────────────────────────────────────
  let textoOcr = ''
  let dadosExtraidos
  let resultado

  try {
    textoOcr = await extractTextFromPdf(buffer)
    dadosExtraidos = extrairDadosFatura(textoOcr)
    resultado = analisarFatura(dadosExtraidos)
  } catch (err) {
    console.error('[upload] OCR error:', err)
    return NextResponse.json({ error: 'Não foi possível ler o PDF. Verifique se o arquivo é uma fatura de energia válida.' }, { status: 422 })
  }

  // ── 2. Upsert usuário ──────────────────────────────────────────────────────
  const dbUser = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {},
    create: {
      clerkId: clerkUser.id,
      email,
      nome: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
    },
  })

  // ── 3. Determinar mês/ano ──────────────────────────────────────────────────
  const mesForm = parseInt(formData.get('mes') as string ?? '', 10)
  const anoForm = parseInt(formData.get('ano') as string ?? '', 10)
  const mesRef = mesForm > 0 && mesForm <= 12 ? mesForm : (dadosExtraidos.mesReferencia ?? new Date().getMonth() + 1)
  const anoRef = anoForm > 0 ? anoForm : (dadosExtraidos.anoReferencia ?? new Date().getFullYear())

  // ── 4. Encontrar ou criar Conta ────────────────────────────────────────────
  const contaIdForm = (formData.get('contaId') as string | null)?.trim() || null
  let contaId: string

  try {
    if (contaIdForm) {
      const contaExistente = await prisma.conta.findFirst({ where: { id: contaIdForm, userId: dbUser.id } })
      if (!contaExistente) return NextResponse.json({ error: 'Unidade não encontrada.' }, { status: 404 })
      contaId = contaExistente.id
    } else {
      const distribuidora = dadosExtraidos.distribuidora?.trim() || 'Desconhecida'
      const numeroCliente = dadosExtraidos.numeroCliente?.trim() || null
      const titular = dadosExtraidos.nomeCliente?.trim() || null

      const contaMatch = await prisma.conta.findFirst({
        where: { userId: dbUser.id, distribuidora, ...(numeroCliente ? { numeroCliente } : {}) },
      })

      if (contaMatch) {
        if (titular && !contaMatch.titular) {
          await prisma.conta.update({ where: { id: contaMatch.id }, data: { titular } })
        }
        contaId = contaMatch.id
      } else {
        const novaConta = await prisma.conta.create({
          data: { userId: dbUser.id, distribuidora, numeroCliente, titular },
        })
        contaId = novaConta.id
      }
    }
  } catch (err) {
    console.error('[upload] DB conta error:', err)
    return NextResponse.json({ error: 'Erro ao localizar/criar unidade consumidora.' }, { status: 500 })
  }

  // ── 5. Upload PDF ──────────────────────────────────────────────────────────
  const path = `faturas/${dbUser.id}/${contaId}/${anoRef}-${String(mesRef).padStart(2, '0')}-${Date.now()}.pdf`

  try {
    const { error: uploadError } = await supabaseAdmin.storage
      .from('faturas')
      .upload(path, buffer, { contentType: 'application/pdf', upsert: false })

    if (uploadError) {
      console.error('[upload] storage error:', uploadError)
      return NextResponse.json({ error: `Falha no upload: ${uploadError.message}` }, { status: 500 })
    }
  } catch (err) {
    console.error('[upload] storage exception:', err)
    return NextResponse.json({ error: 'Erro inesperado no upload do arquivo.' }, { status: 500 })
  }

  const { data: urlData } = supabaseAdmin.storage.from('faturas').getPublicUrl(path)
  const arquivoUrl = urlData.publicUrl

  // ── 6. Verificar duplicata e criar Fatura ──────────────────────────────────
  try {
    const duplicata = await prisma.fatura.findUnique({
      where: { contaId_mes_ano: { contaId, mes: mesRef, ano: anoRef } },
    })
    if (duplicata) {
      return NextResponse.json(
        { error: `Já existe uma fatura de ${String(mesRef).padStart(2, '0')}/${anoRef} para esta unidade.` },
        { status: 409 }
      )
    }

    const fatura = await prisma.fatura.create({
      data: {
        contaId,
        mes: mesRef,
        ano: anoRef,
        valorTotal: dadosExtraidos.valorTotal ?? 0,
        consumoKwh: dadosExtraidos.consumoKwh ?? null,
        arquivoUrl,
        textoOcr,
        dadosJson: { extraido: dadosExtraidos, resultado } as unknown as import('@prisma/client').Prisma.JsonObject,
        status: 'CONCLUIDA',
      },
    })

    return NextResponse.json({ redirectTo: `/dashboard/faturas/${fatura.id}` })
  } catch (err) {
    console.error('[upload] DB fatura error:', err)
    return NextResponse.json({ error: 'Erro ao salvar a fatura no banco de dados.' }, { status: 500 })
  }
}
