# Roadmap Completo - APP EnergyAI

## Timeline Geral

```
FASE 01 - FUNDAÇÃO          ████████████░░░░░░░░░░░░░░░░░░  ~8-10 semanas
FASE 02 - ANÁLISE AVANÇADA  ░░░░░░░░░░░░████████████░░░░░░  ~8-10 semanas
FASE 03 - EXPANSÃO          ░░░░░░░░░░░░░░░░░░░░░░░░██████  ~6-8 semanas
FASE 04 - OTIMIZAÇÃO        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░██  Contínuo
```

---

## FASE 01 — FUNDAÇÃO (Semanas 1-10)

### Objetivo
Criar o MVP funcional: usuário consegue se cadastrar, pagar, enviar PDF e receber análise básica.

### Marcos (Milestones)

| Semana | Entrega | Critério de Aceite |
|--------|---------|-------------------|
| 1-2 | Ambiente configurado + Landing Page | Deploy em staging, página acessível |
| 3-4 | Autenticação completa | Cadastro, login, logout, recuperação funcionando |
| 4-5 | Integração de pagamento | Pix e cartão processando em sandbox |
| 6-7 | Upload + OCR básico | PDF aceito, texto extraído e armazenado |
| 8-9 | Classificação A/B + Dashboard básico | Grupo identificado, dados exibidos |
| 10 | Testes + Correções + Deploy | MVP em produção |

### Entregas
- Landing page responsiva com CTA
- Sistema de autenticação completo
- Integração Mercado Pago + Stripe
- Upload de PDF com validação
- Extração OCR básica
- Classificação Grupo A / Grupo B
- Dashboard com dados extraídos
- Relatório básico com gráficos simples

---

## FASE 02 — ANÁLISE AVANÇADA (Semanas 11-20)

### Objetivo
Implementar todas as regras de negócio, simulações financeiras, exportação PDF e calculadora de CO2.

### Marcos (Milestones)

| Semana | Entrega | Critério de Aceite |
|--------|---------|-------------------|
| 11-12 | Regras completas Grupo A | Demanda, reativo, Verde/Azul funcionando |
| 13-14 | Regras completas Grupo B | Solar on-grid, híbrido, payback |
| 15-16 | Simulações financeiras | Cenários calculados e exibidos |
| 17 | Calculadora de CO2 | Indicadores calculados e visuais |
| 18-19 | Exportação PDF profissional | PDF gerado com capa, gráficos, dados |
| 20 | Testes + Correções + Deploy | Fase 2 em produção |

### Entregas
- Análise de demanda contratada (Grupo A)
- Multa por potência reativa (Grupo A)
- Comparativo Verde x Azul (Grupo A)
- Regra B Optante (Grupo A)
- Análise solar on-grid (Grupo B)
- Sistema híbrido com baterias (Grupo B)
- Calculadora de CO2 com equivalências
- Relatório PDF profissional completo
- Dashboard enriquecido com cenários

---

## FASE 03 — EXPANSÃO (Semanas 21-28)

### Objetivo
Adicionar funcionalidades premium: mercado livre, grid zero, BESS, painel administrativo.

### Marcos (Milestones)

| Semana | Entrega | Critério de Aceite |
|--------|---------|-------------------|
| 21-22 | Simulação Mercado Livre | Estimativa de economia gerada |
| 23-24 | Grid Zero + BESS | Cenários combinados funcionando |
| 25-26 | Painel Administrativo | Parâmetros editáveis pelo admin |
| 27-28 | Melhorias de parser + Testes | Precisão melhorada, deploy |

### Entregas
- Simulação de Mercado Livre
- Cenário Grid Zero (FV + ML)
- Simulação BESS (bateria para ponta)
- Cenários combinados (FV + Grid Zero + BESS)
- Painel admin para parâmetros globais
- Parser melhorado com mais concessionárias
- Melhorias de UX baseadas em feedback

---

## FASE 04 — OTIMIZAÇÃO (Semana 29+)

### Objetivo
Escalar o produto, melhorar precisão com ML, implementar PWA e features de retenção.

### Marcos (Milestones)

| Período | Entrega | Critério de Aceite |
|---------|---------|-------------------|
| Sem 29-30 | PWA + Notificações | App instalável, push funcionando |
| Sem 31-32 | ML para parser | Taxa de acerto > 90% |
| Sem 33-34 | Dashboard profissional avançado | Gestão de clientes completa |
| Sem 35+ | Escala + API pública | Infra dimensionada, API documentada |

### Entregas
- PWA (Progressive Web App)
- Machine Learning para melhorar OCR
- Dashboard de gestão de clientes para profissionais
- Notificações por e-mail e WhatsApp
- API pública para integradores
- White-label para grandes clientes
- Otimizações de performance
- Analytics avançado

---

## Dependências entre Fases

```
FASE 01 ──→ FASE 02 ──→ FASE 03
   │            │            │
   │            │            └──→ FASE 04 (contínua)
   │            │
   │            └── Depende: OCR, classificação, auth, pagamento
   │
   └── Depende: Nada (início do zero)
```

---

## Critérios de Go/No-Go entre Fases

### Fase 01 → Fase 02
- [ ] Upload de PDF funcionando em produção
- [ ] OCR extraindo > 70% dos campos corretamente
- [ ] Pagamento processando (sandbox validado)
- [ ] Pelo menos 5 faturas de diferentes concessionárias testadas

### Fase 02 → Fase 03
- [ ] Todas as regras de Grupo A implementadas e testadas
- [ ] Todas as regras de Grupo B implementadas e testadas
- [ ] PDF exportado com qualidade profissional
- [ ] Pelo menos 20 análises completas validadas

### Fase 03 → Fase 04
- [ ] Mercado Livre simulando corretamente
- [ ] BESS e Grid Zero gerando cenários válidos
- [ ] Painel admin funcional
- [ ] Feedback de pelo menos 10 usuários reais

---

*Documento atualizado em: Abril 2026*
*Versão: 1.0*
