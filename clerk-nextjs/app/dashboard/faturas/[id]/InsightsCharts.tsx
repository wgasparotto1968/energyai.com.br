'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar, ReferenceLine,
} from 'recharts'
import type { ResultadoAnalise } from '@/lib/analise/engine'

const MESES_ABR = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

interface Props {
  resultado: ResultadoAnalise
  extraido?: {
    demandaContratadaKw?: number
    demandaMedidaKw?: number
    fatorPotencia?: number
    valorReativo?: number
    valorTotal?: number
    valorEnergia?: number
    valorDistribuicao?: number
    valorTributos?: number
    cosip?: number
    consumoPontaKwh?: number
    consumoForaPontaKwh?: number
    consumoKwh?: number
    historico?: Array<{ mes: number; ano: number; consumoTotalKwh?: number; consumoForaPontaKwh?: number; consumoPontaKwh?: number }>
  } | null
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

function fmtR(n: number) {
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface TooltipPayloadItem {
  name: string
  value: number
  color?: string
}

function EconomiaTooltip({ active, payload, label }: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-lg px-4 py-3 min-w-[170px]">
      <p className="text-xs font-semibold text-slate-500 mb-2 truncate max-w-[200px]">{label}</p>
      {payload.map((item, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color ?? '#888' }} />
            <span className="text-xs text-slate-500">{item.name}</span>
          </div>
          <span className="text-xs font-bold text-slate-800">{fmtR(item.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function InsightsCharts({ resultado, extraido }: Props) {
  const { grupo, insights, resumo } = resultado
  const sections: React.ReactNode[] = []

  // ── 0. Histórico de consumo (Grupo B) ─────────────────────────────
  if (grupo === 'B' && extraido?.historico && extraido.historico.length >= 2) {
    const hist = extraido.historico
      .map(h => ({
        label: `${MESES_ABR[h.mes]}/${String(h.ano).slice(2)}`,
        mes: h.mes,
        ano: h.ano,
        consumo: h.consumoTotalKwh ?? ((h.consumoForaPontaKwh ?? 0) + (h.consumoPontaKwh ?? 0)),
      }))
      .filter(h => h.consumo > 0)
      // ordena cronológico: ano asc, mês asc
      .sort((a, b) => a.ano !== b.ano ? a.ano - b.ano : a.mes - b.mes)

    if (hist.length >= 2) {
      const media = Math.round(hist.reduce((s, h) => s + h.consumo, 0) / hist.length)
      const maximo = Math.max(...hist.map(h => h.consumo))

      sections.push(
        <div key="historico-b" className="rounded-xl border border-blue-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-semibold text-slate-700">Histórico de consumo</h3>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span><span className="font-semibold text-blue-600">{media} kWh</span> média ({hist.length} meses)</span>
              <span><span className="font-semibold text-slate-700">{maximo} kWh</span> máximo</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hist} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}`}
                width={36}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  const v = payload[0].value as number
                  const diff = v - media
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white shadow-lg px-4 py-3 min-w-[150px]">
                      <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
                      <p className="text-sm font-bold text-slate-800">{v} kWh</p>
                      <p className={`text-xs mt-0.5 ${diff > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                        {diff > 0 ? `+${diff}` : diff} kWh vs. média
                      </p>
                    </div>
                  )
                }}
                cursor={{ fill: 'rgba(59,130,246,0.06)' }}
              />
              <ReferenceLine
                y={media}
                stroke="#3b82f6"
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={{ value: `Média: ${media} kWh`, position: 'insideTopRight', fontSize: 10, fill: '#3b82f6' }}
              />
              <Bar dataKey="consumo" name="Consumo" radius={[4, 4, 0, 0]}>
                {hist.map((h, i) => (
                  <Cell
                    key={i}
                    fill={h.consumo > media * 1.2 ? '#f97316' : h.consumo < media * 0.8 ? '#22c55e' : '#60a5fa'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400">
            Azul = próximo da média · <span className="text-orange-500">Laranja = acima (+20%)</span> · <span className="text-green-600">Verde = abaixo (−20%)</span>
          </p>
        </div>
      )
    }
  }

  // ── 1. Demanda Contratada vs Medida (Grupo A) ─────────────────────
  if (
    grupo === 'A' &&
    extraido?.demandaContratadaKw != null &&
    extraido?.demandaMedidaKw != null
  ) {
    const contratada = extraido.demandaContratadaKw
    const medida = extraido.demandaMedidaKw
    const ideal = Math.round(medida * 1.10)
    const ultrapassagem = medida > contratada
    // ponto de transição da cor na barra de medida (% do comprimento total)
    const transicaoPct = ultrapassagem ? (contratada / medida) * 100 : 100
    const gradBlue = '#3b82f6'
    const gradRed = '#ef4444'
    const gradientId = `demandaGrad-${contratada}-${medida}`

    const data = [
      { name: 'Contratada', value: contratada },
      { name: 'Medida', value: medida },
      { name: 'Recomendada', value: ideal },
    ]
    const domainMax = Math.max(contratada, medida, ideal) * 1.08
    sections.push(
      <div key="demanda" className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Demanda: contratada vs medida</h3>
        <p className="text-xs text-slate-500">
          Contratada: <strong>{contratada} kW</strong> · Medida: <strong>{medida} kW</strong> · Recomendada: <strong>{ideal} kW</strong>
          {ultrapassagem && (
            <span className="text-red-600 font-semibold"> · Ultrapassagem: {fmt(medida - contratada)} kW ({fmt(((medida - contratada) / contratada) * 100)}%)</span>
          )}
        </p>
        <ResponsiveContainer width="100%" height={155}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 40 }}>
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset={`${Math.max(0, transicaoPct - 1)}%`} stopColor={gradBlue} />
                <stop offset={`${Math.min(100, transicaoPct + 1)}%`} stopColor={gradRed} />
                <stop offset="100%" stopColor={gradRed} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" unit=" kW" tick={{ fontSize: 11 }} domain={[0, domainMax]} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={90} />
            <Tooltip formatter={(v) => [`${Number(v ?? 0)} kW`]} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              <Cell fill={gradBlue} />
              <Cell fill={ultrapassagem ? `url(#${gradientId})` : gradBlue} />
              <Cell fill="#22c55e" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // ── 2. Consumo Ponta vs Fora Ponta (Grupo A) ─────────────────────
  if (
    grupo === 'A' &&
    extraido?.consumoPontaKwh != null &&
    extraido?.consumoForaPontaKwh != null
  ) {
    const pontaPct = Math.round((extraido.consumoPontaKwh / (extraido.consumoPontaKwh + extraido.consumoForaPontaKwh)) * 100)
    const data = [
      { name: 'Ponta', value: extraido.consumoPontaKwh, fill: '#f59e0b' },
      { name: 'Fora Ponta', value: extraido.consumoForaPontaKwh, fill: '#3b82f6' },
    ]
    sections.push(
      <div key="consumo-ponta" className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Consumo: Ponta vs Fora Ponta</h3>
        <div className="flex gap-4 items-center">
          <ResponsiveContainer width="50%" height={160}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${fmt(Number(v ?? 0))} kWh`]} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-3">
            {data.map((d) => (
              <div key={d.name}>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>{d.name}</span><span className="font-semibold">{fmt(d.value)} kWh</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${(d.value / (extraido.consumoPontaKwh! + extraido.consumoForaPontaKwh!)) * 100}%`, backgroundColor: d.fill }}
                  />
                </div>
              </div>
            ))}
            <p className="text-xs text-slate-500 mt-1">
              {pontaPct}% do consumo ocorre na ponta.
              {pontaPct > 25 ? ' Avaliar tarifa Azul pode ser vantajoso.' : ' Perfil favorável para tarifa Verde.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── 3. Fator de Potência (gauge) ──────────────────────────────────
  if (extraido?.fatorPotencia != null) {
    const fp = extraido.fatorPotencia
    const pct = Math.round((fp / 1.0) * 100)
    const cor = fp >= 0.92 ? '#22c55e' : '#ef4444'
    const data = [{ name: 'FP', value: pct, fill: cor }]
    const multaMes = extraido.valorReativo ?? 0
    const multaAno = multaMes * 12
    const economia5anos = multaMes * 12 * 5

    // Estimativa técnica do banco de capacitores via potência reativa a compensar
    // Q = P × (tan(arccos(fp_atual)) - tan(arccos(fp_alvo)))
    // Custo de mercado: R$ 150–400/kVAr instalado (média ~250 R$/kVAr)
    const demandaKw = extraido.demandaMedidaKw ?? extraido.demandaContratadaKw ?? null
    let custoCapacitorMin: number | null = null
    let custoCapacitorMax: number | null = null
    let kvarNecessario: number | null = null
    if (demandaKw && fp < 1) {
      const tanAtual = Math.tan(Math.acos(fp))
      const tanAlvo  = Math.tan(Math.acos(0.95))
      const qKvar = demandaKw * (tanAtual - tanAlvo)
      kvarNecessario = Math.ceil(qKvar)
      custoCapacitorMin = Math.round(kvarNecessario * 150)
      custoCapacitorMax = Math.round(kvarNecessario * 400)
    }

    sections.push(
      <div key="fp" className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Fator de Potência</h3>
        <div className="flex items-start gap-6 flex-wrap">
          {/* Gauge */}
          <div className="relative flex-shrink-0">
            <ResponsiveContainer width={140} height={140}>
              <RadialBarChart innerRadius="60%" outerRadius="100%" data={data} startAngle={180} endAngle={0}>
                <RadialBar dataKey="value" background={{ fill: '#f1f5f9' }} cornerRadius={8}>
                  {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </RadialBar>
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
              <span className="text-2xl font-bold" style={{ color: cor }}>{fp.toFixed(2)}</span>
              <span className="text-xs text-slate-400">FP medido</span>
            </div>
          </div>
          {/* Info básica */}
          <div className="flex-1 min-w-[180px] space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: cor }} />
              <span className="text-sm text-slate-700">Medido: <strong>{fp.toFixed(2)}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-400" />
              <span className="text-sm text-slate-700">Mínimo ANEEL: <strong>0.92</strong></span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full mt-1">
              <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: cor }} />
            </div>
            <p className="text-xs font-medium mt-1" style={{ color: cor }}>
              {fp >= 0.92 ? '✅ Dentro do limite regulatório' : '❌ Abaixo do limite — encargo de reativos cobrado'}
            </p>
          </div>
        </div>

        {/* Detalhes de multa e economia (somente se FP abaixo do limite) */}
        {fp < 0.92 && (
          <div className="space-y-3 border-t border-slate-100 pt-4">
            {/* Cards multa/economia */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center">
                <p className="text-xs text-red-500 mb-1">Multa este mês</p>
                <p className="text-lg font-bold text-red-700">
                  {multaMes > 0 ? fmtR(multaMes) : '—'}
                </p>
                <p className="text-xs text-red-400 mt-0.5">encargo de reativos</p>
              </div>
              <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-center">
                <p className="text-xs text-orange-500 mb-1">Projeção anual</p>
                <p className="text-lg font-bold text-orange-700">
                  {multaMes > 0 ? fmtR(multaAno) : '—'}
                </p>
                <p className="text-xs text-orange-400 mt-0.5">se nada for feito</p>
              </div>
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
                <p className="text-xs text-green-600 mb-1">Economia em 5 anos</p>
                <p className="text-lg font-bold text-green-700">
                  {multaMes > 0 ? fmtR(economia5anos) : '—'}
                </p>
                <p className="text-xs text-green-500 mt-0.5">corrigindo o FP</p>
              </div>
            </div>

            {/* Barra: participação da multa na fatura */}
            {multaMes > 0 && extraido?.valorTotal && extraido.valorTotal > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Participação da multa na fatura</span>
                  <span className="font-semibold text-red-600">
                    {((multaMes / extraido.valorTotal) * 100).toFixed(1)}% do total
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="h-3 bg-green-400" style={{ width: `${((extraido.valorTotal - multaMes) / extraido.valorTotal) * 100}%` }} />
                  <div className="h-3 bg-red-400" style={{ width: `${(multaMes / extraido.valorTotal) * 100}%` }} />
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-400" />Consumo/encargos</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" />Multa FP</span>
                </div>
              </div>
            )}

            {/* Recomendação */}
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-amber-800">💡 Recomendação — Banco de Capacitores</p>
              <p className="text-xs text-amber-700">
                Instale um banco de capacitores para corrigir o fator de potência de <strong>{fp.toFixed(2)}</strong> para <strong>≥ 0,95</strong> e eliminar o encargo de reativos.
              </p>
              {kvarNecessario && custoCapacitorMin && custoCapacitorMax ? (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-amber-700">
                    <strong>Potência a compensar:</strong> ~{kvarNecessario} kVAr
                    {demandaKw ? ` (calculado sobre ${demandaKw} kW de demanda medida)` : ''}
                  </p>
                  <p className="text-xs text-amber-700">
                    <strong>Investimento estimado:</strong> {fmtR(custoCapacitorMin)} – {fmtR(custoCapacitorMax)}
                  </p>
                  {multaAno > 0 && (
                    <p className="text-xs text-amber-700">
                      <strong>Payback estimado:</strong>{' '}
                      {(custoCapacitorMin / multaAno).toFixed(1)}–{(custoCapacitorMax / multaAno).toFixed(1)} anos
                    </p>
                  )}
                  <p className="text-xs text-amber-500 mt-1 italic">
                    Custo de mercado: R$ 150–400/kVAr instalado (banco automático trifásico, inclui instalação).
                    Valores podem variar conforme tensão, marca e complexidade da instalação.
                  </p>
                </div>
              ) : multaMes > 0 ? (
                <p className="text-xs text-amber-700 mt-1">
                  Sem demanda medida disponível para estimar o dimensionamento. Solicite um laudo ao eletricista.
                </p>
              ) : null}
            </div>

            {/* Aviso de amostra */}
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 space-y-1">
              <p className="text-xs font-semibold text-blue-800">📊 Análise baseada em 1 fatura — precisão limitada</p>
              <p className="text-xs text-blue-700">
                O fator de potência pode variar ao longo do ano conforme o perfil de carga e sazonalidade.
                Com apenas <strong>1 mês</strong>, a projeção anual pode superestimar ou subestimar o real encargo pago.
                Para dimensionar corretamente o banco de capacitores e calcular o payback real, recomenda-se analisar pelo menos <strong>6 faturas</strong> (ideal: <strong>12 meses</strong>).
              </p>
              <p className="text-xs text-blue-600 font-medium">
                → Envie mais faturas desta unidade para refinar a análise.
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── 5. Composição do custo (pizza) ────────────────────────────────
  if (extraido?.valorTotal && extraido.valorTotal > 0) {
    const pieData = []
    if (extraido.valorEnergia) pieData.push({ name: 'Energia', value: extraido.valorEnergia })
    if (extraido.valorDistribuicao) pieData.push({ name: 'Distribuição', value: extraido.valorDistribuicao })
    if (extraido.valorTributos) pieData.push({ name: 'Tributos', value: extraido.valorTributos })
    if (extraido.cosip) pieData.push({ name: 'COSIP', value: extraido.cosip })
    const soma = pieData.reduce((s, d) => s + d.value, 0)
    const outros = extraido.valorTotal - soma
    if (outros > 0) pieData.push({ name: 'Outros/Demanda', value: Math.round(outros) })

    if (pieData.length >= 2) {
      sections.push(
        <div key="composicao" className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Composição do custo</h3>
          <div className="flex gap-4 items-center">
            <ResponsiveContainer width="45%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} paddingAngle={2}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [fmtR(Number(v ?? 0))]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {pieData.map((d, i) => (
                <div key={d.name}>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      {d.name}
                    </span>
                    <span className="font-medium">{fmtR(d.value)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${(d.value / extraido.valorTotal!) * 100}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }
  }

  if (sections.length === 0) return null

  return <div className="space-y-4">{sections}</div>
}
