'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { FileText, Search, X, CheckCircle, AlertTriangle, Clock } from 'lucide-react'

const MESES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const statusIcon: Record<string, React.ReactNode> = {
  PENDENTE: <Clock className="h-4 w-4 text-yellow-500" />,
  PROCESSANDO: <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />,
  CONCLUIDA: <CheckCircle className="h-4 w-4 text-green-500" />,
  ERRO: <AlertTriangle className="h-4 w-4 text-red-500" />,
}

const statusColor: Record<string, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-700',
  PROCESSANDO: 'bg-blue-100 text-blue-700',
  CONCLUIDA: 'bg-green-100 text-green-700',
  ERRO: 'bg-red-100 text-red-700',
}

const statusLabel: Record<string, string> = {
  PENDENTE: 'Pendente',
  PROCESSANDO: 'Processando',
  CONCLUIDA: 'Concluída',
  ERRO: 'Erro',
}

export type FaturaItem = {
  id: string
  mes: number
  ano: number
  valorTotal: number
  consumoKwh: number | null
  status: string
  dadosJson: {
    extraido?: { numeroCliente?: string; enderecoUC?: string }
    resultado?: { insights: Array<{ tipo: string; valorAnual?: number }> }
  } | null
  distribuidora: string
  titular: string | null
  numeroCliente: string | null
  endereco: string | null
  contaId: string
}

interface Props {
  faturas: FaturaItem[]
}

const DEFAULT_LIMIT = 5

export default function AtividadeRecenteSearch({ faturas }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return faturas.slice(0, DEFAULT_LIMIT)
    const q = query.trim().toLowerCase()
    return faturas.filter((f) => {
      const ucNum = f.numeroCliente || f.dadosJson?.extraido?.numeroCliente || ''
      const ucEnd = f.endereco || f.dadosJson?.extraido?.enderecoUC || ''
      const titular = f.titular || f.distribuidora || ''
      return (
        titular.toLowerCase().includes(q) ||
        ucNum.toLowerCase().includes(q) ||
        ucEnd.toLowerCase().includes(q)
      )
    })
  }, [query, faturas])

  const isSearching = query.trim().length > 0

  return (
    <div className="space-y-3">
      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome, UC ou endereço…"
          className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-8 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Contador de resultados */}
      {isSearching && (
        <p className="text-xs text-slate-500">
          {filtered.length === 0
            ? 'Nenhum resultado encontrado.'
            : `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} para "${query.trim()}"`}
        </p>
      )}

      {/* Lista */}
      {filtered.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
          {filtered.map((fatura) => {
            const economiaAnual =
              fatura.dadosJson?.resultado?.insights
                .filter((i) => i.tipo === 'economia')
                .reduce((s, i) => s + (i.valorAnual ?? 0), 0) ?? 0
            const ucNum = fatura.numeroCliente || fatura.dadosJson?.extraido?.numeroCliente || null
            const ucEnd = fatura.endereco || fatura.dadosJson?.extraido?.enderecoUC || null

            return (
              <Link
                key={fatura.id}
                href={`/dashboard/faturas/${fatura.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 flex-shrink-0">
                  <FileText className="h-5 w-5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {fatura.titular ?? fatura.distribuidora} — {MESES[fatura.mes]}/{fatura.ano}
                  </p>
                  <p className="text-xs text-slate-500">
                    {fatura.valorTotal > 0
                      ? `R$ ${fatura.valorTotal.toFixed(2).replace('.', ',')}`
                      : 'Valor não extraído'}
                    {fatura.consumoKwh != null ? ` · ${fatura.consumoKwh} kWh` : ''}
                  </p>
                  {(ucNum || ucEnd) && (
                    <p className="text-xs text-slate-400 truncate">
                      {[ucNum ? `UC ${ucNum}` : null, ucEnd]
                        .filter(Boolean)
                        .join(' · ')
                        .slice(0, 45)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {economiaAnual > 0 && (
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full hidden sm:inline">
                      −R$ {Math.round(economiaAnual).toLocaleString('pt-BR')}/ano
                    </span>
                  )}
                  <div className="flex items-center gap-1.5">
                    {statusIcon[fatura.status]}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[fatura.status] ?? ''}`}>
                      {statusLabel[fatura.status] ?? fatura.status}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Rodapé quando não busca e há mais faturas */}
      {!isSearching && faturas.length > DEFAULT_LIMIT && (
        <p className="text-xs text-slate-400 text-center">
          Mostrando {DEFAULT_LIMIT} de {faturas.length} faturas.{' '}
          <Link href="/dashboard/faturas" className="text-blue-600 hover:text-blue-800 transition-colors">
            Ver todas →
          </Link>
        </p>
      )}
    </div>
  )
}
