import type { Co2Analise } from '@/lib/analise/engine'
import { Leaf, Car, Smartphone, Zap } from 'lucide-react'

function fmt(n: number, decimals = 0) {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: decimals })
}

function StatCard({
  icon,
  value,
  unit,
  label,
  bg,
  iconColor,
}: {
  icon: React.ReactNode
  value: string
  unit: string
  label: string
  bg: string
  iconColor: string
}) {
  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <div className={`mb-2 ${iconColor}`}>{icon}</div>
      <p className="text-xl font-bold text-slate-800 leading-tight">
        {value}
        <span className="text-sm font-medium text-slate-500 ml-1">{unit}</span>
      </p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

export default function Co2Card({ co2 }: { co2: Co2Analise }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
          <Leaf className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-emerald-800 text-sm">Impacto Ambiental</h3>
          <p className="text-xs text-emerald-600">
            Emissões de CO₂ evitadas ao implementar as recomendações
          </p>
        </div>
      </div>

      {/* Destaque anual */}
      <div className="rounded-xl bg-emerald-700 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-emerald-300 text-xs uppercase tracking-wide">CO₂ evitado por ano</p>
          <p className="text-white text-3xl font-bold mt-1">
            {fmt(co2.co2EvitadoKgAno)} kg
          </p>
          <p className="text-emerald-300 text-xs mt-1">
            {fmt(co2.energiaEconomizadaKwhAno, 0)} kWh economizados ×{' '}
            {co2.fatorEmissao} kgCO₂/kWh (SIN 2024)
          </p>
        </div>
        <Leaf className="h-12 w-12 text-emerald-500 opacity-40" />
      </div>

      {/* Equivalências */}
      <div>
        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
          Equivale a…
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <StatCard
            icon={<Leaf className="h-5 w-5" />}
            value={fmt(co2.arvoresEquivalentes, 0)}
            unit="árvores"
            label="plantadas por ano"
            bg="border-emerald-200 bg-white"
            iconColor="text-emerald-600"
          />
          <StatCard
            icon={<Car className="h-5 w-5" />}
            value={fmt(co2.kmCarroEquivalentes, 0)}
            unit="km"
            label="de carro não rodado"
            bg="border-emerald-200 bg-white"
            iconColor="text-slate-600"
          />
          <StatCard
            icon={<Smartphone className="h-5 w-5" />}
            value={fmt(co2.celularesCarregados, 0)}
            unit="cargas"
            label="de celular evitadas"
            bg="border-emerald-200 bg-white"
            iconColor="text-blue-600"
          />
        </div>
      </div>

      {/* Projeção longo prazo */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white border border-emerald-200 p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Em 5 anos</p>
          <p className="text-lg font-bold text-emerald-700">{fmt(co2.co2EvitadoKg5Anos, 0)} kg</p>
        </div>
        <div className="rounded-lg bg-white border border-emerald-200 p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Em 25 anos</p>
          <p className="text-lg font-bold text-emerald-700">
            {co2.co2EvitadoKg25Anos >= 1000
              ? `${fmt(co2.co2EvitadoKg25Anos / 1000, 1)} t`
              : `${fmt(co2.co2EvitadoKg25Anos, 0)} kg`}
          </p>
        </div>
      </div>

      <p className="text-xs text-emerald-600 italic">
        Cálculo baseado no fator de emissão médio do Sistema Interligado Nacional (SIN) 2024 —
        {co2.fatorEmissao} kgCO₂/kWh.
      </p>
    </div>
  )
}
