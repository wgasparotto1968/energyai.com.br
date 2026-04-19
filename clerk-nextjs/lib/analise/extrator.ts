/**
 * Extrai campos estruturados do texto bruto de uma fatura de energia.
 * Cobre os padrões mais comuns das distribuidoras brasileiras.
 */

export interface DadosFatura {
  // Identificação
  grupo?: 'A' | 'B'
  subgrupo?: string        // B1, B2, B3, A3a, A4, etc.
  modalidade?: string      // Convencional, Verde, Azul
  tipoLigacao?: string     // Monofásico, Bifásico, Trifásico
  distribuidora?: string
  numeroCliente?: string
  nomeCliente?: string

  // Referência temporal
  mesReferencia?: number   // 1-12
  anoReferencia?: number

  // Localização
  cidade?: string
  estado?: string
  cep?: string
  enderecoUC?: string

  // Valores financeiros
  valorTotal?: number
  valorEnergia?: number
  valorDistribuicao?: number
  valorTributos?: number
  valorCosip?: number
  valorReativo?: number

  // Consumo
  consumoKwh?: number
  consumoPontaKwh?: number
  consumoForaPontaKwh?: number

  // Demanda (Grupo A)
  demandaContratadaKw?: number
  demandaMedidaKw?: number
  demandaPontaKw?: number
  demandaForaPontaKw?: number
  tarifaDemanda?: number

  // Fator de potência
  fatorPotencia?: number

  // Tarifa de energia (R$/kWh)
  tarifaEnergia?: number
  tarifaEnergiaPonta?: number
  tarifaEnergiaForaPonta?: number

  // Iluminação pública
  cosip?: number

  // Histórico dos 12 meses (extraído da tabela HISTÓRICO DE CONSUMO)
  historico?: EntradaHistorico[]
}

export interface EntradaHistorico {
  mes: number           // 1–12
  ano: number           // ex: 2024
  consumoForaPontaKwh?: number
  consumoPontaKwh?: number
  consumoTotalKwh?: number
  demandaForaPontaKw?: number
  demandaPontaKw?: number
}

const MESES_ABREV: Record<string, number> = {
  JAN: 1, FEV: 2, MAR: 3, ABR: 4, MAI: 5, JUN: 6,
  JUL: 7, AGO: 8, SET: 9, OUT: 10, NOV: 11, DEZ: 12,
}

/**
 * Extrai histórico de consumo de faturas Grupo B (residencial/comercial BT).
 *
 * Suporta dois formatos CELESC:
 *   1. "CON GTP 581 0 557 0 703 0 ..." — pares (consumo, injetado) após rótulo CON GTP,
 *      com cabeçalho de meses numa linha anterior (MAR/26 FEV/26 ...).
 *   2. Inline: "JAN/26 317 31 DEZ/25 361 31 ..." — cada mês seguido de (consumo, dias_faturados).
 */
export function extrairHistoricoGrupoB(texto: string): EntradaHistorico[] {
  const t = texto.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // ── Estratégia 1: "CON GTP" (CELESC com/sem net metering) ──────────
  // Cabeçalho de meses aparece numa linha separada: "MAR/26 FEV/26 JAN/26 ..."
  // Linha de valores: "CON GTP 581 0 557 0 703 0 ..."
  const conGtpMatch = /\bCON\s+GTP\b\s+((?:\d+\s*)+)/i.exec(t)
  if (conGtpMatch) {
    // Coleta meses que aparecem antes do CON GTP
    const antesConGtp = t.slice(0, conGtpMatch.index)
    const mesRe2 = /(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/(\d{2,4})/gi
    const seen2 = new Set<string>()
    const mesesHdr: Array<{ mes: number; ano: number }> = []
    for (const m of antesConGtp.matchAll(mesRe2)) {
      const k = `${m[1].toUpperCase()}/${m[2]}`
      if (!seen2.has(k)) {
        seen2.add(k)
        const anoRaw = parseInt(m[2])
        mesesHdr.push({ mes: MESES_ABREV[m[1].toUpperCase()], ano: anoRaw < 100 ? 2000 + anoRaw : anoRaw })
      }
    }
    const nums = conGtpMatch[1].trim().split(/\s+/).map(Number).filter(n => !isNaN(n))
    // Detecta padrão em pares (consumo, injetado): ímpares são 0 ou muito baixos
    const pares  = nums.filter((_, i) => i % 2 === 0)
    const impares = nums.filter((_, i) => i % 2 === 1)
    const ehPar = impares.length > 0 && impares.every(v => v < 50)
    const consumos = ehPar ? pares : nums.filter(v => v > 33 && v < 99999)

    const N = Math.min(mesesHdr.length, consumos.length)
    if (N >= 2) {
      return mesesHdr.slice(0, N)
        .map((m, i) => ({ ...m, consumoTotalKwh: consumos[i] > 0 ? consumos[i] : undefined }))
        .filter(e => e.consumoTotalKwh != null) as EntradaHistorico[]
    }
  }

  // ── Estratégia 2: Inline "MMM/YY consumo dias_faturados" ──────────
  // Ex: "JAN/26 317 31 DEZ/25 361 31 NOV/25 322 30 ..."
  const inlineRe = /(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/(\d{2,4})\s+(\d{2,4})\s+(\d{1,2})\b/gi
  const inlineMatches = [...t.matchAll(inlineRe)]
  if (inlineMatches.length >= 2) {
    const result: EntradaHistorico[] = []
    const seenInline = new Set<string>()
    for (const m of inlineMatches) {
      const mesAbr = m[1].toUpperCase()
      const anoRaw = parseInt(m[2])
      const ano = anoRaw < 100 ? 2000 + anoRaw : anoRaw
      const consumo = parseInt(m[3])
      const dias = parseInt(m[4])
      const key = `${mesAbr}/${ano}`
      if (!seenInline.has(key) && dias >= 25 && dias <= 35 && consumo > 30) {
        seenInline.add(key)
        result.push({ mes: MESES_ABREV[mesAbr], ano, consumoTotalKwh: consumo })
      }
    }
    if (result.length >= 2) return result
  }

  // ── Estratégia 3: Block format (CELESC Grupo B padrão) ─────────────
  // "Dias Faturados JAN/26 DEZ/25 NOV/25 ... FEV/25 317 361 322 ... 357 31 31 30 ..."
  // Todos os meses aparecem juntos (cluster), depois todos os valores de consumo, depois os dias.
  {
    const monthRe3 = /(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/(\d{2})\b/gi
    const allM = [...t.matchAll(monthRe3)]
    if (allM.length >= 3) {
      // Agrupa meses em clusters (gap ≤ 30 chars entre meses consecutivos)
      const clusters: RegExpMatchArray[][] = []
      let curr: RegExpMatchArray[] = [allM[0]]
      for (let i = 1; i < allM.length; i++) {
        const gap = allM[i].index! - (allM[i - 1].index! + allM[i - 1][0].length)
        if (gap <= 30) {
          curr.push(allM[i])
        } else {
          clusters.push([...curr])
          curr = [allM[i]]
        }
      }
      clusters.push(curr)

      // Maior cluster = cabeçalho do histórico
      const cluster = clusters.reduce((a, b) => (a.length >= b.length ? a : b))
      if (cluster.length >= 3) {
        const N = cluster.length
        const lastM = cluster[N - 1]
        const afterEnd = lastM.index! + lastM[0].length

        // Delimita até o próximo mês (para evitar capturar meses de outras seções)
        const nextMonth = allM.find(m => m.index! > afterEnd)
        const limit = nextMonth ? nextMonth.index! : afterEnd + 600
        const segment = t.slice(afterEnd, limit)

        // Extrai inteiros 2-4 dígitos (ignorando floats/reais com vírgula)
        const nums = [...segment.matchAll(/\b(\d{2,4})\b/g)].map(m => parseInt(m[1], 10))

        if (nums.length >= N) {
          // Primeiros N números = consumo mensal
          const result: EntradaHistorico[] = []
          for (let i = 0; i < N; i++) {
            const mesAbr = cluster[i][1].toUpperCase()
            const anoRaw = parseInt(cluster[i][2], 10)
            const ano = anoRaw < 100 ? 2000 + anoRaw : anoRaw
            const consumo = nums[i]
            if (consumo > 0 && consumo < 9999) {
              result.push({ mes: MESES_ABREV[mesAbr], ano, consumoTotalKwh: consumo })
            }
          }
          if (result.length >= 3) return result
        }
      }
    }
  }

  return []
}

/**
 * Extrai a tabela "HISTÓRICO DE CONSUMO" de faturas CELESC/similares.
 * Retorna até 12 entradas mensais com consumo e demanda.
 *
 * Formato CELESC: o OCR frequentemente produz tudo em uma única linha.
 * Estrutura: [meses cabeçalho] ... [Label1 vals] [Label2 vals] ... [N vals hist1] [N vals hist2] ...
 *
 * Abordagem: usa regex com lookbehind para excluir leituras de medidor cumulativas (ex: 6.367.849,00).
 * Identifica os rótulos de grandeza contíguos (sem gap > 500 chars), calcula o offset real dos históricos
 * e extrai blocos de N valores para cada grandeza mapeada.
 */
export function extrairHistoricoConsumo(texto: string): EntradaHistorico[] {
  const textoNorm = texto.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // 1. Localiza meses MMM/AA
  const mesRe = /(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/(\d{2,4})/gi
  const allMesMatches = [...textoNorm.matchAll(mesRe)]
  if (allMesMatches.length < 3) return []

  const seen = new Set<string>()
  const mesesHeader: Array<{ mes: number; ano: number }> = []
  for (const m of allMesMatches) {
    const mesAbr = m[1].toUpperCase()
    const anoRaw = parseInt(m[2])
    const ano = anoRaw < 100 ? 2000 + anoRaw : anoRaw
    const key = `${mesAbr}/${ano}`
    if (!seen.has(key)) {
      seen.add(key)
      mesesHeader.push({ mes: MESES_ABREV[mesAbr], ano })
    }
  }
  const N = mesesHeader.length
  if (N < 3) return []

  const resultado = new Map<string, EntradaHistorico>()
  for (const { mes, ano } of mesesHeader) {
    resultado.set(`${mes}-${ano}`, { mes, ano })
  }

  // Regex: números BR com vírgula, exclui leituras de medidor cumulativas (ex: 6.367.849,00)
  // (?<![.\d]) = não precedido por ponto ou dígito
  const numRe = /(?<![.\d])\d{1,3}(?:\.\d{3})?,\d{2}(?!\d)/g

  // 2. Janela: do primeiro mês até 4000 chars depois
  const primeiroMesIdx = allMesMatches[0].index!
  const janela = textoNorm.slice(Math.max(0, primeiroMesIdx - 50), primeiroMesIdx + 4000)

  // 3. Coleta todos os números com vírgula na janela
  const todosNums: Array<{ val: number; idx: number }> = []
  for (const m of janela.matchAll(numRe)) {
    todosNums.push({ val: parseFloat(m[0].replace(/\./g, '').replace(',', '.')), idx: m.index! })
  }
  if (todosNums.length < N) return []

  // 4. Encontra rótulos de grandeza (incluindo reativas) — todos os que aparecem na seção
  const rotuloRe = /(consumo\s+fora\s+ponta|consumo\s+ponta|demanda\s+fora\s+ponta|demanda\s+ponta|demanda\s+reativa\s+fora\s+ponta|demanda\s+reativa\s+ponta|reativo\s+excedente\s+fora\s+ponta|reativo\s+excedente\s+ponta)/gi
  const rotulos: Array<{ idx: number; label: string }> = []
  for (const m of janela.matchAll(rotuloRe)) {
    rotulos.push({ idx: m.index!, label: m[0].toLowerCase().replace(/\s+/g, ' ').trim() })
  }
  if (rotulos.length === 0) return []

  // 5. Filtra: mantém apenas rótulos do grupo contíguo inicial (gap máximo 500 chars)
  const rotulosContiguos = [rotulos[0]]
  for (let i = 1; i < rotulos.length; i++) {
    if (rotulos[i].idx - rotulos[i - 1].idx > 500) break
    rotulosContiguos.push(rotulos[i])
  }

  const primeiroRotuloIdx = rotulosContiguos[0].idx
  const ultimoRotuloIdx = rotulosContiguos[rotulosContiguos.length - 1].idx
  const numsAposPrimeiroRotulo = todosNums.filter(n => n.idx > primeiroRotuloIdx)

  // 6. Offset real: valores entre o 1º rótulo (excl.) e o último rótulo (excl.) + 3 valores do último
  const numsAntesUltimoRotulo = numsAposPrimeiroRotulo.filter(n => n.idx < ultimoRotuloIdx)
  const offsetHistorico = numsAntesUltimoRotulo.length + 3

  const inicioHistoricos = numsAposPrimeiroRotulo.slice(offsetHistorico)
  if (inicioHistoricos.length < N) return []

  // 7. Grandezas mapeadas — descobre a posição de cada uma na lista de rótulos contíguos
  type TipoGrandeza = 'consumoFP' | 'consumoP' | 'demandaFP' | 'demandaP'
  const grandezasMapeadas: Array<{ re: RegExp; tipo: TipoGrandeza }> = [
    { re: /consumo\s+fora\s+ponta(?!\s+reativ)/i, tipo: 'consumoFP' },
    { re: /^consumo\s+ponta$/i,                    tipo: 'consumoP'  },
    { re: /demanda\s+fora\s+ponta(?!\s+reativ)/i,  tipo: 'demandaFP' },
    { re: /^demanda\s+ponta$/i,                    tipo: 'demandaP'  },
  ]

  const tiposComOffset: Array<{ tipo: TipoGrandeza; posNaListaRotulos: number }> = []
  for (const { re, tipo } of grandezasMapeadas) {
    for (let i = 0; i < rotulosContiguos.length; i++) {
      if (re.test(rotulosContiguos[i].label) && !tiposComOffset.find(t => t.tipo === tipo)) {
        tiposComOffset.push({ tipo, posNaListaRotulos: i })
      }
    }
  }

  function atribuir(tipo: TipoGrandeza, historicos: number[]) {
    for (let j = 0; j < Math.min(historicos.length, N); j++) {
      const { mes, ano } = mesesHeader[j]
      const entrada = resultado.get(`${mes}-${ano}`)
      if (!entrada) continue
      const val = historicos[j]
      if (val > 0) {
        switch (tipo) {
          case 'consumoFP':  entrada.consumoForaPontaKwh = val; break
          case 'consumoP':   entrada.consumoPontaKwh     = val; break
          case 'demandaFP':  entrada.demandaForaPontaKw  = val; break
          case 'demandaP':   entrada.demandaPontaKw      = val; break
        }
      }
    }
  }

  // 8. Extrai blocos: cada grandeza ocupa N posições consecutivas em inicioHistoricos
  for (const { tipo, posNaListaRotulos } of tiposComOffset) {
    const blocoStart = posNaListaRotulos * N
    const bloco = inicioHistoricos.slice(blocoStart, blocoStart + N).map(n => n.val)
    if (bloco.length >= N) atribuir(tipo, bloco)
  }

  return Array.from(resultado.values())
    .map(e => {
      const fp = e.consumoForaPontaKwh ?? 0
      const p  = e.consumoPontaKwh ?? 0
      if (fp > 0 || p > 0) e.consumoTotalKwh = fp + p
      return e
    })
    .filter(e => (e.consumoTotalKwh ?? 0) > 0 || (e.demandaForaPontaKw ?? 0) > 0)
}

function parseReais(str: string): number | undefined {
  // Remove R$, pontos de milhar, troca vírgula por ponto
  const cleaned = str.replace(/R\$\s*/gi, '').replace(/\./g, '').replace(',', '.').trim()
  const val = parseFloat(cleaned)
  return isNaN(val) ? undefined : val
}

function parseFloat2(str: string): number | undefined {
  const cleaned = str.replace(',', '.').trim()
  const val = parseFloat(cleaned)
  return isNaN(val) ? undefined : val
}

function matchReais(text: string, ...patterns: RegExp[]): number | undefined {
  for (const p of patterns) {
    const m = p.exec(text)
    if (m) return parseReais(m[1])
  }
  return undefined
}

/**
 * Soma todas as linhas que contêm palavras-chave de energia reativa e captura
 * o último valor monetário de cada linha (coluna total em tabelas sem "R$").
 * Usado para distribuidoras com formato tabular que preserva quebras de linha.
 */
function sumLinhasReativas(text: string): number | undefined {
  // Só captura linhas de EXCEDENTE reativo — ignora "Demanda Reativa" (medição sem encargo)
  const linhas = text.split('\n')
  let total = 0
  let encontrou = false
  const keyRe = /reativo\s+excedente|excedente\s+reativ|ufer|erex/i
  // Captura todos os números com 2 casas decimais na linha
  const numRe = /\d{1,8}[,.]\d{2}/g
  for (const linha of linhas) {
    if (!keyRe.test(linha)) continue
    const nums = [...linha.matchAll(numRe)]
    if (nums.length === 0) continue
    // Pega o último número da linha (coluna total na tabela)
    const ultimo = nums[nums.length - 1][0]
    const val = parseReais(ultimo)
    if (val !== undefined && val >= 1.0) {
      total += val
      encontrou = true
    }
  }
  return encontrou ? total : undefined
}

/**
 * CELESC: a tabela de faturamento é despejada em colunas contínuas pelo OCR
 * (sem quebra de linha por item). Clientes com microgeração solar têm valores
 * negativos de "Energia Injetada" imediatamente antes dos subtotais reativos.
 * Padrão: [-inj.Tusd] [-inj.Te] [reat.Ponta] [reat.ForaPonta] [demanda...]
 */
function extrairReativosCelesc(text: string): number | undefined {
  if (!/Consumo Reat/i.test(text)) return undefined
  // Dois negativos consecutivos seguidos de dois positivos (ponta + fora-ponta reativos)
  const m = /-[\d.]+,\d{2}\s+-[\d.]+,\d{2}\s+([\d.,]+)\s+([\d.,]+)/i.exec(text)
  if (!m) return undefined
  const v1 = parseReais(m[1])
  const v2 = parseReais(m[2])
  if (v1 === undefined || v2 === undefined) return undefined
  // Sanidade: cada parcela reativa deve ser razoável (< R$ 5.000)
  if (v1 > 5000 || v2 > 5000) return undefined
  return v1 + v2
}

function matchFloat(text: string, ...patterns: RegExp[]): number | undefined {
  for (const p of patterns) {
    const m = p.exec(text)
    if (m) return parseFloat2(m[1])
  }
  return undefined
}

export function extrairDadosFatura(texto: string): DadosFatura {
  const t = texto

  const dados: DadosFatura = {}

  // ── Valor total da fatura ──────────────────────────────────────────
  dados.valorTotal = matchReais(t,
    // Padrões genéricos
    /total\s+a\s+pagar[\s\S]{0,30}R\$\s*([\d.,]+)/i,
    /valor\s+total[\s\S]{0,20}R\$\s*([\d.,]+)/i,
    /total\s+da\s+fatura[\s\S]{0,20}R\$\s*([\d.,]+)/i,
    /valor\s+a\s+pagar[\s\S]{0,20}R\$\s*([\d.,]+)/i,
    // CELESC: "TOTAL 1.891,90" no final
    /\bTOTAL\s+([\d.]+,\d{2})\b/i,
    // COPEL/CEMIG: "R$2.845,86" isolado após data (antes de "Nome")
    /R\$\s*([\d.]+,\d{2})\s*(?:Nome|Endere|NOME)/i,
    // Genérico: R$ seguido de valor grande (>= 3 dígitos)
    /R\$\s*([\d]{1,3}(?:\.\d{3})+,\d{2})/,
    /R\$\s*([\d]{3,},\d{2})/,
  )

  // ── Consumo kWh ───────────────────────────────────────────────────
  // CELESC divide o consumo em múltiplas linhas por faixa de ICMS:
  //   (0D) Consumo TE KWH 150,000  ← ICMS 12%
  //   (0D) Consumo TE KWH 412,000  ← ICMS 17%
  // O total correto é a SOMA de todas as ocorrências.
  const celescTeMatches = [...t.matchAll(/\(0D\)\s*Consumo\s+TE\s*KWH\s+([\d.]+,?\d*)/gi)]
  if (celescTeMatches.length > 0) {
    dados.consumoKwh = celescTeMatches.reduce((sum, m) => sum + (parseFloat2(m[1]) ?? 0), 0)
  }

  if (dados.consumoKwh == null)
  dados.consumoKwh = matchFloat(t,
    /\(0[DE]\)\s*Consumo\s+TE\s*KWH\s+([\d.]+,?\d*)/i,
    // COPEL Grupo A: soma ponta + fora-ponta — extrai ponta primeiro
    /ENERGIA\s+ELETRICA\s+TE\s+(?:F\s+)?PONTA[\s\S]{0,30}kWh\s+([\d.,]+)/i,
    // Padrões genéricos
    /consumo[\s\S]{0,20}([\d.,]+)\s*kWh/i,
    /energia\s+ativ[ao][\s\S]{0,40}([\d.,]+)\s*kWh/i,
    /consumo\s+de\s+energia[\s\S]{0,20}([\d.,]+)/i,
    /total\s+de\s+energia[\s\S]{0,20}([\d.,]+)/i,
  )

  // Para COPEL Grupo A: se consumoKwh ainda nulo, tenta extrair da grade tabular
  if (dados.consumoKwh == null) {
    // Tenta "X kWh" ou "kWh X" (inline, outros distribuidores)
    const kwhs = [...t.matchAll(/\b(\d{1,4}(?:\.\d{3})*(?:,\d+)?)\s+kWh\b/gi)]
      .map(m => parseReais(m[1]) ?? 0)
      .filter(v => v > 50 && v < 99999) // filtra valores plausíveis de consumo
    if (kwhs.length >= 2) {
      const sorted = kwhs.sort((a, b) => b - a)
      dados.consumoKwh = sorted[0] + (sorted[1] ?? 0)
    } else if (kwhs.length === 1) {
      dados.consumoKwh = kwhs[0]
    }
  }
  // COPEL grade: "kWh kWh kWh kWh kWh kW kW kWh kWh\n255 255 1.925 1.925 ..."
  if (dados.consumoKwh == null) {
    const gridMatch = /(?:kWh\s+){4,5}kW[\s\S]{0,60}?\n?\s*([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)/.exec(t)
    if (gridMatch) {
      const ponta = parseReais(gridMatch[1]) ?? 0    // TE ponta
      const fPonta = parseReais(gridMatch[3]) ?? 0   // TE fora-ponta (3º valor, índice skip TUSD)
      if (ponta + fPonta > 0) dados.consumoKwh = ponta + fPonta
    }
  }

  // ── Consumo ponta / fora ponta ────────────────────────────────────
  dados.consumoPontaKwh = matchFloat(t,
    /consumo\s+ponta[\s\S]{0,30}([\d.,]+)\s*kWh/i,
    /energia\s+ativ[ao]\s+ponta[\s\S]{0,30}([\d.,]+)/i,
    /ENERGIA\s+ELETRICA\s+TE\s+PONTA[\s\S]{0,50}?([\d]+(?:\.\d{3})*(?:,\d+)?)\s/i,
  )
  dados.consumoForaPontaKwh = matchFloat(t,
    /consumo\s+fora[\s\S]{0,30}([\d.,]+)\s*kWh/i,
    /energia\s+ativ[ao]\s+fora\s+ponta[\s\S]{0,30}([\d.,]+)/i,
    /ENERGIA\s+ELETRICA\s+TE\s+F\s+PONTA[\s\S]{0,50}?([\d]+(?:\.\d{3})*(?:,\d+)?)\s/i,
  )

  // ── Demanda (Grupo A) ─────────────────────────────────────────────
  dados.demandaContratadaKw = matchFloat(t,
    /demanda\s+contratada[\s\S]{0,30}([\d.,]+)\s*kW/i,
    /demanda\s+faturada[\s\S]{0,30}([\d.,]+)\s*kW/i,
    // COPEL: "Demanda Todos os Períodos: 40 kW"
    /Demanda\s+Todos\s+os\s+Per[íi]odos[:\s]+([\d.,]+)\s*kW/i,
    // CELESC: "DEMANDA PONTA (kW): 120"
    /DEMANDA\s+PONTA\s*\(kW\)[:\s]+([\d.,]+)/i,
    // CELESC genérico: "DEMANDA (kW): 120"
    /DEMANDA\s*\(kW\)[:\s]+([\d.,]+)/i,
    // CELESC visual: "Grandezas Contratadas ... Demanda ... 70 KW"
    /Grandezas\s+Contratadas[\s\S]{0,120}?Demanda[\s\S]{0,60}?(\d+(?:[.,]\d+)?)\s*KW/i,
    // CELESC visual simples: "Demanda 70 KW" seguido de Medida/Faturada
    /\bDemanda\s+(\d{2,4})\s*KW\b(?:[\s\S]{0,30}?(?:Medida|Faturada))/i,
    // CELESC tabela: "(0T) Demanda KW 87,310" — usa demanda faturada como contratada
    /\(0T\)\s*Demanda\s+KW\s+([\d.,]+)/i,
  )
  dados.demandaMedidaKw = matchFloat(t,
    /demanda\s+medida[\s\S]{0,30}([\d.,]+)\s*kW/i,
    /demanda\s+registrada[\s\S]{0,30}([\d.,]+)\s*kW/i,
    // COPEL tabela: primeiro valor de DEMANDA USD (kW)
    /DEMANDA\s+USD\s+kW\s+([\d.,]+)/i,
    // CELESC tabela de faturamento: "Demanda Tusd   74   23,14..."
    /Demanda\s+Tusd\b[\s\S]{0,10}?([\d]+(?:[.,]\d+)?)\s+[\d,]+\s+[\d,]/i,
    // CELESC medição: linha DNP ou DMP (kW PT)
    /\bDNP\b[\s\S]{0,60}kW\s+PT[\s\S]{0,10}([\d.,]+)/i,
    /\bDMP\b[\s\S]{0,60}kW\s+PT[\s\S]{0,10}([\d.,]+)/i,
    // CELESC novo formato: "Demanda Ativa Fora Ponta [atual] [anterior] [medido]" — 3º valor = kW FP
    /Demanda\s+Ativa\s+Fora\s+Ponta\s+[\d.,]+\s+[\d.,]+\s+([\d.,]+)/i,
    // CELESC formato antigo: bloco MEDIDO após "kVArh TP" + 14 constantes (0,0xxx) → 4º valor = DNF (kW FP)
    /kVArh\s+TP\s+(?:0,0\d+\s+){14}[\d.,]+\s+[\d.,]+\s+[\d.,]+\s+([\d.,]+)/,
    // CELESC visual: "Ponta (PT) Fora Ponta (FP) 33KW 66KW" — pega FP (segundo KW, logo após PT)
    /Ponta\s*\(PT\)\s+Fora\s+Ponta\s*\(FP\)\s+\d+\s*KW\s+(\d+)\s*KW/i,
    // CELESC visual: "Medida  45KW  87KW" — segundo KW = FP
    /Medida[\s\S]{0,5}\d+\s*KW[\s\S]{0,5}(\d+)\s*KW/i,
    // CELESC tabela: "(0T) Demanda KW 87,310"
    /\(0T\)\s*Demanda\s+KW\s+([\d.,]+)/i,
  )

  // ── Fator de potência ─────────────────────────────────────────────
  dados.fatorPotencia = matchFloat(t,
    /fator\s+de\s+pot[êe]ncia[\s\S]{0,30}(0[,.][\d]+)/i,
    /fp[\s:]+([0-9][,.][\d]+)/i,
  )

  // ── Valor reativo ─────────────────────────────────────────────────
  dados.valorReativo =
    matchReais(t,
      /excedente\s+de\s+reativos[\s\S]{0,40}R\$\s*([\d.,]+)/i,
      /reativos[\s\S]{0,30}R\$\s*([\d.,]+)/i,
      /EREX[\s\S]{0,30}R\$\s*([\d.,]+)/i,
    ) ??
    extrairReativosCelesc(t) ??
    sumLinhasReativas(t)

  // ── COSIP ─────────────────────────────────────────────────────────
  dados.cosip = matchReais(t,
    /cosip[\s\S]{0,30}R\$\s*([\d.,]+)/i,
    /ilumina[çc][ãa]o\s+p[úu]blica[\s\S]{0,30}R\$\s*([\d.,]+)/i,
    /CIP[\s:]+R\$\s*([\d.,]+)/i,
  )

  // ── Modalidade / grupo ────────────────────────────────────────────
  if (/modalidade\s*(verde|azul)/i.test(t) || /mod\s+tarifaria\s+horaria\s+(verde|azul)/i.test(t) || /Bandeira\s+Tarif[áa]ria[\s\S]{0,30}?(Verde|Azul)/i.test(t) || /horosazonal\s+(verde|azul)/i.test(t) || /\bEtapa:\s*(Verde|Azul)/i.test(t)) {
    const m = /modalidade\s*(verde|azul)/i.exec(t) ?? /mod\s+tarifaria\s+horaria\s+(verde|azul)/i.exec(t) ?? /Bandeira\s+Tarif[áa]ria[\s\S]{0,30}?(Verde|Azul)/i.exec(t) ?? /horosazonal\s+(verde|azul)/i.exec(t) ?? /\bEtapa:\s*(Verde|Azul)/i.exec(t)
    dados.modalidade = m ? m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase() : undefined
    dados.grupo = 'A'
  } else if (/modalidade[\s\S]{0,30}convencional/i.test(t) || /tarifa\s+convencional/i.test(t)) {
    dados.modalidade = 'Convencional'
    dados.grupo = 'B'
  }

  // Subgrupo
  const subgrupoMatch = /subgrupo[\s:]+([AB][0-9a-z]*)/i.exec(t)
    ?? /\b(B[1-4]|A[0-9]|AS|A3a)\b/.exec(t)
  if (subgrupoMatch) {
    dados.subgrupo = subgrupoMatch[1].toUpperCase()
    if (dados.subgrupo.startsWith('B')) dados.grupo = 'B'
    if (dados.subgrupo.startsWith('A')) dados.grupo = 'A'
  }

  // Tipo ligação
  if (/trifásico|trifasico|trif[áa]sico/i.test(t)) dados.tipoLigacao = 'Trifásico'
  else if (/bifásico|bifasico|bif[áa]sico/i.test(t)) dados.tipoLigacao = 'Bifásico'
  else if (/monofásico|monofasico|monof[áa]sico/i.test(t)) dados.tipoLigacao = 'Monofásico'

  // CEP e estado
  const cepMatch = /\b(\d{5}-\d{3})\b/.exec(t)
  if (cepMatch) dados.cep = cepMatch[1]

  const estadoMatch = /\b(AC|AL|AM|AP|BA|CE|DF|ES|GO|MA|MG|MS|MT|PA|PB|PE|PI|PR|RJ|RN|RO|RR|RS|SC|SE|SP|TO)\b/.exec(t)
  if (estadoMatch) dados.estado = estadoMatch[1]

  // ── Endereço da UC ────────────────────────────────────────────────
  // Tenta extrair o endereço de instalação/entrega de vários formatos
  //
  // CELESC: OCR lê colunas fora de ordem — o endereço aparece ANTES do label "ENDERECO:"
  // Padrão: "CPF/CNPJ: ***XXX-** CPF/CNPJ: SAO PEDRO 78 - PACHECOS B ARIRIU-PH ENDERECO: 88135-077..."
  // A 2ª ocorrência de "CPF/CNPJ: " é seguida diretamente pelo endereço (começa com letra/dígito, não asterisco)
  const celescEnderecoMatch = /CPF\/CNPJ:\s+([A-Z0-9][^]{5,100}?)\s+ENDERE[ÇC]O/i.exec(t)
  if (celescEnderecoMatch) {
    dados.enderecoUC = celescEnderecoMatch[1].trim().replace(/\s+/g, ' ')
  } else {
    const enderecoMatch =
      /endere[çc]o\s+de\s+entrega[:\s]+([^\n]{5,80})/i.exec(t)
      ?? /local\s+de\s+consumo[:\s]+([^\n]{5,80})/i.exec(t)
      ?? /local\s+de\s+fornecimento[:\s]+([^\n]{5,80})/i.exec(t)
      ?? /instala[çc][ãa]o[:\s]+([^\n]{5,80})/i.exec(t)
      ?? /endere[çc]o[:\s]+([^\n]{5,120})/i.exec(t)
    if (enderecoMatch) {
      const raw = enderecoMatch[1].trim().replace(/\s+/g, ' ')
      const truncado = raw
        .replace(/\s*-?\s*CEP[:\s].*/i, '')
        .replace(/\s*\d{5}-\d{3}.*/i, '')
        .replace(/\s*-?\s*CIDADE[:\s].*/i, '')
        .replace(/\s*-?\s*CPF[:/].*/i, '')
        .replace(/\s*-?\s*CNPJ[:/].*/i, '')
        .replace(/\s*-?\s*Grupo\/Subgrupo.*/i, '')
        .replace(/\s*-?\s*\d{2}\/\d{2}\/\d{4}.*/i, '')
        .trim()
      if (truncado.length >= 5) dados.enderecoUC = truncado
    }
  }

  // Tarifa energia (R$/kWh)
  dados.tarifaEnergia = matchFloat(t,
    /tarifa[\s\S]{0,40}([\d.,]+)\s*R\$\/kWh/i,
    /pre[çc]o[\s\S]{0,20}([\d]{1}\,[\d]{4,6})\s*kWh/i,
  )

  // ── Número do cliente / unidade consumidora ───────────────────────
  const ncMatch =
    /n[úu]mero\s+do\s+cliente[:\s]+([\d./-]+)/i.exec(t)
    ?? /n[úu]mero\s+da\s+instala[çc][ãa]o[:\s]+([\d./-]+)/i.exec(t)
    ?? /c[óo]digo\s+do\s+cliente[:\s]+([\d./-]+)/i.exec(t)
    ?? /unidade\s+consumidora[:\s]+([\d./-]+)/i.exec(t)
    ?? /cliente[:\s]+([\d]{6,12})/i.exec(t)
  if (ncMatch) dados.numeroCliente = ncMatch[1].trim()

  // ── Distribuidora ─────────────────────────────────────────────────
  // Busca apenas no cabeçalho do texto (primeiros 2000 chars) para evitar
  // falsos positivos — ex: CELESC invoice pode citar COPEL em notas de rodapé
  const cabecalho = t.slice(0, 2000)
  const distribuidoras: [RegExp, string][] = [
    [/CELESC/i, 'CELESC'],       // SC — antes de COPEL/COPEL-D para evitar conflito
    [/COPEL[-\s]?D\b/i, 'COPEL'],// COPEL Distribuição
    [/\bCOPEL\b/i, 'COPEL'],
    [/CEMIG/i, 'CEMIG'],
    [/ENEL/i, 'ENEL'],
    [/LIGHT/i, 'LIGHT'],
    [/ELEKTRO/i, 'ELEKTRO'],
    [/CELPE/i, 'CELPE'],
    [/COELBA/i, 'COELBA'],
    [/CPFL/i, 'CPFL'],
    [/ENERGISA/i, 'ENERGISA'],
    [/EQUATORIAL/i, 'EQUATORIAL'],
    [/NEOENERGIA/i, 'NEOENERGIA'],
    [/CELG/i, 'CELG'],
    [/CELPA/i, 'CELPA'],
    [/AMAZONAS\s*ENERGIA/i, 'AMAZONAS ENERGIA'],
    [/BANDEIRANTE/i, 'BANDEIRANTE'],
    [/EDP\b/i, 'EDP'],
    [/RGE/i, 'RGE'],
    [/ENERSUL/i, 'ENERSUL'],
    [/CERON/i, 'CERON'],
  ]
  for (const [re, nome] of distribuidoras) {
    if (re.test(cabecalho)) { dados.distribuidora = nome; break }
  }

  // ── Nome do titular (cliente) ─────────────────────────────────────
  // Normaliza quebras de linha em espaços para capturar nomes multi-linha
  const tNorm = t.replace(/\r?\n/g, ' ').replace(/\s{2,}/g, ' ')

  // Palavras que indicam que o match capturou lixo de formulário
  const nomeLixoRe = /^(?:do|da|de|dos|das|cliente|instala|data|hora|visto|ausente|n[úu]mero|inexistente|mudou|endere[çc]o|recusou|fechada|outros|agencia|cedente|sacado|vencimento|pagavel|informac)/i

  // Tenta cada padrão em ordem e usa o primeiro candidato válido
  const nomeCandidatos: RegExp[] = [
    // CELESC OCR colado: "CLINICA DIRCKSEN LTDANOME:" ou "CLINICA DIRCKSEN LTDAPagador:"
    /([A-ZÀ-Ú][A-ZÀ-Ú .'-]{3,80}?)(?=NOME:|Pagador:)/,
    // CELESC boleto visual: "Pagador: CLINICA DIRCKSEN LTDA"
    /Pagador[:\s]+([A-ZÀ-Úa-zà-ú .'-]{4,100}?)(?=\s+(?:CPF|CNPJ|Endere[çc]o|CEP|\d)|$)/i,
    // CELESC: "JS FERREIRA ALIMENTOS LTDA CPJ 81.791.485/0001-80" (CPJ = OCR de CNPJ)
    /([A-ZÀ-Ú][A-ZÀ-Úa-zà-ú .'-]{3,80}?)\s+C[NP]J\s+[\d.\/\-]+/i,
    // Razão social explícita
    /(?:raz[ãa]o\s+social)[:\s]+([A-ZÀ-Úa-zà-ú .'-]{4,100}?)(?=\s+(?:CNPJ|CEP|Endere[çc]o))/i,
    // "Nome / Razão Social: FULANO"
    /(?:nome\s*\/\s*raz[ãa]o\s+social)[:\s]+([A-ZÀ-Úa-zà-ú .'-]{4,100}?)(?=\s+(?:CNPJ|CEP|Endere[çc]o))/i,
    // COPEL e similares: "Nome: FULANO  Endereço"
    /Nome[:\s]+([A-ZÀ-Ú][A-ZÀ-Úa-zà-ú .'-]{3,100}?)(?=\s+(?:Endere[çc]o|CEP|CNPJ|I\.E\.|Tipo\s+de|Classifica))/i,
    // "Titular: FULANO"
    /titular[:\s]+([A-ZÀ-Úa-zà-ú .'-]{4,100}?)(?=\s+(?:Endere[çc]o|CEP|CNPJ|\d))/i,
    // Relatório EnergyAI
    /Titular\s+da\s+an[áa]lise\s+([A-ZÀ-Úa-zà-ú .'-]{4,100}?)(?=\s+(?:ALERT|Distribuidora)|$)/i,
  ]

  for (const p of nomeCandidatos) {
    const m = p.exec(tNorm)
    if (!m) continue
    const candidato = m[1].trim()
    if (candidato.length >= 4 && !nomeLixoRe.test(candidato)) {
      dados.nomeCliente = candidato
      break
    }
  }

  // ── Mês e Ano de referência ───────────────────────────────────────
  const MESES_PT: [RegExp, number][] = [
    [/janeiro|jan\b/i, 1], [/fevereiro|fev\b/i, 2], [/mar[çc]o|mar\b/i, 3],
    [/abril|abr\b/i, 4], [/maio/i, 5], [/junho|jun\b/i, 6],
    [/julho|jul\b/i, 7], [/agosto|ago\b/i, 8], [/setembro|set\b/i, 9],
    [/outubro|out\b/i, 10], [/novembro|nov\b/i, 11], [/dezembro|dez\b/i, 12],
  ]
  // Padrão: "Referência: 03/2025" ou "Competência: 03/2025"
  const refMatch =
    /(?:refer[êe]ncia|compet[êe]ncia|vencimento|per[íi]odo)[:\s]+([\d]{2})\/([\d]{4})/i.exec(t)
    ?? /([\d]{2})\/([\d]{4})/.exec(t)  // fallback: primeiro MM/YYYY no texto
  if (refMatch) {
    const m = parseInt(refMatch[1], 10)
    const a = parseInt(refMatch[2], 10)
    if (m >= 1 && m <= 12 && a >= 2000 && a <= 2100) {
      dados.mesReferencia = m
      dados.anoReferencia = a
    }
  }
  // Fallback textual
  if (!dados.mesReferencia) {
    const anoTextoMatch = /[\d]{4}/.exec(t)
    for (const [re, num] of MESES_PT) {
      if (re.test(t)) { dados.mesReferencia = num; break }
    }
    if (anoTextoMatch && !dados.anoReferencia) {
      const a = parseInt(anoTextoMatch[0], 10)
      if (a >= 2000 && a <= 2100) dados.anoReferencia = a
    }
  }

  // ── Histórico de consumo (tabela dos 12 meses) ────────────────────
  const historico = extrairHistoricoConsumo(t)
  if (historico.length > 0) {
    dados.historico = historico
  } else {
    // Fallback: Grupo B não tem rótulos de ponta/fora-ponta
    const historicoB = extrairHistoricoGrupoB(t)
    if (historicoB.length > 0) dados.historico = historicoB
  }

  return dados
}
