# Decisões Técnicas - APP EnergyAI

## Por que cada tecnologia foi escolhida

Este documento justifica as decisões técnicas do projeto para que você (mesmo sendo leigo) entenda o raciocínio por trás de cada escolha.

---

## 1. Framework Frontend: Next.js 14+ (React)

### Por que Next.js?
- **React** é a biblioteca mais popular do mundo para interfaces web
- **Next.js** é o framework React mais usado e recomendado pela própria equipe do React
- Permite **renderização do lado do servidor (SSR)** — melhor para SEO da landing page
- **App Router** (mais recente) organiza melhor o código
- Deploy automatizado no **Vercel** (empresa que criou o Next.js)
- Pode funcionar como **full-stack** (frontend + API backend no mesmo projeto)

### Alternativas descartadas
| Alternativa | Motivo de descarte |
|-------------|-------------------|
| WordPress | Não suporta complexidade necessária (OCR, IA, dashboards) |
| Vue.js/Nuxt | Comunidade menor, menos bibliotecas disponíveis |
| Angular | Mais complexo, curva de aprendizado maior |
| HTML/CSS puro | Inviável para aplicação complexa |

---

## 2. Estilização: Tailwind CSS + shadcn/ui

### Por que Tailwind?
- **Produtividade** — escreve CSS diretamente no HTML, sem alternar arquivos
- **Consistência** — sistema de design pré-definido (cores, espaçamentos, fontes)
- **Performance** — gera apenas o CSS que é usado
- **shadcn/ui** — componentes prontos e bonitos (botões, cards, modais, tabelas)
- Você não precisa de um designer para ter um app bonito

### Por que não Bootstrap?
- Bootstrap gera sites com aparência genérica
- Tailwind permite personalização total mantendo produtividade

---

## 3. Banco de Dados: PostgreSQL (Supabase ou Neon)

### Por que PostgreSQL?
- Banco de dados relacional mais robusto e gratuito
- Suporta JSON nativo (perfeito para dados variáveis das faturas)
- Escala para milhões de registros sem problemas
- **Supabase** oferece PostgreSQL gerenciado com painel visual e auth integrado
- **Neon** oferece PostgreSQL serverless (paga só pelo uso)

### Por que não MySQL ou MongoDB?
| Alternativa | Motivo |
|-------------|--------|
| MySQL | PostgreSQL é superior em features (JSON, arrays, full-text) |
| MongoDB | Dados do app são majoritariamente relacionais (users → payments → invoices) |
| SQLite | Não escala para produção multi-usuário |

---

## 4. ORM: Prisma

### Por que Prisma?
- Define o banco de dados em um arquivo legível (`schema.prisma`)
- Gera automaticamente as queries com tipagem TypeScript
- Migrações automáticas (altera o banco sem SQL manual)
- Previne SQL Injection por padrão
- Mais produtivo e seguro que escrever SQL manualmente

---

## 5. OCR: Google Cloud Vision API + Tesseract.js

### Por que Google Vision como primário?
- **Melhor precisão** — Google tem os melhores modelos de OCR do mercado
- Lê PDFs com diferentes qualidades
- Suporta documentos escaneados, fotografados e digitais
- Preço acessível (primeiras 1.000 páginas/mês gratuitas)

### Por que Tesseract como fallback?
- Open source e gratuito
- Roda no próprio servidor (sem depender da cloud)
- Funciona como backup se Google Vision estiver fora

---

## 6. IA para Parsing: GPT-4 / Claude

### Por que IA generativa para interpretar faturas?
- Faturas de cada concessionária têm **layouts diferentes**
- Regras fixas (regex) não funcionam para todos os formatos
- IA generativa entende contexto e extrai campos mesmo de layouts desconhecidos
- Pode calcular nível de confiança por campo
- Melhora com o tempo (novos prompts, fine-tuning)

### Estratégia
1. OCR extrai o texto bruto
2. IA generativa recebe o texto e retorna JSON estruturado
3. Validação cruzada verifica consistência dos dados
4. Se falhar, sinaliza baixa confiança

---

## 7. Pagamentos: Mercado Pago + Stripe

### Por que dois gateways?
| Gateway | Uso principal | Vantagem |
|---------|--------------|----------|
| Mercado Pago | **Pix** + cartão no Brasil | Maior penetração de Pix no Brasil, taxas competitivas |
| Stripe | **Cartão de crédito** + assinaturas | Melhor gestão de assinaturas recorrentes, dashboard superior |

### Estratégia
- **Pix**: Mercado Pago (80%+ dos pagamentos no Brasil são via Pix)
- **Cartão + Assinatura**: Stripe (melhor para recorrência)
- Ambos com webhooks para confirmação automática

---

## 8. Hosting: Vercel + Railway

### Por que Vercel para o Frontend?
- Feito pela mesma empresa que criou o Next.js
- Deploy em 1 clique via GitHub
- CDN global (site rápido no mundo todo)
- SSL gratuito
- Preview automático para cada pull request
- Plano gratuito generoso para começar

### Por que Railway para o Backend?
- Deploy simples a partir do GitHub
- Suporta Node.js, PostgreSQL, Redis
- Preços acessíveis (paga por uso)
- Escalável conforme demanda
- Alternativa: Render (similar)

---

## 9. Armazenamento de PDFs: Cloudflare R2

### Por que R2?
- **Sem taxas de egress** (download gratuito — S3 cobra por isso)
- Compatível com API do S3 (mesmas bibliotecas)
- CDN global integrado (Cloudflare)
- Mais barato que AWS S3 para nosso uso
- URLs assinadas (PDFs nunca ficam públicos)

---

## 10. Autenticação: NextAuth.js ou Clerk

### Opção A: NextAuth.js (Open Source)
- Gratuito
- Suporta e-mail/senha, Google, GitHub
- Integração nativa com Next.js
- Mais trabalho de implementação

### Opção B: Clerk (SaaS)
- Pronto para usar (cadastro, login, perfil prontos)
- Multi-fator grátis
- Gestão de usuários com dashboard
- Gratuito até 10.000 usuários
- **Recomendado para quem é leigo** — menos código para manter

### Decisão: **Clerk** (menos trabalho, mais seguro por padrão)

---

## 11. Monitoramento: Sentry + Uptime Robot

### Sentry
- Captura erros automaticamente (frontend e backend)
- Mostra stack trace, device, browser
- Alertas por e-mail/Slack
- Plano gratuito: 5.000 eventos/mês

### Uptime Robot
- Monitora se o site está online a cada 5 minutos
- Alerta por e-mail se cair
- Gratuito para até 50 monitores

---

## 12. Geração de PDF: Puppeteer ou @react-pdf/renderer

### Opção A: Puppeteer (HTML → PDF)
- Renderiza uma página HTML como PDF
- Suporta gráficos, CSS avançado
- Resultado pixel-perfect
- Mais pesado (requer Chrome headless)

### Opção B: @react-pdf/renderer
- Componentes React específicos para PDF
- Mais leve
- Menos flexibilidade visual

### Decisão: **Puppeteer** — qualidade profissional do PDF é prioridade

---

## Resumo das Decisões

| Área | Escolha | Tipo |
|------|---------|------|
| Frontend | Next.js 14 + React | Framework |
| Estilização | Tailwind CSS + shadcn/ui | UI |
| Backend | Next.js API Routes + Node.js | Runtime |
| Banco de dados | PostgreSQL (Supabase/Neon) | Database |
| ORM | Prisma | Data layer |
| OCR | Google Cloud Vision + Tesseract | IA |
| Parser | GPT-4 / Claude | IA |
| Pagamentos | Mercado Pago + Stripe | Financeiro |
| Hosting Frontend | Vercel | Infra |
| Hosting Backend | Railway/Render | Infra |
| Armazenamento | Cloudflare R2 | Storage |
| Auth | Clerk | Segurança |
| PDF | Puppeteer | Geração |
| Monitoramento | Sentry + Uptime Robot | Ops |
| CDN | Cloudflare | Performance |

---

*Documento atualizado em: Abril 2026*
*Versão: 1.0*
