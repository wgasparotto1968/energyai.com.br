import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Building2, Plus, FileText, AlertTriangle, ChevronRight } from 'lucide-react'
import DeleteContaButton from './DeleteContaButton'

const LIXO_RE = /sem titular|data\s+hora|visto|ausente|inexistente|mudou/i

export default async function ContasPage() {
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: {
      contas: {
        orderBy: { createdAt: 'desc' },
        include: {
          faturas: { orderBy: [{ ano: 'asc' }, { mes: 'asc' }] },
        },
      },
    },
  })

  const contas = dbUser?.contas ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Contas de Energia</h1>
          <p className="text-slate-500 mt-1">Unidades consumidoras cadastradas</p>
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
      {contas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <h3 className="text-slate-700 font-semibold mb-1">Nenhuma conta cadastrada</h3>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contas.map((conta) => {
            // Nome display
            const titularBruto = conta.titular ?? ''
            const titular = titularBruto && !LIXO_RE.test(titularBruto)
              ? titularBruto
              : conta.distribuidora

            const totalFaturas = conta.faturas.length
            const concluidas = conta.faturas.filter((f) => f.status === 'CONCLUIDA').length

            // Verifica se há 12 meses distintos de faturas concluídas
            const mesesUnicos = new Set(
              conta.faturas
                .filter((f) => f.status === 'CONCLUIDA')
                .map((f) => f.mes)
            )
            const historicoCompleto = mesesUnicos.size >= 12

            // Período de referência (mês mais antigo → mais recente)
            const faturasConcluidas = conta.faturas.filter((f) => f.status === 'CONCLUIDA')
            const periodoLabel = faturasConcluidas.length > 0
              ? (() => {
                  const primeira = faturasConcluidas[0]
                  const ultima = faturasConcluidas[faturasConcluidas.length - 1]
                  return `${String(primeira.mes).padStart(2, '0')}/${primeira.ano} – ${String(ultima.mes).padStart(2, '0')}/${ultima.ano}`
                })()
              : null

            return (
              <div key={conta.id} className="group relative">
                {/* Botão de exclusão — posicionado no canto superior direito sobre o link */}
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteContaButton contaId={conta.id} />
                </div>
                <Link
                  href={`/dashboard/contas/${conta.id}`}
                  className="flex flex-col bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all p-5 gap-3"
                >
                {/* Ícone + nome */}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 flex-shrink-0">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="font-semibold text-slate-800 leading-tight truncate">{titular}</p>
                    {conta.numeroCliente && (
                      <span className="inline-block mt-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                        UC {conta.numeroCliente}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
                </div>

                {/* Endereço */}
                {conta.endereco && (
                  <p className="text-xs text-slate-500 truncate -mt-1">
                    {conta.endereco.length > 45 ? conta.endereco.slice(0, 45) + '…' : conta.endereco}
                  </p>
                )}

                {/* Concessionária + período */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  {conta.distribuidora && conta.distribuidora !== 'Desconhecida' ? (
                    <span className="font-medium text-slate-600">{conta.distribuidora}</span>
                  ) : (
                    <span className="text-slate-400 italic">Concessionária não identificada</span>
                  )}
                  {periodoLabel && <span>{periodoLabel}</span>}
                </div>

                {/* Rodapé: contagem de faturas */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    {totalFaturas} {totalFaturas === 1 ? 'fatura' : 'faturas'}
                    {concluidas > 0 && concluidas < totalFaturas && ` · ${concluidas} concluídas`}
                  </span>
                  <span className="text-xs text-slate-400">{mesesUnicos.size} meses</span>
                </div>

                {/* Alerta: histórico incompleto */}
                {!historicoCompleto && concluidas > 0 && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span>
                      Histórico incompleto ({mesesUnicos.size}/12 meses) — análise pode conter imprecisões.
                    </span>
                  </div>
                )}
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
