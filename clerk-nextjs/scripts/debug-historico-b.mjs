// Debug: mostra o OCR da fatura CELESC Grupo B e testa extrairHistoricoGrupoB
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import pkg from 'pg'
const { Pool } = pkg
import { pathToFileURL } from 'url'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const { extrairHistoricoGrupoB, extrairHistoricoConsumo } = await import(
  pathToFileURL(path.join(__dirname, '../lib/analise/extrator.ts')).href
)

async function main() {
  // Busca fatura CELESC mais recente com textoOcr
  const fatura = await prisma.fatura.findFirst({
    where: {
      textoOcr: { not: null },
      conta: { distribuidora: { contains: 'CELESC' } },
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, mes: true, ano: true, textoOcr: true, dadosJson: true },
  })

  if (!fatura?.textoOcr) {
    console.log('Nenhuma fatura CELESC com textoOcr encontrada.')
    await prisma.$disconnect()
    return
  }

  const t = fatura.textoOcr

  console.log('=== FATURA:', fatura.id, fatura.mes + '/' + fatura.ano)
  console.log()

  // Busca seção de histórico
  const idxHist = t.search(/HIST[ÓO]RICO/i)
  if (idxHist >= 0) {
    console.log('=== TRECHO HISTÓRICO (1200 chars) ===')
    console.log(t.slice(idxHist, idxHist + 1200))
    console.log()
  } else {
    console.log('Seção HISTÓRICO não encontrada.')
    console.log()
  }

  // Busca CON GTP
  const idxGtp = t.search(/\bCON\s+GTP\b/i)
  if (idxGtp >= 0) {
    console.log('=== TRECHO CON GTP (300 chars antes + 300 chars depois) ===')
    console.log(t.slice(Math.max(0, idxGtp - 300), idxGtp + 300))
    console.log()
  } else {
    console.log('Padrão CON GTP não encontrado.')
    console.log()
  }

  // Busca padrão inline MMM/YY
  const inlineRe = /(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/(\d{2,4})/gi
  const meses = [...t.matchAll(inlineRe)]
  console.log('=== OCORRÊNCIAS DE MESES (' + meses.length + ') ===')
  meses.forEach(m => {
    const start = Math.max(0, m.index - 20)
    const end = Math.min(t.length, m.index + 80)
    console.log('  [' + m[0] + '] → "' + t.slice(start, end).replace(/\n/g, '↵') + '"')
  })
  console.log()

  // Testa extrairHistoricoGrupoB
  const histB = extrairHistoricoGrupoB(t)
  console.log('=== extrairHistoricoGrupoB: ' + histB.length + ' entradas ===')
  histB.forEach(h => console.log('  ' + String(h.mes).padStart(2,'0') + '/' + h.ano + ' consumo=' + (h.consumoTotalKwh ?? '-')))

  // Testa extrairHistoricoConsumo
  const histA = extrairHistoricoConsumo(t)
  console.log()
  console.log('=== extrairHistoricoConsumo (Grupo A): ' + histA.length + ' entradas ===')
  histA.forEach(h => console.log('  ' + String(h.mes).padStart(2,'0') + '/' + h.ano + ' fp=' + (h.consumoForaPontaKwh ?? '-') + ' p=' + (h.consumoPontaKwh ?? '-')))

  // Mostra dadosJson.extraido.historico atual
  const dados = fatura.dadosJson
  const hist = dados?.extraido?.historico ?? dados?.historico
  console.log()
  console.log('=== dadosJson.extraido.historico atual: ' + (hist?.length ?? 0) + ' entradas ===')
  if (hist?.length > 0) hist.forEach(h => console.log('  ', JSON.stringify(h)))

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
