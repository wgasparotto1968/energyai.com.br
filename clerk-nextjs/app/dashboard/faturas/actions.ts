'use server'

import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase'
import { extractTextFromPdf } from '@/lib/pdfExtract'
import { extrairDadosFatura } from '@/lib/analise/extrator'
import { analisarFatura } from '@/lib/analise/engine'

export async function enviarFatura(
  formData: FormData,
): Promise<{ error: string } | { redirectTo: string }> {
  const clerkUser = await currentUser()
  if (!clerkUser) return { error: 'Não autenticado.' }

  const email = clerkUser.emailAddresses?.[0]?.emailAddress
  if (!email) return { error: 'Nenhum e-mail associado à conta Clerk.' }

  const dbUser = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {},
    create: {
      clerkId: clerkUser.id,
      email,
      nome: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
    },
  })

  const arquivo = formData.get('arquivo') as File | null
  if (!arquivo || arquivo.size === 0) return { error: 'Nenhum arquivo selecionado.' }
  if (arquivo.type !== 'application/pdf') return { error: 'Somente arquivos PDF são aceitos.' }
  if (arquivo.size > 10 * 1024 * 1024) return { error: 'Arquivo muito grande. Máximo 10 MB.' }

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
    console.error('[enviarFatura] OCR error:', err)
    return { error: 'Não foi possível ler o PDF. Verifique se o arquivo é uma fatura de energia válida.' }
  }

  // ── 2. Determinar mês/ano (OCR primeiro, fallback para hoje) ───────────────
  const mesForm = parseInt(formData.get('mes') as string ?? '', 10)
  const anoForm = parseInt(formData.get('ano') as string ?? '', 10)

  const mesRef = mesForm > 0 && mesForm <= 12 ? mesForm : (dadosExtraidos.mesReferencia ?? new Date().getMonth() + 1)
  const anoRef = anoForm > 0 ? anoForm : (dadosExtraidos.anoReferencia ?? new Date().getFullYear())

  // ── 3. Encontrar ou criar Conta ────────────────────────────────────────────
  const contaIdForm = formData.get('contaId') as string | null

  let contaId: string

  try {
    if (contaIdForm && contaIdForm.trim() !== '') {
      const contaExistente = await prisma.conta.findFirst({
        where: { id: contaIdForm, userId: dbUser.id },
      })
      if (!contaExistente) return { error: 'Unidade não encontrada.' }
      contaId = contaExistente.id
    } else {
      const distribuidora = dadosExtraidos.distribuidora?.trim() || 'Desconhecida'
      const numeroCliente = dadosExtraidos.numeroCliente?.trim() || null
      const titular = dadosExtraidos.nomeCliente?.trim() || null

      const contaMatch = await prisma.conta.findFirst({
        where: {
          userId: dbUser.id,
          distribuidora,
          ...(numeroCliente ? { numeroCliente } : {}),
        },
      })

      if (contaMatch) {
        // Atualiza titular se agora foi extraído e ainda não estava salvo
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
    console.error('[enviarFatura] DB conta error:', err)
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('reach database') || msg.includes('P1001') || msg.includes('DatabaseNotReachable')) {
      return { error: 'Banco de dados temporariamente indisponível. Aguarde alguns segundos e tente novamente.' }
    }
    return { error: 'Erro ao localizar/criar unidade consumidora.' }
  }

  // ── 4. Upload PDF ──────────────────────────────────────────────────────────
  const path = `faturas/${dbUser.id}/${contaId}/${anoRef}-${String(mesRef).padStart(2, '0')}-${Date.now()}.pdf`

  try {
    const { error: uploadError } = await supabaseAdmin.storage
      .from('faturas')
      .upload(path, buffer, { contentType: 'application/pdf', upsert: false })

    if (uploadError) {
      console.error('[enviarFatura] upload error:', uploadError)
      return { error: `Falha no upload: ${uploadError.message}` }
    }
  } catch (err) {
    console.error('[enviarFatura] upload exception:', err)
    return { error: 'Erro inesperado no upload do arquivo.' }
  }

  const { data: urlData } = supabaseAdmin.storage.from('faturas').getPublicUrl(path)
  const arquivoUrl = urlData.publicUrl

  // ── 5. Verificar duplicata e criar Fatura ──────────────────────────────────
  try {
    const duplicata = await prisma.fatura.findUnique({
      where: { contaId_mes_ano: { contaId, mes: mesRef, ano: anoRef } },
    })
    if (duplicata) {
      return { error: `Já existe uma fatura de ${String(mesRef).padStart(2, '0')}/${anoRef} para esta unidade.` }
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

    return { redirectTo: `/dashboard/faturas/${fatura.id}` }
  } catch (err) {
    console.error('[enviarFatura] DB fatura error:', err)
    return { error: 'Erro ao salvar a fatura no banco de dados.' }
  }
}
