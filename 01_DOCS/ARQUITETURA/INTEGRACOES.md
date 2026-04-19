# Integrações Externas - APP EnergyAI

---

## Mapa de Integrações

| Serviço | Finalidade | Fase | Criticidade |
|---------|-----------|------|-------------|
| **Clerk** | Autenticação de usuários | 1 | Alta |
| **Google Cloud Vision** | OCR de PDFs | 1 | Alta |
| **OpenAI (GPT-4)** | Parser inteligente de faturas | 1 | Alta |
| **Mercado Pago** | Pagamento via Pix | 1 | Alta |
| **Stripe** | Pagamento via cartão + assinaturas | 1 | Alta |
| **Cloudflare R2** | Armazenamento de PDFs | 1 | Alta |
| **Resend** | E-mails transacionais | 1 | Média |
| **Sentry** | Monitoramento de erros | 1 | Média |
| **Tesseract.js** | OCR fallback (local) | 1 | Média |
| **CRESESB/CEPEL** | Dados de HSP (irradiação solar) | 2 | Alta |
| **Uptime Robot** | Monitoramento de disponibilidade | 1 | Baixa |
| **Google Analytics** | Analytics de uso | 1 | Baixa |
| **Cloudflare** | CDN + WAF + DDoS | 1 | Alta |
| **Redis (Upstash)** | Cache + Filas (BullMQ) | 2 | Alta |
| **Puppeteer** | Geração de PDF | 2 | Alta |
| **WhatsApp API** | Notificações (opcional) | 4 | Baixa |

---

## Detalhes de Configuração

### Clerk (Auth)
```
Site: https://clerk.com
Plano: Free (até 10.000 MAU)
Docs: https://clerk.com/docs
Configurar:
- Criar application
- Habilitar email/password sign-in
- Configurar webhook para sync com banco local
- Configurar redirect URLs
```

### Google Cloud Vision (OCR)
```
Site: https://cloud.google.com/vision
Plano: Pay-as-you-go (1.000 páginas/mês grátis)
Preço: $1.50 por 1.000 páginas (após gratuidade)
Docs: https://cloud.google.com/vision/docs
Configurar:
- Criar projeto no GCP
- Habilitar Vision API
- Criar service account
- Gerar JSON credentials
```

### OpenAI (GPT-4)
```
Site: https://platform.openai.com
Plano: Pay-as-you-go
Preço: ~$0.03 por requisição de parsing
Docs: https://platform.openai.com/docs
Configurar:
- Criar API key
- Definir limites de gasto
- Preparar prompts de extração
```

### Mercado Pago
```
Site: https://www.mercadopago.com.br/developers
Plano: Sem mensalidade (taxa por transação)
Docs: https://www.mercadopago.com.br/developers/pt/docs
Configurar:
- Criar aplicação (sandbox + produção)
- Configurar webhooks
- Obter access_token e public_key
```

### Stripe
```
Site: https://stripe.com
Plano: Sem mensalidade (taxa por transação)
Docs: https://stripe.com/docs
Configurar:
- Criar conta
- Configurar produtos (planos Starter, Pro, Premium)
- Configurar preços recorrentes
- Configurar webhooks
- Obter secret_key e publishable_key
```

### Cloudflare R2
```
Site: https://www.cloudflare.com/r2
Plano: 10 GB grátis/mês + 10 milhões operações
Docs: https://developers.cloudflare.com/r2
Configurar:
- Criar bucket 'EnergyAI-pdfs'
- Gerar API tokens (S3 compatible)
- Configurar lifecycle rules (retenção)
```

### Resend (E-mails)
```
Site: https://resend.com
Plano: Free (100 e-mails/dia)
Docs: https://resend.com/docs
Configurar:
- Verificar domínio (DNS: SPF, DKIM, DMARC)
- Criar API key
- Criar templates de e-mail
```

---

## Custos Estimados (Mensal — para 100 análises/mês)

| Serviço | Custo Estimado |
|---------|---------------|
| Vercel (Hosting) | R$ 0 (free tier) |
| Railway (Backend) | R$ 25-50 |
| Supabase/Neon (PostgreSQL) | R$ 0 (free tier) |
| Cloudflare R2 (Storage) | R$ 0 (free tier) |
| Clerk (Auth) | R$ 0 (free tier) |
| Google Vision (OCR) | R$ 0 (free tier) |
| OpenAI (GPT-4) | R$ 15-30 |
| Resend (E-mail) | R$ 0 (free tier) |
| Sentry (Erros) | R$ 0 (free tier) |
| Cloudflare (CDN) | R$ 0 (free tier) |
| Domínio (.com.br) | R$ 3-5 |
| **TOTAL** | **~R$ 50-90/mês** |

> Custo escala conforme volume. A maioria dos serviços tem tier gratuito generoso.

---

*Documento atualizado em: Abril 2026*
*Versão: 1.0*
