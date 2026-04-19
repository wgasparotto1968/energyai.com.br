import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, AlertTriangle, Leaf, Zap, DollarSign, BarChart2 } from 'lucide-react'
import type { ResultadoAnalise } from '@/lib/analise/engine'
import { HistoricoChart } from './_components/HistoricoChart'

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function mesLabel(mes: number, ano: number) {
  return `${MESES[(mes - 1) % 12]}/${String(ano).slice(2)}`
}

function variacaoIcon(pct: number | null) {
  if (pct === null) return <Minus className="h-3.5 w-3.5 text-slate-400" />
  if (pct > 5) return <TrendingUp className="h-3.5 w-3.5 text-red-500" />
  if (pct < -5) return <TrendingDown className="h-3.5 w-3.5 text-green-500" />
  return <Minus className="h-3.5 w-3.5 text-slate-400" />
}

function variacaoColor(pct: number | null) {
  if (pct === null) return 'text-slate-400'
  if (pct > 5) return 'text-red-600 font-semibold'
  if (pct < -5) return 'text-green-600 font-semibold'
  return 'text-slate-500'
}

export default async function HistoricoPage({
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
        select: {
          id: true,
          mes: true,
          ano: true,
          valorTotal: true,
          consumoKwh: true,
          arquivoUrl: true,
          dadosJson: true,
          createdAt: true,
          status: true,
        },
      },
    },
  })
  if (!conta) notFound()

  // ── Build history points ──────────────────────────────────────────────────
  interface PontoHistorico {
    id: string
    mes: number
    ano: number
    label: string
    valorTotal: number
    valorProjetado: boolean
    ehHistorico: boolean
    consumoKwh: number | null
    custoKwh: number | null
    economiaAnual: number
    co2EvitadoKgAno: number | null
    variacaoValor: number | null
    variacaoConsumo: number | null
  }

  // Custo médio/kWh apenas das faturas reais (com PDF, origemHistorico != true)
  const faturasReais = conta.faturas.filter(f => {
    return !!f.arquivoUrl && f.valorTotal > 0 && (f.consumoKwh ?? 0) > 0
  })
  const custoMedioReal =
    faturasReais.length > 0
      ? faturasReais.reduce((s, f) => s + f.valorTotal / (f.consumoKwh ?? 1), 0) / faturasReais.length
      : null

  const pontos: PontoHistorico[] = conta.faturas.map((f, i) => {
    const prev = i > 0 ? conta.faturas[i - 1] : null
    const dj = f.dadosJson as { extraido?: { origemHistorico?: boolean }; resultado?: ResultadoAnalise } | null
    // Fatura de histórico = sem PDF (arquivoUrl null), independente do campo origemHistorico no JSON
    const ehHistorico = !f.arquivoUrl

    const resultado = dj?.resultado ?? null

    const economiaAnual = resultado
      ? resultado.insights
          .filter((ins) => ins.tipo === 'economia')
          .reduce((s, ins) => s + (ins.valorAnual ?? 0), 0)
      : 0

    const co2EvitadoKgAno = resultado?.co2?.co2EvitadoKgAno ?? null

    // Para faturas de histórico, projeta o valor via custo médio das faturas reais
    const valorProjetado = ehHistorico && custoMedioReal != null && (f.consumoKwh ?? 0) > 0
    const valorTotal = valorProjetado
      ? Math.round(custoMedioReal! * (f.consumoKwh ?? 0) * 100) / 100
      : f.valorTotal
    // Flag para o chart: cinza se for histórico (mesmo sem projeção de valor)
    const ehProjetadoChart = ehHistorico

    const variacaoValor =
      prev && prev.valorTotal > 0
        ? ((valorTotal - prev.valorTotal) / prev.valorTotal) * 100
        : null

    const variacaoConsumo =
      prev && prev.consumoKwh != null && prev.consumoKwh > 0 && f.consumoKwh != null
        ? ((f.consumoKwh - prev.consumoKwh) / prev.consumoKwh) * 100
        : null

    const custoKwh =
      valorTotal > 0 && f.consumoKwh != null && f.consumoKwh > 0
        ? valorTotal / f.consumoKwh
        : null

    return {
      id: f.id,
      mes: f.mes,
      ano: f.ano,
      label: mesLabel(f.mes, f.ano),
      valorTotal,
      valorProjetado,
      ehHistorico,
      consumoKwh: f.consumoKwh,
      custoKwh,
      economiaAnual,
      co2EvitadoKgAno,
      variacaoValor,
      variacaoConsumo,
    }
  })

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const totalFaturas = pontos.length
  // Média apenas de faturas reais (com PDF), não inclui histórico projetado
  const pontosReais = pontos.filter((p) => !p.ehHistorico)
  const mediaValor = pontosReais.length > 0 ? pontosReais.reduce((s, p) => s + p.valorTotal, 0) / pontosReais.length : 0
  const mediaConsumo =
    pontosReais.filter((p) => p.consumoKwh != null).length > 0
      ? pontosReais.filter((p) => p.consumoKwh != null).reduce((s, p) => s + (p.consumoKwh ?? 0), 0) /
        pontosReais.filter((p) => p.consumoKwh != null).length
      : 0
  const mediaCustoKwh =
    pontos.filter((p) => p.custoKwh != null).length > 0
      ? pontos.filter((p) => p.custoKwh != null).reduce((s, p) => s + (p.custoKwh ?? 0), 0) /
        pontos.filter((p) => p.custoKwh != null).length
      : 0
  const totalEconomia = pontos.reduce((s, p) => s + p.economiaAnual, 0)
  const totalCo2 = pontos.reduce((s, p) => s + (p.co2EvitadoKgAno ?? 0), 0)

  // Variation alerts (> 20% valor change vs previous) — apenas faturas reais
  const alertas = pontos.filter((p) => !p.ehHistorico && p.variacaoValor != null && Math.abs(p.variacaoValor) > 20)

  // Trend: last 3 vs first 3
  const tendencia =
    pontos.length >= 6
      ? (pontos.slice(-3).reduce((s, p) => s + p.valorTotal, 0) / 3 -
          pontos.slice(0, 3).reduce((s, p) => s + p.valorTotal, 0) / 3) /
        (pontos.slice(0, 3).reduce((s, p) => s + p.valorTotal, 0) / 3) * 100
      : null

  // Build 12-slot Jan→Dez chart, most recent year per month, nulls for gaps
  const porMesChart = new Map<number, { ano: number; valorTotal: number; consumoKwh: number | null; projetado: boolean }>()
  for (const p of pontos) {
    const existing = porMesChart.get(p.mes)
    if (!existing || p.ano > existing.ano) {
      porMesChart.set(p.mes, { ano: p.ano, valorTotal: p.valorTotal, consumoKwh: p.consumoKwh, projetado: p.ehHistorico })
    }
  }

  // Expande o histórico embutido em cada fatura real (dadosJson.extraido.historico)
  // Adiciona meses que não têm fatura própria como barras cinzas projetadas
  for (const f of conta.faturas) {
    if (!f.arquivoUrl) continue // só faturas reais
    const dj = f.dadosJson as { extraido?: { historico?: Array<{ mes: number; ano: number; consumoTotalKwh?: number }> } } | null
    const hist = dj?.extraido?.historico ?? []
    for (const h of hist) {
      if (!h.mes || !h.ano) continue
      const existing = porMesChart.get(h.mes)
      // Só adiciona se não existir já como fatura real deste mês/ano
      if (existing && !existing.projetado) continue
      const consumo = h.consumoTotalKwh ?? 0
      const valor = custoMedioReal != null && consumo > 0 ? Math.round(custoMedioReal * consumo * 100) / 100 : 0
      if (valor > 0) {
        const atual = porMesChart.get(h.mes)
        if (!atual || (atual.projetado && h.ano >= atual.ano)) {
          porMesChart.set(h.mes, { ano: h.ano, valorTotal: valor, consumoKwh: consumo, projetado: true })
        }
      }
    }
  }
  const chartPontos = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1
    const dado = porMesChart.get(m)
    return {
      label: dado ? `${MESES[i]}/${String(dado.ano).slice(2)}` : MESES[i],
      valor: dado?.valorTotal ?? null,
      consumo: dado?.consumoKwh ?? null,
      projetado: dado?.projetado ?? false,
    }
  })

  if (totalFaturas === 0) {
    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <Link
            href={`/dashboard/contas/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Histórico — {conta.titular}</h1>
        </div>
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <BarChart2 className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">Nenhuma fatura processada</p>
          <p className="text-slate-500 text-sm mt-1">Processe ao menos uma fatura para visualizar o histórico.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/contas/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Histórico — {conta.titular}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{totalFaturas} fatura{totalFaturas !== 1 ? 's' : ''} analisada{totalFaturas !== 1 ? 's' : ''}</p>
          </div>
          {tendencia !== null && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${tendencia > 5 ? 'bg-red-50 text-red-700' : tendencia < -5 ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {tendencia > 5 ? <TrendingUp className="h-4 w-4" /> : tendencia < -5 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              Tendência: {tendencia > 0 ? '+' : ''}{tendencia.toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-slate-500">Média mensal</span>
          </div>
          <p className="text-xl font-bold text-slate-800">R$ {Math.round(mediaValor).toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-slate-500">Consumo médio</span>
          </div>
          <p className="text-xl font-bold text-slate-800">{mediaConsumo > 0 ? `${Math.round(mediaConsumo)} kWh` : '–'}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-500">Custo médio/kWh</span>
          </div>
          <p className="text-xl font-bold text-slate-800">{mediaCustoKwh > 0 ? `R$ ${mediaCustoKwh.toFixed(2)}` : '–'}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Leaf className="h-4 w-4 text-green-500" />
            <span className="text-xs text-slate-500">CO₂ evitado (último)</span>
          </div>
          <p className="text-xl font-bold text-slate-800">
            {totalCo2 > 0 ? `${Math.round(totalCo2)} kg` : '–'}
          </p>
        </div>
      </div>

      {/* Alertas de variação */}
      {alertas.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <p className="text-sm font-semibold text-amber-800">Variações expressivas detectadas</p>
          </div>
          <div className="space-y-1.5">
            {alertas.map((a) => (
              <Link
                key={a.id}
                href={`/dashboard/faturas/${a.id}`}
                className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-amber-100 hover:border-amber-300 transition-colors"
              >
                <span className="text-sm text-slate-700 font-medium">{a.label}</span>
                <span className={`text-sm ${a.variacaoValor! > 0 ? 'text-red-600' : 'text-green-600'} font-semibold`}>
                  {a.variacaoValor! > 0 ? '+' : ''}{a.variacaoValor!.toFixed(1)}% em relação ao mês anterior
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      {totalFaturas >= 2 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <HistoricoChart pontos={chartPontos} />
        </div>
      )}

      {/* Economia potencial consolidada */}
      {totalEconomia > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-800 mb-0.5">Economia potencial identificada nas análises</p>
          <p className="text-2xl font-bold text-green-700">R$ {Math.round(totalEconomia).toLocaleString('pt-BR')}/ano</p>
          <p className="text-xs text-green-600 mt-1">Soma das economias identificadas em todas as faturas processadas desta unidade.</p>
        </div>
      )}

      {/* Tabela de faturas */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Detalhamento mensal</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <th className="text-left px-4 py-2.5 font-medium">Mês</th>
                <th className="text-right px-4 py-2.5 font-medium">Valor (R$)</th>
                <th className="text-right px-4 py-2.5 font-medium">Δ Valor</th>
                <th className="text-right px-4 py-2.5 font-medium">Consumo</th>
                <th className="text-right px-4 py-2.5 font-medium">Δ Consumo</th>
                <th className="text-right px-4 py-2.5 font-medium">R$/kWh</th>
                <th className="text-right px-4 py-2.5 font-medium">Economia/ano</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pontos.map((p) => (
                <tr key={p.id} className={`transition-colors ${p.ehHistorico ? 'bg-slate-50/60 hover:bg-slate-100/60' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    <div className="flex items-center gap-1.5">
                      {p.label}
                      {p.ehHistorico && (
                        <span className="text-[10px] text-slate-400 font-normal italic">hist.</span>
                      )}
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-right ${p.ehHistorico ? 'text-slate-400 italic' : 'text-slate-700'}`}>
                    {p.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center gap-0.5 ${variacaoColor(p.variacaoValor)}`}>
                      {variacaoIcon(p.variacaoValor)}
                      {p.variacaoValor !== null ? `${p.variacaoValor > 0 ? '+' : ''}${p.variacaoValor.toFixed(1)}%` : '–'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {p.consumoKwh != null ? `${p.consumoKwh.toLocaleString('pt-BR')} kWh` : '–'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center gap-0.5 ${variacaoColor(p.variacaoConsumo)}`}>
                      {variacaoIcon(p.variacaoConsumo)}
                      {p.variacaoConsumo !== null ? `${p.variacaoConsumo > 0 ? '+' : ''}${p.variacaoConsumo.toFixed(1)}%` : '–'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {p.custoKwh != null ? `R$ ${p.custoKwh.toFixed(2)}` : '–'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.economiaAnual > 0 ? (
                      <span className="text-green-600 font-medium">R$ {Math.round(p.economiaAnual).toLocaleString('pt-BR')}</span>
                    ) : (
                      <span className="text-slate-400">–</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/faturas/${p.id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
