# 📂 APP EnergyAI — Índice Geral do Projeto

---

## Estrutura Completa

```
WG App EnergyAI/
│
├── 📄 PLANO_FINAL_ENERGIA.md ............ Especificação funcional original
├── 📄 INDICE.md .......................... Este arquivo (índice geral)
│
├── 📁 00_PLANEJAMENTO/ ................... Todos os planos e decisões
│   ├── 📄 VISAO_GERAL.md ................ Stack, estrutura, métricas, riscos
│   ├── 📄 ROADMAP_COMPLETO.md ........... Timeline, marcos, dependências
│   ├── 📄 DECISOES_TECNICAS.md .......... Justificativas de cada tecnologia
│   ├── 📄 MELHORIAS_SUGERIDAS.md ........ 15 melhorias priorizadas
│   │
│   ├── 📁 FASE_01_FUNDACAO/
│   │   └── 📄 PLANO_FASE_01.md .......... 8 etapas com checklists detalhados
│   │
│   ├── 📁 FASE_02_ANALISE_AVANCADA/
│   │   └── 📄 PLANO_FASE_02.md .......... 7 etapas: regras A/B, CO2, PDF
│   │
│   ├── 📁 FASE_03_EXPANSAO/
│   │   └── 📄 PLANO_FASE_03.md .......... 6 etapas: ML, Grid Zero, BESS, Admin
│   │
│   └── 📁 FASE_04_OTIMIZACAO/
│       └── 📄 PLANO_FASE_04.md .......... 7 etapas: PWA, ML, API, Escala
│
├── 📁 01_DOCS/ ........................... Documentação técnica
│   ├── 📁 ARQUITETURA/
│   │   ├── 📄 ARQUITETURA_GERAL.md ...... Diagrama, APIs, segurança, env vars
│   │   ├── 📄 BANCO_DE_DADOS.md ......... Todas as tabelas com SQL + Prisma
│   │   └── 📄 INTEGRACOES.md ............ Serviços externos, configs, custos
│   │
│   ├── 📁 UX_UI/
│   │   └── 📄 MAPA_DE_TELAS.md ......... Todas as telas, fluxos, wireframes, design system
│   │
│   ├── 📁 REGRAS_NEGOCIO/
│   │   ├── 📄 GRUPO_A.md ................ Regras Grupo A (demanda, reativo, Verde/Azul, B Optante)
│   │   ├── 📄 GRUPO_B.md ................ Regras Grupo B (solar, híbrido, CO2, exemplo)
│   │   └── 📄 PAGAMENTOS.md ............. Planos, fluxos, gateways, webhooks
│   │
│   └── 📁 LEGAL/
│       └── 📄 LGPD_E_CONFORMIDADE.md .... LGPD, termos, privacidade, disclaimers
│
├── 📁 02_FRONTEND/ ....................... Código frontend (Next.js)
│   └── (será criado na implementação)
│
├── 📁 03_BACKEND/ ........................ Código backend (Node.js)
│   └── (será criado na implementação)
│
├── 📁 04_INFRA/ .......................... Configurações de deploy
│   └── (será criado na implementação)
│
├── 📁 05_TESTES/ ......................... Testes e validação
│   └── 📄 PLANO_DE_TESTES.md ............ Checklists de teste por módulo
│
└── 📁 06_ASSETS/ ......................... Recursos visuais
    └── 📄 README.md ...................... Guia de assets, ícones, cores
```

---

## Resumo dos Documentos Criados

| # | Documento | Descrição | Itens de checklist |
|---|-----------|-----------|-------------------|
| 1 | Visão Geral | Stack, estrutura, métricas | ~6 |
| 2 | Roadmap | Timeline de 4 fases | ~16 marcos |
| 3 | Decisões Técnicas | 12 decisões justificadas | — |
| 4 | Melhorias Sugeridas | 15 features extras priorizadas | — |
| 5 | Plano Fase 01 | 8 etapas detalhadas | ~150 itens |
| 6 | Plano Fase 02 | 7 etapas detalhadas | ~120 itens |
| 7 | Plano Fase 03 | 6 etapas detalhadas | ~100 itens |
| 8 | Plano Fase 04 | 7 etapas detalhadas | ~90 itens |
| 9 | Arquitetura Geral | Diagrama, APIs, segurança | ~40 endpoints |
| 10 | Banco de Dados | 11 tabelas com SQL | ~150 campos |
| 11 | Integrações | 16 serviços com custos | — |
| 12 | Mapa de Telas | 30+ telas, fluxos, wireframes | — |
| 13 | Regras Grupo A | 9 regras com fórmulas | — |
| 14 | Regras Grupo B | 6 regras com exemplo completo | — |
| 15 | Pagamentos | Planos, fluxos, webhooks | — |
| 16 | LGPD e Legal | Conformidade completa | ~30 itens |
| 17 | Plano de Testes | Todos os módulos | ~80 testes |

**Total**: ~17 documentos, ~460+ itens de checklist, 4 fases com 28 etapas.

---

## Como Usar Este Planejamento

1. **Comece pela Visão Geral** — Entenda o projeto como um todo
2. **Leia as Decisões Técnicas** — Entenda por que cada tecnologia foi escolhida
3. **Siga o Roadmap** — Veja a timeline e dependências
4. **Execute por Fase** — Siga os planos de cada fase em ordem
5. **Use os Checklists** — Marque cada item como concluído `[x]`
6. **Consulte os Docs** — Referência técnica durante a implementação
7. **Valide com os Testes** — Use o plano de testes para validar cada entrega

---

*Criado em: Abril 2026*
*Total de documentos: 17*
*Total de check items: 460+*
