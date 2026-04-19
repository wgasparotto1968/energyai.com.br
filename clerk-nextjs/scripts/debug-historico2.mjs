import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import pkg from 'pg'
import { fileURLToPath, pathToFileURL } from 'url'
import path from 'path'

const { Pool } = pkg
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const { extrairHistoricoGrupoB, extrairDadosFatura } = await import(
  pathToFileURL(path.join(__dirname, '../lib/analise/extrator.ts')).href
)

async function main() {
  // Pega a fatura mais recente com OCR
  const fatura = await prisma.fatura.findFirst({
    where: { status: 'CONCLUIDA', textoOcr: { not: null } },
    orderBy: [{ ano: 'desc' }, { mes: 'desc' }, { createdAt: 'desc' }],
    select: { id: true, mes: true, ano: true, textoOcr: true, dadosJson: true },
  })

  if (!fatura) { console.log('Nenhuma fatura encontrada'); process.exit(0) }

  const t = fatura.textoOcr
  console.log(`=== Fatura ${fatura.mes}/${fatura.ano} (${fatura.id}) ===\n`)

  // Dados já salvos no banco
  const dj = fatura.dadosJson
  const historicoBanco = dj?.extraido?.historico ?? []
  console.log(`Histórico no banco: ${historicoBanco.length} entradas`)
  for (const h of historicoBanco) {
    console.log(`  ${String(h.mes).padStart(2,'0')}/${h.ano}  consumo=${h.consumoTotalKwh ?? '-'}`)
  }

  // Roda extrator agora
  console.log('\n--- Rodando extrairHistoricoGrupoB agora ---')
  const hist = extrairHistoricoGrupoB(t)
  console.log(`Resultado: ${hist.length} entradas`)
  for (const h of hist) {
    console.log(`  ${String(h.mes).padStart(2,'0')}/${h.ano}  consumo=${h.consumoTotalKwh ?? '-'}`)
  }

  // Roda extrator completo
  console.log('\n--- Rodando extrairDadosFatura agora ---')
  const dados = extrairDadosFatura(t)
  console.log(`nomeCliente: ${dados.nomeCliente}`)
  console.log(`consumoKwh: ${dados.consumoKwh}`)
  console.log(`valorTotal: ${dados.valorTotal}`)
  console.log(`historico: ${dados.historico?.length ?? 0} entradas`)

  // Diagnóstico de padrões no OCR
  console.log('\n--- Diagnóstico OCR ---')
  const meses = (t.match(/(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/\d{2}/gi) ?? [])
  console.log(`Ocorrências de MMM/AA: ${meses.length}`)
  console.log(`  -> ${meses.slice(0, 20).join('  ')}`)

  const temConGtp = /CON\s+GTP/i.test(t)
  console.log(`Tem CON GTP: ${temConGtp}`)

  const temHistorico = /HIST[OÓ]RICO/i.test(t)
  console.log(`Tem HISTORICO: ${temHistorico}`)

  if (temHistorico) {
    const idx = t.search(/HIST[OÓ]RICO/i)
    console.log('\n--- Trecho do OCR em torno de HISTORICO ---')
    console.log(t.slice(Math.max(0, idx - 100), idx + 600))
  }

  // Mostra onde estão os meses no texto
  console.log('\n--- Posições dos meses no OCR ---')
  const mesRe = /(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/(\d{2})/gi
  let m
  while ((m = mesRe.exec(t)) !== null) {
    const ctx = t.slice(Math.max(0, m.index - 20), m.index + 40).replace(/\n/g, '↵')
    console.log(`  pos ${m.index}: ${ctx}`)
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
