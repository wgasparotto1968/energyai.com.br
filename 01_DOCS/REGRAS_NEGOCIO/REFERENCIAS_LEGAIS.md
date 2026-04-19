# Referências Legais e Normativas - APP EnergyAI

Este documento consolida as leis, resoluções e normas utilizadas como base para as tomadas de decisão, cálculos e inteligência do sistema.

## 1. Agência Nacional de Energia Elétrica (ANEEL)

### Resolução Normativa nº 1.000/2021
- **Descrição**: Regras de Prestação do Serviço Público de Distribuição de Energia Elétrica.
- **Impacto no Sistema**:
  - **Fator de Potência**: Define o limite mínimo de 0,92 para o fator de potência (Base para o cálculo de multa de reativo no `GRUPO_A.md`).
  - **Ultrapassagem de Demanda**: Define a tolerância de 5% sobre a demanda contratada antes da aplicação de penalidades em dobro ou triplo.
  - **B-Optante**: Define os critérios de elegibilidade para unidades do Grupo A faturarem com tarifas do Grupo B.
  - **Tarifa Branca (Grupo B)**: Modalidade com três postos horários (Ponta, Intermediária e Fora Ponta). Com consultas públicas em andamento para adoção compulsória em unidades com consumo superior a 1.000 kWh/mês.

### Lei nº 14.300/2022 (Marco Legal da Geração Distribuída)
- **Descrição**: Institui o marco legal da micro e minigeração distribuída, o Sistema de Compensação de Energia Elétrica (SCEE).
- **Impacto no Sistema**:
  - **Fio B / Valoração dos Créditos**: Base para simulações financeiras de payback de sistemas solares (`GRUPO_B.md`).
  - **Custo de Disponibilidade**: Cálculo do pagamento mínimo para quem injeta energia na rede.

### Portaria MME nº 50/2022 e REN ANEEL nº 1.081/2023 (Mercado Livre)
- **Descrição**: Abertura do Mercado Livre de Energia para todos os consumidores de alta tensão.
- **Impacto no Sistema**:
  - **Elegibilidade Grupo A**: Desde 1º de janeiro de 2024, **todos os consumidores do Grupo A** podem migrar para o Mercado Livre, independentemente da demanda contratada.
  - **Comercializador Varejista**: Consumidores com demanda inferior a 500 kW são obrigados a migrar sendo representados por um **Comercializador Varejista**.

## 2. Parâmetros a serem incluídos no Banco de Dados (Tabela `ParametrosRegulatorios`)

| Parâmetro (Nome no DB) | Valor Vigente | Unidade | Referência Legal |
|------------------------|---------------|---------|------------------|
| `fator_potencia_minimo`| 0.92 | Decimal | REN 1.000/2021 - ANEEL |
| `tolerancia_demanda` | 0.05 | Percentual | REN 1.000/2021 - ANEEL |
| `demanda_minima_livre` | 0 | kW | Portaria MME 50/2022 (Abertura Grupo A) |
| `demanda_obrigacao_varejista`| 500 | kW | REN 1.081/2023 - ANEEL |
| `consumo_compulsorio_branca` | 1000 | kWh | Consulta Pública / ANEEL |

*Nota: Sempre que uma resolução mudar, o sistema deve ser atualizado através do Painel Administrativo, garantindo que os novos cálculos usem o `DataVigencia` correto.*