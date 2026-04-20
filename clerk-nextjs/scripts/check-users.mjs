import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
const { Pool } = pg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const users = await prisma.user.findMany({
    include: {
      contas: {
        include: {
          faturas: {
            select: { id: true, mes: true, ano: true, status: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  })

  for (const u of users) {
    console.log(`\nUSER: ${u.email} | clerkId: ${u.clerkId}`)
    for (const c of u.contas) {
      console.log(`  CONTA [${c.id.slice(0,8)}]: ${c.distribuidora} | titular: ${c.titular ?? '-'} | faturas: ${c.faturas.length}`)
      for (const f of c.faturas) {
        console.log(`    fatura: ${f.mes}/${f.ano} | ${f.status} | ${f.createdAt.toISOString().slice(0,10)}`)
      }
    }
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
