# FASE 03 — EXPANSÃO
## Plano Detalhado com Checklist

---

## 📋 Resumo da Fase

| Item | Detalhe |
|------|---------|
| **Objetivo** | Adicionar funcionalidades premium: Mercado Livre, Grid Zero, BESS, Painel Admin |
| **Duração estimada** | 6-8 semanas |
| **Pré-requisito** | Fase 02 concluída e em produção |
| **Resultado esperado** | Produto premium com simulações avançadas e gestão administrativa |

---

## ETAPA 3.1 — SIMULAÇÃO DE MERCADO LIVRE

### Descrição
Permitir que consumidores elegíveis vejam uma estimativa de economia migrando para o Mercado Livre de Energia.

### Tarefas

- [ ] Identificar indícios de mercado livre na fatura
  - [ ] Verificar se já opera no Mercado Livre
  - [ ] Verificar se o consumidor pertence ao Grupo A (todos são elegíveis desde Jan/2024)
  - [ ] Verificar se a demanda contratada é < 500 kW para sinalizar a obrigatoriedade do **Comercializador Varejista**
- [ ] Criar banco de referência de preços do Mercado Livre
  - [ ] Preço médio do MWh por submercado (parametrizável)
  - [ ] Submercados: SE/CO, S, NE, N
  - [ ] Fontes incentivadas: desconto na TUSD (50% ou 100%)
- [ ] Simular cenário de Mercado Livre
  - [ ] Calcular custo atual no Mercado Cativo (ACR)
  - [ ] Calcular custo estimado no Mercado Livre (ACL)
    - [ ] Energia: preço PLD ou contrato médio
    - [ ] TUSD: tarifa de uso do sistema
    - [ ] Encargos setoriais
    - [ ] Gestão e comercialização (estimativa)
  - [ ] Calcular economia mensal e anual estimada
  - [ ] Calcular economia em 5 anos (com cenários)
- [ ] Gerar gráfico comparativo: ACR vs. ACL
- [ ] Gerar tabela com breakdown de custos
- [ ] Adicionar disclaimers obrigatórios:
  - [ ] "Simulação indicativa — valores dependem de negociação"
  - [ ] "Consulte um comercializador de energia autorizado"
  - [ ] "Preços de referência podem variar"
- [ ] Integrar cenário no dashboard
- [ ] Integrar cenário no relatório PDF
- [ ] Atualizar calculadora de CO2 (se aplicável)

### Parâmetros Parametrizáveis
| Parâmetro | Default | Unidade |
|-----------|---------|---------|
| Preço médio MWh (SE/CO) | R$ 180,00 | R$/MWh |
| Preço médio MWh (S) | R$ 175,00 | R$/MWh |
| Preço médio MWh (NE) | R$ 165,00 | R$/MWh |
| Preço médio MWh (N) | R$ 170,00 | R$/MWh |
| Taxa de gestão | R$ 2.500,00 | R$/mês |
| Desconto TUSD incentivada 50% | 50% | % |
| Desconto TUSD incentivada 100% | 100% | % |

### Critérios de Aceite
- Elegibilidade verificada automaticamente
- Simulação gera economia plausível
- Disclaimers sempre exibidos
- Integrado ao dashboard e relatório PDF
- Parâmetros editáveis pelo admin

---

## ETAPA 3.2 — GRID ZERO

### Descrição
Para consumidores que já operam (ou poderão operar) no Mercado Livre, simular cenário com fotovoltaico + Grid Zero.

### Tarefas

- [ ] Verificar se o consumidor opera ou é elegível ao Mercado Livre
- [ ] Simular cenário FV + Mercado Livre (Grid Zero)
  - [ ] Calcular geração FV estimada
  - [ ] Calcular consumo residual da rede
  - [ ] Se consumo residual ≈ 0, classificar como Grid Zero
  - [ ] Calcular investimento total (FV + ML)
  - [ ] Calcular economia vs. cenário atual
  - [ ] Calcular payback do cenário combinado
- [ ] Gerar gráfico: Consumo atual vs. FV + Grid Zero
- [ ] Gerar card de resumo do cenário
- [ ] Integrar cenário no dashboard
- [ ] Integrar cenário no relatório PDF
- [ ] Adicionar disclaimers de viabilidade

### Critérios de Aceite
- Cenário Grid Zero calculado corretamente
- Payback considera investimento total
- Integrado ao dashboard e PDF
- Só aparece quando Mercado Livre é elegível

---

## ETAPA 3.3 — BESS (BATERIA PARA HORÁRIO DE PONTA)

### Descrição
Simular uso de bateria (BESS) para redução de custo no horário de ponta.

### Tarefas

- [ ] Identificar consumo e custo no horário de ponta
  - [ ] Extrair da fatura (se disponível)
  - [ ] Estimar com base em perfis típicos (se não disponível)
- [ ] Simular sistema BESS
  - [ ] Calcular capacidade de bateria necessária (kWh)
  - [ ] Calcular potência do inversor (kW)
  - [ ] Calcular custo do sistema BESS
    - [ ] R$/kWh de bateria (parametrizável, default R$ 2.500)
    - [ ] Custos de instalação (10-15% do equipamento)
  - [ ] Calcular economia no ponta
    - [ ] Diferença de tarifa ponta vs. fora ponta
    - [ ] Energia deslocada por dia
    - [ ] Economia mensal
  - [ ] Calcular payback do BESS
  - [ ] Calcular vida útil (ciclos e anos)
- [ ] Simular cenários combinados:
  - [ ] BESS isolado
  - [ ] FV + BESS
  - [ ] FV + BESS + Grid Zero (se elegível ML)
- [ ] Gerar gráficos:
  - [ ] Curva de carga com e sem BESS
  - [ ] Economia por cenário combinado
  - [ ] Payback comparativo
- [ ] Gerar cards de resumo para cada cenário
- [ ] Integrar no dashboard
- [ ] Integrar no relatório PDF

### Parâmetros Parametrizáveis
| Parâmetro | Default | Unidade |
|-----------|---------|---------|
| Custo BESS | R$ 2.500 | R$/kWh |
| Vida útil da bateria | 10 | anos |
| Ciclos de vida | 5.000 | ciclos |
| Eficiência da bateria | 90% | % |
| Custo de instalação | 12% | % do equipamento |

### Critérios de Aceite
- BESS simulado com valores plausíveis
- Cenários combinados calculados corretamente
- Gráficos exibidos para cada cenário
- Parametrizável pelo admin
- Integrado no dashboard e PDF

---

## ETAPA 3.4 — PAINEL ADMINISTRATIVO

### Descrição
Criar painel administrativo para gestão de parâmetros, usuários e sistema.

### Tarefas

- [ ] Criar role "admin" no sistema de autenticação
- [ ] Criar página admin protegida (`/admin`)
- [ ] Implementar módulos do painel:

#### 3.4.1 — Gestão de Parâmetros
- [ ] Tela de parâmetros globais editáveis:
  - [ ] Valor por Wpico (on-grid): R$ 3,00
  - [ ] Valor por Wpico (híbrido): R$ 6,00
  - [ ] Fator de emissão CO2: 0.0817 kgCO2/kWh
  - [ ] Custo BESS: R$ 2.500/kWh
  - [ ] Preços de referência Mercado Livre (por submercado)
  - [ ] Taxa de gestão Mercado Livre
  - [ ] Perda padrão FV: 22%
  - [ ] Simultaneidade residencial: 30%
  - [ ] Simultaneidade comercial: 50%
  - [ ] Simultaneidade híbrido: 85%
  - [ ] Desconto COSIP: 30%
  - [ ] Margem de segurança demanda: 10%
  - [ ] Textos legais do relatório
- [ ] Histórico de alterações de parâmetros (audit log)
- [ ] Validação de valores (min/max)

#### 3.4.2 — Gestão de Usuários
- [ ] Lista de usuários com filtros (tipo, plano, status)
- [ ] Detalhes do usuário (perfil, plano, pagamentos, análises)
- [ ] Ativar/desativar usuário
- [ ] Alterar plano do usuário manualmente
- [ ] Visualizar histórico de análises do usuário

#### 3.4.3 — Dashboard Administrativo
- [ ] Total de usuários (por tipo e plano)
- [ ] Total de análises realizadas (por período)
- [ ] Receita total (por período)
- [ ] Taxa de sucesso do OCR
- [ ] Concessionárias mais processadas
- [ ] Gráfico de crescimento de usuários
- [ ] Gráfico de receita mensal

#### 3.4.4 — Log de Processamento
- [ ] Visualizar logs de OCR/parsing
- [ ] Filtrar por status (sucesso, falha)
- [ ] Ver detalhes de cada processamento
- [ ] Métricas de confiança médias

### Critérios de Aceite
- Apenas usuários admin acessam o painel
- Parâmetros editáveis e com histórico
- Dashboard com métricas em tempo real
- Gestão de usuários funcional
- Logs de processamento acessíveis

---

## ETAPA 3.5 — MELHORIAS DO PARSER E OCR

### Descrição
Melhorar a precisão do parser com base nos dados coletados na Fase 1 e 2.

### Tarefas

- [ ] Analisar logs de processamento da Fase 1 e 2
  - [ ] Identificar campos com maior taxa de falha
  - [ ] Identificar concessionárias com menor taxa de acerto
- [ ] Criar templates específicos por concessionária
  - [ ] CEMIG: template + testes
  - [ ] CPFL: template + testes
  - [ ] Enel: template + testes
  - [ ] Energisa: template + testes
  - [ ] Light: template + testes
  - [ ] Copel: template + testes
  - [ ] Celesc: template + testes
  - [ ] Equatorial: template + testes
  - [ ] Neoenergia: template + testes
  - [ ] CEEE: template + testes
- [ ] Melhorar prompts de IA para extração
  - [ ] Adicionar exemplos de cada concessionária
  - [ ] Adicionar instruções de fallback
  - [ ] Ajustar para campos que falham frequentemente
- [ ] Implementar pré-processamento de imagem
  - [ ] Remoção de ruído
  - [ ] Ajuste de contraste
  - [ ] Rotação automática
- [ ] Implementar validação cruzada de campos
  - [ ] Consumo × Tarifa ≈ Valor total
  - [ ] Soma de componentes ≈ Total da fatura
- [ ] Atualizar métricas de confiança
- [ ] Meta: taxa de acerto > 85% em campos principais

### Critérios de Aceite
- Taxa de acerto > 85% para campos principais
- No mínimo 10 concessionárias com template dedicado
- Validação cruzada implementada
- Melhorias documentadas e métricas registradas

---

## ETAPA 3.6 — TESTES E DEPLOY DA FASE 03

### Tarefas

- [ ] Testar simulação de Mercado Livre com faturas reais
- [ ] Testar Grid Zero com cenários válidos
- [ ] Testar BESS com parâmetros variados
- [ ] Testar cenários combinados (FV + BESS + ML)
- [ ] Testar painel administrativo completo
- [ ] Testar alteração de parâmetros e impacto nas análises
- [ ] Validar cálculos contra planilha manual
- [ ] Testar parser melhorado com 20+ faturas
- [ ] Corrigir bugs encontrados
- [ ] Deploy em staging
- [ ] Teste de aceitação
- [ ] Deploy em produção
- [ ] Coletar feedback de usuários reais (se disponíveis)

### Critérios de Aceite
- Todas as funcionalidades da Fase 3 testadas
- Cálculos validados
- Painel admin funcional em produção
- Parser com taxa de acerto melhorada

---

## Resumo de Entregas da Fase 03

| # | Entrega | Status |
|---|---------|--------|
| 3.1 | Simulação de Mercado Livre | ⬜ |
| 3.2 | Grid Zero | ⬜ |
| 3.3 | BESS (Baterias) | ⬜ |
| 3.4 | Painel Administrativo | ⬜ |
| 3.5 | Melhorias do Parser/OCR | ⬜ |
| 3.6 | Testes e Deploy | ⬜ |

---

*Documento atualizado em: Abril 2026*
*Versão: 1.0*
