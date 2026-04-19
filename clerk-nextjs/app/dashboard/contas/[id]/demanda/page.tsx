import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { DemandaChart, type PontoDemanda } from './_components/DemandaChart'

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

interface Extraido {
  demandaContratadaKw?: number
  demandaMedidaKw?: number
  tarifaDemanda?: number
  modalidade?: string
  grupo?: string
}

// ── Parâmetros ANEEL por tipo de contrato ───────────────────────────────────
// ANEEL REN 1000/2021: ultrapassagem cobrada em 3× a tarifa de demanda
// Tolerância de 5% antes de caracterizar ultrapassagem (ambas modalidades)
const FATOR_ULTRAPASSAGEM = 3   // 3× tarifa sobre o excedente (padrão Grupo A)
const TOLERANCIA_ULTRAPASSAGEM = 1.05  // 5% de tolerância ANEEL

export default async function AnaliseDemandaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } })
  if (!dbUser) return null

  const conta = await prisma.conta.findFirst({
    where: { id, userId: dbUser.id },
    include: {
      faturas: {
        where: { status: 'CONCLUIDA' },
        orderBy: [{ ano: 'asc' }, { mes: 'asc' }],
      },
    },
  })
  if (!conta) notFound()

  // ── Indexar faturas por chave ano-mes ────────────────────────────
  let tarifaDemanda: number | null = null
  let modalidadeContrato: string | null = null
  const contratadas: number[] = []
  const medidas: number[] = []

  // Indexa por mês (1-12) → dado mais recente daquele mês
  const porMes = new Map<number, { ano: number; medidaFP: number | null; contratada: number | null }>()

  for (const fatura of conta.faturas) {
    const dj = fatura.dadosJson as { extraido?: Extraido } | null
    const ex = dj?.extraido
    if (!ex?.demandaMedidaKw && !ex?.demandaContratadaKw) continue

    const medidaFP = ex.demandaMedidaKw ?? null
    const contratada = ex.demandaContratadaKw ?? null

    if (medidaFP != null) medidas.push(medidaFP)
    if (contratada != null) contratadas.push(contratada)
    // Usa sempre o dado mais recente (faturas ordenadas asc por ano/mes)
    if (ex.tarifaDemanda) tarifaDemanda = ex.tarifaDemanda
    if (ex.modalidade) modalidadeContrato = ex.modalidade

    const existing = porMes.get(fatura.mes)
    if (!existing || fatura.ano > existing.ano) {
      porMes.set(fatura.mes, { ano: fatura.ano, medidaFP, contratada })
    }
  }

  // Tarifa de referência: usa a extraída ou fallback de R$ 30/kW (média ANEEL)
  const tarifaUsada = tarifaDemanda ?? 30
  const tarifaEhEstimativa = tarifaDemanda == null

  // ── Gerar os 12 meses Jan→Dez, blank quando sem fatura
  const pontos: PontoDemanda[] = []
  for (let m = 1; m <= 12; m++) {
    const dado = porMes.get(m) ?? null
    const medidaFP = dado?.medidaFP ?? null
    const contratada = dado?.contratada ?? null
    const label = dado
      ? `${MESES[m - 1]}/${String(dado.ano).slice(2)}`
      : MESES[m - 1]
    const ultrapassagem =
      medidaFP != null && contratada != null && medidaFP > contratada * 1.05
        ? medidaFP - contratada
        : null
    pontos.push({ label, medidaFP, medidaPT: null, contratada, ultrapassagem })
  }

  // ── Calcular demanda contratada atual e sugestão ──────────────────
  const contratadaAtual =
    contratadas.length > 0 ? contratadas[contratadas.length - 1] : null

  // ── Ponto ótimo: minimiza custo total anual por perfil do cliente ─────────
  // Função de custo genérica parametrizada pelos valores ANEEL do contrato:
  //   custo(c) = 12 × c × t  +  Σ max(0, medida_i − c) × FATOR × t  ∀ medida_i > c × TOLERANCIA
  // O ponto ótimo depende exclusivamente do perfil de demandas do cliente:
  //   - perfil estável → demanda contratada baixa sem ultrapassagens
  //   - perfil variável → aceita alguns meses de multa para reduzir custo fixo
  // Break-even teórico: compensa aumentar c enquanto houver > 12/FATOR meses de ultrapassagem
  const breakEvenMeses = 12 / FATOR_ULTRAPASSAGEM   // = 4 para FATOR=3 (padrão ANEEL)

  let sugerida: number | null = null
  let nMesesOtimo = 0
  let custoTotalOtimo: number | null = null

  if (medidas.length > 0) {
    const calcCusto = (c: number) =>
      12 * c * tarifaUsada +
      medidas.reduce(
        (sum, m) => (m > c * TOLERANCIA_ULTRAPASSAGEM ? sum + (m - c) * FATOR_ULTRAPASSAGEM * tarifaUsada : sum),
        0
      )

    const minC = Math.ceil(Math.min(...medidas))
    const maxC = Math.ceil(Math.max(...medidas)) + 1

    let bestCost = Infinity
    let bestC = minC
    for (let c = minC; c <= maxC; c++) {
      const custo = calcCusto(c)
      if (custo < bestCost) { bestCost = custo; bestC = c }
    }

    // Arredonda para múltiplo de 5 kW escolhendo o mais barato (respeita restrição contratual mínima)
    const cDown = Math.max(5, Math.floor(bestC / 5) * 5)
    const cUp   = Math.ceil(bestC / 5) * 5 || 5
    sugerida = calcCusto(cDown) <= calcCusto(cUp) ? cDown : cUp

    nMesesOtimo    = medidas.filter((m) => m > sugerida! * TOLERANCIA_ULTRAPASSAGEM).length
    custoTotalOtimo = calcCusto(sugerida)
  }

  const mesesComUltrapassagem = pontos.filter((p) => p.ultrapassagem != null && p.ultrapassagem > 0).length
  const maxMedida = medidas.length > 0 ? Math.max(...medidas) : null
  const minMedida = medidas.length > 0 ? Math.min(...medidas) : null
  const mediaMedida = medidas.length > 0 ? medidas.reduce((a, b) => a + b, 0) / medidas.length : null
  const mesesComDados = pontos.filter((p) => p.medidaFP != null).length
  const temDadosSuficientes = mesesComDados >= 2

  // ── Economia = custo atual total − custo no ponto ótimo ─────────────────────
  const custoUltrapassagemAtual = medidas.reduce(
    (sum, m) =>
      m > (contratadaAtual ?? 0) * TOLERANCIA_ULTRAPASSAGEM
        ? sum + (m - (contratadaAtual ?? 0)) * FATOR_ULTRAPASSAGEM * tarifaUsada
        : sum,
    0
  )
  const custoAtualTotal =
    contratadaAtual != null ? 12 * contratadaAtual * tarifaUsada + custoUltrapassagemAtual : null

  const economiaAnual =
    custoAtualTotal != null && custoTotalOtimo != null && custoAtualTotal > custoTotalOtimo
      ? custoAtualTotal - custoTotalOtimo
      : null

  // ── Custos financeiros ────────────────────────────────────────────
  // Custo base anual da demanda contratada (extrapolado para 12 meses)
  const custoAnualDemandaBase =
    contratadaAtual != null
      ? 12 * contratadaAtual * tarifaUsada
      : null

  const fmtBRL = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/contas/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para {conta.titular ?? conta.distribuidora}
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
            <Building2 className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Análise de Demanda</h1>
            <p className="text-sm text-slate-500">
              {conta.titular ?? conta.distribuidora} · {pontos.length} {pontos.length === 1 ? 'mês' : 'meses'} com dados de demanda
            </p>
          </div>
        </div>
      </div>

      {/* Aviso se dados insuficientes */}
      {!temDadosSuficientes && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Dados insuficientes para análise de tendência</p>
            <p className="text-xs text-amber-700 mt-1">
              {pontos.length === 0
                ? 'Nenhuma fatura com dados de demanda extraídos. Reprocesse as faturas.'
                : 'Apenas 1 mês com demanda identificada. Envie mais faturas para visualizar a evolução.'}
            </p>
          </div>
        </div>
      )}

      {/* Cards resumo */}
      {medidas.length > 0 && contratadaAtual != null && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Demanda contratada</p>
            <p className="text-xl font-bold text-orange-600">{contratadaAtual} kW</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Máx. medida</p>
            <p className="text-xl font-bold text-blue-600">{maxMedida?.toFixed(0)} kW</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Média medida</p>
            <p className="text-xl font-bold text-slate-700">{mediaMedida?.toFixed(0)} kW</p>
          </div>
          <div className={`rounded-xl border p-4 text-center ${mesesComUltrapassagem > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <p className={`text-xs mb-1 ${mesesComUltrapassagem > 0 ? 'text-red-500' : 'text-green-600'}`}>Meses c/ ultrapassagem</p>
            <p className={`text-xl font-bold ${mesesComUltrapassagem > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {mesesComUltrapassagem}/{pontos.length}
            </p>
          </div>
        </div>
      )}

      {/* Cards financeiros */}
      {custoAnualDemandaBase != null && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500 mb-1">Custo anual da demanda contratada</p>
            <p className="text-2xl font-bold text-slate-800">{fmtBRL(custoAnualDemandaBase)}</p>
            <p className="text-xs text-slate-400 mt-1">
              {contratadaAtual} kW × R$ {tarifaUsada.toFixed(2)}/kW × 12 meses
              {tarifaEhEstimativa && ' (tarifa estimada)'}
            </p>
          </div>
          <div className={`rounded-xl border p-4 ${
            custoUltrapassagemAtual > 0
              ? 'border-red-200 bg-red-50'
              : 'border-green-200 bg-green-50'
          }`}>
            <p className={`text-xs mb-1 ${
              custoUltrapassagemAtual > 0 ? 'text-red-500' : 'text-green-600'
            }`}>Multas por ultrapassagem no período</p>
            <p className={`text-2xl font-bold ${
              custoUltrapassagemAtual > 0 ? 'text-red-600' : 'text-green-600'
            }`}>{fmtBRL(custoUltrapassagemAtual)}</p>
            <p className={`text-xs mt-1 ${
              custoUltrapassagemAtual > 0 ? 'text-red-400' : 'text-green-500'
            }`}>
              {mesesComUltrapassagem > 0
                ? `${mesesComUltrapassagem} ${mesesComUltrapassagem === 1 ? 'mês' : 'meses'} com cobrança em 3× a tarifa`
                : 'Nenhuma ultrapassagem registrada'}
            </p>
          </div>
          <div className={`rounded-xl border p-4 ${
            economiaAnual != null && economiaAnual > 0
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-slate-200 bg-slate-50'
          }`}>
            <p className={`text-xs mb-1 ${
              economiaAnual != null && economiaAnual > 0 ? 'text-emerald-600' : 'text-slate-500'
            }`}>Economia potencial (ajuste de demanda)</p>
            <p className={`text-2xl font-bold ${
              economiaAnual != null && economiaAnual > 0 ? 'text-emerald-600' : 'text-slate-400'
            }`}>
              {economiaAnual != null && economiaAnual > 0
                ? fmtBRL(economiaAnual)
                : sugerida == null
                  ? 'Sem dados'
                  : contratadaAtual != null && sugerida >= contratadaAtual
                    ? 'Demanda já otimizada'
                    : '—'}
            </p>
            {economiaAnual != null && economiaAnual > 0 && sugerida != null && (
              <p className="text-xs text-emerald-500 mt-1">
                Reduzindo de {contratadaAtual} kW para {sugerida} kW
              </p>
            )}
          </div>
        </div>
      )}

      {/* Gráfico */}
      {temDadosSuficientes && contratadaAtual != null && sugerida != null && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
          <h2 className="text-sm font-semibold text-slate-700">Demanda medida × contratada × sugerida</h2>
          <p className="text-xs text-slate-500">
            Barras em <span className="text-red-500 font-medium">vermelho</span> = meses com ultrapassagem ({'>'} 5% da contratada).
          </p>
          <DemandaChart
            pontos={pontos}
            contratadaAtual={contratadaAtual}
            sugerida={sugerida}
            tarifaDemanda={tarifaUsada}
            tarifaEhEstimativa={tarifaEhEstimativa}
            economiaAnual={economiaAnual}
            mesesComDados={mesesComDados}
          />
        </div>
      )}

      {/* Metodologia e insights */}
      {sugerida != null && contratadaAtual != null && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Como foi calculada a demanda sugerida?</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p>
                A demanda sugerida de <strong>{sugerida} kW</strong> é o <strong>ponto ótimo financeiro</strong>:
                o valor que minimiza o custo total anual (demanda contratada + multas de ultrapassagem)
                com base nos {medidas.length} meses com dados.
              </p>
            </div>
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p>
                O equilíbrio econômico ocorre quando há <strong>~4 meses/ano com ultrapassagem</strong>:
                cada kW extra custa <em>12 × tarifa</em>/ano mas economiza{' '}
                <em>{FATOR_ULTRAPASSAGEM}× tarifa</em> por mês em overage — ponto de equilíbrio:{' '}
                <strong>{breakEvenMeses.toFixed(0)} meses/ano</strong>. Para este cliente, o ótimo resulta em{' '}
                <strong>{nMesesOtimo} {nMesesOtimo === 1 ? 'mês' : 'meses'} com ultrapassagem</strong>{' '}
                nos {medidas.length} meses analisados.
              </p>
            </div>
            {modalidadeContrato && (
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p>
                  Modalidade tarifária identificada: <strong>{modalidadeContrato}</strong>.
                  {modalidadeContrato.toLowerCase().includes('azul')
                    ? ' Modalidade Azul possui demandas separadas de ponta e fora-ponta — a análise considera apenas a demanda fora-ponta extraída das faturas.'
                    : ' Modalidade Verde utiliza demanda única (fora-ponta).'}
                </p>
              </div>
            )}
            {minMedida != null && (
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p>
                  Demanda mínima registrada: <strong>{minMedida.toFixed(0)} kW</strong> — variação entre mínima e máxima de{' '}
                  <strong>{(((maxMedida ?? 0) - minMedida) / minMedida * 100).toFixed(0)}%</strong>.
                  {(maxMedida ?? 0) - minMedida > (contratadaAtual ?? 0) * 0.3
                    ? ' Alta variabilidade — considere demanda automática ou banco de capacitores.'
                    : ' Perfil de carga relativamente estável.'}
                </p>
              </div>
            )}
            {nMesesOtimo === 0 && contratadaAtual != null && sugerida < contratadaAtual && (
              <div className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p>
                  Nenhum mês com ultrapassagem no nível sugerido. A contratada pode ser reduzida com segurança.
                </p>
              </div>
            )}
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs text-slate-500">
            ⚠️ Esta análise é baseada em <strong>{medidas.length} {medidas.length === 1 ? 'mês' : 'meses'} com demanda medida</strong>.
            Para maior confiabilidade, recomenda-se pelo menos <strong>12 meses</strong> de histórico antes de solicitar alteração contratual junto à distribuidora.
            Fator ANEEL aplicado: <strong>{FATOR_ULTRAPASSAGEM}× tarifa</strong> · Tolerância: <strong>{((TOLERANCIA_ULTRAPASSAGEM - 1) * 100).toFixed(0)}%</strong>.
          </div>
        </div>
      )}
    </div>
  )
}
