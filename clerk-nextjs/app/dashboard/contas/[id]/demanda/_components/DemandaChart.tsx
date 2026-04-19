'use client'

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export interface PontoDemanda {
  label: string       // "Jan/25"
  medidaFP: number | null   // demanda medida fora ponta (kW)
  medidaPT: number | null   // demanda medida ponta (kW) — se disponível
  contratada: number | null // demanda contratada naquele mês
  ultrapassagem: number | null // demanda de ultrapassagem cobrada (kW acima do contratado)
}

interface Props {
  pontos: PontoDemanda[]
  contratadaAtual: number
  sugerida: number
  tarifaDemanda: number
  tarifaEhEstimativa: boolean
  economiaAnual: number | null
  mesesComDados: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs space-y-1 min-w-[160px]">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex justify-between gap-4">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-medium text-slate-800">
            {entry.value != null ? `${Number(entry.value).toFixed(0)} kW` : '—'}
          </span>
        </div>
      ))}
    </div>
  )
}

export function DemandaChart({ pontos, contratadaAtual, sugerida, tarifaDemanda, tarifaEhEstimativa, economiaAnual, mesesComDados }: Props) {

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={pontos} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            unit=" kW"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            formatter={(value) => <span className="text-slate-600">{value}</span>}
          />

          {/* Demanda medida FP */}
          <Bar dataKey="medidaFP" name="Demanda medida (kW)" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {pontos.map((p, i) => {
              const medida = p.medidaFP ?? 0
              const excede = p.contratada != null && medida > p.contratada * 1.05
              return <Cell key={i} fill={excede ? '#ef4444' : '#3b82f6'} />
            })}
          </Bar>

          {/* Linha demanda contratada mês a mês */}
          <Line
            dataKey="contratada"
            name="Demanda contratada (kW)"
            type="stepAfter"
            stroke="#f97316"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#f97316', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            connectNulls
          />

          {/* Linha demanda contratada atual (referência + label) */}
          <ReferenceLine
            y={contratadaAtual}
            stroke="#f97316"
            strokeWidth={1}
            strokeDasharray="6 3"
            strokeOpacity={0.4}
            label={{ value: 'Demanda contratada', position: 'insideTopRight', fontSize: 11, fill: '#ea580c', fontWeight: 500 }}
          />

          {/* Linha demanda sugerida */}
          <ReferenceLine
            y={sugerida}
            stroke="#22c55e"
            strokeWidth={2}
            strokeDasharray="4 4"
            label={{ value: 'Demanda Sugerida', position: 'insideBottomRight', fontSize: 11, fill: '#16a34a', fontWeight: 500 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legenda das linhas de referência */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-600 px-1">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-6 border-t-2 border-dashed border-orange-400" />
          Demanda contratada atual ({contratadaAtual} kW)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-6 border-t-2 border-dashed border-green-500" />
          Demanda sugerida ({sugerida} kW)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-400" />
          Mês com ultrapassagem ({'>'} 5% do contratado)
        </span>
      </div>

      {/* Card economia */}
      {economiaAnual != null && economiaAnual > 0 && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-2">
          <div className="flex items-start gap-3">
            <div className="text-green-600 text-lg mt-0.5">💰</div>
            <div>
              <p className="text-sm font-semibold text-green-800">Potencial de economia líquida anual</p>
              <p className="text-xs text-green-700 mt-0.5">
                Reduzindo de <strong>{contratadaAtual} kW</strong> para <strong>{sugerida} kW</strong>:{' '}
                <strong>R$ {economiaAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/ano</strong>
                {tarifaDemanda ? ` (tarifa: R$ ${tarifaDemanda.toFixed(2)}/kW·mês)` : ''}.
              </p>
            </div>
          </div>
          <div className="text-[11px] text-green-700 pl-8 space-y-0.5">
            <p>✔ Economia base = ({contratadaAtual} − {sugerida}) × tarifa × 12 meses</p>
            <p>✔ Descontadas ultrapassagens que surgiriam no novo nível (ANEEL: 3× a tarifa)</p>
            <p>✔ Calculado sobre <strong>{mesesComDados} meses</strong> de histórico real</p>
            {tarifaEhEstimativa && (
              <p className="text-amber-600 mt-1">⚠ Tarifa de demanda não encontrada nas faturas — usando R$ {tarifaDemanda.toFixed(2)}/kW·mês como referência ANEEL. Reprocesse as faturas para obter o valor real.</p>
            )}
          </div>
        </div>
      )}
      {economiaAnual != null && economiaAnual <= 0 && economiaAnual !== null && contratadaAtual > sugerida && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <div className="text-amber-600 text-lg mt-0.5">⚠️</div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Economia líquida nula ou negativa</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Embora a demanda contratada ({contratadaAtual} kW) seja superior à sugerida ({sugerida} kW),
              os meses com ultrapassagem no novo nível anulariam a economia. Revise o nível sugerido.
            </p>
          </div>
        </div>
      )}
      {contratadaAtual < sugerida && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <div className="text-amber-600 text-lg mt-0.5">⚠️</div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Demanda contratada abaixo da medida recorrente</p>
            <p className="text-xs text-amber-700 mt-0.5">
              A demanda contratada ({contratadaAtual} kW) está abaixo da demanda recomendada ({sugerida} kW),
              gerando cobranças de ultrapassagem. Considere aumentar a demanda contratada.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
