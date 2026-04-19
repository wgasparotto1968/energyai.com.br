import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FileText, Plus, Building2, Calendar } from 'lucide-react'

export default async function FaturasPage() {
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: {
      contas: {
        include: {
          faturas: {
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  })

  const todasFaturas = (dbUser?.contas ?? []).flatMap((conta) =>
    conta.faturas.map((f) => ({ ...f, distribuidora: conta.distribuidora }))
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Faturas</h1>
          <p className="text-slate-500 mt-1">Histórico de faturas enviadas</p>
        </div>
        <Link
          href="/dashboard/faturas/nova"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Enviar Fatura
        </Link>
      </div>

      {/* Empty state */}
      {todasFaturas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <h3 className="text-slate-700 font-semibold mb-1">Nenhuma fatura enviada</h3>
          <p className="text-slate-500 text-sm mb-4">
            Envie sua primeira fatura em PDF para começar a análise.
          </p>
          <Link
            href="/dashboard/faturas/nova"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Enviar Fatura
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {todasFaturas.map((fatura) => (
            <div
              key={fatura.id}
              className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 flex-shrink-0">
                <FileText className="h-5 w-5 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">
                  {fatura.distribuidora}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {String(fatura.mes).padStart(2, '0')}/{fatura.ano}
                  </span>
                  {fatura.valorTotal > 0 && (
                    <span className="text-xs text-slate-500">
                      R$ {fatura.valorTotal.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                  {fatura.consumoKwh != null && (
                    <span className="text-xs text-slate-500">{fatura.consumoKwh} kWh</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[fatura.status] ?? 'bg-slate-100 text-slate-600'}`}>
                  {statusLabel[fatura.status] ?? fatura.status}
                </span>
                {fatura.arquivoUrl && (
                  <a
                    href={fatura.arquivoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:underline flex items-center gap-1"
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    PDF
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
