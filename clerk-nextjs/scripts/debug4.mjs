import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const MESES_ABREV = { JAN:1,FEV:2,MAR:3,ABR:4,MAI:5,JUN:6,JUL:7,AGO:8,SET:9,OUT:10,NOV:11,DEZ:12 }

// Regex: números BR com vírgula, excluindo leituras de medidor (ex: 6.367.849,00)
// (?<!\d\.) = não precedido por dígito + ponto (parte de número maior)
const numRe = /(?<![.\d])\d{1,3}(?:\.\d{3})?,\d{2}(?!\d)/g

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
    const key = mesAbr + '/' + ano
    if (!seen.has(key)) { seen.add(key); mesesHeader.push({ mes: MESES_ABREV[mesAbr], ano }) }
  }
  const N = mesesHeader.length
  if (N < 3) return []

  const resultado = new Map()
  for (const { mes, ano } of mesesHeader) resultado.set(mes + '-' + ano, { mes, ano })

  const primeiroMesIdx = allMesMatches[0].index
  const janela = textoNorm.slice(Math.max(0, primeiroMesIdx - 50), primeiroMesIdx + 4000)

  // Coleta TODOS os números com vírgula na janela (excluindo leituras de medidor grandes)
  const todosNums = []
  for (const m of janela.matchAll(numRe)) {
    todosNums.push({ val: parseFloat(m[0].replace(/\./g,'').replace(',','.')), idx: m.index, raw: m[0] })
  }

  console.log('Total nums:', todosNums.length)
  console.log('Primeiros 30:', todosNums.slice(0, 30).map(n => n.raw).join(' | '))
  console.log()

  // Encontra rótulos de grandeza (incluindo reativas) na janela
  const rotuloRe = /(consumo\s+fora\s+ponta|consumo\s+ponta|demanda\s+fora\s+ponta|demanda\s+ponta|demanda\s+reativa\s+fora\s+ponta|demanda\s+reativa\s+ponta|reativo\s+excedente\s+fora\s+ponta|reativo\s+excedente\s+ponta)/gi
  const rotulos = []
  for (const m of janela.matchAll(rotuloRe)) {
    rotulos.push({ idx: m.index, label: m[0].toLowerCase().replace(/\s+/g, ' ').trim() })
  }
  console.log('Rótulos encontrados:', rotulos.map(r => r.label + '@' + r.idx).join(' | '))
  console.log()

  if (rotulos.length === 0) return []

  // Cada rótulo tem 3 valores imediatamente após (leitAnt, leitAtual, totalApurado)
  // Os valores históricos vêm após todos os rótulos
  // = após (numRótulos * 3) valores contados desde o primeiro rótulo

  const primeiroRotuloIdx = rotulos[0].idx
  const numsAposPrimeiroRotulo = todosNums.filter(n => n.idx > primeiroRotuloIdx)
  // Filtra rótulos: mantém apenas o grupo contíguo inicial (gap máximo de 500 chars)
  const rotulosContiguos = [rotulos[0]]
  for (let i = 1; i < rotulos.length; i++) {
    if (rotulos[i].idx - rotulos[i-1].idx > 500) break
    rotulosContiguos.push(rotulos[i])
  }
  console.log('Rótulos contíguos:', rotulosContiguos.length, rotulosContiguos.map(r => r.label).join(' | '))

  // Offset: conta valores reais entre o primeiro rótulo e o início dos históricos
  // = número de valores que aparecem entre o primeiro e o último rótulo + 3 valores do último
  const ultimoRotuloContiguo = rotulosContiguos[rotulosContiguos.length - 1]
  const numsAposUltimoRotulo = numsAposPrimeiroRotulo.filter(n => n.idx > ultimoRotuloContiguo.idx)
  // O histórico começa após os 3 valores do último rótulo (ou menos se algumas leituras são inteiras)
  // Descobrimos que "demanda reativa" e "reativo excedente" têm 3 vals, mas FP/P têm apenas 1
  // Então: offset = valores antes do último rótulo + 3 (do último rótulo)
  const numsAntesUltimoRotulo = numsAposPrimeiroRotulo.filter(n => n.idx < ultimoRotuloContiguo.idx)
  const offsetHistorico = numsAntesUltimoRotulo.length + 3  // +3 para os valores do último rótulo

  console.log('Num rótulos contíguos:', rotulosContiguos.length, '→ offset histórico:', offsetHistorico)
  console.log('Nums após primeiro rótulo:', numsAposPrimeiroRotulo.length)
  console.log('Nums[0..5]:', numsAposPrimeiroRotulo.slice(0,5).map(n => n.raw).join(' | '))
  console.log('Nums[offset..offset+5]:', numsAposPrimeiroRotulo.slice(offsetHistorico, offsetHistorico+5).map(n => n.raw).join(' | '))
  console.log()

  const inicioHistoricos = numsAposPrimeiroRotulo.slice(offsetHistorico)
  if (inicioHistoricos.length < N) {
    console.log('Não há históricos suficientes:', inicioHistoricos.length, '<', N)
    return []
  }

  // Grandezas mapeadas em ordem de aparição (excluindo reativas)
  const grandezasMapeadas = [
    { re: /consumo\s+fora\s+ponta(?!\s+reativ)/i, tipo: 'consumoFP' },
    { re: /consumo\s+ponta(?!\s+reativ)/i,          tipo: 'consumoP'  },
    { re: /demanda\s+fora\s+ponta(?!\s+reativ)/i,   tipo: 'demandaFP' },
    { re: /demanda\s+ponta(?!\s+reativ)/i,           tipo: 'demandaP'  },
  ]

  // Descobre a posição de cada grandeza na lista de rótulos (incluindo reativas)
  const tiposComOffset = []
  for (const { re, tipo } of grandezasMapeadas) {
    for (let i = 0; i < rotulosContiguos.length; i++) {
      if (re.test(rotulosContiguos[i].label) && !tiposComOffset.find(t => t.tipo === tipo)) {
        tiposComOffset.push({ tipo, posNaListaRotulos: i })
      }
    }
  }
  console.log('Grandezas mapeadas com offset na lista:', tiposComOffset.map(t => t.tipo + '@pos' + t.posNaListaRotulos).join(' | '))

  function atribuir(tipo, historicos) {
    for (let j = 0; j < Math.min(historicos.length, N); j++) {
      const { mes, ano } = mesesHeader[j]
      const entrada = resultado.get(mes + '-' + ano)
      if (!entrada) continue
      const val = historicos[j]
      if (val > 0) {
        if (tipo === 'consumoFP') entrada.consumoForaPontaKwh = val
        else if (tipo === 'consumoP') entrada.consumoPontaKwh = val
        else if (tipo === 'demandaFP') entrada.demandaForaPontaKw = val
        else if (tipo === 'demandaP') entrada.demandaPontaKw = val
      }
    }
  }

  for (const { tipo, posNaListaRotulos } of tiposComOffset) {
    // O bloco histórico dessa grandeza começa em: posNaListaRotulos * N
    // (porque cada grandeza tem N valores históricos)
    const blocoStart = posNaListaRotulos * N
    const bloco = inicioHistoricos.slice(blocoStart, blocoStart + N).map(n => n.val)
    console.log(tipo + ': bloco[' + blocoStart + '..' + (blocoStart+N) + '] = [' + bloco.slice(0,3).join(',') + '...]')
    if (bloco.length >= N) atribuir(tipo, bloco)
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
    select: { textoOcr: true },
  })
  if (!f) { console.log('Não encontrado'); await prisma.$disconnect(); return }

  const historico = extrairHistoricoConsumo(f.textoOcr)
  console.log('\nResultado final: ' + historico.length + ' entradas')
  for (const h of historico) {
    console.log('  ' + String(h.mes).padStart(2,'0') + '/' + h.ano + ' consumoFP=' + (h.consumoForaPontaKwh??'-') + ' consumoP=' + (h.consumoPontaKwh??'-') + ' demandaFP=' + (h.demandaForaPontaKw??'-'))
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e.message); process.exit(1) })
