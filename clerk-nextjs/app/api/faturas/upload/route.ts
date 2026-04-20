import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase'

// Etapa 1: apenas salva o PDF e cria a fatura como PENDENTE (sem OCR).
// O OCR é feito em /api/faturas/[id]/processar chamado logo em seguida.
export const maxDuration = 30

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

  // ── 1. Upsert usuário ──────────────────────────────────────────────────────
  const dbUser = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {},
    create: {
      clerkId: clerkUser.id,
      email,
      nome: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
    },
  })

  // ── 2. Encontrar ou criar Conta ────────────────────────────────────────────
  const contaIdForm = (formData.get('contaId') as string | null)?.trim() || null
  let contaId: string

  try {
    if (contaIdForm) {
      const contaExistente = await prisma.conta.findFirst({ where: { id: contaIdForm, userId: dbUser.id } })
      if (!contaExistente) return NextResponse.json({ error: 'Unidade não encontrada.' }, { status: 404 })
      contaId = contaExistente.id
    } else {
      // Conta temporária — o /processar atualiza distribuidora/titular após OCR
      const novaConta = await prisma.conta.create({
        data: { userId: dbUser.id, distribuidora: 'Desconhecida' },
      })
      contaId = novaConta.id
    }
  } catch (err) {
    console.error('[upload] DB conta error:', err)
    return NextResponse.json({ error: 'Erro ao criar unidade consumidora.' }, { status: 500 })
  }

  // ── 3. Upload PDF para Supabase ────────────────────────────────────────────
  const now = new Date()
  const mesRef = now.getMonth() + 1
  const anoRef = now.getFullYear()
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

  // ── 4. Criar Fatura como PENDENTE ──────────────────────────────────────────
  try {
    const fatura = await prisma.fatura.create({
      data: {
        contaId,
        mes: mesRef,
        ano: anoRef,
        valorTotal: 0,
        arquivoUrl,
        status: 'PENDENTE',
      },
    })

    // Retorna ID para o client chamar /processar em seguida
    return NextResponse.json({ faturaId: fatura.id })
  } catch (err) {
    console.error('[upload] DB fatura error:', err)
    return NextResponse.json({ error: 'Erro ao salvar a fatura no banco de dados.' }, { status: 500 })
  }
}
