# Arquitetura Geral - APP EnergyAI

---

## Visão de Alto Nível

```
┌─────────────────────────────────────────────────────────┐
│                    USUÁRIO (Browser/PWA)                  │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 CLOUDFLARE (CDN + WAF)                    │
│              DDoS Protection + SSL + Cache                │
└─────────────────────┬───────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌──────────────────┐   ┌──────────────────┐
│   VERCEL          │   │   RAILWAY         │
│   (Frontend)      │   │   (Backend API)   │
│                   │   │                   │
│   Next.js 14      │   │   Node.js         │
│   React           │   │   Express/Fastify │
│   Tailwind CSS    │   │   Prisma ORM      │
│   shadcn/ui       │   │   BullMQ (Filas)  │
└──────────────────┘   └──────┬────────────┘
                              │
          ┌───────────┬───────┴──────┬────────────┐
          ▼           ▼              ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│ PostgreSQL   │ │  Redis   │ │ Cloud R2 │ │   Serviços   │
│ (Supabase/   │ │ (Cache   │ │ (PDFs)   │ │   Externos   │
│  Neon)       │ │  +Filas) │ │          │ │              │
│              │ │          │ │          │ │ Google Vision│
│ Users        │ │ Sessions │ │ Uploads  │ │ OpenAI/Claude│
│ Payments     │ │ Cache    │ │ Reports  │ │ Mercado Pago │
│ Invoices     │ │ Queue    │ │          │ │ Stripe       │
│ Data         │ │          │ │          │ │ Clerk (Auth) │
│ Analytics    │ │          │ │          │ │ Resend       │
└──────────────┘ └──────────┘ └──────────┘ └──────────────┘
```

---

## Fluxo de Processamento de Fatura

```
1. Upload              2. Fila              3. OCR
┌──────────┐        ┌──────────┐        ┌──────────────┐
│ Usuário  │───────▶│ BullMQ   │───────▶│ Google Vision│
│ envia PDF│        │ (Redis)  │        │ ou Tesseract │
└──────────┘        └──────────┘        └──────┬───────┘
                                               │
4. Parser            5. Análise           6. Resultado
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ GPT-4/Claude │◀───│ Texto bruto  │    │ Dashboard    │
│ Extrai campos│    │ do OCR       │───▶│ + PDF        │
│ em JSON      │────┘              │    │ + CO2        │
└──────────────┘                        └──────────────┘
```

---

## Estrutura de APIs

### Autenticação (via Clerk)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/webhooks/clerk | Webhook de eventos do Clerk |

### Pagamentos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/payments/create-checkout | Criar sessão de pagamento |
| POST | /api/payments/create-subscription | Criar assinatura |
| POST | /api/webhooks/mercadopago | Webhook Mercado Pago |
| POST | /api/webhooks/stripe | Webhook Stripe |
| GET | /api/payments/history | Histórico de pagamentos |
| GET | /api/payments/status | Status da assinatura |

### Faturas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/invoices/upload | Upload de PDF |
| GET | /api/invoices | Lista de faturas do usuário |
| GET | /api/invoices/:id | Detalhes de uma fatura |
| GET | /api/invoices/:id/status | Status do processamento |
| GET | /api/invoices/:id/results | Dados extraídos + análise |
| GET | /api/invoices/:id/pdf | Download do relatório PDF |
| DELETE | /api/invoices/:id | Excluir fatura |

### Análise
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/analysis/:id | Resultado completo da análise |
| GET | /api/analysis/:id/scenarios | Cenários de economia |
| GET | /api/analysis/:id/co2 | Calculadora de CO2 |
| POST | /api/analysis/:id/generate-pdf | Gerar relatório PDF |

### Admin
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/admin/params | Parâmetros globais |
| PUT | /api/admin/params | Atualizar parâmetros |
| GET | /api/admin/users | Lista de usuários |
| GET | /api/admin/users/:id | Detalhes do usuário |
| PUT | /api/admin/users/:id | Editar usuário |
| GET | /api/admin/analytics | Métricas do sistema |
| GET | /api/admin/logs | Logs de processamento |

### Conta
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/account | Dados da conta |
| PUT | /api/account | Atualizar perfil |
| GET | /api/account/usage | Uso do plano |

---

## Segurança

### Camadas de Proteção
1. **Cloudflare WAF** — Bloqueia ataques conhecidos, DDoS
2. **Rate Limiting** — Limite de requisições por IP/usuário
3. **CORS** — Apenas origens permitidas
4. **Helmet** — Headers de segurança (CSP, HSTS, X-Frame, etc.)
5. **Clerk Auth** — JWT verificado em cada requisição
6. **Prisma ORM** — Previne SQL Injection
7. **Zod** — Validação de input em todas as rotas
8. **Signed URLs** — PDFs nunca ficam públicos
9. **bcrypt** — Senhas hasheadas (se não usar Clerk)
10. **LGPD** — Criptografia de dados sensíveis

### Headers de Segurança Obrigatórios
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Variáveis de Ambiente

```env
# App
NEXT_PUBLIC_APP_URL=https://EnergyAI.com.br
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/EnergyAI

# Redis
REDIS_URL=redis://host:6379

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=EnergyAI-pdfs

# OCR (Google Vision)
GOOGLE_CLOUD_PROJECT_ID=...
GOOGLE_CLOUD_CREDENTIALS=...

# AI (OpenAI)
OPENAI_API_KEY=sk-...

# Pagamentos (Mercado Pago)
MERCADOPAGO_ACCESS_TOKEN=...
MERCADOPAGO_WEBHOOK_SECRET=...

# Pagamentos (Stripe)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# E-mail (Resend)
RESEND_API_KEY=re_...

# Monitoramento (Sentry)
SENTRY_DSN=https://...@sentry.io/...
```

---

*Documento atualizado em: Abril 2026*
*Versão: 1.0*
