import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { extractTextFromPdf } from '@/lib/pdfExtract'
import { extrairDadosFatura } from '@/lib/analise/extrator'
import { analisarFatura } from '@/lib/analise/engine'

export const maxDuration = 60

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const clerkUser = await currentUser()
  if (!clerkUser) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } })
  if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 })

  // Buscar fatura (verifica posse via conta)
  const fatura = await prisma.fatura.findFirst({
    where: {
      id,
      conta: { userId: dbUser.id },
    },
  })

  if (!fatura) return NextResponse.json({ error: 'Fatura não encontrada' }, { status: 404 })
  if (!fatura.arquivoUrl) return NextResponse.json({ error: 'Fatura sem arquivo' }, { status: 400 })

  // Marcar como PROCESSANDO
  await prisma.fatura.update({ where: { id }, data: { status: 'PROCESSANDO' } })

  try {
    // 1. Baixar o PDF do Supabase Storage
    const res = await fetch(fatura.arquivoUrl)
    if (!res.ok) throw new Error(`Falha ao baixar PDF: ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())

    // 2. Extrair texto
    const textoOcr = await extractTextFromPdf(buffer)

    // 3. Extrair campos estruturados
    const dadosExtraidos = extrairDadosFatura(textoOcr)

    // Log de diagnóstico para histórico
    console.log(`[processar] fatura ${id} — histórico extraído: ${dadosExtraidos.historico?.length ?? 0} entradas`)
    if ((dadosExtraidos.historico?.length ?? 0) === 0) {
      const temSecao = /HIST[ÓO]RICO\s+DE\s+CONSUMO/i.test(textoOcr)
      const temMeses = (textoOcr.match(/(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/\d{2}/gi) ?? []).length
      console.log(`[processar] temSecaoHistorico=${temSecao} mesesEncontrados=${temMeses}`)
      if (temSecao) {
        // Imprime o trecho do OCR em volta da seção histórico para diagnóstico
        const idx = textoOcr.search(/HIST[ÓO]RICO\s+DE\s+CONSUMO/i)
        console.log('[processar] OCR trecho histórico:\n' + textoOcr.slice(idx, idx + 800))
      }
    }

    // 4. Rodar engine de análise
    const resultado = analisarFatura(dadosExtraidos)

    // 5. Salvar no banco
    await prisma.fatura.update({
      where: { id },
      data: {
        textoOcr,
        dadosJson: { extraido: dadosExtraidos, resultado } as unknown as import('@prisma/client').Prisma.JsonObject,
        valorTotal: dadosExtraidos.valorTotal ?? fatura.valorTotal,
        consumoKwh: dadosExtraidos.consumoKwh ?? fatura.consumoKwh,
        status: 'CONCLUIDA',
      },
    })

    // 5b. Atualizar titular, distribuidora e endereço na conta
    const updateConta: Record<string, string> = {}
    const contaAtual = await prisma.conta.findUnique({ where: { id: fatura.contaId }, select: { titular: true, distribuidora: true, endereco: true } })
    if (dadosExtraidos.nomeCliente) {
      // Sobrescreve sempre (exceto se o usuário já definiu manualmente um nome limpo)
      const titularAtual = contaAtual?.titular ?? ''
      const isPadrao = !titularAtual || /sem titular|data\s+hora|visto|ausente|inexistente|mudou/i.test(titularAtual)
      if (isPadrao) updateConta.titular = dadosExtraidos.nomeCliente
    }
    if (contaAtual && (contaAtual.distribuidora === 'Desconhecida' || !contaAtual.distribuidora) && dadosExtraidos.distribuidora) {
      updateConta.distribuidora = dadosExtraidos.distribuidora
    } else if (dadosExtraidos.distribuidora && dadosExtraidos.distribuidora !== contaAtual?.distribuidora) {
      // Atualiza se o valor extraído for diferente e mais específico
      updateConta.distribuidora = dadosExtraidos.distribuidora
    }
    // Preenche endereço da UC se ainda não foi definido manualmente
    if (!contaAtual?.endereco && dadosExtraidos.enderecoUC) {
      updateConta.endereco = dadosExtraidos.enderecoUC
    }
    if (Object.keys(updateConta).length > 0) {
      await prisma.conta.update({ where: { id: fatura.contaId }, data: updateConta })
    }

    // 6. Criar faturas históricas a partir da tabela HISTÓRICO DE CONSUMO
    let historicoImportado = 0
    if (dadosExtraidos.historico && dadosExtraidos.historico.length > 0) {
      // Buscar faturas já existentes para esses meses/anos
      const existentes = await prisma.fatura.findMany({
        where: {
          contaId: fatura.contaId,
          OR: dadosExtraidos.historico.map(h => ({ mes: h.mes, ano: h.ano })),
        },
        select: { id: true, mes: true, ano: true, arquivoUrl: true },
      })
      const existentesMap = new Map(existentes.map(e => [`${e.mes}-${e.ano}`, e]))

      for (const entrada of dadosExtraidos.historico) {
        // Não sobrescreve o mês atual (já foi salvo acima)
        if (entrada.mes === fatura.mes && entrada.ano === fatura.ano) continue

        const existente = existentesMap.get(`${entrada.mes}-${entrada.ano}`)
        // Não sobrescreve faturas que já têm PDF real
        if (existente?.arquivoUrl) continue

        const extraidoHistorico = {
          demandaMedidaKw: entrada.demandaForaPontaKw,
          demandaPontaKw: entrada.demandaPontaKw,
          demandaContratadaKw: dadosExtraidos.demandaContratadaKw,
          consumoKwh: entrada.consumoTotalKwh,
          consumoForaPontaKwh: entrada.consumoForaPontaKwh,
          consumoPontaKwh: entrada.consumoPontaKwh,
          tarifaDemanda: dadosExtraidos.tarifaDemanda,
          modalidade: dadosExtraidos.modalidade,
          grupo: dadosExtraidos.grupo,
          origemHistorico: true,
        }

        if (existente) {
          await prisma.fatura.update({
            where: { id: existente.id },
            data: {
              consumoKwh: entrada.consumoTotalKwh ?? null,
              dadosJson: { extraido: extraidoHistorico, resultado: null } as unknown as import('@prisma/client').Prisma.JsonObject,
              status: 'CONCLUIDA',
            },
          })
        } else {
          await prisma.fatura.create({
            data: {
              contaId: fatura.contaId,
              mes: entrada.mes,
              ano: entrada.ano,
              valorTotal: 0,
              consumoKwh: entrada.consumoTotalKwh ?? null,
              dadosJson: { extraido: extraidoHistorico, resultado: null } as unknown as import('@prisma/client').Prisma.JsonObject,
              status: 'CONCLUIDA',
            },
          })
        }
        historicoImportado++
      }
    }

    return NextResponse.json({ ok: true, resultado, historicoImportado })
  } catch (err) {
    console.error('[processar-fatura]', err)
    await prisma.fatura.update({ where: { id }, data: { status: 'ERRO' } })
    return NextResponse.json({ error: 'Erro ao processar fatura' }, { status: 500 })
  }
}
