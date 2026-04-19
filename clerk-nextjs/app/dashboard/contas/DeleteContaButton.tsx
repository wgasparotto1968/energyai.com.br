'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { excluirConta } from './actions'

export default function DeleteContaButton({ contaId }: { contaId: string }) {
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
      const result = await excluirConta(contaId)
      if ('error' in result) {
        alert(result.error)
        setConfirming(false)
      } else {
        router.push('/dashboard/contas')
        router.refresh()
      }
    })
  }

  function handleCancel(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setConfirming(false)
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
        <span className="text-sm text-slate-500 whitespace-nowrap">Confirmar exclusão?</span>
        <button
          onClick={handleClick}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium px-3 py-1.5 transition-colors whitespace-nowrap"
        >
          {isPending ? 'Excluindo…' : 'Sim, excluir'}
        </button>
        <button
          onClick={handleCancel}
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
      className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
      title="Excluir unidade"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
