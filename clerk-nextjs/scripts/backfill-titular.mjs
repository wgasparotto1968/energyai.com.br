// Script para preencher titular nas contas a partir dos dadosJson das faturas
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
const { Pool } = pg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Mini-extrator inline (espelho do regex do extrator.ts)
function extrairNomeDotexto(texto) {
  if (!texto) return null
  const tNorm = texto.replace(/\r?\n/g, ' ').replace(/\s{2,}/g, ' ')
  const patterns = [
    /Nome[:\s]+([A-ZÀ-Ú][A-ZÀ-Úa-zà-ú .'-]{3,100}?)(?=\s{2,}|Endere[çc]o|CEP|CNPJ|I\.E\.|Tipo\s+de|Classifica)/i,
    /(?:nome\s*[\/]?\s*raz[ãa]o\s+social|raz[ãa]o\s+social)[:\s]+([A-ZÀ-Úa-zà-ú .'-]{4,100}?)(?=\s{2,}|Endere[çc]o|CEP|CNPJ)/i,
    /titular[:\s]+([A-ZÀ-Úa-zà-ú .'-]{4,100}?)(?=\s{2,}|Endere[çc]o|CEP|CNPJ|\d)/i,
    /Titular\s+da\s+an[áa]lise\s+([A-ZÀ-Úa-zà-ú .'-]{4,100}?)(?=\s{2,}|ALERT|Distribuidora|$)/i,
    /Nome[:\s]+([A-ZÀ-Ú][A-ZÀ-Úa-zà-ú .'-]{3,100})/i,
  ]
  for (const p of patterns) {
    const m = p.exec(tNorm)
    if (m) {
      const candidato = m[1].trim()
      if (!/^(?:do|da|de|dos|das|cliente|instala)\b/i.test(candidato)) return candidato
    }
  }
  return null
}

async function main() {
  const contas = await prisma.conta.findMany({
    where: { titular: null },
    include: {
      faturas: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  console.log(`Contas sem titular: ${contas.length}`)

  for (const conta of contas) {
    const fatura = conta.faturas[0]
    if (!fatura) continue

    // Tenta primeiro pelo dadosJson
    let nomeCliente = fatura.dadosJson?.extraido?.nomeCliente
    // Se não tiver, re-extrai do textoOcr
    if (!nomeCliente && fatura.textoOcr) {
      nomeCliente = extrairNomeDotexto(fatura.textoOcr)
    }

    const distribuidora = fatura.dadosJson?.extraido?.distribuidora

    const updates = {}
    if (nomeCliente) updates.titular = nomeCliente
    if (distribuidora && conta.distribuidora === 'Desconhecida') updates.distribuidora = distribuidora

    if (Object.keys(updates).length > 0) {
      await prisma.conta.update({ where: { id: conta.id }, data: updates })
      console.log(`✓ Conta ${conta.id}: titular="${updates.titular ?? '-'}", distribuidora="${updates.distribuidora ?? conta.distribuidora}"`)
    } else {
      console.log(`✗ Conta ${conta.id}: nenhum nome encontrado`)
    }
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })

main().catch(e => { console.error(e); process.exit(1) })
