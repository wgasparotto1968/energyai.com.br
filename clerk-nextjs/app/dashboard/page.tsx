import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import {
  FileText, Building2, Zap, Upload, TrendingDown,
  AlertCircle, Clock, AlertTriangle, Plus,
} from 'lucide-react'
import Link from 'next/link'
import type { ResultadoAnalise } from '@/lib/analise/engine'
import AtividadeRecenteSearch from './AtividadeRecenteSearch'

type FaturaItemJson = {
  extraido?: { numeroCliente?: string; enderecoUC?: string }
  resultado?: ResultadoAnalise
} | null

const planoBadge: Record<string, string> = {
  FREE: 'bg-slate-100 text-slate-700',
  PRO: 'bg-purple-100 text-purple-700',
  ENTERPRISE: 'bg-yellow-100 text-yellow-700',
}

export default async function DashboardPage() {
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: {
      _count: { select: { contas: true } },
      contas: {
        include: {
          faturas: {
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  })

  const nome = dbUser?.nome ?? clerkUser.firstName ?? 'Usuário'
  const plano = dbUser?.plano ?? 'FREE'
  const totalContas = dbUser?._count?.contas ?? 0

  // Apenas faturas com PDF real (exclui registros históricos sem arquivoUrl)
  const todasFaturas = (dbUser?.contas ?? [])
    .flatMap((c) => c.faturas.map((f) => ({ ...f, distribuidora: c.distribuidora, titular: c.titular, numeroCliente: c.numeroCliente, endereco: c.endereco, contaId: c.id })))
    .filter((f) => !!f.arquivoUrl)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const totalFaturas = (dbUser?.contas ?? []).reduce((s, c) => s + c.faturas.filter(f => !!f.arquivoUrl).length, 0)
  const faturasAnalisadas = todasFaturas.filter((f) => f.status === 'CONCLUIDA').length
  const faturasPendentes = todasFaturas.filter((f) => f.status === 'PENDENTE' || f.status === 'ERRO').length

  // Somar economias identificadas nas faturas concluídas
  let economiaAnualTotal = 0
  let totalAlertas = 0
  for (const fatura of todasFaturas) {
    const json = fatura.dadosJson as { resultado?: ResultadoAnalise } | null
    if (json?.resultado) {
      for (const insight of json.resultado.insights) {
        if (insight.tipo === 'economia' && insight.valorAnual) economiaAnualTotal += insight.valorAnual
        if (insight.tipo === 'alerta') totalAlertas++
      }
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Saudação */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Olá, {nome} 👋</h1>
        <p className="text-slate-500 mt-1 text-sm">Aqui está o resumo da sua conta.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 mb-3">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{totalContas}</p>
          <p className="text-xs text-slate-500 mt-0.5">Unidades Consumidoras</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 mb-3">
            <FileText className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{totalFaturas}</p>
          <p className="text-xs text-slate-500 mt-0.5">Faturas enviadas</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 mb-3">
            <TrendingDown className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {economiaAnualTotal > 0
              ? `R$\u00a0${Math.round(economiaAnualTotal).toLocaleString('pt-BR')}`
              : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Economia/ano identificada</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{totalAlertas}</p>
          <p className="text-xs text-slate-500 mt-0.5">Alertas ativos</p>
        </div>
      </div>

      {/* Ações rápidas */}
      <div>
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Ações rápidas</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/dashboard/faturas/nova"
            className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 hover:border-green-400 hover:bg-green-100 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600 flex-shrink-0">
              <Upload className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Enviar fatura</p>
              <p className="text-xs text-slate-500">Upload de PDF</p>
            </div>
          </Link>

          <Link
            href="/dashboard/contas/nova"
            className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 hover:border-blue-400 hover:bg-blue-100 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 flex-shrink-0">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Nova unidade</p>
              <p className="text-xs text-slate-500">Cadastrar UC</p>
            </div>
          </Link>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 flex-shrink-0">
              <Zap className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Plano {plano}</p>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${planoBadge[plano] ?? planoBadge.FREE}`}>
                {plano === 'FREE' ? 'Gratuito' : plano === 'PRO' ? 'Pro' : 'Enterprise'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Atividade recente */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Atividade recente</h2>
          <Link href="/dashboard/faturas" className="text-xs text-blue-600 hover:text-blue-800 transition-colors">
            Ver todas →
          </Link>
        </div>

        {todasFaturas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <AlertCircle className="mx-auto h-9 w-9 text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium mb-1">Nenhuma fatura ainda</p>
            <p className="text-slate-500 text-sm mb-4">
              Cadastre uma unidade e envie a primeira fatura para começar.
            </p>
            {totalContas === 0 ? (
              <Link
                href="/dashboard/contas/nova"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Building2 className="h-4 w-4" />
                Cadastrar unidade
              </Link>
            ) : (
              <Link
                href="/dashboard/faturas/nova"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Upload className="h-4 w-4" />
                Enviar fatura
              </Link>
            )}
          </div>
        ) : (
          <AtividadeRecenteSearch
            faturas={todasFaturas.map((f) => ({
              id: f.id,
              mes: f.mes,
              ano: f.ano,
              valorTotal: f.valorTotal,
              consumoKwh: f.consumoKwh ?? null,
              status: f.status,
              dadosJson: f.dadosJson as FaturaItemJson,
              distribuidora: f.distribuidora,
              titular: f.titular ?? null,
              numeroCliente: f.numeroCliente ?? null,
              endereco: f.endereco ?? null,
              contaId: f.contaId,
            }))}
          />
        )}
      </div>

      {/* Banner pendentes */}
      {faturasPendentes > 0 && faturasAnalisadas < totalFaturas && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 flex items-center gap-3">
          <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            Você tem <strong>{faturasPendentes}</strong> fatura{faturasPendentes > 1 ? 's' : ''} aguardando análise.{' '}
            <Link href="/dashboard/faturas" className="underline hover:no-underline">
              Processar agora →
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}

