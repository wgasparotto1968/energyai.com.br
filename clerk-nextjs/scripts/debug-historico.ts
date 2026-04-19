/**
 * Script de diagnóstico: lê o textoOcr de todas as faturas CONCLUIDAS
 * e testa a extração do histórico.
 * Uso: node --env-file=.env.local --import tsx/esm scripts/debug-historico.ts
 */
import { PrismaClient } from '@prisma/client'
import { extrairHistoricoConsumo } from '../lib/analise/extrator'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
})

async function main() {
  const faturas = await prisma.fatura.findMany({
    where: { status: 'CONCLUIDA', textoOcr: { not: null } },
    select: { id: true, mes: true, ano: true, contaId: true, textoOcr: true },
  })

  console.log(`\n=== ${faturas.length} fatura(s) CONCLUIDAS com OCR ===\n`)

  for (const f of faturas) {
    const ocr = f.textoOcr!
    const temSecao = /HIST[ÓO]RICO\s+DE\s+CONSUMO/i.test(ocr)
    const historico = extrairHistoricoConsumo(ocr)

    console.log(`--- Fatura ${f.mes.toString().padStart(2,'0')}/${f.ano} (id: ${f.id}) ---`)
    console.log(`  temSecaoHistorico: ${temSecao}`)
    console.log(`  entradas extraídas: ${historico.length}`)

    if (historico.length > 0) {
      for (const h of historico) {
        console.log(`    ${h.mes.toString().padStart(2,'0')}/${h.ano}: consumoFP=${h.consumoForaPontaKwh ?? '-'} consumoP=${h.consumoPontaKwh ?? '-'} demandaFP=${h.demandaForaPontaKw ?? '-'}`)
      }
    } else if (temSecao) {
      // Mostra o trecho do OCR para diagnóstico
      const idx = ocr.search(/HIST[ÓO]RICO\s+DE\s+CONSUMO/i)
      const trecho = ocr.slice(idx, idx + 1200)
      console.log(`  TRECHO OCR:`)
      console.log('  ' + trecho.split('\n').map(l => '  |' + l).join('\n'))
    }
    console.log()
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
