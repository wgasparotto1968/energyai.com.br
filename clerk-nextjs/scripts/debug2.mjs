import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const MESES_ABREV = { JAN:1,FEV:2,MAR:3,ABR:4,MAI:5,JUN:6,JUL:7,AGO:8,SET:9,OUT:10,NOV:11,DEZ:12 }

function extrairHistoricoConsumo(texto) {
  const textoNorm = texto.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const mesRe = /(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/(\d{2,4})/gi
  const allMesMatches = [...textoNorm.matchAll(mesRe)]
  if (allMesMatches.length < 3) return []

  const seen = new Set()
  const mesesHeader = []
  for (const m of allMesMatches) {
    const mesAbr = m[1].toUpperCase()
    const anoRaw = parseInt(m[2])
    const ano = anoRaw < 100 ? 2000 + anoRaw : anoRaw
    const key = `${mesAbr}/${ano}`
    if (!seen.has(key)) { seen.add(key); mesesHeader.push({ mes: MESES_ABREV[mesAbr], ano }) }
  }
  const N = mesesHeader.length
  if (N < 3) return []

  const resultado = new Map()
  for (const { mes, ano } of mesesHeader) resultado.set(`${mes}-${ano}`, { mes, ano })

  const primeiroMesIdx = allMesMatches[0].index
  const janela = textoNorm.slice(Math.max(0, primeiroMesIdx - 50), primeiroMesIdx + 4000)
  const numRe = /\b\d{1,4}(?:\.\d{3})*,\d{2}\b/g
  const linhas = janela.split('\n')

  const grandezas = [
    { re: /consumo\s+fora\s+ponta/i, tipo: 'consumoFP' },
    { re: /consumo\s+ponta/i,         tipo: 'consumoP'  },
    { re: /demanda\s+fora\s+ponta/i,  tipo: 'demandaFP' },
    { re: /demanda\s+ponta/i,         tipo: 'demandaP'  },
  ]

  function coletarNums(startLine, maxLines=8) {
    const acc = []
    for (let k = startLine; k < Math.min(startLine + maxLines, linhas.length); k++) {
      for (const m of linhas[k].matchAll(numRe)) acc.push(parseFloat(m[0].replace(/\./g,'').replace(',','.')))
      if (acc.length >= N + 5) break
    }
    return acc
  }

  for (const { re, tipo } of grandezas) {
    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i]
      if (!re.test(linha)) continue
      if ((tipo === 'consumoP' || tipo === 'demandaP') && /fora/i.test(linha)) continue
      if (/reativ/i.test(linha)) continue
      const nums = coletarNums(i, 8)
      if (nums.length < N) continue
      const historicos = nums.slice(nums.length - N)
      console.log(`  [${tipo}] linha ${i}: "${linha.trim()}"`)
      console.log(`    nums(${nums.length}): [${nums.join(',')}]`)
      console.log(`    historicos: [${historicos.join(',')}]`)
      for (let j = 0; j < N; j++) {
        const { mes, ano } = mesesHeader[j]
        const entrada = resultado.get(`${mes}-${ano}`)
        if (!entrada || historicos[j] <= 0) continue
        switch (tipo) {
          case 'consumoFP': entrada.consumoForaPontaKwh = historicos[j]; break
          case 'consumoP':  entrada.consumoPontaKwh = historicos[j]; break
          case 'demandaFP': entrada.demandaForaPontaKw = historicos[j]; break
          case 'demandaP':  entrada.demandaPontaKw = historicos[j]; break
        }
      }
      break
    }
  }
  return Array.from(resultado.values()).map(e => {
    const fp = e.consumoForaPontaKwh ?? 0
    const p = e.consumoPontaKwh ?? 0
    if (fp > 0 || p > 0) e.consumoTotalKwh = fp + p
    return e
  }).filter(e => (e.consumoTotalKwh ?? 0) > 0 || (e.demandaForaPontaKw ?? 0) > 0)
}

async function main() {
  const f = await prisma.fatura.findFirst({
    where: { status: 'CONCLUIDA', textoOcr: { not: null }, mes: 2, ano: 2025 },
    select: { id: true, mes: true, ano: true, textoOcr: true },
  })
  if (!f) { console.log('Fatura 02/2025 não encontrada'); await prisma.$disconnect(); return }

  const ocr = f.textoOcr
  const mesRe = /(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/(\d{2,4})/gi
  const allMesMatches = [...ocr.matchAll(mesRe)]
  console.log('Total de meses no OCR:', allMesMatches.length)
  console.log('Primeiros 5:', allMesMatches.slice(0,5).map(m => `${m[0]}@${m.index}`).join(' | '))
  
  // Mostra a janela em torno do primeiro mês
  const primeiroMesIdx = allMesMatches.length > 0 ? allMesMatches[0].index : 0
  const janela = ocr.slice(Math.max(0, primeiroMesIdx - 50), primeiroMesIdx + 1500)
  console.log('\n=== JANELA (primeiro mês -50 até +1500) ===')
  const linhasJanela = janela.split('\n')
  linhasJanela.forEach((l, i) => console.log(`  L${i}: ${JSON.stringify(l)}`))
  
  console.log('\n=== EXTRAÇÃO ===')
  const historico = extrairHistoricoConsumo(ocr)
  console.log('\nResultado final: ' + historico.length + ' entradas')
  for (const h of historico) {
    console.log tendencias(`  ${String(h.mes).padStart(2,'0')}/${h.ano} consumoFP=${h.consumoForaPontaKwh??'-'} consumoP=${h.consumoPontaKwh??'-'} demandaFP=${h.demandaForaPontaKw??'-'}`)
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e.message, e.stack); process.exit(1) })
