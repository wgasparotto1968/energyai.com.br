# Regras de Negócio - Grupo A

## Consumidores de Média e Alta Tensão

---

## 1. Identificação do Grupo A

O consumidor é classificado como Grupo A quando:
- Modalidade tarifária é Azul ou Verde
- Subgrupo tarifário é A1, A2, A3, A3a, A4 ou AS
- Tensão de fornecimento ≥ 2,3 kV
- Possui demanda contratada

---

## 2. Análise de Demanda Contratada

### Conceito
A demanda contratada é o valor de potência (kW) que o consumidor contrata com a distribuidora.
Se a demanda medida for muito menor que a contratada, ele paga por potência não utilizada.
Se ultrapassar, paga multa.

### Regras de Cálculo

**Sobrecontratação** (está pagando demais):
```
SE demanda_contratada > (demanda_max_12m × 1.10)
ENTÃO sobrecontratacao = demanda_contratada - (demanda_max_12m × 1.10)
     custo_mensal_excesso = sobrecontratacao × tarifa_demanda
     economia_anual = custo_mensal_excesso × 12
```

**Subcontratação** (risco de multa):
```
SE demanda_medida > demanda_contratada (em qualquer mês)
ENTÃO ultrapassagem = demanda_medida - demanda_contratada
     SE ultrapassagem ≤ 5% da demanda_contratada:
         multa = ultrapassagem × tarifa_demanda × 2
     SE ultrapassagem > 5% da demanda_contratada:
         multa = ultrapassagem × tarifa_demanda × 3
```

**Demanda Ideal Sugerida**:
```
demanda_ideal = demanda_max_12m × (1 + margem_seguranca)
margem_seguranca = 0.10 (10%, parametrizável)
```

### Dados Necessários
- Demanda contratada (kW)
- Demanda medida dos últimos 12 meses (kW)
- Tarifa de demanda vigente (R$/kW)

### Saída
- Gráfico: Demanda contratada (linha) vs. Demanda medida (barras) — 12 meses
- Card: Economia estimada com ajuste (R$/mês e R$/ano)
- Recomendação textual

---

## 3. Multa por Potência Reativa (Excedente de Reativos)

### Conceito
O fator de potência mínimo exigido pela ANEEL é 0,92. Abaixo disso, a distribuidora cobra
excedente de reativos (EREX).

### Regras de Cálculo
```
SE fator_potencia < 0.92 (identificado na fatura)
ENTÃO custo_reativo_mensal = valor_cobrado_reativo
     custo_reativo_anual = custo_reativo_mensal × 12
     
     investimento_capacitores = estimativa_parametrizavel
     payback_capacitores = investimento_capacitores / custo_reativo_anual
```

### Saída
- Card de alerta (vermelho): Valor cobrado por reativo
- Recomendação: Instalação de banco de capacitores
- Estimativa de payback da correção

---

## 4. Comparativo Tarifário Verde x Azul

### Conceito
Consumidores do Grupo A (subgrupos A3a e A4) podem escolher entre:
- **Tarifa Azul**: demanda separada ponta e fora ponta
- **Tarifa Verde**: demanda única + energia ponta mais cara

### Regras de Simulação

**Cenário Azul:**
```
custo_azul = (demanda_ponta × tarifa_demanda_ponta)
           + (demanda_fora_ponta × tarifa_demanda_fora_ponta)
           + (consumo_ponta × tarifa_energia_ponta_azul)
           + (consumo_fora_ponta × tarifa_energia_fora_ponta_azul)
```

**Cenário Verde:**
```
custo_verde = (demanda_unica × tarifa_demanda_verde)
            + (consumo_ponta × tarifa_energia_ponta_verde)
            + (consumo_fora_ponta × tarifa_energia_fora_ponta_verde)
```

**Recomendação:**
```
SE custo_verde < custo_azul × 0.97  → Recomendar Verde (>3% economia)
SE custo_azul < custo_verde × 0.97  → Recomendar Azul (>3% economia)
SE diferença < 3%                    → Manter atual (diferença insignificante)
```

### Saída
- Tabela comparativa detalhada
- Gráfico de barras lado a lado
- Economia anual estimada com mudança

---

## 5. Regra B Optante

### Conceito
Consumidores do Grupo A com demanda medida consistentemente baixa podem solicitar
migração para Grupo B (tarifa mais simples, potencialmente mais barata).

### Regras
```
SE MAX(demanda_medida_12m) < 112 kW
ENTÃO elegivel_b_optante = true
     
     custo_atual_a = custo_total_medio_12m
     custo_estimado_b = consumo_medio × tarifa_b + cosip + taxa_minima
     economia_mensal = custo_atual_a - custo_estimado_b
```

### Importante
- Resultado é **indicativo** — necessita validação com a concessionária
- Nem todas as concessionárias permitem B Optante facilmente
- Disclaimer obrigatório no relatório

### Saída
- Card de elegibilidade (verde se elegível, cinza se não)
- Comparativo: Custo Grupo A vs. Custo estimado Grupo B
- Disclaimer de validação

---

## 6. Solar Fotovoltaico (Grupo A)

### Regras
```
SE has_distributed_gen == false:
    potencia_wp = consumo_mensal / (HSP × 30 × (1 - perda))
    investimento = potencia_wp × custo_por_wp
    geracao_mensal = potencia_wp × HSP × 30 × (1 - perda)
    economia_mensal = geracao_mensal × tarifa_energia
    payback_meses = investimento / (economia_mensal × 12 / 12)
```

### Saída
- Potência recomendada (kWp)
- Investimento estimado
- Economia mensal e anual
- Payback em meses
- Gráfico de break-even

---

## 7. Mercado Livre (Fase 3)

### Elegibilidade (Regra a partir de Jan/2024)
```
SE demanda_contratada ≥ 500 kW → Consumidor Livre (qualquer fonte)
SE demanda_contratada ≥ 75 kW  → Consumidor Especial (fontes incentivadas)
```

### Saída
- Indicativo de economia com migração
- Disclaimers obrigatórios

---

## 8. Grid Zero (Fase 3)

### Conceito
FV + Mercado Livre onde a geração FV cobre 100% do consumo.

### Regras
```
SE elegivel_mercado_livre:
    geracao_fv = consumo_total
    consumo_rede = 0
    economia = custo_atual - custo_tusd_apenas
```

---

## 9. BESS (Fase 3)

### Conceito
Bateria para deslocar consumo do horário de ponta para fora ponta.

### Regras
```
energia_ponta_diaria = consumo_ponta / 22  (dias úteis)
capacidade_bateria = energia_ponta_diaria / eficiencia_bateria
custo_bess = capacidade_bateria × custo_por_kwh_bess
economia_mensal = energia_ponta × (tarifa_ponta - tarifa_fora_ponta)
payback_bess = custo_bess / (economia_mensal × 12 / 12)
```

---

*Documento atualizado em: Abril 2026*
*Versão: 1.0*
