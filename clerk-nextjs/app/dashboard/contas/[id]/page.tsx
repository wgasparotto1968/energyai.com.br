import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, FileText, Plus, Calendar, BarChart2, Zap } from 'lucide-react'
import DeleteFaturaButton from '@/app/dashboard/faturas/[id]/DeleteFaturaButton'

export default async function ContaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  })
  if (!dbUser) return null

  const conta = await prisma.conta.findFirst({
    where: { id, userId: dbUser.id },
    include: {
      faturas: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!conta) notFound()

  const statusLabel: Record<string, string> = {
    PENDENTE: 'Pendente',
    PROCESSANDO: 'Processando',
    CONCLUIDA: 'Concluída',
    ERRO: 'Erro',
  }

  const statusColor: Record<string, string> = {
    PENDENTE: 'bg-yellow-100 text-yellow-700',
    PROCESSANDO: 'bg-blue-100 text-blue-700',
    CONCLUIDA: 'bg-green-100 text-green-700',
    ERRO: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/contas"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {conta.titular ?? conta.distribuidora}
              </h1>
              {conta.numeroCliente && (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100">
                    UC {conta.numeroCliente}
                  </span>
                  {conta.endereco && (
                    <span className="text-xs text-slate-500 truncate max-w-[240px]">
                      {conta.endereco.length > 40 ? conta.endereco.slice(0, 40) + '…' : conta.endereco}
                    </span>
                  )}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5">
                {conta.distribuidora && conta.distribuidora !== 'Desconhecida' && (
                  <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                    <Building2 className="h-3.5 w-3.5" />
                    {conta.distribuidora}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`/dashboard/faturas/nova?contaId=${conta.id}`}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nova Fatura
            </Link>
          </div>
        </div>

        {/* Botões de análise */}
        {conta.faturas.some((f) => f.status === 'CONCLUIDA') && (() => {
          const ultimaReal = [...conta.faturas]
            .filter(f => f.status === 'CONCLUIDA' && !!f.arquivoUrl)
            .sort((a, b) => b.ano !== a.ano ? b.ano - a.ano : b.mes - a.mes)[0]
          const grupoFatura = (ultimaReal?.dadosJson as { extraido?: { grupo?: string } } | null)?.extraido?.grupo
          const isGrupoA = grupoFatura === 'A'
          return (
            <div className="flex items-center gap-2 mt-4">
              <Link
                href={`/dashboard/contas/${conta.id}/historico`}
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
              >
                <BarChart2 className="h-4 w-4" />
                Histórico
              </Link>
              {ultimaReal && (
                isGrupoA ? (
                  <Link
                    href={`/dashboard/contas/${conta.id}/demanda`}
                    className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
                  >
                    <Zap className="h-4 w-4" />
                    Análise de Demanda
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard/faturas/${ultimaReal.id}`}
                    className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
                  >
                    <Zap className="h-4 w-4" />
                    Análise da Fatura
                  </Link>
                )
              )}
            </div>
          )
        })()}
      </div>

      {/* Faturas */}
      <div>
        {conta.faturas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <FileText className="mx-auto h-9 w-9 text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium mb-1">Nenhuma fatura enviada</p>
            <p className="text-slate-500 text-sm mb-4">
              Envie a primeira fatura desta unidade para gerar análises.
            </p>
            <Link
              href={`/dashboard/faturas/nova?contaId=${conta.id}`}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Enviar Fatura
            </Link>
          </div>
        ) : (() => {
          const faturaReal = conta.faturas.filter(f => !!f.arquivoUrl)
          const faturaHistorico = conta.faturas.filter(f => !f.arquivoUrl)
            .sort((a, b) => b.ano !== a.ano ? b.ano - a.ano : b.mes - a.mes)

          const renderCard = (fatura: typeof conta.faturas[0], isHistorico: boolean) => (
            <div
              key={fatura.id}
              className={`flex items-center gap-2 rounded-xl border transition-colors ${
                isHistorico
                  ? 'bg-slate-100 border-slate-200 border-dashed hover:border-slate-300 hover:bg-slate-200/50'
                  : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              <Link
                href={`/dashboard/faturas/${fatura.id}`}
                className="flex items-center gap-4 flex-1 p-4 min-w-0"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${isHistorico ? 'bg-slate-200' : 'bg-slate-100'}`}>
                  <FileText className={`h-5 w-5 ${isHistorico ? 'text-slate-400' : 'text-slate-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${isHistorico ? 'text-slate-500' : 'text-slate-800'}`}>
                    {String(fatura.mes).padStart(2, '0')}/{fatura.ano}
                  </p>
                  {isHistorico ? (
                    <p className="text-xs text-slate-400">
                      {fatura.consumoKwh != null ? `${fatura.consumoKwh} kWh` : '—'}
                      {' · '}apenas consumo (importado do histórico)
                    </p>
                  ) : (
                    fatura.valorTotal != null && fatura.valorTotal > 0 && (
                      <p className="text-xs text-slate-500">
                        R$ {fatura.valorTotal.toFixed(2).replace('.', ',')}
                        {fatura.consumoKwh != null ? ` · ${fatura.consumoKwh} kWh` : ''}
                      </p>
                    )
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {!isHistorico && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[fatura.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {statusLabel[fatura.status] ?? fatura.status}
                    </span>
                  )}
                  {!isHistorico && (
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(fatura.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              </Link>
              <div className="pr-4 flex-shrink-0">
                <DeleteFaturaButton faturaId={fatura.id} contaId={conta.id} />
              </div>
            </div>
          )

          return (
            <div className="space-y-4">
              {/* Faturas reais (com PDF) */}
              {faturaReal.length > 0 && (
                <div>
                  <h2 className="text-base font-semibold text-slate-700 mb-2">
                    Faturas ({faturaReal.length})
                  </h2>
                  <div className="space-y-2">
                    {faturaReal.map(f => renderCard(f, false))}
                  </div>
                </div>
              )}

              {/* Faturas do histórico */}
              {faturaHistorico.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                    Importadas do histórico ({faturaHistorico.length})
                    <span className="font-normal text-slate-400">— apenas consumo mensal</span>
                  </h2>
                  <div className="space-y-1.5">
                    {faturaHistorico.map(f => renderCard(f, true))}
                  </div>
                </div>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
