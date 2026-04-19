import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { criarConta } from '../actions'

export default function NovaContaPage() {
  return (
    <div className="max-w-lg">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/contas"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Nova Unidade</h1>
        <p className="text-slate-500 mt-1">Cadastre uma unidade consumidora</p>
      </div>

      {/* Form */}
      <form action={criarConta as unknown as (formData: FormData) => void} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        {/* Titular */}
        <div>
          <label htmlFor="titular" className="block text-sm font-medium text-slate-700 mb-1.5">
            Nome / Razão Social do Titular
          </label>
          <input
            id="titular"
            name="titular"
            type="text"
            placeholder="Nome do titular da conta de energia"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
        </div>

        {/* Distribuidora */}
        <div>
          <label htmlFor="distribuidora" className="block text-sm font-medium text-slate-700 mb-1.5">
            Concessionária <span className="text-red-500">*</span>
          </label>
          <input
            id="distribuidora"
            name="distribuidora"
            type="text"
            required
            placeholder="Ex: CELESC, COPEL, CEMIG, ENEL…"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
        </div>

        {/* UC */}
        <div>
          <label htmlFor="numeroCliente" className="block text-sm font-medium text-slate-700 mb-1.5">
            Nº da UC (Unidade Consumidora)
          </label>
          <input
            id="numeroCliente"
            name="numeroCliente"
            type="text"
            placeholder="Número de instalação ou UC"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
        </div>

        {/* Endereço */}
        <div>
          <label htmlFor="endereco" className="block text-sm font-medium text-slate-700 mb-1.5">
            Endereço
          </label>
          <input
            id="endereco"
            name="endereco"
            type="text"
            placeholder="Endereço da unidade consumidora"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/dashboard/contas"
            className="flex-1 text-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="flex-1 rounded-lg bg-green-600 hover:bg-green-700 px-4 py-2.5 text-sm font-medium text-white transition-colors"
          >
            Cadastrar Unidade
          </button>
        </div>
      </form>
    </div>
  )
}
