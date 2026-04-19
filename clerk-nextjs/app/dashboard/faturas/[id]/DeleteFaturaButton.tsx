'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deletarFatura } from './actions'

export default function DeleteFaturaButton({
  faturaId,
  contaId,
}: {
  faturaId: string
  contaId: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)

  function handleClick() {
    if (!confirming) {
      setConfirming(true)
      return
    }
    startTransition(async () => {
      const result = await deletarFatura(faturaId)
      if ('error' in result) {
        alert(result.error)
        setConfirming(false)
      } else {
        router.push(`/dashboard/contas/${contaId}`)
      }
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Confirmar exclusão?</span>
        <button
          onClick={handleClick}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium px-3 py-1.5 transition-colors"
        >
          {isPending ? 'Excluindo…' : 'Sim, excluir'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      title="Excluir fatura"
      className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
