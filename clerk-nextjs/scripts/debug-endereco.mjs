import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import pkg from 'pg'
const { Pool } = pkg
import { pathToFileURL } from 'url'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })
const { extrairDadosFatura } = await import(pathToFileURL(path.join(__dirname, '../lib/analise/extrator.ts')).href)

const f = await prisma.fatura.findFirst({
  where: { textoOcr: { not: null } },
  orderBy: { createdAt: 'desc' },
  select: { textoOcr: true },
})

// Mostra trecho ao redor de ENDEREÇO
const idx = f.textoOcr.search(/ENDERE[ÇC]O/i)
if (idx >= 0) {
  console.log('=== Trecho ENDEREÇO (raw, 300 chars) ===')
  console.log(JSON.stringify(f.textoOcr.slice(Math.max(0, idx - 100), idx + 300)))
}

// Busca pelo endereço real
const idxSao = f.textoOcr.search(/SAO\s+PEDRO|PACHECOS|ARIRIU/i)
if (idxSao >= 0) {
  console.log('\n=== Trecho SAO PEDRO (raw) ===')
  console.log(JSON.stringify(f.textoOcr.slice(Math.max(0, idxSao - 150), idxSao + 200)))
}

// Mostra os primeiros 2000 chars do OCR para entender o layout
console.log('\n=== OCR primeiros 2000 chars ===')
console.log(f.textoOcr.slice(0, 2000))

// Testa extração
const d = extrairDadosFatura(f.textoOcr)
console.log('\nenderecoUC:', d.enderecoUC)
console.log('nomeCliente:', d.nomeCliente)
await prisma.$disconnect()
