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
  const conta = await prisma.conta.findFirst({
    where: { id: 'cmo4y7d1f0016xkumg7rgoiav' },
    include: { faturas: { orderBy: { createdAt: 'desc' } } },
  })

  if (!conta) { console.log('Conta não encontrada'); process.exit(0) }
  console.log(`Conta: ${conta.titular} | ${conta.faturas.length} faturas\n`)

  for (const f of conta.faturas) {
    const hist = (f.dadosJson)?.extraido?.historico ?? []
    console.log(`Fatura ${f.mes}/${f.ano} | arquivoUrl: ${f.arquivoUrl ? 'SIM' : 'NULL'} | status: ${f.status} | historico banco: ${hist.length}`)

    if (f.textoOcr) {
      const fresh = extrairHistoricoGrupoB(f.textoOcr)
      console.log(`  -> extrairHistoricoGrupoB fresh: ${fresh.length} entradas`)
      if (fresh.length > 0) {
        const dados = extrairDadosFatura(f.textoOcr)
        console.log(`  -> extrairDadosFatura.historico: ${dados.historico?.length ?? 0} entradas`)
        // Mostrar primeiros meses
        for (const h of (dados.historico ?? []).slice(0, 5)) {
          console.log(`     ${String(h.mes).padStart(2,'0')}/${h.ano}  consumo=${h.consumoTotalKwh}`)
        }
        if ((dados.historico?.length ?? 0) > 5) console.log(`     ... e mais ${(dados.historico?.length ?? 0) - 5}`)
      }
    } else {
      console.log('  -> Sem textoOcr')
    }
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
