'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function NomeForm({
  nomeAtual,
}: {
  nomeAtual: string
}) {
  const [nome, setNome] = useState(nomeAtual)
  const [isPending, startTransition] = useTransition()
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSucesso(false)
    setErro(null)

    startTransition(async () => {
      const res = await fetch('/api/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome }),
      })
      if (res.ok) {
        setSucesso(true)
        router.refresh()
      } else {
        const json = await res.json()
        setErro(json.error ?? 'Erro ao salvar.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <label htmlFor="nome" className="block text-sm font-medium text-slate-700 mb-1.5">
          Nome de exibição
        </label>
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(e) => { setNome(e.target.value); setSucesso(false) }}
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          maxLength={80}
        />
      </div>
      <button
        type="submit"
        disabled={isPending || nome === nomeAtual}
        className="rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 transition-colors flex-shrink-0"
      >
        {isPending ? 'Salvando…' : 'Salvar'}
      </button>
      {sucesso && <p className="text-xs text-green-600 self-end pb-1">Salvo!</p>}
      {erro && <p className="text-xs text-red-600 self-end pb-1">{erro}</p>}
    </form>
  )
}
