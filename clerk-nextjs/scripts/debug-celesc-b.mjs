// Debug: mostra OCR e campos extraídos da fatura CELESC Grupo B mais recente
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
const { Pool } = pg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Busca a fatura CELESC mais recente com consumoKwh = 150 (o valor errado)
  const fatura = await prisma.fatura.findFirst({
    where: { conta: { distribuidora: { contains: 'CELESC' } }, status: 'CONCLUIDA' },
    orderBy: { createdAt: 'desc' },
  })

  if (!fatura) { console.log('Nenhuma fatura CELESC encontrada'); return }

  const dj = fatura.dadosJson
  console.log('=== DADOS EXTRAÍDOS (dadosJson.extraido) ===')
  console.log(JSON.stringify(dj?.extraido ?? dj, null, 2))

  if (!fatura.textoOcr) { console.log('\nSem textoOcr armazenado'); return }

  console.log('\n=== TEXTO OCR COMPLETO ===')
  console.log(fatura.textoOcr)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
