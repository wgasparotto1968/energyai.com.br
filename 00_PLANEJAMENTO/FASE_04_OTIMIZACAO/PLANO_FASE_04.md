# FASE 04 — OTIMIZAÇÃO E ESCALA
## Plano Detalhado com Checklist

---

## 📋 Resumo da Fase

| Item | Detalhe |
|------|---------|
| **Objetivo** | Escalar o produto, melhorar com ML, implementar PWA e features de retenção |
| **Duração estimada** | Contínua (a partir da semana 29) |
| **Pré-requisito** | Fase 03 concluída |
| **Resultado esperado** | Produto escalável, inteligente e com alta retenção |

---

## ETAPA 4.1 — PROGRESSIVE WEB APP (PWA)

### Descrição
Transformar o app em PWA para permitir instalação e uso offline parcial.

### Tarefas

- [ ] Configurar Service Worker no Next.js
  - [ ] Usar `next-pwa` ou configuração manual
  - [ ] Cache de assets estáticos
  - [ ] Cache de páginas críticas
- [ ] Criar `manifest.json`
  - [ ] Nome: "EnergyAI"
  - [ ] Ícones em múltiplos tamanhos (192x192, 512x512)
  - [ ] Theme color: #1E3A5F
  - [ ] Background color: #F8FAFC
  - [ ] Display: standalone
- [ ] Implementar tela de instalação (prompt)
  - [ ] Banner "Instale o app" em mobile
  - [ ] Botão de instalação no menu
- [ ] Implementar funcionalidade offline
  - [ ] Dashboard visualizável offline (última análise cacheada)
  - [ ] Mensagem "Sem conexão" para ações que requerem internet
  - [ ] Sincronização automática ao reconectar
- [ ] Implementar notificações push
  - [ ] Permissão do usuário
  - [ ] Notificação: análise concluída
  - [ ] Notificação: lembrete de pagamento
  - [ ] Notificação: nova funcionalidade
- [ ] Testar em Android e iOS (Safari)
- [ ] Testar instalação e desinstalação
- [ ] Lighthouse PWA score > 90

### Critérios de Aceite
- App instalável em mobile e desktop
- Funciona offline para visualização
- Notificações push funcionando
- Lighthouse PWA > 90

---

## ETAPA 4.2 — MACHINE LEARNING PARA PARSER

### Descrição
Usar ML para melhorar a precisão do OCR e parsing de faturas.

### Tarefas

- [ ] Coletar dataset de faturas processadas
  - [ ] Min 100 faturas por concessionária
  - [ ] Rotular campos corretos manualmente
  - [ ] Registrar correções feitas por usuários
- [ ] Treinar modelo de classificação de layout
  - [ ] Identificar concessionária pela estrutura visual
  - [ ] Identificar regiões de interesse no PDF
  - [ ] Acurácia alvo: > 95%
- [ ] Implementar modelo de extração de campos
  - [ ] Named Entity Recognition (NER) para campos da fatura
  - [ ] Fine-tuning de modelo de linguagem
  - [ ] Validação cruzada contra extração por IA generativa
- [ ] Implementar feedback loop
  - [ ] Botão "Corrigir dado" no dashboard
  - [ ] Armazenar correções como training data
  - [ ] Re-treinar modelo periodicamente
- [ ] Implementar A/B test: IA generativa vs. ML dedicado
- [ ] Monitorar métricas de acurácia continuamente
  - [ ] Dashboard no admin: taxa de acerto por campo
  - [ ] Alertas quando taxa cai abaixo do limiar

### Critérios de Aceite
- Taxa de acerto > 90% em campos principais
- Modelo treinado e deployado
- Feedback loop funcionando
- Métricas monitoradas

---

## ETAPA 4.3 — DASHBOARD PROFISSIONAL AVANÇADO

### Descrição
Criar funcionalidades avançadas de gestão para profissionais.

### Tarefas

- [ ] Gestão de Clientes
  - [ ] Cadastro de clientes do profissional
  - [ ] Vincular análises a clientes específicos
  - [ ] Histórico de análises por cliente
  - [ ] Notas e observações por cliente
- [ ] Relatórios Consolidados
  - [ ] Visão geral de todos os clientes
  - [ ] Economia total gerada para carteira
  - [ ] Ranking de clientes com maior potencial
  - [ ] Exportação em Excel/CSV
- [ ] Comparativo entre Períodos
  - [ ] Upload de múltiplas faturas do mesmo cliente
  - [ ] Gráfico de evolução do consumo
  - [ ] Gráfico de evolução de custos
  - [ ] Identificação de tendências
- [ ] Agenda de Reanálise
  - [ ] Lembrete para reanalisar cliente
  - [ ] Periodicidade configurável
  - [ ] Notificação por e-mail
- [ ] White-Label (Premium)
  - [ ] Upload de logo próprio
  - [ ] Cores personalizáveis no relatório
  - [ ] Nome da empresa no cabeçalho do PDF
  - [ ] Remoção da marca EnergyAI (plano Premium)

### Critérios de Aceite
- Gestão de clientes funcional
- Relatórios consolidados exportáveis
- Comparativo entre períodos com gráficos
- White-label funcional para Premium

---

## ETAPA 4.4 — NOTIFICAÇÕES E COMUNICAÇÃO

### Descrição
Sistema completo de notificações por múltiplos canais.

### Tarefas

- [ ] E-mail Transacional (Resend/SendGrid)
  - [ ] Templates HTML responsivos para:
    - [ ] Boas-vindas
    - [ ] Confirmação de pagamento
    - [ ] Análise concluída
    - [ ] Falha no processamento
    - [ ] Lembrete de vencimento
    - [ ] Recuperação de senha
    - [ ] Novidades do sistema
  - [ ] Configurar SPF, DKIM, DMARC
  - [ ] Monitorar taxa de entrega
- [ ] WhatsApp (API Business ou Evolution API)
  - [ ] Notificação de análise concluída
  - [ ] Link direto para resultado
  - [ ] Lembrete de pagamento
  - [ ] Opt-in/opt-out do usuário
- [ ] Notificações In-App
  - [ ] Sino de notificações no header
  - [ ] Lista de notificações
  - [ ] Marcar como lida
  - [ ] Badge com contador

### Critérios de Aceite
- E-mails enviados e entregues (taxa > 95%)
- WhatsApp funcional (se implementado)
- Notificações in-app visíveis e gerenciáveis
- Opt-out respeitado

---

## ETAPA 4.5 — API PÚBLICA

### Descrição
Disponibilizar API para integradores e parceiros.

### Tarefas

- [ ] Definir endpoints da API:
  - [ ] `POST /api/v1/invoices/upload` — Enviar fatura
  - [ ] `GET /api/v1/invoices/{id}` — Status da análise
  - [ ] `GET /api/v1/invoices/{id}/results` — Resultados
  - [ ] `GET /api/v1/invoices/{id}/pdf` — Download do relatório
  - [ ] `GET /api/v1/account` — Dados da conta
  - [ ] `GET /api/v1/account/usage` — Uso do plano
- [ ] Implementar autenticação por API Key
  - [ ] Geração de chave no painel do profissional
  - [ ] Rate limiting por plano
  - [ ] Log de uso da API
- [ ] Criar documentação da API
  - [ ] Swagger/OpenAPI
  - [ ] Exemplos de uso (cURL, Python, Node.js)
  - [ ] Página de documentação pública
- [ ] Implementar webhooks
  - [ ] Evento: análise concluída
  - [ ] Evento: análise falhou
  - [ ] Configuração de URL pelo usuário
  - [ ] Retry automático (3 tentativas)
- [ ] Testar com clientes beta

### Critérios de Aceite
- API funcional e documentada
- Autenticação por API Key
- Rate limiting respeitado
- Webhooks funcionando com retry
- Documentação Swagger acessível

---

## ETAPA 4.6 — PERFORMANCE E ESCALA

### Descrição
Otimizar performance e preparar para crescimento.

### Tarefas

- [ ] Otimização de Frontend
  - [ ] Code splitting eficiente
  - [ ] Lazy loading de componentes pesados
  - [ ] Otimização de imagens (next/image)
  - [ ] Pré-fetch de rotas frequentes
  - [ ] Lighthouse Performance > 95
- [ ] Otimização de Backend
  - [ ] Implementar Redis para cache
  - [ ] Cache de resultados de análise
  - [ ] Cache de parâmetros globais
  - [ ] Otimizar queries do PostgreSQL
  - [ ] Implementar connection pooling
- [ ] Fila de Processamento
  - [ ] Implementar fila robusta (BullMQ + Redis)
  - [ ] Workers escaláveis para OCR
  - [ ] Priorização por plano
  - [ ] Dead letter queue para falhas
- [ ] Monitoramento Avançado
  - [ ] APM (Application Performance Monitoring)
  - [ ] Métricas de latência por endpoint
  - [ ] Alertas de degradação
  - [ ] Dashboard de saúde do sistema
- [ ] Infraestrutura
  - [ ] CDN global (Cloudflare)
  - [ ] Auto-scaling para workers
  - [ ] Backup automático diário
  - [ ] Disaster recovery plan
  - [ ] Multi-região (se necessário)

### Critérios de Aceite
- Lighthouse > 95
- Tempo de resposta p95 < 300ms
- Fila processando sem gargalo
- Monitoramento 24/7 ativo
- Backup funcionando diariamente

---

## ETAPA 4.7 — ANALYTICS E BUSINESS INTELLIGENCE

### Descrição
Implementar analytics para entender uso e otimizar negócio.

### Tarefas

- [ ] Implementar tracking de eventos
  - [ ] Pageviews (landing, dashboard, etc.)
  - [ ] Cadastro iniciado / concluído
  - [ ] Plano selecionado
  - [ ] Pagamento iniciado / concluído / falhado
  - [ ] Upload de fatura
  - [ ] Análise concluída / visualizada
  - [ ] PDF exportado / baixado
  - [ ] Tempo na plataforma
- [ ] Dashboard de Analytics (admin)
  - [ ] Funil de conversão: visitante → cadastro → pagamento → análise
  - [ ] Cohort analysis (retenção mensal)
  - [ ] Análise de churn
  - [ ] Revenue por período
  - [ ] MRR (Monthly Recurring Revenue)
  - [ ] LTV (Lifetime Value) por plano
  - [ ] CAC (Custo de Aquisição de Cliente) — se integrado com ads
- [ ] Integrar com ferramentas externas
  - [ ] Google Analytics 4
  - [ ] Hotjar ou Microsoft Clarity (heatmaps)
  - [ ] Mixpanel ou PostHog (product analytics)

### Critérios de Aceite
- Eventos de tracking implementados
- Funil de conversão visível
- Métricas de negócio acessíveis no admin
- Dados confiáveis e consistentes

---

## Resumo de Entregas da Fase 04

| # | Entrega | Status |
|---|---------|--------|
| 4.1 | PWA (Progressive Web App) | ⬜ |
| 4.2 | Machine Learning para Parser | ⬜ |
| 4.3 | Dashboard Profissional Avançado | ⬜ |
| 4.4 | Notificações e Comunicação | ⬜ |
| 4.5 | API Pública | ⬜ |
| 4.6 | Performance e Escala | ⬜ |
| 4.7 | Analytics e BI | ⬜ |

---

*Documento atualizado em: Abril 2026*
*Versão: 1.0*
