# FASE 01 — FUNDAÇÃO
## Plano Detalhado com Checklist

---

## 📋 Resumo da Fase

| Item | Detalhe |
|------|---------|
| **Objetivo** | Criar o MVP funcional do APP EnergyAI |
| **Duração estimada** | 8-10 semanas |
| **Resultado esperado** | Usuário consegue cadastrar, pagar, enviar PDF e ver análise básica |
| **Pré-requisitos** | Domínio registrado, contas nos serviços cloud, ambiente de dev |

---

## ETAPA 1.1 — SETUP DO AMBIENTE E INFRAESTRUTURA

### Descrição
Configurar todo o ambiente de desenvolvimento, repositório, CI/CD e serviços cloud.

### Tarefas

- [ ] Criar repositório Git (GitHub privado)
- [ ] Configurar branch strategy (main, develop, feature/*)
- [ ] Criar projeto Next.js 14+ com App Router
- [ ] Configurar TypeScript
- [ ] Instalar e configurar Tailwind CSS
- [ ] Instalar shadcn/ui (componentes)
- [ ] Configurar ESLint + Prettier
- [ ] Configurar Husky (pre-commit hooks)
- [ ] Criar arquivo .env.example com variáveis necessárias
- [ ] Configurar Prisma ORM
- [ ] Criar banco PostgreSQL (Supabase ou Neon)
- [ ] Criar schema inicial do Prisma
- [ ] Configurar deploy no Vercel (staging)
- [ ] Configurar domínio customizado
- [ ] Configurar SSL/HTTPS
- [ ] Criar conta Google Cloud (para Vision API)
- [ ] Criar bucket S3/R2 para armazenamento de PDFs
- [ ] Configurar Sentry (monitoramento de erros)
- [ ] Configurar variáveis de ambiente no Vercel
- [ ] Testar pipeline de deploy (push → build → deploy)

### Critérios de Aceite
- Projeto roda localmente com `npm run dev`
- Deploy automático no Vercel ao fazer push
- Banco de dados acessível
- Bucket de armazenamento funcional

### Arquivos/Pastas a Criar
```
02_FRONTEND/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
├── lib/
├── prisma/
│   └── schema.prisma
├── public/
├── .env.example
├── .eslintrc.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## ETAPA 1.2 — LANDING PAGE PÚBLICA

### Descrição
Criar a página de apresentação do produto. É a primeira impressão do usuário.

### Tarefas

- [ ] Criar layout base com header e footer
- [ ] Implementar seção Hero com proposta de valor principal
  - Título impactante
  - Subtítulo explicativo
  - CTA "Começar agora" e "Ver demonstração"
  - Imagem/mockup do dashboard
- [ ] Implementar seção "Como funciona"
  - Passo 1: Envie sua fatura em PDF
  - Passo 2: IA analisa automaticamente
  - Passo 3: Receba seu relatório com economia
  - Ícones ilustrativos para cada passo
- [ ] Implementar seção "Benefícios"
  - Economia identificada automaticamente
  - Análise para Grupo A e Grupo B
  - Relatório profissional em PDF
  - Calculadora de CO2
  - Simulações de solar, baterias e mercado livre
- [ ] Implementar seção "Exemplo de Análise"
  - Card com exemplo Grupo A (economia de demanda)
  - Card com exemplo Grupo B (solar residencial)
  - Gráficos estáticos de demonstração
- [ ] Implementar seção "Planos e Preços"
  - Card Starter (R$ 49,90/mês — 10 faturas)
  - Card Pro (R$ 199,00/mês — 50 faturas)
  - Card Premium (R$ 699,00/mês — ilimitado)
  - Card Consulta Avulsa (R$ 99,00 por análise)
  - Destaque no plano Pro (mais popular)
- [ ] Implementar seção "Depoimentos" (placeholder)
- [ ] Implementar seção "FAQ"
  - O que é o APP EnergyAI?
  - Como funciona a leitura da fatura?
  - Funciona com qualquer concessionária?
  - Meus dados estão seguros?
  - Como funciona o pagamento?
  - Posso cancelar a qualquer momento?
- [ ] Implementar seção "CTA Final"
  - Chamada para ação final
  - Botão de cadastro
- [ ] Implementar Footer
  - Links: Termos de Uso, Política de Privacidade, Contato
  - Redes sociais
  - Copyright
- [ ] Implementar responsividade completa (mobile-first)
- [ ] Implementar SEO básico (meta tags, Open Graph, sitemap)
- [ ] Configurar Google Analytics / Plausible
- [ ] Testar em diferentes dispositivos e navegadores
- [ ] Otimizar performance (Lighthouse score > 90)

### Paleta de Cores
| Uso | Cor | Hex |
|-----|-----|-----|
| Predominante | Azul marinho | #1E3A5F |
| Secundária | Laranja | #F97316 |
| Sustentabilidade | Verde | #22C55E |
| Alertas/Perdas | Vermelho | #EF4444 |
| Fundo | Branco/Cinza claro | #F8FAFC |
| Texto | Cinza escuro | #1E293B |

### Critérios de Aceite
- Página carrega em < 3 segundos
- Lighthouse Performance > 90
- 100% responsiva (320px a 1920px)
- CTAs linkando para página de cadastro
- SEO tags presentes

---

## ETAPA 1.3 — AUTENTICAÇÃO E CONTA DE USUÁRIO

### Descrição
Sistema completo de cadastro, login, recuperação de senha e gestão de perfil.

### Tarefas

- [ ] Escolher e configurar solução de auth (NextAuth.js ou Clerk)
- [ ] Criar página de cadastro (`/cadastro`)
  - [ ] Formulário com campos: Nome, E-mail, Telefone, Senha, Tipo de usuário
  - [ ] Campos adicionais para profissional: Empresa, CNPJ/CPF
  - [ ] Validação client-side com Zod
  - [ ] Validação server-side
  - [ ] Checkbox de aceite dos Termos de Uso e Política de Privacidade
  - [ ] Verificação de e-mail duplicado
  - [ ] Confirmação por e-mail (link de verificação)
- [ ] Criar página de login (`/login`)
  - [ ] Formulário com E-mail e Senha
  - [ ] Link "Esqueci minha senha"
  - [ ] Link para cadastro
  - [ ] Proteção contra brute force (rate limiting)
- [ ] Criar fluxo de recuperação de senha
  - [ ] Página "Esqueci minha senha" (`/recuperar-senha`)
  - [ ] Envio de e-mail com token temporário
  - [ ] Página de redefinição de senha
  - [ ] Token com expiração de 1 hora
- [ ] Criar página de perfil (`/perfil`)
  - [ ] Exibir dados do usuário
  - [ ] Permitir edição de nome, telefone, empresa
  - [ ] Permitir alteração de senha
  - [ ] Exibir plano atual (profissional)
  - [ ] Exibir histórico de consultas
- [ ] Implementar logout
- [ ] Implementar middleware de proteção de rotas
- [ ] Implementar role-based access (profissional vs cliente)
- [ ] Criar tabelas no banco de dados:
  - [ ] `users` (id, name, email, phone, password_hash, type, created_at)
  - [ ] `profiles` (user_id, company, cnpj_cpf, plan, plan_started_at)
  - [ ] `sessions` (para controle de sessões)
- [ ] Configurar envio de e-mails transacionais (Resend ou SendGrid)
- [ ] Testar fluxo completo de cadastro → verificação → login → logout
- [ ] Testar recuperação de senha
- [ ] Testar proteção de rotas (acesso negado sem login)

### Modelo de Dados — Users
```sql
users
├── id              UUID PRIMARY KEY
├── name            VARCHAR(255) NOT NULL
├── email           VARCHAR(255) UNIQUE NOT NULL
├── phone           VARCHAR(20)
├── password_hash   VARCHAR(255) NOT NULL
├── type            ENUM('professional', 'client') NOT NULL
├── email_verified  BOOLEAN DEFAULT false
├── is_active       BOOLEAN DEFAULT true
├── created_at      TIMESTAMP DEFAULT NOW()
└── updated_at      TIMESTAMP DEFAULT NOW()

profiles
├── id              UUID PRIMARY KEY
├── user_id         UUID REFERENCES users(id)
├── company         VARCHAR(255)
├── cnpj_cpf        VARCHAR(18)
├── plan            ENUM('starter', 'pro', 'premium') NULL
├── plan_started_at TIMESTAMP NULL
├── plan_expires_at TIMESTAMP NULL
├── queries_used    INTEGER DEFAULT 0
├── queries_limit   INTEGER DEFAULT 0
└── updated_at      TIMESTAMP DEFAULT NOW()
```

### Critérios de Aceite
- Cadastro com todos os campos obrigatórios
- E-mail de verificação enviado e funcional
- Login com credenciais corretas
- Recuperação de senha funcional
- Rotas protegidas bloqueando acesso não autenticado
- Dados validados no server-side

---

## ETAPA 1.4 — SISTEMA DE PAGAMENTOS

### Descrição
Integrar Mercado Pago e Stripe para processar assinaturas e pagamentos avulsos.

### Tarefas

- [ ] Criar contas no Mercado Pago (sandbox e produção)
- [ ] Criar contas no Stripe (sandbox e produção)
- [ ] Implementar fluxo de assinatura para profissional
  - [ ] Página de escolha de plano (`/planos`)
  - [ ] Integração com Mercado Pago para Pix
  - [ ] Integração com Stripe para cartão de crédito
  - [ ] Webhook para confirmação de pagamento
  - [ ] Ativação automática do plano após confirmação
  - [ ] Lógica de assinatura recorrente
- [ ] Implementar fluxo de pagamento avulso para cliente
  - [ ] Tela de pagamento antes da análise
  - [ ] Pix com QR Code
  - [ ] Cartão de crédito
  - [ ] Webhook para confirmação
  - [ ] Liberação da análise após pagamento confirmado
- [ ] Criar tabelas no banco:
  - [ ] `payments` (id, user_id, type, amount, status, gateway, created_at)
  - [ ] `subscriptions` (id, user_id, plan, status, gateway_id, started_at, expires_at)
- [ ] Implementar lógica de limite por plano
  - [ ] Starter: max 10 consultas/mês
  - [ ] Pro: max 50 consultas/mês
  - [ ] Premium: ilimitado
  - [ ] Reset do contador no início de cada ciclo
- [ ] Implementar bloqueio por inadimplência
  - [ ] Verificar status do pagamento antes de permitir análise
  - [ ] Mensagem clara de bloqueio
  - [ ] Link para regularização
- [ ] Implementar página de histórico de pagamentos (`/pagamentos`)
- [ ] Implementar e-mail de confirmação de pagamento
- [ ] Implementar e-mail de falha de pagamento
- [ ] Testar em sandbox (Mercado Pago + Stripe)
- [ ] Testar cenários de falha (cartão recusado, Pix expirado)
- [ ] Testar webhook de confirmação
- [ ] Testar bloqueio por inadimplência

### Modelo de Dados — Payments
```sql
payments
├── id              UUID PRIMARY KEY
├── user_id         UUID REFERENCES users(id)
├── type            ENUM('subscription', 'single') NOT NULL
├── amount          DECIMAL(10,2) NOT NULL
├── currency        VARCHAR(3) DEFAULT 'BRL'
├── status          ENUM('pending', 'confirmed', 'failed', 'refunded')
├── gateway         ENUM('mercadopago', 'stripe') NOT NULL
├── gateway_id      VARCHAR(255)
├── metadata        JSONB
├── created_at      TIMESTAMP DEFAULT NOW()
└── updated_at      TIMESTAMP DEFAULT NOW()

subscriptions
├── id              UUID PRIMARY KEY
├── user_id         UUID REFERENCES users(id)
├── plan            ENUM('starter', 'pro', 'premium') NOT NULL
├── status          ENUM('active', 'cancelled', 'expired', 'past_due')
├── gateway         ENUM('mercadopago', 'stripe') NOT NULL
├── gateway_sub_id  VARCHAR(255)
├── current_period_start TIMESTAMP
├── current_period_end   TIMESTAMP
├── queries_used    INTEGER DEFAULT 0
├── created_at      TIMESTAMP DEFAULT NOW()
└── updated_at      TIMESTAMP DEFAULT NOW()
```

### Critérios de Aceite
- Profissional consegue assinar plano via Pix ou cartão
- Cliente consegue pagar consulta avulsa via Pix ou cartão
- Webhooks confirmam pagamento automaticamente
- Plano ativado após pagamento confirmado
- Análise bloqueada para inadimplentes
- Limite de consultas respeitado por plano
- Histórico de pagamentos exibido corretamente

---

## ETAPA 1.5 — UPLOAD DE FATURAS PDF

### Descrição
Módulo de upload, validação e armazenamento seguro de faturas em PDF.

### Tarefas

- [ ] Criar página de upload (`/analise/nova`)
  - [ ] Área de drag-and-drop para PDF
  - [ ] Botão alternativo de seleção de arquivo
  - [ ] Preview do nome do arquivo selecionado
  - [ ] Barra de progresso do upload
- [ ] Implementar validações no frontend
  - [ ] Aceitar apenas arquivos .pdf
  - [ ] Tamanho máximo: 10MB
  - [ ] Feedback visual de erro
- [ ] Implementar validações no backend
  - [ ] Verificar MIME type (application/pdf)
  - [ ] Verificar magic bytes do PDF (%PDF-)
  - [ ] Verificar tamanho do arquivo
  - [ ] Scan de segurança básico (anti-malware)
- [ ] Implementar upload para S3/R2
  - [ ] Gerar nome único (UUID + timestamp)
  - [ ] Organizar por user_id/ano/mes/
  - [ ] Retornar URL segura (signed URL, não pública)
- [ ] Criar tabela no banco:
  - [ ] `invoices` (id, user_id, file_url, file_name, file_size, status, created_at)
- [ ] Implementar associação fatura → consulta
- [ ] Verificar permissão do usuário (pagamento ok, limite ok)
- [ ] Após upload bem-sucedido, iniciar processamento OCR (fila)
- [ ] Exibir status do processamento ao usuário
  - [ ] "Enviando..." → "Processando..." → "Concluído" / "Erro"
- [ ] Implementar tratamento de erros
  - [ ] Arquivo corrompido
  - [ ] Timeout de upload
  - [ ] Falha de armazenamento
- [ ] Testar com PDFs de diferentes concessionárias (min 5)
- [ ] Testar com arquivos inválidos (jpg renomeado, PDF corrompido)
- [ ] Testar limite de tamanho

### Modelo de Dados — Invoices
```sql
invoices
├── id              UUID PRIMARY KEY
├── user_id         UUID REFERENCES users(id)
├── payment_id      UUID REFERENCES payments(id) NULL
├── file_url        VARCHAR(500) NOT NULL
├── file_name       VARCHAR(255) NOT NULL
├── file_size       INTEGER NOT NULL
├── file_hash       VARCHAR(64) NOT NULL
├── status          ENUM('uploaded', 'processing', 'completed', 'failed')
├── error_message   TEXT NULL
├── created_at      TIMESTAMP DEFAULT NOW()
└── updated_at      TIMESTAMP DEFAULT NOW()
```

### Critérios de Aceite
- Upload funciona via drag-and-drop e botão
- Apenas PDFs são aceitos (validação client + server)
- Arquivo armazenado com segurança no S3/R2
- URLs não são públicas (signed URLs)
- Processamento OCR inicia automaticamente
- Status exibido em tempo real ao usuário

---

## ETAPA 1.6 — OCR E PARSER BÁSICO

### Descrição
Extrair texto do PDF usando OCR e interpretar os dados da fatura com parser inteligente.

### Tarefas

- [ ] Configurar Google Cloud Vision API
  - [ ] Criar service account
  - [ ] Gerar credenciais JSON
  - [ ] Configurar no .env
- [ ] Implementar pipeline de OCR
  - [ ] Receber PDF do storage
  - [ ] Converter PDF em imagens (se necessário)
  - [ ] Enviar para Google Vision API
  - [ ] Receber texto extraído
  - [ ] Armazenar texto bruto
- [ ] Implementar fallback com Tesseract.js
  - [ ] Se Google Vision falhar, tentar com Tesseract
  - [ ] Registrar qual engine foi utilizada
- [ ] Implementar Parser Inteligente (GPT-4 / Claude)
  - [ ] Enviar texto extraído para IA
  - [ ] Prompt estruturado para extração de campos
  - [ ] Retorno em formato JSON padronizado
  - [ ] Calcular nível de confiança por campo
- [ ] Campos a extrair:
  - [ ] Nome do cliente
  - [ ] Concessionária
  - [ ] Número da unidade consumidora
  - [ ] Classe e subclasse
  - [ ] Modalidade tarifária
  - [ ] Grupo tarifário (A ou B)
  - [ ] Consumo mensal (kWh)
  - [ ] Demanda contratada (kW) — Grupo A
  - [ ] Demanda medida (kW) — Grupo A
  - [ ] Histórico de 12 meses
  - [ ] Valores de impostos e encargos
  - [ ] ICMS
  - [ ] PIS/COFINS
  - [ ] COSIP
  - [ ] Valor total da fatura
  - [ ] Data de referência
  - [ ] Potência reativa — Grupo A
  - [ ] Fio B
  - [ ] Taxa mínima
  - [ ] Indícios de Geração Distribuída
  - [ ] Indícios de Mercado Livre
- [ ] Implementar classificação de confiança
  - [ ] Alta (> 90%): extraído com certeza
  - [ ] Média (70-90%): extraído com ressalvas
  - [ ] Baixa (< 70%): sinalizar no relatório
  - [ ] Ausente: campo não encontrado
- [ ] Criar tabela para dados extraídos:
  - [ ] `invoice_data` (campos extraídos estruturados)
  - [ ] `extraction_log` (log do processamento)
- [ ] Implementar retry automático (max 3 tentativas)
- [ ] Implementar timeout (máx 60s por fatura)
- [ ] Testar com faturas de diferentes concessionárias:
  - [ ] CEMIG
  - [ ] CPFL
  - [ ] Enel (SP, RJ, CE)
  - [ ] Energisa
  - [ ] Light
  - [ ] Copel
  - [ ] Celesc
  - [ ] Equatorial
  - [ ] Neoenergia
  - [ ] CEEE
- [ ] Validar taxa de acerto por campo
- [ ] Documentar campos que falham com frequência

### Modelo de Dados — Invoice Data
```sql
invoice_data
├── id                    UUID PRIMARY KEY
├── invoice_id            UUID REFERENCES invoices(id)
├── raw_text              TEXT
├── ocr_engine            ENUM('google_vision', 'tesseract')
├── parser_engine         ENUM('gpt4', 'claude', 'regex')
├── client_name           VARCHAR(255)
├── client_name_conf      DECIMAL(3,2)
├── utility_company       VARCHAR(255)
├── utility_company_conf  DECIMAL(3,2)
├── consumer_unit         VARCHAR(50)
├── tariff_group          ENUM('A', 'B')
├── tariff_group_conf     DECIMAL(3,2)
├── tariff_modality       VARCHAR(100)
├── consumer_class        VARCHAR(100)
├── monthly_consumption   DECIMAL(12,2)
├── contracted_demand     DECIMAL(12,2) NULL
├── measured_demand       DECIMAL(12,2) NULL
├── reactive_power        DECIMAL(12,2) NULL
├── total_amount          DECIMAL(12,2)
├── reference_date        DATE
├── taxes_icms            DECIMAL(12,2)
├── taxes_pis_cofins      DECIMAL(12,2)
├── cosip                 DECIMAL(12,2)
├── wire_b                DECIMAL(12,2) NULL
├── minimum_rate          DECIMAL(12,2) NULL
├── has_distributed_gen   BOOLEAN DEFAULT false
├── has_free_market       BOOLEAN DEFAULT false
├── history_12m           JSONB
├── all_fields            JSONB
├── confidence_summary    JSONB
├── processing_time_ms    INTEGER
├── created_at            TIMESTAMP DEFAULT NOW()
└── updated_at            TIMESTAMP DEFAULT NOW()
```

### Critérios de Aceite
- OCR extrai texto de PDFs de diferentes concessionárias
- Parser identifica e estrutura os campos principais
- Classificação de grupo tarifário (A ou B) funcional
- Nível de confiança calculado por campo
- Campos ausentes ou de baixa confiança sinalizados
- Tempo de processamento < 30 segundos por fatura
- Fallback funciona quando Google Vision falha

---

## ETAPA 1.7 — CLASSIFICAÇÃO DA UNIDADE E DASHBOARD BÁSICO

### Descrição
Classificar a unidade consumidora e apresentar os dados em um dashboard visual.

### Tarefas

- [ ] Implementar lógica de classificação
  - [ ] Grupo A / Grupo B (baseado na fatura)
  - [ ] Monofásico / Bifásico / Trifásico
  - [ ] Residencial / Comercial / Industrial
  - [ ] Média tensão / Alta tensão (quando identificável)
- [ ] Criar dashboard do resultado (`/analise/[id]`)
  - [ ] Card: dados do cliente e concessionária
  - [ ] Card: classificação da unidade (Grupo, Classe, Tipo)
  - [ ] Card: consumo mensal e valor da fatura
  - [ ] Card: impostos e encargos
  - [ ] Gráfico: histórico de consumo (12 meses, se disponível)
  - [ ] Gráfico: composição da fatura (pizza)
  - [ ] Tabela: campos extraídos com nível de confiança
  - [ ] Alerta: campos com baixa confiança ou ausentes
- [ ] Implementar cards de KPI
  - [ ] Consumo médio mensal
  - [ ] Valor médio mensal
  - [ ] Custo por kWh
  - [ ] Classificação identificada
- [ ] Implementar indicadores visuais de confiança
  - [ ] Verde: alta confiança
  - [ ] Amarelo: média confiança
  - [ ] Vermelho: baixa confiança
  - [ ] Cinza: não encontrado
- [ ] Criar lista de análises (`/analises`)
  - [ ] Lista com data, concessionária, grupo, status
  - [ ] Filtros por data e status
  - [ ] Link para cada análise individual
- [ ] Implementar responsividade do dashboard
- [ ] Testar com dados reais extraídos
- [ ] Testar com dados incompletos (campos ausentes)

### Critérios de Aceite
- Classificação correta do grupo tarifário
- Dashboard exibe todos os dados extraídos
- Gráficos renderizam corretamente
- Confiança exibida por campo
- Lista de análises funcional
- Responsivo em mobile e desktop

---

## ETAPA 1.8 — TESTES, SEGURANÇA E DEPLOY DO MVP

### Descrição
Testar tudo, corrigir bugs, validar segurança e fazer deploy em produção.

### Tarefas

- [ ] Testes Funcionais
  - [ ] Testar fluxo completo: cadastro → pagamento → upload → análise
  - [ ] Testar como profissional (todos os planos)
  - [ ] Testar como cliente (consulta avulsa)
  - [ ] Testar recuperação de senha
  - [ ] Testar limite de consultas por plano
  - [ ] Testar bloqueio por inadimplência
  - [ ] Testar com 10+ faturas de diferentes concessionárias
- [ ] Testes de Segurança
  - [ ] Verificar proteção contra SQL Injection
  - [ ] Verificar proteção contra XSS
  - [ ] Verificar proteção contra CSRF
  - [ ] Verificar rate limiting no login
  - [ ] Verificar que URLs de PDFs não são públicas
  - [ ] Verificar que senhas são hasheadas (bcrypt)
  - [ ] Verificar headers de segurança (CSP, HSTS, etc.)
  - [ ] Verificar CORS configurado corretamente
- [ ] Testes de Performance
  - [ ] Lighthouse score > 90 (landing page)
  - [ ] Tempo de resposta das APIs < 500ms
  - [ ] Tempo de processamento OCR < 30s
  - [ ] Testar com upload simultâneo (3+ faturas)
- [ ] Correções e Ajustes
  - [ ] Listar e priorizar bugs encontrados
  - [ ] Corrigir bugs críticos
  - [ ] Corrigir bugs de UX
  - [ ] Revisar textos e mensagens de erro
- [ ] Preparação para Produção
  - [ ] Migrar banco de staging para produção
  - [ ] Configurar variáveis de produção
  - [ ] Ativar gateways de pagamento em modo produção
  - [ ] Configurar backup automático do banco
  - [ ] Configurar monitoramento (Sentry + alertas)
  - [ ] Configurar Cloudflare (CDN + DDoS)
- [ ] Deploy em Produção
  - [ ] Deploy do frontend (Vercel)
  - [ ] Deploy do backend (Railway/Render)
  - [ ] Verificar tudo funcionando
  - [ ] Teste smoke em produção
  - [ ] Configurar uptime monitoring

### Critérios de Aceite
- Todos os fluxos testados e funcionando
- Zero vulnerabilidades críticas de segurança
- Performance dentro dos limites definidos
- Deploy em produção estável
- Monitoramento ativo

---

## Resumo de Entregas da Fase 01

| # | Entrega | Status |
|---|---------|--------|
| 1.1 | Ambiente e infraestrutura configurados | ⬜ |
| 1.2 | Landing page publicada | ⬜ |
| 1.3 | Autenticação completa | ⬜ |
| 1.4 | Pagamentos funcionando | ⬜ |
| 1.5 | Upload de PDF funcional | ⬜ |
| 1.6 | OCR e parser básico | ⬜ |
| 1.7 | Classificação + Dashboard básico | ⬜ |
| 1.8 | Testes + Deploy MVP | ⬜ |

---

*Documento atualizado em: Abril 2026*
*Versão: 1.0*
