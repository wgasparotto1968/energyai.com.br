import type { DadosFatura } from './extrator'

export interface Co2Analise {
  // Energia que deixa de ser consumida/gerada suja (kWh/ano)
  energiaEconomizadaKwhAno: number
  // Fator SIN 2024: 0.0817 kgCO2/kWh
  fatorEmissao: number
  // Evitado
  co2EvitadoKgMes: number
  co2EvitadoKgAno: number
  co2EvitadoKg5Anos: number
  co2EvitadoKg25Anos: number
  // Equivalências
  arvoresEquivalentes: number   // 1 árvore ≈ 22 kgCO2/ano
  kmCarroEquivalentes: number   // 1 km ≈ 0.21 kgCO2
  celularesCarregados: number   // 1 carga ≈ 0.008 kgCO2
}

export interface ResultadoAnalise {
  grupo: 'A' | 'B' | 'INDEFINIDO'
  insights: Insight[]
  resumo: ResumoFatura
  co2?: Co2Analise
}

export interface Insight {
  tipo: 'alerta' | 'economia' | 'info' | 'ok'
  titulo: string
  descricao: string
  valorMensal?: number
  valorAnual?: number
  recomendacao?: string
  investimento?: number
  paybackAnos?: number
  custoFuturo?: number
}

export interface ResumoFatura {
  valorTotal: number
  consumoKwh?: number
  custoKwh?: number          // R$/kWh efetivo
  modalidade?: string
  subgrupo?: string
  tipoLigacao?: string
  distribuidora?: string
}

const MARGEM_SEGURANCA = 0.10   // 10%
const FP_MINIMO = 0.92           // ANEEL

function analisarGrupoA(dados: DadosFatura): Insight[] {
  const insights: Insight[] = []

  // 1. Demanda
  if (dados.demandaContratadaKw != null && dados.demandaMedidaKw != null) {
    const contratada = dados.demandaContratadaKw
    const medida = dados.demandaMedidaKw
    const tarifaDemanda = dados.tarifaDemanda ?? 30 // R$/kW referência

    const limiteIdeal = medida * (1 + MARGEM_SEGURANCA)

    if (contratada > limiteIdeal) {
      // Sobrecontratação
      const excesso = contratada - limiteIdeal
      const economiaMensal = excesso * tarifaDemanda
      const economiaAnual = economiaMensal * 12
      insights.push({
        tipo: 'economia',
        titulo: 'Demanda sobrecontratada',
        descricao: `Sua demanda contratada (${contratada} kW) está ${excesso.toFixed(1)} kW acima do ideal para seu perfil de consumo.`,
        valorMensal: economiaMensal,
        valorAnual: economiaAnual,
        recomendacao: `Reduza a demanda contratada para ${limiteIdeal.toFixed(0)} kW e economize ~R$ ${economiaMensal.toFixed(0)}/mês.`,
      })
    } else if (medida > contratada) {
      // Subcontratação / ultrapassagem
      const ultrapassagem = medida - contratada
      const pct = ultrapassagem / contratada
      const multiplicador = pct <= 0.05 ? 2 : 3
      const multa = ultrapassagem * tarifaDemanda * multiplicador
      insights.push({
        tipo: 'alerta',
        titulo: 'Ultrapassagem de demanda',
        descricao: `A demanda medida (${medida} kW) ultrapassou a contratada (${contratada} kW) em ${(pct * 100).toFixed(1)}%. Multa aplicada: ~R$ ${multa.toFixed(0)}.`,
        valorMensal: multa,
        valorAnual: multa * 12,
        recomendacao: `Contrate pelo menos ${(medida * (1 + MARGEM_SEGURANCA)).toFixed(0)} kW para evitar multas.`,
      })
    } else {
      insights.push({
        tipo: 'ok',
        titulo: 'Demanda adequada',
        descricao: `Demanda contratada (${contratada} kW) está dentro do limite ideal.`,
      })
    }
  }

  // 2. Fator de potência
  if (dados.fatorPotencia != null && dados.fatorPotencia < FP_MINIMO) {
    const custoReativo = dados.valorReativo ?? 0
    insights.push({
      tipo: 'alerta',
      titulo: 'Fator de potência abaixo do limite',
      descricao: `FP medido: ${dados.fatorPotencia.toFixed(2)} (mínimo ANEEL: ${FP_MINIMO}). Você paga o encargo de reativos excedentes.`,
      valorMensal: custoReativo,
      valorAnual: custoReativo * 12,
      recomendacao: 'Instale banco de capacitores para corrigir o fator de potência e eliminar essa cobrança.',
    })
  }

  // 3. Comparativo Verde/Azul (quando modalidade identificada)
  if (dados.modalidade) {
    insights.push({
      tipo: 'info',
      titulo: `Modalidade tarifária: ${dados.modalidade}`,
      descricao:
        dados.modalidade === 'Verde'
          ? 'Na Tarifa Verde, a demanda é única mas a energia na ponta é mais cara. Se seu consumo na ponta for alto, considere avaliar a Tarifa Azul.'
          : 'Na Tarifa Azul, a demanda é separada (ponta/fora ponta). Considere simular a Tarifa Verde se seu consumo na ponta for baixo.',
      recomendacao: 'Solicite uma simulação comparativa com base em 12 meses para determinar a modalidade mais econômica.',
    })
  }

  // 3b. Custo efetivo por kWh (sempre exibir quando disponível)
  if (dados.valorTotal != null && dados.consumoKwh != null && dados.consumoKwh > 0) {
    const custoKwh = dados.valorTotal / dados.consumoKwh
    insights.push({
      tipo: 'info',
      titulo: `Custo efetivo: R$ ${custoKwh.toFixed(2)}/kWh`,
      descricao: `Custo médio da energia incluindo todos os encargos e tributos. Para Grupo A, compare com a tarifa homologada pela ANEEL para sua distribuidora.`,
    })
  }

  // 3c. Quando não há dados de demanda, emite alerta informativo
  if (dados.demandaContratadaKw == null && dados.demandaMedidaKw == null) {
    insights.push({
      tipo: 'alerta',
      titulo: 'Dados de demanda não identificados',
      descricao: 'Não foi possível extrair a demanda contratada e medida desta fatura. A análise de sobrecontratação/ultrapassagem requer esses dados.',
      recomendacao: 'Verifique na fatura os campos "Demanda Contratada" e "Demanda Medida" e confira se o PDF é a fatura original (não um relatório ou extrato).',
    })
  }

  // 4. B Optante — elegibilidade para migrar para Grupo B
  // ANEEL: MAX demanda medida < 112 kW permite pedido de migração
  if (dados.demandaMedidaKw != null && dados.valorTotal != null) {
    const LIMITE_B_OPTANTE_KW = 112
    const elegivel = dados.demandaMedidaKw < LIMITE_B_OPTANTE_KW

    if (elegivel && dados.consumoKwh != null && dados.consumoKwh > 0) {
      // Estima custo no Grupo B: consumo * tarifa B ref + COSIP + taxa mínima trifásica
      const TARIFA_B_REF = 0.90 // R$/kWh — referência média Brasil
      const TAXA_MIN_B_TRIFASICO = 95 // R$/mês — monofásico equiv. para consumidores industriais BT
      const cosipAtual = dados.cosip ?? 0
      const custoEstimadoB = dados.consumoKwh * TARIFA_B_REF + TAXA_MIN_B_TRIFASICO + cosipAtual
      const economiaMensal = dados.valorTotal - custoEstimadoB

      if (economiaMensal > 0) {
        insights.push({
          tipo: 'economia',
          titulo: 'Elegível para migração B Optante',
          descricao: `Sua demanda máxima medida (${dados.demandaMedidaKw} kW) é inferior a 112 kW. Você pode solicitar migração para tarifa Grupo B, potencialmente mais simples e econômica.`,
          valorMensal: economiaMensal,
          valorAnual: economiaMensal * 12,
          recomendacao: `Custo estimado no Grupo B: R$ ${custoEstimadoB.toFixed(0)}/mês vs. atual R$ ${dados.valorTotal.toFixed(0)}/mês. Consulte sua concessionária — esta é uma estimativa indicativa.`,
        })
      } else {
        insights.push({
          tipo: 'info',
          titulo: 'Elegível para B Optante, mas sem vantagem aparente',
          descricao: `Demanda medida (${dados.demandaMedidaKw} kW) permite pedido de migração para Grupo B, porém a estimativa de custo não apresenta economia expressiva no perfil atual.`,
          recomendacao: 'Solicite simulação detalhada com sua concessionária antes de migrar.',
        })
      }
    } else if (!elegivel) {
      // não mostrar nada — silêncio quando não elegível
    }
  }

  return insights
}

function analisarGrupoB(dados: DadosFatura): Insight[] {
  const insights: Insight[] = []

  // 1. Custo efetivo por kWh
  if (dados.valorTotal != null && dados.consumoKwh != null && dados.consumoKwh > 0) {
    const custoKwh = dados.valorTotal / dados.consumoKwh
    let referencia = 'médio'
    if (custoKwh > 1.2) referencia = 'alto'
    else if (custoKwh < 0.7) referencia = 'baixo'

    insights.push({
      tipo: custoKwh > 1.2 ? 'alerta' : 'info',
      titulo: `Custo efetivo: R$ ${custoKwh.toFixed(2)}/kWh`,
      descricao: `Seu custo efetivo por kWh é ${referencia} (inclui energia + tributos + COSIP).`,
    })
  }

  // 2. COSIP
  if (dados.cosip != null && dados.cosip > 0) {
    insights.push({
      tipo: 'info',
      titulo: 'Contribuição de Iluminação Pública (COSIP)',
      descricao: `R$ ${dados.cosip.toFixed(2)}/mês cobrados em fatura. Este valor não é passível de redução, mas você pode acompanhar eventuais cobranças indevidas.`,
      valorMensal: dados.cosip,
      valorAnual: dados.cosip * 12,
    })
  }

  // 3. Solar fotovoltaico on-grid + híbrido
  if (dados.consumoKwh != null && dados.consumoKwh > 0 && dados.valorTotal != null) {

    // Usa média do histórico quando disponível (mais representativo que um mês isolado)
    const mesesHistorico = (dados.historico ?? [])
      .map(h => h.consumoTotalKwh ?? ((h.consumoForaPontaKwh ?? 0) + (h.consumoPontaKwh ?? 0)))
      .filter(v => v > 0)
    const consumoBase =
      mesesHistorico.length >= 3
        ? Math.round(mesesHistorico.reduce((a, b) => a + b, 0) / mesesHistorico.length)
        : dados.consumoKwh
    const baseLabel =
      mesesHistorico.length >= 3
        ? `média de ${mesesHistorico.length} meses`
        : 'consumo deste mês'

    // Taxa mínima (kWh e reais estimados) por tipo de ligação
    const taxaMinKwh =
      dados.tipoLigacao === 'Trifásico' ? 100
      : dados.tipoLigacao === 'Bifásico' ? 50
      : 30
    const taxaMinReais =
      dados.tipoLigacao === 'Trifásico' ? 95
      : dados.tipoLigacao === 'Bifásico' ? 50
      : 30

    const consumoAbativel = Math.max(0, consumoBase - taxaMinKwh)

    if (consumoAbativel > 0) {
      const HSP = 4.5                    // kWh/m²/dia — média Brasil
      const perda = 0.22                 // 22% perdas do sistema
      const fatorSistema = HSP * 30 * (1 - perda)  // ≈ 105.3 kWh/kWp/mês

      // ─── ON-GRID ───────────────────────────────────────────────
      // Dimensionamento para abater todo consumo abatível + 20% de margem
      const MARGEM = 1.20
      const kWpOnGrid = (consumoAbativel / fatorSistema) * MARGEM
      const investimentoOnGrid = kWpOnGrid * 1000 * 2.70  // R$ 2,70/Wp

      const cosip = dados.cosip ?? 0
      const tarifaMedia = dados.valorTotal / dados.consumoKwh
      // Fio B: usa valorDistribuicao da fatura (TUSD) quando disponível,
      // caso contrário estima como 60% da tarifa total
      const fioBPorKwh = (dados.valorDistribuicao != null && dados.consumoKwh > 0)
        ? dados.valorDistribuicao / dados.consumoKwh
        : tarifaMedia * 0.60
      // On-grid: 30% de simultaneidade → Fio B incide sobre 70% do consumo compensado
      const custoResidualOnGrid = (consumoAbativel * 0.70 * fioBPorKwh) + cosip
      const economiaMensalOnGrid = Math.max(0, consumoAbativel * tarifaMedia - custoResidualOnGrid)
      const economiaAnualOnGrid = economiaMensalOnGrid * 12
      const paybackOnGrid = economiaAnualOnGrid > 0 ? investimentoOnGrid / economiaAnualOnGrid : 0
      const paineis600W = Math.ceil((kWpOnGrid * 1000) / 600)
      const geracaoMensalOnGrid = Math.round(kWpOnGrid * fatorSistema)

      if (kWpOnGrid >= 0.5) {
        insights.push({
          tipo: 'economia',
          titulo: `Instalação Sistema Solar`,
          descricao: [
            `${paineis600W} painéis de 600W irão gerar ~${geracaoMensalOnGrid} kWh/mês (projeção de geração do sistema).`,
            `Conta cai para ~R$ ${Math.round(custoResidualOnGrid)}/mês (Fio B sobre 70% do consumo + COSIP).`,
            `Economia: R$ ${economiaMensalOnGrid.toFixed(2).replace('.', ',')}/mês · R$ ${Math.round(economiaAnualOnGrid).toLocaleString('pt-BR')}/ano.`,
            `Investimento estimado: R$ ${Math.round(investimentoOnGrid).toLocaleString('pt-BR')}.`,
            `Payback: ${paybackOnGrid.toFixed(1)} anos.`,
          ].join('\n'),
          valorMensal: economiaMensalOnGrid,
          valorAnual: economiaAnualOnGrid,
          investimento: Math.round(investimentoOnGrid),
          paybackAnos: paybackOnGrid,
          custoFuturo: Math.round(custoResidualOnGrid),
          recomendacao: `Investimento estimado: R$ ${Math.round(investimentoOnGrid).toLocaleString('pt-BR')}. Retorno em ${paybackOnGrid.toFixed(1)} anos. Retorno 25 anos: R$ ${Math.round(economiaAnualOnGrid * 25 - investimentoOnGrid).toLocaleString('pt-BR')}.`,
        })
      }

      // ─── HÍBRIDO (com baterias) ────────────────────────────────
      // Simultaneidade 85% — cobre consumo noturno via baterias
      const kWpHibrido = (consumoAbativel / fatorSistema) * MARGEM
      const investimentoHibrido = kWpHibrido * 1000 * 5.00  // R$ 5,00/Wp (inclui baterias)
      // Híbrido: baterias cobrem uso noturno → Fio B incide apenas no excedente não armazenado (~15%)
      const custoResidualHibrido = (consumoAbativel * 0.15 * fioBPorKwh) + cosip
      const economiaMensalHibrido = Math.max(0, consumoAbativel * tarifaMedia - custoResidualHibrido)
      const economiaAnualHibrido = economiaMensalHibrido * 12
      const paybackHibrido = economiaAnualHibrido > 0 ? investimentoHibrido / economiaAnualHibrido : 0
      const paineis600WHibrido = Math.ceil((kWpHibrido * 1000) / 600)
      const geracaoMensalHibrido = Math.round(kWpHibrido * fatorSistema)

      if (kWpHibrido >= 0.5 && economiaMensalHibrido > 0) {
        insights.push({
          tipo: 'info',
          titulo: `Instalação Sistema Solar com Baterias`,
          descricao: [
            `${paineis600WHibrido} painéis de 600W irão gerar ~${geracaoMensalHibrido} kWh/mês (projeção de geração do sistema).`,
            `Conta cai para ~R$ ${Math.round(custoResidualHibrido)}/mês (Fio B mínimo + COSIP — baterias cobrem consumo noturno).`,
            `Economia: R$ ${economiaMensalHibrido.toFixed(2).replace('.', ',')}/mês · R$ ${Math.round(economiaAnualHibrido).toLocaleString('pt-BR')}/ano.`,
            `Investimento estimado: R$ ${Math.round(investimentoHibrido).toLocaleString('pt-BR')}.`,
            `Payback: ${paybackHibrido.toFixed(1)} anos.`,
            `Com as baterias, você também fica protegido contra quedas de energia da rede e tem total controle sobre seu consumo. Além disso, com independência energética, é possível migrar para a Tarifa Branca, reduzindo ainda mais sua conta ao aproveitar horários de menor custo.`,
          ].join('\n'),
          valorMensal: economiaMensalHibrido,
          valorAnual: economiaAnualHibrido,
          investimento: Math.round(investimentoHibrido),
          paybackAnos: paybackHibrido,
          custoFuturo: Math.round(custoResidualHibrido),
          recomendacao: `Investimento: R$ ${Math.round(investimentoHibrido).toLocaleString('pt-BR')} (custo R$ 6,00/Wp). Payback ${paybackHibrido.toFixed(1)} anos. Comparado ao on-grid (R$ ${Math.round(investimentoOnGrid).toLocaleString('pt-BR')}), o híbrido oferece maior independência energética.`,
        })
      }
    }
  }

  return insights
}

export function analisarFatura(dados: DadosFatura): ResultadoAnalise {
  const grupo: 'A' | 'B' | 'INDEFINIDO' =
    dados.grupo === 'A' ? 'A'
    : dados.grupo === 'B' ? 'B'
    : 'INDEFINIDO'

  let insights: Insight[] = []

  if (grupo === 'A') {
    insights = analisarGrupoA(dados)
  } else if (grupo === 'B') {
    insights = analisarGrupoB(dados)
  } else {
    // Análise genérica
    if (dados.valorTotal != null && dados.consumoKwh != null && dados.consumoKwh > 0) {
      insights.push({
        tipo: 'info',
        titulo: 'Análise parcial',
        descricao: 'Não foi possível identificar o grupo tarifário na fatura. Verifique manualmente se é Grupo A (alta/média tensão) ou Grupo B (baixa tensão).',
      })
    }
  }

  const custoKwh =
    dados.valorTotal != null && dados.consumoKwh != null && dados.consumoKwh > 0
      ? dados.valorTotal / dados.consumoKwh
      : undefined

  // ── CO₂ ────────────────────────────────────────────────────────
  // Soma kWh economia de todos os insights com valorAnual e base de consumo
  const economiaAnualTotal = insights
    .filter((i) => i.tipo === 'economia')
    .reduce((s, i) => s + (i.valorAnual ?? 0), 0)

  // Estima kWh economizados: economia financeira / tarifa média (fallback 0.85 R$/kWh)
  const tarifaMedia = custoKwh ?? 0.85
  const energiaEconomizadaKwhAno = tarifaMedia > 0 ? economiaAnualTotal / tarifaMedia : 0

  let co2: Co2Analise | undefined
  if (energiaEconomizadaKwhAno > 0) {
    const FATOR = 0.0817 // kgCO2/kWh — SIN 2024
    const co2Ano = energiaEconomizadaKwhAno * FATOR
    co2 = {
      energiaEconomizadaKwhAno,
      fatorEmissao: FATOR,
      co2EvitadoKgMes: co2Ano / 12,
      co2EvitadoKgAno: co2Ano,
      co2EvitadoKg5Anos: co2Ano * 5,
      co2EvitadoKg25Anos: co2Ano * 25,
      arvoresEquivalentes: co2Ano / 22,
      kmCarroEquivalentes: co2Ano / 0.21,
      celularesCarregados: co2Ano / 0.008,
    }
  }

  return {
    grupo,
    insights,
    co2,
    resumo: {
      valorTotal: dados.valorTotal ?? 0,
      consumoKwh: dados.consumoKwh,
      custoKwh,
      modalidade: dados.modalidade,
      subgrupo: dados.subgrupo,
      tipoLigacao: dados.tipoLigacao,
      distribuidora: dados.distribuidora,
    },
  }
}
