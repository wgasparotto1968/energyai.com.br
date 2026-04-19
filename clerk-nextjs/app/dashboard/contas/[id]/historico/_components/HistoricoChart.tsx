'use client'

interface Ponto {
  label: string
  valor: number | null
  consumo: number | null
  projetado?: boolean
}

export function HistoricoChart({ pontos }: { pontos: Ponto[] }) {
  if (pontos.length === 0) return null

  const maxValor = Math.max(...pontos.map((p) => p.valor ?? 0))
  const maxConsumo = Math.max(...pontos.map((p) => p.consumo ?? 0))
  const temProjetado = pontos.some((p) => p.projetado)

  return (
    <div className="space-y-8">
      {/* Legenda */}
      {temProjetado && (
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-blue-500" />
            Valor real (R$)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" />
            Consumo real (kWh)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-slate-300" />
            Dados importados do histórico e valor financeiro projetado a partir do custo médio do kWh
          </span>
        </div>
      )}

      {/* Valor total */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Valor da fatura (R$)</p>
        <div className="flex items-end gap-2 h-36">
          {pontos.map((p, i) => {
            const pct = maxValor > 0 && p.valor != null ? (p.valor / maxValor) * 100 : 0
            const isProjetado = !!p.projetado
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <span className="text-[10px] text-slate-500 truncate w-full text-center leading-none">
                  {p.valor != null ? p.valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : ''}
                </span>
                <div className="w-full flex items-end" style={{ height: '100px' }}>
                  {p.valor != null ? (
                    <div
                      className={`w-full rounded-t-md transition-colors ${
                        isProjetado
                          ? 'bg-slate-300 hover:bg-slate-400'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                      style={{ height: `${pct}%`, minHeight: 4 }}
                    />
                  ) : (
                    <div className="w-full" style={{ height: '100%' }} />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 truncate w-full text-center">{p.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Consumo kWh */}
      {maxConsumo > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Consumo (kWh)</p>
          <div className="flex items-end gap-2 h-36">
            {pontos.map((p, i) => {
              const pct = maxConsumo > 0 && p.consumo != null ? (p.consumo / maxConsumo) * 100 : 0
              const isProjetado = !!p.projetado
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <span className="text-[10px] text-slate-500 truncate w-full text-center leading-none">
                    {p.consumo != null ? p.consumo.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : ''}
                  </span>
                  <div className="w-full flex items-end" style={{ height: '100px' }}>
                    {p.consumo != null ? (
                      <div
                        className={`w-full rounded-t-md transition-colors ${
                          isProjetado
                            ? 'bg-slate-300 hover:bg-slate-400'
                            : 'bg-emerald-500 hover:bg-emerald-600'
                        }`}
                        style={{ height: `${pct}%`, minHeight: 4 }}
                      />
                    ) : (
                      <div className="w-full" style={{ height: '100%' }} />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 truncate w-full text-center">{p.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
