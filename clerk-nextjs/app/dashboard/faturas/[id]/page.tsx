import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  TrendingDown,
  AlertTriangle,
  Info,
  CheckCircle,
  ExternalLink,
  Zap,
  Download,
  PiggyBank,
  Wallet,
  Timer,
  Receipt,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import type { ResultadoAnalise } from '@/lib/analise/engine'
import ProcessarButton from './ProcessarButton'
import Co2Card from './Co2Card'
import DeleteFaturaButton from './DeleteFaturaButton'
import InsightsCharts from './InsightsCharts'

const MESES = [
  '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const statusLabel: Record<string, string> = {
  PENDENTE: 'Pendente',
  PROCESSANDO: 'Processando…',
  CONCLUIDA: 'Concluída',
  ERRO: 'Erro',
}

const statusColor: Record<string, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-700',
  PROCESSANDO: 'bg-blue-100 text-blue-700',
  CONCLUIDA: 'bg-green-100 text-green-700',
  ERRO: 'bg-red-100 text-red-700',
}

function insightIcon(tipo: string) {
  switch (tipo) {
    case 'alerta': return <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
    case 'economia': return <TrendingDown className="h-5 w-5 text-green-600 flex-shrink-0" />
    case 'ok': return <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
    default: return <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
  }
}

function insightBorder(tipo: string) {
  switch (tipo) {
    case 'alerta': return 'border-red-200 bg-red-50'
    case 'economia': return 'border-green-200 bg-green-50'
    case 'ok': return 'border-green-200 bg-green-50'
    default: return 'border-blue-200 bg-blue-50'
  }
}

export default async function FaturaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } })
  if (!dbUser) return null

  const fatura = await prisma.fatura.findFirst({
    where: {
      id,
      conta: { userId: dbUser.id },
    },
    include: {
      conta: {
        include: {
          faturas: { select: { arquivoUrl: true } },
        },
      },
    },
  })

  if (!fatura) notFound()

  const dadosJson = fatura.dadosJson as {
    resultado?: ResultadoAnalise
    extraido?: {
      nomeCliente?: string
      numeroCliente?: string
      enderecoUC?: string
      demandaContratadaKw?: number
      demandaMedidaKw?: number
      fatorPotencia?: number
      valorReativo?: number
      valorTotal?: number
      valorEnergia?: number
      valorDistribuicao?: number
      valorTributos?: number
      cosip?: number
      consumoPontaKwh?: number
      consumoForaPontaKwh?: number
      consumoKwh?: number
      grupo?: string
      historico?: Array<{ mes: number; ano: number; consumoTotalKwh?: number; consumoForaPontaKwh?: number; consumoPontaKwh?: number }>
    }
  } | null
  const resultado = dadosJson?.resultado ?? null
  const extraido = dadosJson?.extraido ?? null

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/contas/${fatura.contaId}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {fatura.arquivoUrl ? (
              <a
                href={fatura.arquivoUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Ver PDF original"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <FileText className="h-6 w-6 text-blue-600" />
              </a>
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {extraido?.nomeCliente ?? fatura.conta.titular ?? fatura.conta.distribuidora}
              </h1>
              <p className="text-sm text-slate-500">
                Fatura {MESES[fatura.mes]}/{fatura.ano} · {fatura.conta.distribuidora}
              </p>
              {(extraido?.numeroCliente || extraido?.enderecoUC) && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {[extraido.numeroCliente ? `UC ${extraido.numeroCliente}` : null, extraido.enderecoUC].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>

          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[fatura.status]}`}>
            {statusLabel[fatura.status]}
          </span>
        </div>
      </div>

      {/* Processamento */}
      {(fatura.status === 'PENDENTE' || fatura.status === 'ERRO' || fatura.status === 'CONCLUIDA') && fatura.arquivoUrl && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-slate-700">
              {fatura.status === 'CONCLUIDA' ? 'Reprocessar análise' : fatura.status === 'ERRO' ? 'Reprocessar fatura' : 'Analisar fatura'}
            </h2>
          </div>
          {fatura.status === 'ERRO' && (
            <p className="text-sm text-red-600">
              Ocorreu um erro no processamento anterior. Tente novamente.
            </p>
          )}
          {fatura.status === 'CONCLUIDA' && (
            <p className="text-sm text-slate-500">
              Reprocesse para atualizar a análise com as regras mais recentes.
            </p>
          )}
          <ProcessarButton faturaId={fatura.id} />
        </div>
      )}

      {/* Cards resumo */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-white border border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-500 mb-0.5">Valor total</p>
          <p className="text-base font-bold text-slate-800 whitespace-nowrap">
            {fatura.valorTotal > 0
              ? `R$ ${fatura.valorTotal.toFixed(2).replace('.', ',')}`
              : '—'}
          </p>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-500 mb-0.5">Consumo</p>
          <p className="text-base font-bold text-slate-800 whitespace-nowrap">
            {fatura.consumoKwh != null ? `${fatura.consumoKwh} kWh` : '—'}
          </p>
        </div>
        {resultado?.resumo.custoKwh != null && (
          <div className="rounded-xl bg-white border border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-500 mb-0.5">Custo efetivo</p>
            <p className="text-base font-bold text-slate-800 whitespace-nowrap">
              R$ {resultado.resumo.custoKwh.toFixed(3).replace('.', ',')}/kWh
            </p>
          </div>
        )}
        {extraido?.demandaContratadaKw != null && (
          <div className="rounded-xl bg-white border border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-500 mb-0.5">Demanda contratada</p>
            <p className="text-base font-bold text-slate-800 whitespace-nowrap">
              {extraido.demandaContratadaKw} kW
              {extraido?.demandaMedidaKw != null && <span className="text-xs text-slate-400 font-normal ml-1">(med. {extraido.demandaMedidaKw} kW)</span>}
            </p>
          </div>
        )}
      </div>

      {fatura.status === 'PROCESSANDO' && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 flex items-center gap-3">
          <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-sm text-blue-700">
            Fatura em processamento. Atualize a página em alguns instantes.
          </p>
        </div>
      )}

      {/* Resultados */}
      {resultado && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-700">
              Análise — Grupo {resultado.grupo}
              {resultado.resumo.modalidade ? ` · ${resultado.resumo.modalidade}` : ''}
              {resultado.resumo.subgrupo ? ` · ${resultado.resumo.subgrupo}` : ''}
            </h2>
          </div>

          {resultado.insights.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-slate-500 text-sm">
                Nenhum insight gerado. Os dados extraídos podem estar incompletos.
              </p>
            </div>
          )}

          {/* Gráficos */}
          <InsightsCharts resultado={resultado} extraido={extraido} />

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 flex-shrink-0">
              <TrendingDown className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Oportunidades de economia</p>
              <p className="text-xs text-slate-500">Simulações baseadas no seu perfil de consumo</p>
            </div>
          </div>

          <div className="space-y-3">
            {resultado.insights.filter(insight => !insight.titulo.startsWith('Custo efetivo')).map((insight, i) => {
              const titulo = insight.titulo.startsWith('Solar On-Grid:')
                ? 'Instalação Sistema Solar'
                : insight.titulo.startsWith('Solar Híbrido')
                ? 'Instalação Sistema Solar com Baterias'
                : insight.titulo
              return (
              <div
                key={i}
                className={`rounded-xl border p-4 ${insightBorder(insight.tipo)}`}
              >
                <div className="flex items-start gap-3">
                  {insightIcon(insight.tipo)}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{titulo}</p>

                    {(titulo === 'Instalação Sistema Solar' || titulo === 'Instalação Sistema Solar com Baterias') && (
                      <div className="my-3 rounded-xl bg-gradient-to-b from-white to-sky-50 border border-slate-100 p-3 overflow-x-auto">
                        {/* Grid: 44px | 1fr | 56px | 1fr | 12px | 1fr | 44px */}
                        {/* Row 1: linha horizontal  Row 2: linha vertical  Row 3: carga */}
                        <style>{`@keyframes flowRight{from{background-position:0 0}to{background-position:14px 0}}@keyframes flowDown{from{background-position:0 0}to{background-position:0 14px}}`}</style>
                        <div className="min-w-[280px]" style={{display:'grid', gridTemplateColumns:'44px 1fr 56px 1fr 12px 1fr 44px', gridTemplateRows:'44px 24px 44px'}}>

                          {/* ── ROW 1 ── */}
                          {/* Solar */}
                          <div style={{gridColumn:1,gridRow:1}} className="flex items-center justify-center">
                            <div className="h-11 w-11 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center shadow-sm">
                              <svg className="h-6 w-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="7" width="20" height="13" rx="1.5"/><line x1="2" y1="11.5" x2="22" y2="11.5"/><line x1="2" y1="15.5" x2="22" y2="15.5"/>
                                <line x1="9" y1="7" x2="9" y2="20"/><line x1="15" y1="7" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="7"/>
                                <circle cx="12" cy="3" r="1.5" fill="currentColor" stroke="none"/>
                              </svg>
                            </div>
                          </div>
                          {/* Linha animada Solar→Inversor */}
                          <div style={{gridColumn:2,gridRow:1}} className="flex items-center">
                            <div className="flex-1 relative overflow-hidden" style={{height:'6px'}}>
                              <div className="absolute inset-0" style={{backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='6'%3E%3Cpolyline points='1,1 7,3 1,5' fill='none' stroke='%23fbbf24' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,backgroundSize:'14px 6px',backgroundRepeat:'repeat-x',animation:'flowRight 0.5s linear infinite'}}/>
                            </div>
                            <svg className="h-3 w-3 text-amber-400 flex-shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6h8M7 3l3 3-3 3"/></svg>
                          </div>
                          {/* Inversor */}
                          <div style={{gridColumn:3,gridRow:1}} className="flex items-center justify-center">
                            <div className="h-11 w-14 rounded-lg bg-sky-500 border-2 border-sky-400 flex flex-col items-center justify-center shadow-md gap-0.5">
                              <span className="text-white text-[9px] font-black tracking-wider leading-none">DC/AC</span>
                              <svg className="h-2.5 w-7 text-sky-200" viewBox="0 0 28 8" fill="none"><path d="M0 4 Q7 0 14 4 Q21 8 28 4" stroke="currentColor" strokeWidth="1.5"/></svg>
                            </div>
                          </div>
                          {/* Linha Inversor→Bateria + ícone bateria (híbrido) */}
                          {titulo === 'Instalação Sistema Solar com Baterias' && <>
                            <div style={{gridColumn:3,gridRow:2}} className="flex justify-center items-stretch">
                              <div className="relative overflow-hidden" style={{width:'6px'}}>
                                <div className="absolute inset-0" style={{backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='14'%3E%3Cpolyline points='1,1 3,7 5,1' fill='none' stroke='%2334d399' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,backgroundSize:'6px 14px',backgroundRepeat:'repeat-y',animation:'flowDown 0.5s linear infinite'}}/>
                              </div>
                            </div>
                            <div style={{gridColumn:3,gridRow:3}} className="flex items-center justify-center">
                              <div className="h-11 w-14 rounded-lg bg-emerald-500 border-2 border-emerald-400 flex flex-col items-center justify-center shadow-md gap-0.5">
                                <span className="text-white text-[9px] font-black tracking-wider leading-none">Battery</span>
                                <svg className="h-2.5 w-7 text-emerald-200" viewBox="0 0 28 8" fill="none"><rect x="1" y="2" width="20" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="21" y="3" width="3" height="3" rx="0.5" fill="currentColor" stroke="none"/><line x1="7" y1="4.5" x2="13" y2="4.5" stroke="currentColor" strokeWidth="1.2"/><line x1="10" y1="2.5" x2="10" y2="6.5" stroke="currentColor" strokeWidth="1.2"/></svg>
                              </div>
                            </div>
                          </>}
                          {/* Linha animada Inversor→nó */}
                          <div style={{gridColumn:4,gridRow:1}} className="flex items-center">
                            <div className="flex-1 relative overflow-hidden" style={{height:'6px'}}>
                              <div className="absolute inset-0" style={{backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='6'%3E%3Cpolyline points='1,1 7,3 1,5' fill='none' stroke='%23fbbf24' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,backgroundSize:'14px 6px',backgroundRepeat:'repeat-x',animation:'flowRight 0.5s linear infinite'}}/>
                            </div>
                          </div>
                          {/* Nó de junção + linha vertical animada — span rows 1,2,3 */}
                          <div style={{gridColumn:5, gridRow:'1 / 4'}} className="flex flex-col items-center">
                            {/* Espaço superior */}
                            <div style={{height:'15px'}} className="flex-shrink-0"/>
                            {/* Nó âmbar */}
                            <div className="h-3.5 w-3.5 flex-shrink-0 rounded-full bg-amber-400 border-2 border-amber-500 shadow-sm"/>
                            {/* Linha animada descendo até a Carga */}
                            <div className="flex-1 relative overflow-hidden" style={{width:'6px'}}>
                              <div className="absolute inset-0" style={{backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='14'%3E%3Cpolyline points='1,1 3,7 5,1' fill='none' stroke='%23fbbf24' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,backgroundSize:'6px 14px',backgroundRepeat:'repeat-y',animation:'flowDown 0.5s linear infinite'}}/>
                            </div>
                          </div>
                          {/* Linha animada nó→Rede */}
                          <div style={{gridColumn:6,gridRow:1}} className="flex items-center">
                            <div className="flex-1 relative overflow-hidden" style={{height:'6px'}}>
                              <div className="absolute inset-0" style={{backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='6'%3E%3Cpolyline points='1,1 7,3 1,5' fill='none' stroke='%23fbbf24' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,backgroundSize:'14px 6px',backgroundRepeat:'repeat-x',animation:'flowRight 0.5s linear infinite'}}/>
                            </div>
                            <svg className="h-3 w-3 text-amber-400 flex-shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6h8M7 3l3 3-3 3"/></svg>
                          </div>
                          {/* Rede */}
                          <div style={{gridColumn:7,gridRow:1}} className="flex items-center justify-center">
                            <div className="h-11 w-11 rounded-full bg-red-500 border-2 border-red-600 flex items-center justify-center shadow-md">
                              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="2" x2="12" y2="22"/><line x1="5" y1="6" x2="19" y2="6"/><line x1="7" y1="11" x2="17" y2="11"/>
                                <line x1="5" y1="6" x2="7" y2="11"/><line x1="19" y1="6" x2="17" y2="11"/>
                                <line x1="7" y1="11" x2="3" y2="22"/><line x1="17" y1="11" x2="21" y2="22"/>
                                <circle cx="5" cy="6" r="1" fill="white"/><circle cx="19" cy="6" r="1" fill="white"/>
                              </svg>
                            </div>
                          </div>

                          {/* ── ROW 3: Carga (casa) centrada sob o nó ── */}
                          <div style={{gridColumn:5,gridRow:3}} className="flex items-center justify-center overflow-visible">
                            <div className="h-11 w-11 flex-shrink-0 rounded-full bg-emerald-500 border-2 border-emerald-600 flex items-center justify-center shadow-md">
                              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12L12 3L21 12"/><path d="M5 10L5 20L9 20L9 15L15 15L15 20L19 20L19 10"/>
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Labels */}
                        <div className="min-w-[280px] mt-1" style={{display:'grid', gridTemplateColumns:'44px 1fr 56px 1fr 12px 1fr 44px', gridTemplateRows:'auto auto'}}>
                          <div style={{gridColumn:1,gridRow:1}} className="text-center"><span className="text-[10px] font-semibold text-amber-700">Solar</span></div>
                          <div style={{gridColumn:3,gridRow:1}} className="text-center"><span className="text-[10px] font-semibold text-sky-700 whitespace-nowrap">{titulo === 'Instalação Sistema Solar com Baterias' ? 'Inversor + Baterias' : 'Inversor'}</span></div>
                          <div style={{gridColumn:5,gridRow:1}} className="text-center overflow-visible"><span className="text-[10px] font-semibold text-emerald-700 whitespace-nowrap">Carga</span></div>
                          <div style={{gridColumn:7,gridRow:1}} className="text-center"><span className="text-[10px] font-semibold text-red-600">Rede</span></div>
                        </div>
                      </div>
                    )}

                    {/* Descrição com ícones por linha */}
                    {(titulo === 'Instalação Sistema Solar' || titulo === 'Instalação Sistema Solar com Baterias')
                      ? (() => {
                          const isSolar = titulo === 'Instalação Sistema Solar'
                          const linhaIcons = [
                            { icon: '☀️', prefix: null },  // geração
                            { icon: '📉', prefix: null },  // conta cai
                            { icon: '💰', prefix: null },  // economia
                            { icon: '🔧', prefix: null },  // investimento
                            { icon: '⏱️', prefix: null },  // payback
                            { icon: '🔋', prefix: null },  // baterias / tarifa branca (híbrido)
                          ]
                          return (
                            <ul className="mt-2 space-y-1">
                              {insight.descricao.split('\n').map((linha, li) => (
                                <li key={li} className="flex items-start gap-1.5">
                                  <span className="text-sm flex-shrink-0 leading-5">{linhaIcons[li]?.icon ?? '•'}</span>
                                  <span className="text-xs text-slate-600 leading-5">{linha}</span>
                                </li>
                              ))}
                            </ul>
                          )
                        })()
                      : <p className="text-xs text-slate-600 mt-0.5 whitespace-pre-line">{insight.descricao}</p>
                    }

                    {(insight.valorMensal != null || insight.valorAnual != null || insight.investimento != null) && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {resultado.resumo.valorTotal != null && (
                          <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 px-3 py-2.5 text-center">
                            <div className="flex justify-center mb-1">
                              <div className="h-7 w-7 rounded-full bg-slate-500 flex items-center justify-center">
                                <Receipt className="h-3.5 w-3.5 text-white" />
                              </div>
                            </div>
                            <p className="text-[10px] font-medium text-slate-500 mb-0.5">Conta atual / mês</p>
                            <p className="text-sm font-bold text-slate-700">
                              R$ {resultado.resumo.valorTotal.toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                        )}
                        {insight.custoFuturo != null && (
                          <div className="rounded-xl bg-gradient-to-br from-teal-50 to-cyan-100 border border-teal-200 px-3 py-2.5 text-center">
                            <div className="flex justify-center mb-1">
                              <div className="h-7 w-7 rounded-full bg-teal-500 flex items-center justify-center">
                                <Sparkles className="h-3.5 w-3.5 text-white" />
                              </div>
                            </div>
                            <p className="text-[10px] font-medium text-teal-700 mb-0.5">Conta futura / mês</p>
                            <p className="text-sm font-bold text-teal-700">
                              R$ {insight.custoFuturo.toLocaleString('pt-BR')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {(insight.valorMensal != null || insight.valorAnual != null || insight.investimento != null) && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {insight.valorAnual != null && (
                          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 px-3 py-2.5 text-center">
                            <div className="flex justify-center mb-1">
                              <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center">
                                <PiggyBank className="h-3.5 w-3.5 text-white" />
                              </div>
                            </div>
                            <p className="text-[10px] font-medium text-emerald-700 mb-0.5">Economia / ano</p>
                            <p className="text-sm font-bold text-emerald-700">
                              R$ {Math.round(insight.valorAnual).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        )}
                        {insight.investimento != null && (
                          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-sky-100 border border-blue-200 px-3 py-2.5 text-center">
                            <div className="flex justify-center mb-1">
                              <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center">
                                <Wallet className="h-3.5 w-3.5 text-white" />
                              </div>
                            </div>
                            <p className="text-[10px] font-medium text-blue-700 mb-0.5">Investimento</p>
                            <p className="text-sm font-bold text-blue-700">
                              R$ {insight.investimento.toLocaleString('pt-BR')}
                            </p>
                          </div>
                        )}
                        {insight.paybackAnos != null && (
                          <div className="rounded-xl bg-gradient-to-br from-violet-50 to-purple-100 border border-violet-200 px-3 py-2.5 text-center">
                            <div className="flex justify-center mb-1">
                              <div className="h-7 w-7 rounded-full bg-violet-500 flex items-center justify-center">
                                <Timer className="h-3.5 w-3.5 text-white" />
                              </div>
                            </div>
                            <p className="text-[10px] font-medium text-violet-700 mb-0.5">Payback</p>
                            <p className="text-sm font-bold text-violet-700">
                              {insight.paybackAnos.toFixed(1)} anos
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Projeção 25 anos */}
                    {insight.valorAnual != null && insight.investimento != null && insight.paybackAnos != null && (
                      <div className="mt-2 rounded-xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-300 px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="h-3.5 w-3.5 text-white" />
                          </div>
                          <p className="text-[11px] font-semibold text-amber-800">Projeção de retorno — 25 anos</p>
                        </div>
                        <p className="text-xl font-bold text-amber-700 mt-1">
                          R$ {(insight.valorAnual * 25 - insight.investimento).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-[10px] text-amber-600 mt-0.5">
                          Lucro líquido estimado após descontar o investimento de R$ {insight.investimento.toLocaleString('pt-BR')} (vida útil média do sistema: 25 anos)
                        </p>
                      </div>
                    )}

                    {/* Observações e considerações */}
                    {(titulo === 'Instalação Sistema Solar' || titulo === 'Instalação Sistema Solar com Baterias') && (
                      <p className="mt-2 text-[10px] text-slate-400 italic">
                        ⚠️ Observações e considerações: dimensionamento inclui 20% de margem para crescimento no consumo futuro. Valores estimados com base no perfil de consumo e tarifas vigentes. Simule com um instalador certificado para orçamento preciso.
                      </p>
                    )}

                    {(insight.valorMensal != null || insight.valorAnual != null) && extraido?.grupo !== 'B' && (() => {
                      const faturasReais = fatura.conta.faturas?.filter((f: { arquivoUrl: string | null }) => !!f.arquivoUrl).length ?? 0
                      const faltam = Math.max(0, 12 - faturasReais)
                      return faltam > 0 ? (
                        <div className="mt-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-amber-100">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-amber-800 mb-1">Projeção baseada em poucos dados</p>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1 h-1.5 rounded-full bg-amber-200 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-amber-500 transition-all"
                                    style={{ width: `${Math.min(100, (faturasReais / 12) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-amber-700 whitespace-nowrap font-medium">{faturasReais}/12 faturas</span>
                              </div>
                              <p className="text-xs text-amber-700">
                                Envie mais {faltam} fatura{faltam !== 1 ? 's' : ''} para uma projeção anual confiável.
                              </p>
                            </div>
                            <Link
                              href={`/dashboard/faturas/nova?contaId=${fatura.contaId}`}
                              className="flex-shrink-0 inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Zap className="h-3.5 w-3.5" />
                              Enviar
                            </Link>
                          </div>
                        </div>
                      ) : null
                    })()}
                  </div>
                </div>
              </div>
            )})}
          </div>

          {/* CO₂ */}
          {resultado.co2 && <Co2Card co2={resultado.co2} />}
        </div>
      )}

      {/* DEBUG — remover após diagnóstico */}
      {fatura.textoOcr && (
        <div className="space-y-2">
          <details className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <summary className="cursor-pointer text-xs font-mono text-amber-600 select-none font-semibold">
              [DEBUG] Campos extraídos (dadosJson.extraido) — clique para expandir
            </summary>
            <pre className="mt-3 text-xs text-slate-700 whitespace-pre-wrap font-mono leading-5">
              {JSON.stringify(extraido, null, 2)}
            </pre>
          </details>
          <details className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <summary className="cursor-pointer text-xs font-mono text-slate-400 select-none">
              [DEBUG] Texto OCR bruto ({fatura.textoOcr.length} chars) — clique para expandir
            </summary>
            <pre className="mt-3 text-xs text-slate-600 whitespace-pre-wrap break-words font-mono leading-5 max-h-96 overflow-y-auto">
              {fatura.textoOcr}
            </pre>
          </details>
        </div>
      )}

      {/* Baixar relatório PDF — final da página */}
      {fatura.status === 'CONCLUIDA' && (
        <div className="flex justify-end pt-2">
          <a
            href={`/api/faturas/${fatura.id}/relatorio`}
            download
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            <Download className="h-4 w-4" />
            Baixar relatório PDF
          </a>
        </div>
      )}
    </div>
  )
}
