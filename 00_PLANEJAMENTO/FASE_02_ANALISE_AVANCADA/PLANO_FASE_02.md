# FASE 02 — ANÁLISE AVANÇADA
## Plano Detalhado com Checklist

---

## 📋 Resumo da Fase

| Item | Detalhe |
|------|---------|
| **Objetivo** | Implementar todas as regras de análise para Grupo A e B, simulações financeiras, CO2 e PDF |
| **Duração estimada** | 8-10 semanas |
| **Pré-requisito** | Fase 01 concluída e em produção |
| **Resultado esperado** | Produto completo com análises profissionais e relatório PDF exportável |

---

## ETAPA 2.1 — REGRAS COMPLETAS GRUPO A

### Descrição
Implementar todas as regras de análise técnica e financeira para consumidores do Grupo A.

### 2.1.1 — Análise de Demanda Contratada

- [ ] Extrair demanda contratada e demanda medida da fatura
- [ ] Buscar histórico de 12 meses (quando disponível)
- [ ] Calcular média de demanda medida dos últimos 12 meses
- [ ] Identificar sobrecontratação
  - [ ] Demanda contratada > 110% da demanda máxima medida
  - [ ] Calcular excesso em kW
  - [ ] Calcular custo mensal do excesso
  - [ ] Calcular economia anual com ajuste
- [ ] Identificar subcontratação
  - [ ] Demanda medida > demanda contratada em algum mês
  - [ ] Calcular multa estimada por ultrapassagem
  - [ ] Sinalizar risco
- [ ] Sugerir demanda ideal
  - [ ] Baseado no histórico + margem de segurança (10%)
  - [ ] Exibir comparativo: atual vs. sugerido
- [ ] Gerar gráfico: Demanda Contratada vs. Demanda Medida (12 meses)
- [ ] Gerar card de economia estimada com ajuste de demanda

### 2.1.2 — Multa por Potência Reativa

- [ ] Identificar cobrança de excedente de reativos na fatura
- [ ] Calcular impacto mensal estimado
- [ ] Calcular impacto anual estimado
- [ ] Gerar recomendação: instalação de banco de capacitores
- [ ] Estimar investimento em correção (parametrizável)
- [ ] Calcular payback da correção
- [ ] Gerar card de alerta com valores

### 2.1.3 — Comparativo Tarifário Verde x Azul

- [ ] Identificar modalidade tarifária atual
- [ ] Simular cenário com tarifa Verde
  - [ ] Calcular custo de demanda única
  - [ ] Calcular custo de energia ponta e fora ponta
  - [ ] Calcular total mensal estimado
- [ ] Simular cenário com tarifa Azul
  - [ ] Calcular custo de demanda ponta e fora ponta
  - [ ] Calcular custo de energia ponta e fora ponta
  - [ ] Calcular total mensal estimado
- [ ] Comparar cenários e recomendar o mais vantajoso
- [ ] Gerar gráfico comparativo (barras lado a lado)
- [ ] Gerar tabela detalhada com breakdown de custos
- [ ] Estimar economia anual com mudança (se aplicável)

### 2.1.4 — Regra B Optante

- [ ] Analisar histórico de demanda medida (12 meses)
- [ ] Verificar se TODOS os meses ficaram abaixo de 112 kW
- [ ] Se elegível, gerar simulação como Grupo B
  - [ ] Calcular custo atual (Grupo A)
  - [ ] Calcular custo estimado como B Optante
  - [ ] Calcular economia potencial
- [ ] Se não elegível, registrar motivo
- [ ] Adicionar disclaimer: "Necessita validação com a concessionária"
- [ ] Gerar card de recomendação

### 2.1.5 — Solar Fotovoltaico (Grupo A)

- [ ] Verificar se há indícios de geração distribuída na fatura
- [ ] Se NÃO houver GD, simular implantação FV
  - [ ] Buscar HSP da localidade (CRESESB/CEPEL)
  - [ ] Calcular potência necessária (Wpico) para abater consumo
  - [ ] Considerar perda de 22%
  - [ ] Calcular investimento estimado (R$/Wp parametrizável)
  - [ ] Calcular economia mensal estimada
  - [ ] Calcular payback simples
  - [ ] Calcular retorno em 25 anos
- [ ] Gerar gráfico: Custo atual vs. Custo com FV
- [ ] Gerar card de investimento e retorno

### Critérios de Aceite (Etapa 2.1)
- Todas as análises geram resultados coerentes para faturas reais Grupo A
- Gráficos e cards renderizados corretamente
- Economia estimada dentro de faixas razoáveis
- Disclaimers exibidos quando necessário
- Testado com no mínimo 5 faturas Grupo A reais

---

## ETAPA 2.2 — REGRAS COMPLETAS GRUPO B

### Descrição
Implementar todas as regras de análise para consumidores do Grupo B.

### 2.2.1 — Análise de Perfil

- [ ] Identificar tipo: Residencial ou Comercial
- [ ] Identificar ligação: Monofásico, Bifásico, Trifásico
- [ ] Calcular consumo médio mensal (12 meses, se disponível)
- [ ] Calcular custo médio por kWh efetivo
- [ ] Identificar taxa mínima aplicável
- [ ] Identificar COSIP
- [ ] Identificar Fio B (se aplicável)
- [ ] Gerar card com perfil completo da unidade

### 2.2.2 — Solar On-Grid

- [ ] Buscar HSP (Horas de Sol Pico) com base no CRESESB/CEPEL
  - [ ] Registrar fonte e localização utilizada
  - [ ] Informar se localização foi precisa ou aproximada
- [ ] Calcular potência necessária em Wpico
  - [ ] Fórmula: `Wpico = Consumo_mensal / (HSP × 30 × (1 - 0.22))`
- [ ] Aplicar fator de simultaneidade
  - [ ] Residencial: 30%
  - [ ] Comercial: 50%
- [ ] Calcular geração estimada mensal
  - [ ] `E_mes = Wpico × HSP × 30 × (1 - 0.22)`
- [ ] Calcular investimento on-grid
  - [ ] `Investimento = Wpico × R$ 3,00/Wp` (parametrizável)
- [ ] Calcular economia mensal
  - [ ] Considerar permanência da taxa mínima OU Fio B (o maior)
  - [ ] Considerar ICMS sobre geração
  - [ ] Considerar COSIP com desconto de 30%
- [ ] Calcular payback on-grid
  - [ ] `Payback = Investimento / Economia_anual_líquida`
- [ ] Gerar gráfico: Conta atual vs. Conta com solar
- [ ] Gerar gráfico: Payback ao longo dos anos (break-even)
- [ ] Gerar card resumo: Investimento, Economia, Payback

### 2.2.3 — Sistema Híbrido com Baterias

- [ ] Aplicar fator de simultaneidade de 85%
- [ ] Calcular potência necessária ampliada (para uso noturno)
- [ ] Calcular investimento híbrido
  - [ ] `Investimento = Wpico × R$ 6,00/Wp` (parametrizável)
- [ ] Calcular geração ampliada (inclui uso noturno via bateria)
- [ ] Calcular economia mensal do sistema híbrido
- [ ] Calcular payback do sistema híbrido
- [ ] Comparar on-grid vs. híbrido
- [ ] Gerar gráfico comparativo: On-Grid vs. Híbrido
- [ ] Gerar card resumo do híbrido

### Critérios de Aceite (Etapa 2.2)
- Análise de perfil identifica corretamente tipo e ligação
- Cálculos de solar on-grid matematicamente corretos
- Cálculos de sistema híbrido matematicamente corretos
- Comparativo on-grid vs. híbrido claro e visualmente atraente
- HSP referenciado com fonte
- Testado com no mínimo 5 faturas Grupo B reais

---

## ETAPA 2.3 — CALCULADORA DE CO2

### Descrição
Calcular e exibir o impacto ambiental da economia de energia.

### Tarefas

- [ ] Implementar fórmula de CO2 evitado
  - [ ] `CO2_evitado = Energia_economizada × Fator_emissão`
  - [ ] Fator de emissão parametrizável (default: 0.0817 kgCO2/kWh — SIN 2024)
- [ ] Calcular indicadores:
  - [ ] CO2 evitado por mês (kg)
  - [ ] CO2 evitado por ano (kg)
  - [ ] CO2 evitado em 5 anos (kg)
  - [ ] CO2 evitado em 25 anos (kg)
- [ ] Calcular equivalências visuais:
  - [ ] Árvores equivalentes plantadas (1 árvore ≈ 22kg CO2/ano)
  - [ ] Km de carro não percorridos (1 km ≈ 0.21 kg CO2)
  - [ ] Equivalência em dispositivos carregados
- [ ] Criar componente visual de CO2
  - [ ] Ícone de árvores
  - [ ] Ícone de carro
  - [ ] Números em destaque com cor verde
  - [ ] Animação sutil nos números
- [ ] Integrar no dashboard de resultado
- [ ] Integrar no relatório PDF
- [ ] Aplicar para todos os cenários que geram economia

### Critérios de Aceite
- CO2 calculado para todos os cenários de economia
- Equivalências visuais exibidas corretamente
- Valores matematicamente corretos
- Fator de emissão parametrizável pelo admin

---

## ETAPA 2.4 — SIMULAÇÕES FINANCEIRAS INTEGRADAS

### Descrição
Consolidar todas as simulações financeiras em uma visão integrada.

### Tarefas

- [ ] Criar página de cenários (`/analise/[id]/cenarios`)
- [ ] Para Grupo A, apresentar cenários:
  - [ ] Cenário 1: Ajuste de demanda
  - [ ] Cenário 2: Correção de reativo
  - [ ] Cenário 3: Mudança tarifária (Verde/Azul)
  - [ ] Cenário 4: B Optante (se elegível)
  - [ ] Cenário 5: Solar fotovoltaico
  - [ ] Cenário combinado: soma das economias aplicáveis
- [ ] Para Grupo B, apresentar cenários:
  - [ ] Cenário 1: Solar on-grid
  - [ ] Cenário 2: Sistema híbrido com baterias
  - [ ] Comparativo: on-grid vs. híbrido
- [ ] Gerar gráfico de barras: Economia por cenário
- [ ] Gerar gráfico de linha: Payback ao longo do tempo
- [ ] Gerar tabela consolidada de economias
- [ ] Permitir seleção de cenários para o relatório
- [ ] Destacar cenário de melhor custo-benefício
- [ ] Exibir resumo financeiro do melhor cenário:
  - [ ] Investimento necessário
  - [ ] Economia mensal estimada
  - [ ] Economia anual estimada
  - [ ] Payback em meses
  - [ ] Retorno em 5 / 10 / 25 anos

### Critérios de Aceite
- Todos os cenários aplicáveis são apresentados
- Cenário combinado soma corretamente
- Gráficos financeiros claros e informativos
- Payback calculado para cada cenário
- Cenário de melhor custo-benefício destacado

---

## ETAPA 2.5 — RELATÓRIO PDF PROFISSIONAL

### Descrição
Gerar relatório PDF exportável com qualidade profissional.

### Tarefas

- [ ] Escolher biblioteca de geração de PDF
  - Recomendação: `@react-pdf/renderer` ou `puppeteer` para HTML→PDF
- [ ] Criar template do relatório com seções:
  - [ ] **Capa**
    - Logo do sistema
    - Nome do cliente
    - Concessionária
    - Data da análise
    - Número da análise
  - [ ] **Resumo Executivo** (1 página)
    - Classificação da unidade
    - Principal oportunidade de economia
    - Investimento estimado
    - Payback estimado
    - CO2 evitado
  - [ ] **Dados Extraídos da Fatura**
    - Tabela com todos os campos
    - Nível de confiança por campo
    - Observações sobre campos ausentes
  - [ ] **Análise Técnica**
    - Detalhamento por regra aplicada
    - Gráficos de demanda (Grupo A)
    - Perfil de consumo (Grupo B)
    - Comparativos tarifários
  - [ ] **Análise Financeira**
    - Cenários simulados com detalhes
    - Tabela de investimento x retorno
    - Gráfico de payback
  - [ ] **Impacto Ambiental**
    - CO2 evitado (mês, ano, 5 anos)
    - Equivalências visuais
  - [ ] **Recomendações**
    - Lista priorizada de ações
    - Urgência de cada recomendação
    - Próximos passos sugeridos
  - [ ] **Premissas Utilizadas**
    - Tabela com todos os parâmetros usados
    - Fonte do HSP
    - Valores de referência
  - [ ] **Avisos Legais**
    - Texto de responsabilidade obrigatório
    - Nota sobre caráter estimativo
  - [ ] **Rodapé**
    - Número de páginas
    - Data de geração
    - Versão do sistema
- [ ] Implementar botão "Exportar PDF" no dashboard
- [ ] Implementar geração assíncrona (fila)
- [ ] Implementar notificação quando PDF estiver pronto
- [ ] Armazenar PDF gerado no S3/R2
- [ ] Implementar link de download seguro (signed URL)
- [ ] Testar formatação com diferentes volumes de dados
- [ ] Testar com faturas Grupo A e Grupo B
- [ ] Garantir que gráficos são renderizados no PDF
- [ ] Otimizar tamanho do arquivo (< 5MB)

### Critérios de Aceite
- PDF gerado com todas as seções obrigatórias
- Gráficos renderizados corretamente no PDF
- Formatação profissional e consistente
- Avisos legais sempre presentes
- Tempo de geração < 15 segundos
- PDF armazenado e download funcional

---

## ETAPA 2.6 — DASHBOARD ENRIQUECIDO

### Descrição
Melhorar o dashboard com todos os dados da Fase 2.

### Tarefas

- [ ] Adicionar seção de cenários de economia no dashboard
- [ ] Adicionar indicadores de CO2
- [ ] Adicionar gráficos comparativos
- [ ] Implementar tabs/abas no dashboard:
  - [ ] Visão Geral
  - [ ] Dados da Fatura
  - [ ] Análise Técnica
  - [ ] Cenários de Economia
  - [ ] Impacto Ambiental
- [ ] Implementar botão de exportação PDF no header
- [ ] Melhorar animações e transições
- [ ] Adicionar tooltips explicativos nos gráficos
- [ ] Otimizar carregamento (lazy loading de seções)
- [ ] Testar responsividade completa

### Critérios de Aceite
- Dashboard exibe todas as análises da Fase 2
- Navegação por tabs funcional
- Exportação PDF acessível
- Responsivo em todos os dispositivos
- Tempo de carregamento < 3 segundos

---

## ETAPA 2.7 — TESTES E DEPLOY DA FASE 02

### Tarefas

- [ ] Testar todas as regras de Grupo A com faturas reais
- [ ] Testar todas as regras de Grupo B com faturas reais
- [ ] Validar cálculos manualmente (planilha de validação)
- [ ] Testar geração de PDF com todas as variações
- [ ] Testar calculadora de CO2
- [ ] Testar cenários combinados
- [ ] Corrigir bugs encontrados
- [ ] Performance test do dashboard enriquecido
- [ ] Deploy em staging
- [ ] Teste de aceitação em staging
- [ ] Deploy em produção
- [ ] Smoke test em produção

### Critérios de Aceite
- Todas as funcionalidades da Fase 2 testadas e funcionando
- Cálculos validados contra planilha manual
- PDF gerado sem erros
- Performance aceitável
- Deploy em produção estável

---

## Resumo de Entregas da Fase 02

| # | Entrega | Status |
|---|---------|--------|
| 2.1 | Regras completas Grupo A | ⬜ |
| 2.2 | Regras completas Grupo B | ⬜ |
| 2.3 | Calculadora de CO2 | ⬜ |
| 2.4 | Simulações financeiras integradas | ⬜ |
| 2.5 | Relatório PDF profissional | ⬜ |
| 2.6 | Dashboard enriquecido | ⬜ |
| 2.7 | Testes e deploy | ⬜ |

---

*Documento atualizado em: Abril 2026*
*Versão: 1.0*
