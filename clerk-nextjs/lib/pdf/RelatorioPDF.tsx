import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { ResultadoAnalise, Co2Analise, Insight } from '@/lib/analise/engine'

const MESES = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

// Register fallback font (Helvetica built-in)
Font.registerHyphenationCallback((word) => [word])

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1e293b',
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
  },
  // Header bar
  header: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 40,
    paddingVertical: 28,
    marginBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoBox: {
    width: 32,
    height: 32,
    backgroundColor: '#22c55e',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  logoText: { color: '#ffffff', fontSize: 16, fontFamily: 'Helvetica-Bold' },
  brandName: { color: '#ffffff', fontSize: 16, fontFamily: 'Helvetica-Bold' },
  brandTagline: { color: '#94a3b8', fontSize: 9, marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  headerDate: { color: '#94a3b8', fontSize: 9 },
  headerTitle: { color: '#ffffff', fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 3 },

  body: { paddingHorizontal: 40, paddingTop: 28 },

  // Section
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: { borderBottom: '1px solid #e2e8f0', marginBottom: 16 },

  // KPI cards row
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  kpiCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 12,
    border: '1px solid #e2e8f0',
  },
  kpiLabel: { fontSize: 8, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 },
  kpiValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  kpiUnit: { fontSize: 8, color: '#64748b', marginTop: 2 },

  // Info table
  infoTable: { marginBottom: 24 },
  infoRow: { flexDirection: 'row', paddingVertical: 6, borderBottom: '1px solid #f1f5f9' },
  infoLabel: { width: '40%', fontSize: 9, color: '#64748b' },
  infoValue: { width: '60%', fontSize: 9, color: '#1e293b', fontFamily: 'Helvetica-Bold' },

  // Insight cards
  insightCard: {
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    border: '1px solid #e2e8f0',
  },
  insightAlerta: { backgroundColor: '#fff1f2', border: '1px solid #fecdd3' },
  insightEconomia: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' },
  insightInfo: { backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' },
  insightOk: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' },

  insightBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  badgeAlerta: { backgroundColor: '#fee2e2', color: '#dc2626' },
  badgeEconomia: { backgroundColor: '#dcfce7', color: '#16a34a' },
  badgeInfo: { backgroundColor: '#dbeafe', color: '#2563eb' },
  badgeOk: { backgroundColor: '#dcfce7', color: '#16a34a' },

  insightTitulo: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#1e293b', marginBottom: 3 },
  insightDescricao: { fontSize: 9, color: '#475569', lineHeight: 1.5 },
  insightRecomendacao: { fontSize: 8, color: '#64748b', fontStyle: 'italic', marginTop: 5 },

  insightValores: { flexDirection: 'row', gap: 16, marginTop: 8 },
  valorBox: { backgroundColor: '#ffffff', borderRadius: 4, padding: 6, border: '1px solid #e2e8f0' },
  valorLabel: { fontSize: 7, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3 },
  valorNum: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 2 },
  valorNumAlerta: { color: '#dc2626' },
  valorNumEconomia: { color: '#16a34a' },

  // Summary box
  summaryBox: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 18,
    marginTop: 4,
    marginBottom: 24,
  },
  summaryTitle: { color: '#94a3b8', fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { color: '#22c55e', fontSize: 22, fontFamily: 'Helvetica-Bold', marginTop: 4 },
  summaryDesc: { color: '#cbd5e1', fontSize: 9, marginTop: 4 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1px solid #e2e8f0',
    paddingTop: 8,
  },
  footerText: { fontSize: 8, color: '#94a3b8' },

  // CO2
  co2Box: {
    backgroundColor: '#064e3b',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  co2Title: { color: '#6ee7b7', fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  co2Value: { color: '#ffffff', fontSize: 24, fontFamily: 'Helvetica-Bold' },
  co2Sub: { color: '#a7f3d0', fontSize: 8, marginTop: 3 },
  co2Row: { flexDirection: 'row', gap: 8, marginTop: 12 },
  co2Card: { flex: 1, backgroundColor: '#065f46', borderRadius: 6, padding: 10 },
  co2CardLabel: { color: '#6ee7b7', fontSize: 7, textTransform: 'uppercase', letterSpacing: 0.3 },
  co2CardValue: { color: '#ffffff', fontSize: 12, fontFamily: 'Helvetica-Bold', marginTop: 3 },
  co2CardUnit: { color: '#a7f3d0', fontSize: 7, marginTop: 1 },
  co2ProjecaoRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  co2ProjecaoCard: { flex: 1, backgroundColor: '#065f46', borderRadius: 6, padding: 8, alignItems: 'center' },
  co2ProjecaoLabel: { color: '#6ee7b7', fontSize: 7 },
  co2ProjecaoValue: { color: '#ffffff', fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 2 },

  sectionGap: { marginBottom: 24 },
  pageBreak: { marginTop: 0 },
})

type TipoInsight = 'alerta' | 'economia' | 'info' | 'ok'

function badgeStyle(tipo: TipoInsight) {
  switch (tipo) {
    case 'alerta': return s.badgeAlerta
    case 'economia': return s.badgeEconomia
    case 'ok': return s.badgeOk
    default: return s.badgeInfo
  }
}
function cardStyle(tipo: TipoInsight) {
  switch (tipo) {
    case 'alerta': return s.insightAlerta
    case 'economia': return s.insightEconomia
    case 'ok': return s.insightOk
    default: return s.insightInfo
  }
}
function tipoLabel(tipo: TipoInsight) {
  switch (tipo) {
    case 'alerta': return 'Alerta'
    case 'economia': return 'Economia'
    case 'ok': return 'Adequado'
    default: return 'Informação'
  }
}
function valorColor(tipo: TipoInsight) {
  return tipo === 'alerta' ? s.valorNumAlerta : s.valorNumEconomia
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  )
}

function Co2Section({ co2 }: { co2: Co2Analise }) {
  const ano25 = co2.co2EvitadoKg25Anos
  const ano25Str = ano25 >= 1000 ? `${(ano25 / 1000).toFixed(1)} t` : `${Math.round(ano25)} kg`

  return (
    <View style={s.co2Box}>
      <Text style={s.co2Title}>Impacto Ambiental — CO₂ Evitado</Text>
      <Text style={s.co2Value}>{Math.round(co2.co2EvitadoKgAno)} kg CO₂/ano</Text>
      <Text style={s.co2Sub}>
        {Math.round(co2.energiaEconomizadaKwhAno)} kWh economizados × {co2.fatorEmissao} kgCO₂/kWh (SIN 2024)
      </Text>

      <View style={s.co2Row}>
        <View style={s.co2Card}>
          <Text style={s.co2CardLabel}>Árvores/ano</Text>
          <Text style={s.co2CardValue}>{Math.round(co2.arvoresEquivalentes)}</Text>
          <Text style={s.co2CardUnit}>equivalente a plantar</Text>
        </View>
        <View style={s.co2Card}>
          <Text style={s.co2CardLabel}>Km de carro</Text>
          <Text style={s.co2CardValue}>{Math.round(co2.kmCarroEquivalentes).toLocaleString('pt-BR')}</Text>
          <Text style={s.co2CardUnit}>não percorridos/ano</Text>
        </View>
        <View style={s.co2Card}>
          <Text style={s.co2CardLabel}>Celulares</Text>
          <Text style={s.co2CardValue}>{Math.round(co2.celularesCarregados).toLocaleString('pt-BR')}</Text>
          <Text style={s.co2CardUnit}>carregamentos/ano</Text>
        </View>
      </View>

      <View style={s.co2ProjecaoRow}>
        <View style={s.co2ProjecaoCard}>
          <Text style={s.co2ProjecaoLabel}>Em 5 anos</Text>
          <Text style={s.co2ProjecaoValue}>
            {co2.co2EvitadoKg5Anos >= 1000
              ? `${(co2.co2EvitadoKg5Anos / 1000).toFixed(1)} t`
              : `${Math.round(co2.co2EvitadoKg5Anos)} kg`}
          </Text>
        </View>
        <View style={s.co2ProjecaoCard}>
          <Text style={s.co2ProjecaoLabel}>Em 25 anos</Text>
          <Text style={s.co2ProjecaoValue}>{ano25Str}</Text>
        </View>
      </View>
    </View>
  )
}

function InsightCard({ insight }: { insight: Insight }) {
  const tipo = insight.tipo as TipoInsight
  return (
    <View style={[s.insightCard, cardStyle(tipo)]}>
      <View style={[s.insightBadge, badgeStyle(tipo)]}>
        <Text>{tipoLabel(tipo)}</Text>
      </View>
      <Text style={s.insightTitulo}>{insight.titulo}</Text>
      <Text style={s.insightDescricao}>{insight.descricao}</Text>

      {(insight.valorMensal != null || insight.valorAnual != null) && (
        <View style={s.insightValores}>
          {insight.valorMensal != null && (
            <View style={s.valorBox}>
              <Text style={s.valorLabel}>Por mês</Text>
              <Text style={[s.valorNum, valorColor(tipo)]}>
                R$ {insight.valorMensal.toFixed(0)}
              </Text>
            </View>
          )}
          {insight.valorAnual != null && (
            <View style={s.valorBox}>
              <Text style={s.valorLabel}>Por ano</Text>
              <Text style={[s.valorNum, valorColor(tipo)]}>
                R$ {Math.round(insight.valorAnual).toLocaleString('pt-BR')}
              </Text>
            </View>
          )}
        </View>
      )}

      {insight.recomendacao && (
        <Text style={s.insightRecomendacao}>{insight.recomendacao}</Text>
      )}
    </View>
  )
}

export interface RelatorioData {
  fatura: {
    id: string
    mes: number
    ano: number
    valorTotal: number
    consumoKwh: number | null
    arquivoUrl: string | null
    createdAt: Date
  }
  conta: {
    distribuidora: string
    numeroCliente: string | null
    endereco: string | null
  }
  usuario: {
    nome: string | null
    email: string
  }
  resultado: ResultadoAnalise
}

export function RelatorioPDF({ data }: { data: RelatorioData }) {
  const { fatura, conta, usuario, resultado } = data
  const { resumo, insights, grupo, co2 } = resultado

  const economiaAnual = insights
    .filter((i) => i.tipo === 'economia')
    .reduce((s, i) => s + (i.valorAnual ?? 0), 0)

  const alertas = insights.filter((i) => i.tipo === 'alerta')
  const economias = insights.filter((i) => i.tipo === 'economia')
  const infos = insights.filter((i) => i.tipo === 'info' || i.tipo === 'ok')

  const dataGeracao = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <Document
      title={`Relatório EnergyAI — ${conta.distribuidora} ${MESES[fatura.mes]}/${fatura.ano}`}
      author="EnergyAI"
      creator="EnergyAI"
    >
      <Page size="A4" style={s.page}>
        {/* ── HEADER ── */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <View>
              <View style={s.logoBox}>
                <Text style={s.logoText}>⚡</Text>
              </View>
              <Text style={s.brandName}>EnergyAI</Text>
              <Text style={s.brandTagline}>Análise inteligente de faturas de energia</Text>
            </View>
            <View style={s.headerRight}>
              <Text style={s.headerDate}>Gerado em {dataGeracao}</Text>
              <Text style={s.headerTitle}>
                Relatório de Análise — {MESES[fatura.mes]}/{fatura.ano}
              </Text>
              <Text style={[s.headerDate, { marginTop: 3 }]}>{conta.distribuidora}</Text>
            </View>
          </View>
        </View>

        <View style={s.body}>
          {/* ── KPIs ── */}
          <View style={s.kpiRow}>
            <View style={s.kpiCard}>
              <Text style={s.kpiLabel}>Valor da fatura</Text>
              <Text style={s.kpiValue}>
                {fatura.valorTotal > 0
                  ? `R$ ${fatura.valorTotal.toFixed(2).replace('.', ',')}`
                  : '—'}
              </Text>
            </View>
            <View style={s.kpiCard}>
              <Text style={s.kpiLabel}>Consumo</Text>
              <Text style={s.kpiValue}>
                {fatura.consumoKwh != null ? `${fatura.consumoKwh}` : '—'}
              </Text>
              {fatura.consumoKwh != null && <Text style={s.kpiUnit}>kWh</Text>}
            </View>
            <View style={s.kpiCard}>
              <Text style={s.kpiLabel}>Custo efetivo</Text>
              <Text style={s.kpiValue}>
                {resumo.custoKwh != null
                  ? `R$ ${resumo.custoKwh.toFixed(3).replace('.', ',')}`
                  : '—'}
              </Text>
              {resumo.custoKwh != null && <Text style={s.kpiUnit}>por kWh</Text>}
            </View>
            <View style={s.kpiCard}>
              <Text style={s.kpiLabel}>Grupo tarifário</Text>
              <Text style={s.kpiValue}>
                Grupo {grupo}{resumo.subgrupo ? ` · ${resumo.subgrupo}` : ''}
              </Text>
              {resumo.modalidade && <Text style={s.kpiUnit}>{resumo.modalidade}</Text>}
            </View>
          </View>

          {/* ── DADOS DA UNIDADE ── */}
          <View style={s.sectionGap}>
            <Text style={s.sectionTitle}>Dados da Unidade</Text>
            <View style={s.divider} />
            <View style={s.infoTable}>
              <InfoRow label="Distribuidora" value={conta.distribuidora} />
              {conta.numeroCliente && <InfoRow label="Número do cliente" value={conta.numeroCliente} />}
              {conta.endereco && <InfoRow label="Endereço" value={conta.endereco} />}
              <InfoRow label="Período de referência" value={`${MESES[fatura.mes]} de ${fatura.ano}`} />
              {resumo.tipoLigacao && <InfoRow label="Tipo de ligação" value={resumo.tipoLigacao} />}
              <InfoRow label="Titular da análise" value={usuario.nome ?? usuario.email} />
            </View>
          </View>

          {/* ── RESUMO DE ECONOMIA ── */}
          {economiaAnual > 0 && (
            <View style={s.summaryBox}>
              <Text style={s.summaryTitle}>Economia anual potencial identificada</Text>
              <Text style={s.summaryValue}>
                R$ {Math.round(economiaAnual).toLocaleString('pt-BR')}
              </Text>
              <Text style={s.summaryDesc}>
                Valor estimado com base nas oportunidades identificadas nesta análise.
                Implementar as recomendações pode gerar essa economia por ano.
              </Text>
            </View>
          )}

          {/* ── ALERTAS ── */}
          {alertas.length > 0 && (
            <View style={s.sectionGap}>
              <Text style={s.sectionTitle}>Alertas ({alertas.length})</Text>
              <View style={s.divider} />
              {alertas.map((insight, i) => (
                <InsightCard key={i} insight={insight} />
              ))}
            </View>
          )}

          {/* ── OPORTUNIDADES ── */}
          {economias.length > 0 && (
            <View style={s.sectionGap}>
              <Text style={s.sectionTitle}>Oportunidades de Economia ({economias.length})</Text>
              <View style={s.divider} />
              {economias.map((insight, i) => (
                <InsightCard key={i} insight={insight} />
              ))}
            </View>
          )}

          {/* ── INFORMAÇÕES ── */}
          {infos.length > 0 && (
            <View style={s.sectionGap}>
              <Text style={s.sectionTitle}>Informações e Recomendações</Text>
              <View style={s.divider} />
              {infos.map((insight, i) => (
                <InsightCard key={i} insight={insight} />
              ))}
            </View>
          )}

          {/* ── CO₂ ── */}
          {co2 && <Co2Section co2={co2} />}

          {/* ── DISCLAIMER ── */}
          <View style={{ marginTop: 8, padding: 12, backgroundColor: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
            <Text style={{ fontSize: 8, color: '#94a3b8', lineHeight: 1.5 }}>
              Este relatório é gerado automaticamente com base na extração de dados do PDF da fatura
              e nas fórmulas regulatórias da ANEEL. Os valores são estimativas e podem variar conforme
              as tarifas vigentes da distribuidora. Recomenda-se validação com um engenheiro especialista
              antes de tomar decisões contratuais. EnergyAI não se responsabiliza por diferenças entre
              os valores estimados e os valores contratados ou cobrados.
            </Text>
          </View>
        </View>

        {/* ── FOOTER ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>EnergyAI — Análise Inteligente de Energia</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
