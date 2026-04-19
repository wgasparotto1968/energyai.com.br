# Mapa de Telas e Fluxos de Usuário - APP EnergyAI

---

## Mapa de Telas Completo

```
PÚBLICAS (sem login)
├── / .......................... Landing Page
├── /login ..................... Página de Login
├── /cadastro .................. Página de Cadastro
├── /recuperar-senha ........... Recuperação de Senha
├── /redefinir-senha/:token .... Redefinição de Senha
├── /termos-de-uso ............. Termos de Uso
├── /politica-privacidade ...... Política de Privacidade
└── /demo ...................... Demo (análise exemplo)

AUTENTICADAS — CLIENTE
├── /dashboard ................. Painel principal
├── /analise/nova .............. Nova análise (upload + pagamento)
├── /analise/:id ............... Resultado da análise
│   ├── tab: Visão Geral
│   ├── tab: Dados da Fatura
│   ├── tab: Análise Técnica
│   ├── tab: Cenários de Economia
│   └── tab: Impacto Ambiental
├── /analises .................. Lista de análises
├── /pagamentos ................ Histórico de pagamentos
├── /perfil .................... Edição de perfil
└── /notificacoes .............. Notificações

AUTENTICADAS — PROFISSIONAL
├── /dashboard ................. Painel principal (com métricas)
├── /planos .................... Escolha/Troca de plano
├── /analise/nova .............. Nova análise (upload)
├── /analise/:id ............... Resultado da análise (completo)
├── /analises .................. Lista de análises (com filtros)
├── /clientes .................. Gestão de clientes (Fase 4)
├── /clientes/:id .............. Detalhe do cliente (Fase 4)
├── /pagamentos ................ Histórico de pagamentos
├── /assinatura ................ Gestão da assinatura
├── /perfil .................... Edição de perfil
├── /api-keys .................. Chaves de API (Fase 4)
└── /notificacoes .............. Notificações

ADMIN
├── /admin ..................... Dashboard administrativo
├── /admin/parametros .......... Gestão de parâmetros
├── /admin/usuarios ............ Gestão de usuários
├── /admin/usuarios/:id ........ Detalhe do usuário
├── /admin/analytics ........... Métricas e analytics
└── /admin/logs ................ Logs de processamento
```

---

## Fluxos de Usuário

### Fluxo 1: Visitante → Cliente (Consulta Avulsa)

```
Acessa Landing Page (/)
    │
    ├── Lê sobre o produto
    ├── Vê exemplos de análise
    ├── Vê preço da consulta avulsa (R$ 99)
    │
    └── Clica "Começar Agora"
            │
            ▼
    Cadastro (/cadastro)
    ├── Tipo: Cliente
    ├── Preenche dados
    ├── Aceita termos
    └── Confirma e-mail
            │
            ▼
    Login (/login)
            │
            ▼
    Dashboard (/dashboard)
    └── Clica "Nova Análise"
            │
            ▼
    Nova Análise (/analise/nova)
    ├── Faz upload do PDF
    ├── Faz pagamento (R$ 99 via Pix ou cartão)
    ├── Aguarda processamento
    │       │
    │       ├── "Processando..." (barra de progresso)
    │       └── Notificação quando pronto
    │
    └── Resultado (/analise/:id)
        ├── Visualiza dashboard
        ├── Navega por abas
        └── Exporta PDF
```

### Fluxo 2: Visitante → Profissional (Assinatura)

```
Acessa Landing Page (/)
    │
    ├── Vê planos e preços
    └── Clica "Escolher Plano"
            │
            ▼
    Cadastro (/cadastro)
    ├── Tipo: Profissional
    ├── Preenche dados + empresa + CNPJ
    ├── Aceita termos
    └── Confirma e-mail
            │
            ▼
    Planos (/planos)
    ├── Escolhe plano (Starter/Pro/Premium)
    └── Faz pagamento (Pix ou cartão)
            │
            ▼
    Dashboard (/dashboard)
    ├── Vê uso do plano (X de Y consultas)
    └── Clica "Nova Análise"
            │
            ▼
    (Fluxo de análise igual ao cliente, sem pagamento avulso)
```

### Fluxo 3: Upload e Análise

```
Nova Análise (/analise/nova)
    │
    ├── Arrasta ou seleciona PDF
    ├── Sistema valida arquivo
    │       │
    │       ├── ✅ PDF válido → Upload para R2
    │       └── ❌ Inválido → Mensagem de erro
    │
    ├── [Se Cliente] → Pagamento avulso
    │       │
    │       ├── ✅ Pago → Enfileira processamento
    │       └── ❌ Falhou → Tenta novamente
    │
    ├── [Se Profissional] → Verifica plano
    │       │
    │       ├── ✅ Dentro do limite → Enfileira processamento
    │       └── ❌ Limite atingido → Sugere upgrade
    │
    ▼
    Processamento (OCR + IA)
    ├── Extrai texto (Google Vision / Tesseract)
    ├── Interpreta campos (GPT-4 / Claude)
    ├── Classifica unidade (Grupo A ou B)
    ├── Executa regras de análise
    ├── Calcula cenários de economia
    ├── Calcula CO2
    │
    ▼
    Resultado (/analise/:id)
    ├── Visão Geral (KPIs, resumo)
    ├── Dados da Fatura (campos + confiança)
    ├── Análise Técnica (regras específicas)
    ├── Cenários de Economia (simulações)
    ├── Impacto Ambiental (CO2)
    └── [Botão] Exportar PDF
```

---

## Wireframes Textuais (Layout de cada tela)

### Landing Page (/)

```
┌──────────────────────────────────────────────────────┐
│ [Logo EnergyAI]    Início  Como Funciona  Planos  │
│                                          [Entrar]   │
├──────────────────────────────────────────────────────┤
│                                                      │
│   Descubra quanto você está                          │
│   perdendo na sua conta de luz                       │
│                                                      │
│   Envie sua fatura e nossa IA analisa em segundos    │
│                                                      │
│   [Começar Agora]   [Ver Demonstração]               │
│                                                      │
│                  [Imagem do Dashboard]                │
│                                                      │
├──────────────────────────────────────────────────────┤
│   COMO FUNCIONA                                      │
│                                                      │
│   📄 Envie      🤖 IA Analisa     📊 Receba         │
│   sua fatura    automaticamente    seu relatório     │
│                                                      │
├──────────────────────────────────────────────────────┤
│   PLANOS                                             │
│                                                      │
│   ┌─────────┐  ┌──────────┐  ┌──────────┐          │
│   │ Starter │  │   Pro    │  │ Premium  │          │
│   │ R$49,90 │  │ R$199,00 │  │ R$699,00 │          │
│   │ 10/mês  │  │ 50/mês   │  │ Ilimit.  │          │
│   │[Assinar]│  │[Assinar] │  │[Assinar] │          │
│   └─────────┘  └──────────┘  └──────────┘          │
│                                                      │
│   Consulta Avulsa: R$ 99,00 por análise              │
│                                                      │
├──────────────────────────────────────────────────────┤
│   FAQ | Termos | Privacidade | © 2026 EnergyAI      │
└──────────────────────────────────────────────────────┘
```

### Dashboard do Resultado (/analise/:id)

```
┌──────────────────────────────────────────────────────┐
│ [Logo]  Análises  Nova Análise  Perfil    [Sair]     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Análise #12345 — CEMIG — Grupo B — 15/03/2026      │
│                                          [📄 PDF]    │
│                                                      │
│  [Visão Geral] [Dados] [Técnica] [Economia] [CO2]   │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Consumo  │ │ Valor    │ │ Economia │ │ CO2    │ │
│  │ 380 kWh  │ │ R$342,00 │ │ R$180/mês│ │ 2.3ton │ │
│  │  mensal   │ │  mensal   │ │ potencial│ │  /ano   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│                                                      │
│  ┌─────────────────────┐ ┌──────────────────────┐   │
│  │ Histórico Consumo   │ │ Composição Fatura    │   │
│  │ ████████████████    │ │ ┌────┐               │   │
│  │ ████████████████    │ │ │ ◉  │ Energia: 65%  │   │
│  │ █████████████       │ │ │    │ Impostos: 25% │   │
│  │ ████████████████    │ │ │    │ COSIP: 10%    │   │
│  └─────────────────────┘ └──────────────────────┘   │
│                                                      │
│  ⚠️ 2 campos com baixa confiança [Ver detalhes]      │
│                                                      │
│  📋 RECOMENDAÇÕES                                     │
│  1. 🟢 Instalar solar on-grid (economia R$180/mês)   │
│  2. 🟡 Considerar sistema híbrido (economia R$250)    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Design System (Componentes Reutilizáveis)

### Cores
| Token | Hex | Uso |
|-------|-----|-----|
| `--primary` | #1E3A5F | Botões, headers, links |
| `--secondary` | #F97316 | CTAs, destaques |
| `--success` | #22C55E | Economia, CO2, ganhos |
| `--danger` | #EF4444 | Perdas, multas, alertas |
| `--warning` | #F59E0B | Atenção, confiança média |
| `--bg-primary` | #F8FAFC | Fundo da página |
| `--bg-card` | #FFFFFF | Fundo dos cards |
| `--text-primary` | #1E293B | Texto principal |
| `--text-secondary` | #64748B | Texto secundário |

### Tipografia
| Elemento | Font | Peso | Tamanho |
|----------|------|------|---------|
| H1 | Inter | Bold (700) | 36px |
| H2 | Inter | SemiBold (600) | 28px |
| H3 | Inter | SemiBold (600) | 22px |
| Body | Inter | Regular (400) | 16px |
| Small | Inter | Regular (400) | 14px |
| Caption | Inter | Medium (500) | 12px |

### Componentes
- **KPI Card**: Ícone + Valor + Label + Variação
- **Alert Card**: Ícone (⚠️/✅/❌) + Título + Descrição
- **Scenario Card**: Título + Economia + Investimento + Payback + CTA
- **Confidence Badge**: 🟢 Alta | 🟡 Média | 🔴 Baixa | ⚪ Ausente
- **Chart Container**: Título + Gráfico + Legenda
- **Data Table**: Cabeçalho + Linhas zebradas + Paginação
- **Upload Zone**: Ícone + Texto + Drag area + Barra de progresso
- **Status Badge**: 🔵 Processando | 🟢 Concluído | 🔴 Falhou

---

*Documento atualizado em: Abril 2026*
*Versão: 1.0*
