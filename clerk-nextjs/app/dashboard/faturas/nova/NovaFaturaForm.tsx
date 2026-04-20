'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, X, Info } from 'lucide-react'

export default function NovaFaturaForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const contaId = searchParams.get('contaId') ?? ''

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!arquivo) { setError('Selecione um PDF da fatura.'); return }

    const formData = new FormData()
    formData.set('arquivo', arquivo)
    if (contaId) formData.set('contaId', contaId)

    setIsPending(true)
    try {
      const res = await fetch('/api/faturas/upload', { method: 'POST', body: formData })
      const result = await res.json()
      if (result.error) {
        setError(result.error)
      } else if (result.redirectTo) {
        router.push(result.redirectTo)
      }
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setIsPending(false)
    }
  }

  function handleFile(file: File | null) {
    if (!file) return
    if (file.type !== 'application/pdf') { setError('Somente PDFs são aceitos.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Arquivo muito grande. Máximo 10 MB.'); return }
    setError(null)
    setArquivo(file)
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link
          href={contaId ? `/dashboard/contas/${contaId}` : '/dashboard/faturas'}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Enviar Fatura</h1>
        <p className="text-slate-500 mt-1">Faça upload do PDF — a análise é feita automaticamente.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">

        {/* Info */}
        <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
          <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            A unidade consumidora, mês e ano são lidos automaticamente da fatura. Nenhuma seleção manual é necessária.
          </p>
        </div>

        {/* Upload PDF */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            PDF da Fatura <span className="text-red-500">*</span>
          </label>
          {arquivo ? (
            <div className="flex items-center gap-3 rounded-lg border border-green-300 bg-green-50 px-4 py-3">
              <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-sm text-green-800 truncate flex-1">{arquivo.name}</span>
              <button type="button" onClick={() => setArquivo(null)} className="text-green-600 hover:text-green-800">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0] ?? null) }}
              className="cursor-pointer rounded-lg border-2 border-dashed border-slate-300 hover:border-green-400 bg-slate-50 hover:bg-green-50 p-10 text-center transition-colors"
            >
              <Upload className="mx-auto h-9 w-9 text-slate-400 mb-2" />
              <p className="text-sm text-slate-600">
                <span className="font-medium text-green-600">Clique para selecionar</span>{' '}
                ou arraste o PDF aqui
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF · máx. 10 MB</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Link
            href={contaId ? `/dashboard/contas/${contaId}` : '/dashboard/faturas'}
            className="flex-1 text-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending || !arquivo}
            className="flex-1 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-medium text-white transition-colors"
          >
            {isPending ? 'Analisando…' : 'Enviar e Analisar'}
          </button>
        </div>
      </form>
    </div>
  )
}

