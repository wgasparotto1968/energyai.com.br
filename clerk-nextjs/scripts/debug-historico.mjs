import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import pkg from 'pg'
const { Pool } = pkg
import { createRequire } from 'module'
import { readFileSync } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Importa o extrator compilado em runtime via require do arquivo TS transpilado
// Usa tsx para transpilar on-the-fly
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Importa extrator compilado dinamicamente
const { extrairHistoricoConsumo } = await import(pathToFileURL(path.join(__dirname, '../lib/analise/extrator.ts')).href)

async function main() {
  const faturas = await prisma.fatura.findMany({
    where: { status: 'CONCLUIDA', textoOcr: { not: null }, mes: 2, ano: 2025 },
    select: { id: true, mes: true, ano: true, textoOcr: true },
  })
  for (const f of faturas) {
    const historico = extrairHistoricoConsumo(f.textoOcr)
    console.log('Fatura ' + f.mes + '/' + f.ano + ' — entradas: ' + historico.length)
    for (const h of historico) {
      console.log('  ' + String(h.mes).padStart(2,'0') + '/' + h.ano + ' consumoFP=' + (h.consumoForaPontaKwh ?? '-') + ' consumoP=' + (h.consumoPontaKwh ?? '-') + ' demandaFP=' + (h.demandaForaPontaKw ?? '-')
  for (const f of faturas) {
    const historico = extrairHistoricoConsumo(f.textoOcr)
    console.log('Fatura ' + f.mes + '/' + f.ano + ' — entradas: ' + historico.length)
    for (const h of historico) {
      console.log('  ' + String(h.mes).padStart(2,'0') + '/' + h.ano + ' consumoFP=' + (h.consumoForaPontaKwh ?? '-') + ' consumoP=' + (h.consumoPontaKwh ?? '-') + ' demandaFP=' + (h.demandaForaPontaKw ?? '-'))
    }
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e.message); process.exit(1) })
