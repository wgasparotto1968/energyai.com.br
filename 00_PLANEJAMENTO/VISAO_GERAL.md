# Visão Geral do Projeto - APP EnergyAI

## Resumo Executivo

O **APP EnergyAI** é uma plataforma web SaaS para análise inteligente de faturas de energia elétrica.
Utiliza OCR + IA para extrair dados de qualquer concessionária, classificar unidades consumidoras (Grupo A/B),
simular cenários de economia e gerar relatórios profissionais exportáveis em PDF.

---

## Público-Alvo

| Perfil | Descrição | Modelo de Cobrança |
|--------|-----------|-------------------|
| **Profissional** | Consultores, integradores, engenheiros | Assinatura mensal (Starter/Pro/Premium) |
| **Cliente Final** | Consumidor residencial ou comercial | Consulta avulsa (R$ 99,00) |

---

## Stack Tecnológica Recomendada

### Frontend
- **Framework**: Next.js 14+ (React) com App Router
- **Estilização**: Tailwind CSS + shadcn/ui
- **Gráficos**: Recharts ou Chart.js
- **Forms**: React Hook Form + Zod (validação)
- **Estado**: Zustand (leve e simples)

### Backend
- **Runtime**: Node.js com Express ou Fastify
- **Alternativa**: Next.js API Routes (full-stack)
- **ORM**: Prisma
- **Validação**: Zod

### Banco de Dados
- **Principal**: PostgreSQL (Supabase ou Neon)
- **Cache**: Redis (opcional na Fase 1)

### OCR e IA
- **OCR primário**: Google Cloud Vision API
- **OCR secundário/fallback**: Tesseract.js
- **IA para parsing**: OpenAI GPT-4 (extração estruturada)
- **Alternativa**: Claude API (Anthropic)

### Pagamentos
- **Nacional**: Mercado Pago (Pix + cartão)
- **Internacional**: Stripe (cartão + assinaturas)

### Infraestrutura
- **Hosting**: Vercel (frontend) + Railway ou Render (backend)
- **Armazenamento**: AWS S3 ou Cloudflare R2 (PDFs)
- **CDN**: Cloudflare
- **Monitoramento**: Sentry + Uptime Robot

### Autenticação
- **Solução**: NextAuth.js ou Clerk
- **Alternativa**: Supabase Auth

---

## Estrutura de Pastas do Projeto

```
WG App EnergyAI/
│
├── PLANO_FINAL_ENERGIA.md          # Especificação original
│
├── 00_PLANEJAMENTO/                 # Todos os planos e checklists
│   ├── VISAO_GERAL.md              # Este arquivo
│   ├── ROADMAP_COMPLETO.md         # Timeline e marcos
│   ├── DECISOES_TECNICAS.md        # Justificativas técnicas
│   ├── MELHORIAS_SUGERIDAS.md      # Funcionalidades extras
│   ├── FASE_01_FUNDACAO/           # Landing, Auth, Pagamento, Upload
│   ├── FASE_02_ANALISE_AVANCADA/   # Regras A/B, Simulações, PDF
│   ├── FASE_03_EXPANSAO/           # Mercado Livre, Grid Zero, BESS
│   └── FASE_04_OTIMIZACAO/         # Performance, ML, Escala
│
├── 01_DOCS/                         # Documentação técnica
│   ├── ARQUITETURA/                 # Diagramas e decisões
│   ├── UX_UI/                       # Telas, fluxos, design
│   ├── REGRAS_NEGOCIO/             # Regras detalhadas
│   └── LEGAL/                       # LGPD, termos, privacidade
│
├── 02_FRONTEND/                     # Código do frontend
│   └── (criado na implementação)
│
├── 03_BACKEND/                      # Código do backend
│   └── (criado na implementação)
│
├── 04_INFRA/                        # Configs de deploy e infra
│   └── (criado na implementação)
│
├── 05_TESTES/                       # Planos e scripts de teste
│   └── (criado na implementação)
│
└── 06_ASSETS/                       # Recursos visuais
    ├── IMAGENS/
    ├── ICONS/
    └── TEMPLATES_PDF/
```

---

## Fases do Projeto

| Fase | Nome | Foco | Resultado |
|------|------|------|-----------|
| 01 | Fundação | Landing + Auth + Pagamento + Upload + OCR básico | MVP funcional |
| 02 | Análise Avançada | Regras Grupo A/B + Simulações + PDF + CO2 | Produto completo |
| 03 | Expansão | Mercado Livre + Grid Zero + BESS + Admin | Produto premium |
| 04 | Otimização | ML + Performance + PWA + Escala | Produto escalável |

---

## Métricas de Sucesso

- [ ] Tempo de análise de fatura < 30 segundos
- [ ] Taxa de extração OCR > 85% de precisão
- [ ] NPS > 40 nos primeiros 3 meses
- [ ] Churn mensal < 8% para profissionais
- [ ] Uptime > 99.5%
- [ ] Tempo de carregamento da landing < 3 segundos

---

## Riscos Identificados

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| PDFs com layouts muito variados | Alto | IA generativa + fallback manual |
| Baixa precisão do OCR | Alto | Dupla verificação + confiança por campo |
| Complexidade das regras tarifárias | Médio | Consultoria com especialista do setor |
| Integração com gateways de pagamento | Médio | Sandbox + testes extensivos |
| LGPD e dados sensíveis | Alto | Criptografia + audit trail + DPO |

---

*Documento atualizado em: Abril 2026*
*Versão: 1.0*
