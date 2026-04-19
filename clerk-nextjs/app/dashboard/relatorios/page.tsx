import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  BarChart3,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  FileText,
  Building2,
  Zap,
} from 'lucide-react'
import type { ResultadoAnalise, Insight } from '@/lib/analise/engine'

const MESES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function insightIcon(tipo: string) {
  switch (tipo) {
    case 'alerta': return <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
    case 'economia': return <TrendingDown className="h-4 w-4 text-green-600 flex-shrink-0" />
    case 'ok': return <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
    default: return <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
  }
}

function insightBg(tipo: string) {
  switch (tipo) {
    case 'alerta': return 'border-red-200 bg-red-50'
    case 'economia': return 'border-green-200 bg-green-50'
    case 'ok': return 'border-green-100 bg-green-50'
    default: return 'border-blue-200 bg-blue-50'
  }
}

export default async function RelatoriosPage() {
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: {
      contas: {
        include: {
          faturas: { orderBy: { createdAt: 'desc' } },
        },
      },
    },
  })

  // Flatten faturas com metadados
  type FaturaEnriquecida = {
    id: string
    mes: number
    ano: number
    valorTotal: number
    consumoKwh: number | null
    status: string
    dadosJson: unknown
    distribuidora: string
    contaId: string
  }

  const faturas: FaturaEnriquecida[] = (dbUser?.contas ?? []).flatMap((c) =>
    c.faturas.map((f) => ({
      id: f.id,
      mes: f.mes,
      ano: f.ano,
      valorTotal: f.valorTotal,
      consumoKwh: f.consumoKwh,
      status: f.status,
      dadosJson: f.dadosJson,
      distribuidora: c.distribuidora,
      contaId: c.id,
    }))
  )

  const faturasAnalisadas = faturas.filter((f) => f.status === 'CONCLUIDA')

  // Agrega todos os insights
  type InsightComFatura = Insight & { distribuidora: string; faturaId: string; periodo: string }
  const todosInsights: InsightComFatura[] = []
  let economiaAnualTotal = 0
  let totalAlertas = 0
  let totalConsumoKwh = 0
  let totalGasto = 0

  for (const f of faturasAnalisadas) {
    const json = f.dadosJson as { resultado?: ResultadoAnalise } | null
    if (json?.resultado) {
      for (const insight of json.resultado.insights) {
        todosInsights.push({
          ...insight,
          distribuidora: f.distribuidora,
          faturaId: f.id,
          periodo: `${MESES[f.mes]}/${f.ano}`,
        })
        if (insight.tipo === 'economia' && insight.valorAnual) economiaAnualTotal += insight.valorAnual
        if (insight.tipo === 'alerta') totalAlertas++
      }
    }
    if (f.consumoKwh) totalConsumoKwh += f.consumoKwh
    if (f.valorTotal) totalGasto += f.valorTotal
  }

  const alertas = todosInsights.filter((i) => i.tipo === 'alerta')
  const economias = todosInsights.filter((i) => i.tipo === 'economia')
  const infos = todosInsights.filter((i) => i.tipo === 'info' || i.tipo === 'ok')

  const custoMedioKwh = totalConsumoKwh > 0 ? totalGasto / totalConsumoKwh : null

  const semDados = faturas.length === 0
  const semAnalise = faturasAnalisadas.length === 0 && faturas.length > 0

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Relatórios</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Visão consolidada de todas as suas faturas analisadas.
        </p>
      </div>

      {/* Empty states */}
      {semDados && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <BarChart3 className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <p className="text-slate-600 font-semibold mb-1">Nenhuma fatura enviada ainda</p>
          <p className="text-slate-500 text-sm mb-4">
            Envie faturas para gerar relatórios com oportunidades de economia.
          </p>
          <Link
            href="/dashboard/faturas/nova"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <FileText className="h-4 w-4" />
            Enviar primeira fatura
          </Link>
        </div>
      )}

      {semAnalise && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">
              {faturas.length} fatura{faturas.length > 1 ? 's' : ''} enviada{faturas.length > 1 ? 's' : ''}, nenhuma analisada ainda.
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Abra cada fatura e clique em &quot;Analisar fatura&quot; para gerar os insights.{' '}
              <Link href="/dashboard/faturas" className="underline hover:no-underline">
                Ver faturas →
              </Link>
            </p>
          </div>
        </div>
      )}

      {faturasAnalisadas.length > 0 && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 mb-3">
                <TrendingDown className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {economiaAnualTotal > 0
                  ? `R$\u00a0${Math.round(economiaAnualTotal).toLocaleString('pt-BR')}`
                  : '—'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Economia/ano potencial</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{totalAlertas}</p>
              <p className="text-xs text-slate-500 mt-0.5">Alertas identificados</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 mb-3">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {totalConsumoKwh > 0 ? `${Math.round(totalConsumoKwh).toLocaleString('pt-BR')}` : '—'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">kWh consumidos (total)</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 mb-3">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {custoMedioKwh != null ? `R$\u00a0${custoMedioKwh.toFixed(3).replace('.', ',')}` : '—'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Custo médio/kWh</p>
            </div>
          </div>

          {/* Alertas */}
          {alertas.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Alertas ({alertas.length})
              </h2>
              <div className="space-y-2">
                {alertas.map((insight, i) => (
                  <Link
                    key={i}
                    href={`/dashboard/faturas/${insight.faturaId}`}
                    className={`flex items-start gap-3 rounded-xl border p-4 hover:opacity-90 transition-opacity ${insightBg(insight.tipo)}`}
                  >
                    {insightIcon(insight.tipo)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-800">{insight.titulo}</p>
                        <span className="text-xs text-slate-500">
                          {insight.distribuidora} · {insight.periodo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{insight.descricao}</p>
                      {insight.valorMensal != null && (
                        <p className="text-xs font-semibold text-red-700 mt-1">
                          Impacto: R$ {insight.valorMensal.toFixed(0)}/mês · R$ {(insight.valorMensal * 12).toFixed(0)}/ano
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Oportunidades de economia */}
          {economias.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-green-600" />
                Oportunidades de economia ({economias.length})
              </h2>
              <div className="space-y-2">
                {economias.map((insight, i) => (
                  <Link
                    key={i}
                    href={`/dashboard/faturas/${insight.faturaId}`}
                    className={`flex items-start gap-3 rounded-xl border p-4 hover:opacity-90 transition-opacity ${insightBg(insight.tipo)}`}
                  >
                    {insightIcon(insight.tipo)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-800">{insight.titulo}</p>
                        <span className="text-xs text-slate-500">
                          {insight.distribuidora} · {insight.periodo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{insight.descricao}</p>
                      {insight.valorAnual != null && (
                        <p className="text-xs font-semibold text-green-700 mt-1">
                          Economia estimada: R$ {Math.round(insight.valorAnual).toLocaleString('pt-BR')}/ano
                        </p>
                      )}
                      {insight.recomendacao && (
                        <p className="text-xs text-slate-500 mt-1 italic">{insight.recomendacao}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Informações e recomendações */}
          {infos.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Informações e recomendações ({infos.length})
              </h2>
              <div className="space-y-2">
                {infos.map((insight, i) => (
                  <Link
                    key={i}
                    href={`/dashboard/faturas/${insight.faturaId}`}
                    className={`flex items-start gap-3 rounded-xl border p-4 hover:opacity-90 transition-opacity ${insightBg(insight.tipo)}`}
                  >
                    {insightIcon(insight.tipo)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-800">{insight.titulo}</p>
                        <span className="text-xs text-slate-500">
                          {insight.distribuidora} · {insight.periodo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{insight.descricao}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Faturas analisadas */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Faturas analisadas ({faturasAnalisadas.length})
              </h2>
              <Link href="/dashboard/faturas" className="text-xs text-blue-600 hover:text-blue-800">
                Ver todas →
              </Link>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
              {faturasAnalisadas.map((f) => {
                const json = f.dadosJson as { resultado?: ResultadoAnalise } | null
                const eco = json?.resultado?.insights
                  .filter((i) => i.tipo === 'economia')
                  .reduce((s, i) => s + (i.valorAnual ?? 0), 0) ?? 0
                const alertCount = json?.resultado?.insights.filter((i) => i.tipo === 'alerta').length ?? 0

                return (
                  <Link
                    key={f.id}
                    href={`/dashboard/faturas/${f.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 flex-shrink-0">
                      <FileText className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">
                        {f.distribuidora} — {MESES[f.mes]}/{f.ano}
                      </p>
                      <p className="text-xs text-slate-500">
                        {f.valorTotal > 0 ? `R$ ${f.valorTotal.toFixed(2).replace('.', ',')}` : '—'}
                        {f.consumoKwh != null ? ` · ${f.consumoKwh} kWh` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs flex-shrink-0">
                      {alertCount > 0 && (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                          {alertCount} alerta{alertCount > 1 ? 's' : ''}
                        </span>
                      )}
                      {eco > 0 && (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium hidden sm:inline">
                          −R$ {Math.round(eco).toLocaleString('pt-BR')}/ano
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
