# Especificação Funcional - APP Energia

## 1. Objetivo
O APP Energia é uma aplicação web para leitura de faturas de energia em PDF, análise automática de consumo e custos, geração de relatórios técnicos e financeiros, e simulação de oportunidades de economia para consumidores dos Grupos A e B.

O produto atende:
- Usuários profissionais por assinatura mensal
- Usuários clientes por consulta avulsa

## 2. Escopo do Produto
O sistema deve:
- Permitir cadastro, login e recuperação de acesso
- Diferenciar usuários profissionais e usuários clientes
- Cobrar assinatura mensal de profissionais
- Cobrar consulta avulsa de clientes
- Aceitar upload de faturas em PDF
- Ler faturas de qualquer concessionária
- Extrair dados relevantes com OCR e parser inteligente
- Classificar a unidade consumidora em Grupo A ou Grupo B
- Aplicar regras técnicas e financeiras por grupo
- Gerar gráficos e relatório executivo
- Apresentar estimativas de economia, payback e redução de CO2
- Exportar relatório em PDF

## 3. Perfis de Usuário

### 3.1 Usuário Profissional
Público: consultores, integradores, engenheiros e empresas de energia.

Regras:
- Deve se cadastrar
- Deve escolher um plano
- Deve informar forma de pagamento
- Pode consultar múltiplas faturas conforme limite do plano

Planos:
- Starter: até 10 faturas/mês por R$ 49,90
- Pro: até 50 faturas/mês por R$ 199,00
- Premium: ilimitado por R$ 699,00

### 3.2 Usuário Cliente
Público: consumidor final.

Regras:
- Deve se cadastrar
- Não possui assinatura
- Paga R$ 99,00 por análise realizada

## 4. Módulos Funcionais

### 4.1 Landing Page Pública
Objetivo: explicar o produto antes do cadastro.

Deve conter:
- Proposta de valor
- Explicação simples de funcionamento
- Benefícios práticos
- Demonstração visual do processo
- Exemplo de análise para Grupo A
- Exemplo de análise para Grupo B
- Demonstração de economia financeira
- Demonstração de redução de CO2
- CTA para cadastro e login

### 4.2 Autenticação e Conta
Funcionalidades:
- Cadastro de usuário
- Login
- Logout
- Recuperação de senha
- Edição de perfil
- Aceite de termos de uso e privacidade

Campos mínimos:
- Nome
- E-mail
- Telefone
- Senha
- Tipo de usuário

Campos adicionais para profissional:
- Empresa
- CNPJ/CPF
- Plano contratado

### 4.3 Pagamentos
Gateways:
- Mercado Pago
- Stripe

Funcionalidades:
- Pagamento por Pix
- Pagamento por cartão de crédito
- Assinatura recorrente para profissionais
- Cobrança avulsa para clientes
- Histórico de pagamentos
- Status do pagamento
- Bloqueio de uso em caso de inadimplência do profissional
- Liberação da análise após confirmação do pagamento

### 4.4 Upload de Faturas
Regras:
- Aceitar apenas PDF
- Validar tamanho e integridade do arquivo
- Armazenar documento com vínculo ao usuário
- Associar cada fatura a uma consulta

Fluxo:
1. Usuário seleciona arquivo
2. Sistema valida formato
3. Sistema registra envio
4. Sistema inicia OCR e parser
5. Sistema informa progresso
6. Sistema entrega resultado ou alerta de falha

### 4.5 Leitura Inteligente da Fatura
Objetivo: extrair dados mesmo com diferentes layouts de concessionárias.

Funções:
- OCR do PDF
- Parser orientado por padrões
- Identificação de campos relevantes
- Cálculo de confiança por campo
- Classificação automática do grupo tarifário

Campos esperados:
- Nome do cliente
- Concessionária
- Unidade consumidora
- Classe e subclasse
- Modalidade tarifária
- Grupo tarifário
- Tipo de atendimento
- Consumo mensal
- Demanda contratada
- Demanda medida
- Histórico de 12 meses
- Valores de impostos e encargos
- Potência reativa
- COSIP
- Fio B
- Taxa mínima
- Indícios de GD
- Indícios de mercado livre

Regras de qualidade:
- Se campo relevante estiver ausente ou com baixa confiança, sinalizar no relatório
- Manter rastreabilidade do valor extraído e da confiança da leitura

### 4.6 Classificação da Unidade
Classificação obrigatória:
- Grupo A
- Grupo B

Identificação complementar:
- Monofásico
- Bifásico
- Trifásico
- Média tensão
- Alta tensão
- Residencial
- Comercial
- Industrial, quando identificável

## 5. Regras Funcionais de Análise

### 5.1 Grupo A
Ao identificar Grupo A, executar:

1. Análise de demanda contratada
- Comparar demanda contratada x demanda medida
- Usar histórico de 12 meses quando disponível
- Identificar sobrecontratação e subcontratação
- Sugerir ajuste
- Estimar economia anual

2. Multa por potência reativa
- Identificar ocorrência
- Calcular impacto estimado
- Sinalizar recomendação corretiva

3. Comparativo Verde x Azul
- Simular cenário atual
- Simular alternativa horossazonal Verde
- Simular alternativa horossazonal Azul
- Recomendar alternativa mais vantajosa

4. Regra B Optante
- Identificar maior pico de demanda do histórico
- Se nenhum mês ultrapassar 112 kW, sinalizar elegibilidade potencial
- Gerar comparação entre cenário atual e B Optante
- Destacar necessidade de validação especializada

5. Mercado Livre
- Verificar indícios de elegibilidade ou operação
- Gerar estimativa preliminar de economia
- Explicitar que a simulação é indicativa

6. Solar fotovoltaico
- Se não houver indício de injeção, simular implantação FV
- Estimar redução de consumo da rede
- Estimar investimento e retorno

7. Grid Zero
- Se houver operação no mercado livre, incluir cenário FV com Grid Zero
- Calcular cenário estimado de ganho

8. BESS
- Simular bateria para horário de ponta
- Apresentar economia potencial
- Permitir cenário combinado com FV e/ou Grid Zero

### 5.2 Grupo B
Ao identificar Grupo B, executar:

1. Análise de perfil
- Identificar residencial ou comercial
- Identificar tipo de ligação
- Calcular consumo médio

2. Solar on-grid
- Usar HSP com base no CRESESB/CEPEL
- Calcular potência necessária em Wpico
- Considerar perda padrão de 22%
- Considerar simultaneidade:
- Residencial: 30%
- Comercial: 50%

3. Investimento on-grid
- Usar R$ 3,00 por Wpico
- Manter valor parametrizável

4. Payback on-grid
- Considerar permanência de taxa mínima ou fio B, o maior
- Considerar ICMS
- Considerar COSIP com desconto de 30%

5. Sistema híbrido com baterias
- Aplicar simultaneidade de 85%
- Usar R$ 6,00 por Wpico
- Calcular geração ampliada para uso noturno
- Estimar investimento, economia e payback

## 6. Regras de Cálculo

### 6.1 HSP
Fonte obrigatória:
- CRESESB/CEPEL, portal Sundata

Requisitos:
- Registrar no relatório a origem do HSP
- Informar se a localização foi precisa ou aproximada

### 6.2 Fórmulas Base
Geração estimada mensal:

E_mes = Wp x HSP x 30 x (1 - 0,22)

Payback simples:

Payback = Investimento / Economia anual líquida

CO2 evitado:

CO2_evitado = Energia economizada (kWh) x Fator de emissão (kgCO2/kWh)

### 6.3 Parametrização Administrativa
Configurações obrigatórias:
- Valor por Wpico do on-grid
- Valor por Wpico do híbrido
- Fator de emissão de CO2
- Premissas auxiliares de cálculo
- Textos legais do relatório

## 7. Calculadora de CO2
Indicadores obrigatórios:
- CO2 evitado por mês
- CO2 evitado por ano
- CO2 evitado em 5 anos

Indicadores visuais desejáveis:
- Equivalência em árvores
- Equivalência em km não emitidos
- Equivalência ambiental simplificada

Exibição obrigatória:
- Dashboard do resultado
- Relatório exportado
- Cenários com economia energética ou geração distribuída

## 8. Relatórios e Saídas

### 8.1 Dashboard do Resultado
Deve mostrar:
- Resumo da fatura
- Grupo identificado
- Custo atual estimado
- Perdas identificadas
- Economia potencial
- Payback
- CO2 evitado
- Principais recomendações
- Gráficos comparativos

### 8.2 Relatório PDF
Deve conter:
- Capa com identificação do cliente
- Resumo executivo
- Dados extraídos da fatura
- Nível de confiança dos dados relevantes
- Análise técnica
- Análise financeira
- Cenários simulados
- Recomendações
- Premissas utilizadas
- Observação jurídica e técnica
- Gráficos
- Conclusão final

## 9. UX/UI
Diretrizes visuais:
- Azul marinho como cor predominante
- Laranja como cor secundária
- Verde para sustentabilidade, economia e ganho ambiental
- Vermelho para perdas, multas e alertas

Elementos obrigatórios:
- Cards de KPI
- Gráficos de linha
- Gráficos de barras
- Barras vermelhas para perdas
- Layout responsivo
- Experiência clara em desktop e mobile

## 10. Requisitos Não Funcionais
- Aplicação web responsiva
- Autenticação segura
- Armazenamento seguro dos PDFs
- Rastreabilidade dos cálculos
- Desempenho aceitável para leitura e análise
- Compatibilidade com PDFs de diferentes concessionárias
- Escalabilidade para aumento de volume de consultas
- Conformidade com LGPD
- Trilha de auditoria para premissas e resultados

## 11. Avisos de Responsabilidade
Texto obrigatório no sistema e no relatório:

Os resultados apresentados possuem caráter estimativo e informativo, baseados nos dados extraídos da fatura e nas premissas parametrizadas no sistema. Decisões contratuais, regulatórias, tarifárias, de engenharia ou investimento devem ser validadas por análise técnica detalhada.

## 12. Regras de Negócio
- Usuário profissional só pode analisar dentro do limite do plano, exceto Premium
- Usuário cliente só pode visualizar relatório após pagamento confirmado
- Cada upload deve gerar uma consulta individual
- O sistema deve bloquear nova análise se houver falha de pagamento
- O sistema deve manter histórico de análises por usuário
- O sistema deve registrar data, hora e parâmetros usados em cada relatório
- O sistema deve sinalizar baixa confiança de leitura quando aplicável

## 13. Roadmap Funcional

### Fase 1
- Landing page
- Cadastro e login
- Pagamento
- Upload PDF
- OCR e parser inicial
- Classificação Grupo A/B
- Relatório básico com gráficos

### Fase 2
- Regras avançadas Grupo A
- Regras avançadas Grupo B
- Simulações financeiras
- Exportação PDF
- Calculadora de CO2

### Fase 3
- Mercado livre
- Grid Zero
- BESS
- Melhorias de precisão do parser
- Painel administrativo completo de parâmetros

## 14. Critérios de Aceite de Alto Nível
- O usuário consegue se cadastrar, pagar e enviar uma fatura em PDF
- O sistema extrai os principais dados da fatura e informa o nível de confiança
- O sistema identifica corretamente Grupo A ou Grupo B quando houver dados suficientes
- O sistema gera pelo menos um cenário de economia compatível com o grupo identificado
- O sistema apresenta relatório visual e exportável
- O sistema mostra cálculo de CO2 evitado
- O sistema aplica corretamente limite de uso por plano

## 15. Próximos Passos Recomendados
1. Detalhar em histórias de usuário e critérios de aceite por tela
2. Transformar em arquitetura técnica com banco de dados, APIs e integrações
3. Montar mapa completo de telas e navegação do produto
