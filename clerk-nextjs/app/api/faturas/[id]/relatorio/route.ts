import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import { RelatorioPDF } from '@/lib/pdf/RelatorioPDF'
import type { ResultadoAnalise } from '@/lib/analise/engine'
import React from 'react'

const MESES = ['', 'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const clerkUser = await currentUser()
  if (!clerkUser) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } })
  if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 })

  const fatura = await prisma.fatura.findFirst({
    where: { id, conta: { userId: dbUser.id } },
    include: { conta: true },
  })

  if (!fatura) return NextResponse.json({ error: 'Fatura não encontrada' }, { status: 404 })
  if (fatura.status !== 'CONCLUIDA' || !fatura.dadosJson) {
    return NextResponse.json({ error: 'Fatura ainda não analisada.' }, { status: 400 })
  }

  const json = fatura.dadosJson as { resultado?: ResultadoAnalise }
  if (!json.resultado) {
    return NextResponse.json({ error: 'Resultado de análise não encontrado.' }, { status: 400 })
  }

  const element = React.createElement(RelatorioPDF, {
    data: {
      fatura: {
        id: fatura.id,
        mes: fatura.mes,
        ano: fatura.ano,
        valorTotal: fatura.valorTotal,
        consumoKwh: fatura.consumoKwh,
        arquivoUrl: fatura.arquivoUrl,
        createdAt: fatura.createdAt,
      },
      conta: {
        distribuidora: fatura.conta.distribuidora,
        numeroCliente: fatura.conta.numeroCliente,
        endereco: fatura.conta.endereco,
      },
      usuario: {
        nome: dbUser.nome,
        email: dbUser.email,
      },
      resultado: json.resultado,
    },
  }) as Parameters<typeof renderToBuffer>[0]

  const pdfBuffer = await renderToBuffer(element)

  const filename = `energyai-${fatura.conta.distribuidora.toLowerCase().replace(/\s+/g, '-')}-${MESES[fatura.mes]}-${fatura.ano}.pdf`

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdfBuffer.byteLength),
    },
  })
}
