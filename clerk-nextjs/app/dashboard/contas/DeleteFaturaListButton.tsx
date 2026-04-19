'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deletarFatura } from '@/app/dashboard/faturas/[id]/actions'

export default function DeleteFaturaListButton({ faturaId }: { faturaId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
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
        router.refresh()
      }
    })
  }

  if (confirming) {
    return (
      <div
        className="flex items-center gap-2"
        onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
      >
        <span className="text-xs text-slate-500">Confirmar?</span>
        <button
          onClick={handleClick}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium px-2.5 py-1.5 transition-colors"
        >
          {isPending ? 'Excluindo…' : 'Sim'}
        </button>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirming(false) }}
          disabled={isPending}
          className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
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
      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
