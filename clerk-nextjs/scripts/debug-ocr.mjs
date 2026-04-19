// Mostra o textoOcr de uma fatura para debug do extrator
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
const { Pool } = pg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const fatura = await prisma.fatura.findFirst({
    where: { conta: { distribuidora: 'COPEL' } },
    orderBy: { createdAt: 'desc' },
  })

  if (!fatura?.textoOcr) { console.log('Sem textoOcr'); return }

  // Mostra as primeiras 3000 chars do texto
  const trecho = fatura.textoOcr.slice(0, 3000)
  console.log('=== TEXTO OCR (primeiros 3000 chars) ===')
  console.log(trecho)

  // Testa o regex de nome
  const tNorm = fatura.textoOcr.replace(/\r?\n/g, ' ').replace(/\s{2,}/g, ' ')
  const patterns = [
    /Nome[:\s]+([A-ZÀ-Ú][A-ZÀ-Úa-zà-ú .'-]{3,100}?)(?=\s{2,}|Endere[çc]o|CEP|CNPJ|I\.E\.|Tipo\s+de|Classifica)/i,
    /Nome[:\s]+([A-ZÀ-Ú][A-ZÀ-Úa-zà-ú .'-]{3,100})/i,
    /(?:nome\s*[/\/]?\s*raz[ãa]o\s+social|raz[ãa]o\s+social)[:\s]+([A-ZÀ-Úa-zà-ú .'-]{4,100}?)/i,
  ]
  console.log('\n=== TESTE DE REGEX ===')
  for (const p of patterns) {
    const m = p.exec(tNorm)
    console.log(`Regex: ${p.source.slice(0,60)}...`)
    console.log(`Resultado: ${m ? `"${m[1]}"` : 'null'}`)
  }

  // Busca por "Nome" no texto raw
  const idx = fatura.textoOcr.toLowerCase().indexOf('nome')
  if (idx >= 0) {
    console.log('\n=== Trecho ao redor de "Nome" ===')
    console.log(JSON.stringify(fatura.textoOcr.slice(idx, idx + 200)))
  }

  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
