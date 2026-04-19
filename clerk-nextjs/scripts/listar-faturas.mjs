// Lista faturas sem dadosJson ou status ERRO para reprocessamento
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
const { Pool } = pg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const faturas = await prisma.fatura.findMany({
    include: { conta: true },
    orderBy: { createdAt: 'desc' },
  })

  console.log(`Total de faturas: ${faturas.length}`)
  for (const f of faturas) {
    const temDados = !!f.dadosJson
    const nomeCliente = f.dadosJson?.extraido?.nomeCliente ?? '-'
    console.log(`[${f.status}] ID: ${f.id} | Conta: ${f.conta.distribuidora} | titular_conta: ${f.conta.titular ?? 'null'} | nomeCliente no JSON: ${nomeCliente} | temDados: ${temDados}`)
  }
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
