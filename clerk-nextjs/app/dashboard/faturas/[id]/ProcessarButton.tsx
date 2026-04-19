'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'

export default function ProcessarButton({ faturaId }: { faturaId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [historicoImportado, setHistoricoImportado] = useState<number | null>(null)
  const router = useRouter()

  async function handleProcessar() {
    setError(null)
    setHistoricoImportado(null)
    startTransition(async () => {
      const res = await fetch(`/api/faturas/${faturaId}/processar`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Erro ao processar.')
      } else {
        if (json.historicoImportado > 0) {
          setHistoricoImportado(json.historicoImportado)
        }
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleProcessar}
        disabled={isPending}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        <Zap className="h-4 w-4" />
        {isPending ? 'Processando…' : 'Analisar fatura'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {historicoImportado !== null && historicoImportado > 0 && (
        <p className="text-sm text-green-700">
          ✓ {historicoImportado} {historicoImportado === 1 ? 'mês importado' : 'meses importados'} do histórico da fatura
        </p>
      )}
    </div>
  )
}
