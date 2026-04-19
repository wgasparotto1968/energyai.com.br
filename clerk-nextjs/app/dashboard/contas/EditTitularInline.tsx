'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import { atualizarTitular } from './actions'

export default function EditTitularInline({
  contaId,
  titular,
}: {
  contaId: string
  titular: string | null
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(titular ?? '')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function handleSave() {
    startTransition(async () => {
      await atualizarTitular(contaId, value)
      setEditing(false)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') { setValue(titular ?? ''); setEditing(false) }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          className="text-sm font-semibold text-slate-800 border border-green-400 rounded px-2 py-0.5 w-48 focus:outline-none focus:ring-1 focus:ring-green-500"
          placeholder="Nome do titular"
        />
        <button
          onClick={handleSave}
          disabled={isPending}
          className="p-1 text-green-600 hover:text-green-700"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => { setValue(titular ?? ''); setEditing(false) }}
          disabled={isPending}
          className="p-1 text-slate-400 hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 group/edit">
      <p className="font-semibold text-slate-800 truncate">
        {titular ?? <span className="text-slate-400 font-normal italic">Sem titular</span>}
      </p>
      <button
        onClick={(e) => { e.preventDefault(); setEditing(true) }}
        className="opacity-0 group-hover/edit:opacity-100 p-0.5 text-slate-400 hover:text-slate-600 transition-opacity"
        title="Editar titular"
      >
        <Pencil className="h-3 w-3" />
      </button>
    </div>
  )
}
