# Regras de Negócio - Grupo B

## Consumidores de Baixa Tensão (Residencial, Comercial, Rural)

---

## 1. Identificação do Grupo B

O consumidor é classificado como Grupo B quando:
- Modalidade tarifária é Convencional
- Subgrupo tarifário é B1, B2, B3 ou B4
- Tensão de fornecimento < 2,3 kV
- Não possui demanda contratada

### Subgrupos
| Subgrupo | Descrição |
|----------|-----------|
| B1 | Residencial |
| B2 | Rural |
| B3 | Comercial e demais |
| B4 | Iluminação pública |

---

## 2. Análise de Perfil

### Dados a Identificar
```
tipo_consumidor     → 'residencial' | 'comercial' | 'rural' | 'industrial_bt'
tipo_ligacao        → 'monofasico' | 'bifasico' | 'trifasico'
consumo_medio       → media(consumo_12m) em kWh
custo_medio         → media(valor_fatura_12m) em R$
custo_por_kwh       → custo_medio / consumo_medio
taxa_minima         → valor conforme tipo de ligação
cosip               → valor de contribuição de iluminação pública
fio_b               → custo de disponibilidade (se aplicável)
```

### Taxas Mínimas de Referência (por tipo de ligação)
| Tipo de Ligação | Consumo Mínimo | Custo Aproximado |
|----------------|---------------|-----------------|
| Monofásico | 30 kWh | ~R$ 25-35 |
| Bifásico | 50 kWh | ~R$ 40-55 |
| Trifásico | 100 kWh | ~R$ 80-110 |

> Valores variam por concessionária. O sistema deve extrair da fatura quando possível.

### Saída
- Card de perfil: tipo, ligação, consumo médio, custo médio
- Custo efetivo por kWh
- Composição da fatura (gráfico pizza)

---

## 3. Solar On-Grid

### 3.1 Busca de HSP (Horas de Sol Pico)

**Fonte obrigatória**: CRESESB/CEPEL — Portal Sundata

```
Processo:
1. Identificar cidade/estado do consumidor (da fatura ou CEP)
2. Consultar HSP no Sundata para a localidade
3. Se localidade exata não disponível, usar cidade mais próxima
4. Registrar:
   - Valor do HSP utilizado
   - Se localização foi precisa ou aproximada
   - Fonte da informação
```

**HSP médios por região (referência)**:
| Região | HSP (kWh/m²/dia) |
|--------|-------------------|
| Nordeste | 5.0 - 6.0 |
| Centro-Oeste | 4.5 - 5.5 |
| Sudeste | 4.0 - 5.0 |
| Sul | 3.5 - 4.5 |
| Norte | 4.0 - 5.0 |

### 3.2 Cálculo de Potência

```
# Potência necessária para abater consumo (exceto taxa mínima)
consumo_abativel = consumo_medio - MAX(taxa_minima_kwh, fio_b_kwh)

# Potência considerando simultaneidade
consumo_com_simultaneidade = consumo_abativel × simultaneidade

# Simultaneidade por tipo
simultaneidade_residencial = 0.30  (30%)
simultaneidade_comercial   = 0.50  (50%)

# Potência em Wpico
Wpico = consumo_com_simultaneidade / (HSP × 30 × (1 - perda_padrao))
perda_padrao = 0.22  (22%)

# Converter para kWp (mais comum no mercado)
kWp = Wpico / 1000
```

### 3.3 Geração Estimada Mensal

```
E_mes = Wpico × HSP × 30 × (1 - perda_padrao)

# Em kWh:
E_mes_kwh = kWp × HSP × 30 × (1 - 0.22)
```

### 3.4 Investimento On-Grid

```
investimento = Wpico × custo_por_wp

# Valores de referência (parametrizáveis):
custo_por_wp = R$ 3,00  (on-grid)

# Exemplo:
# Consumo: 350 kWh/mês → ~2.500 Wp → R$ 7.500
```

### 3.5 Economia Mensal

```
# O que permanece na conta após instalar solar:
custo_residual = MAX(taxa_minima, fio_b) 
               + COSIP × (1 - desconto_cosip)
               + ICMS_sobre_geracao_compensada

desconto_cosip = 0.30  (30%, parametrizável)

# Economia mensal:
economia_mensal = custo_medio_atual - custo_residual
```

### 3.6 Payback On-Grid

```
economia_anual = economia_mensal × 12
payback_anos = investimento / economia_anual
payback_meses = payback_anos × 12

# Retorno em diferentes períodos:
retorno_5_anos  = (economia_anual × 5) - investimento
retorno_10_anos = (economia_anual × 10) - investimento
retorno_25_anos = (economia_anual × 25) - investimento
```

### Saída do Solar On-Grid
- Potência recomendada (kWp)
- Número estimado de painéis (~550Wp cada)
- Investimento total
- Economia mensal
- Payback em meses/anos
- Retorno em 5, 10 e 25 anos
- Gráfico: Conta atual vs. Conta com solar (por mês)
- Gráfico: Break-even (investimento vs. economia acumulada)

---

## 4. Sistema Híbrido com Baterias

### 4.1 Conceito
Sistema solar com baterias para armazenar energia e usar à noite.
Maior aproveitamento, mas investimento mais alto.

### 4.2 Cálculos

```
# Simultaneidade ampliada (bateria permite uso noturno)
simultaneidade_hibrido = 0.85  (85%)

# Consumo coberto pelo híbrido
consumo_hibrido = consumo_abativel × simultaneidade_hibrido

# Potência necessária (maior que on-grid)
Wpico_hibrido = consumo_hibrido / (HSP × 30 × (1 - perda_padrao))

# Investimento
custo_por_wp_hibrido = R$ 6,00  (parametrizável)
investimento_hibrido = Wpico_hibrido × custo_por_wp_hibrido

# Economia (maior que on-grid pela simultaneidade)
economia_mensal_hibrido = consumo_hibrido × tarifa_media - custo_residual

# Payback
payback_hibrido = investimento_hibrido / (economia_mensal_hibrido × 12)
```

### 4.3 Comparativo On-Grid vs. Híbrido

| Métrica | On-Grid | Híbrido |
|---------|---------|---------|
| Simultaneidade | 30-50% | 85% |
| Custo por Wp | R$ 3,00 | R$ 6,00 |
| Economia mensal | Menor | Maior |
| Investimento | Menor | Maior |
| Payback | Mais rápido | Mais lento |
| Independência energética | Parcial | Quase total |

### Saída
- Tabela comparativa On-Grid vs. Híbrido
- Gráficos comparativos
- Recomendação baseada no perfil

---

## 5. Tarifa Branca e Baterias (BESS)

### 5.1 Conceito
A Tarifa Branca divide o dia em três postos tarifários para o Grupo B:
- **Ponta**: Tarifa alta (ex: 18h às 21h).
- **Intermediária**: 1 hora antes e 1 hora depois da Ponta (ex: 17h às 18h e 21h às 22h).
- **Fora Ponta**: Restante do dia (tarifa barata).

A instalação de **Baterias (BESS)** aliada à adesão (voluntária ou compulsória) à Tarifa Branca permite carregar as baterias no período Fora Ponta (ou via Solar) e consumir essa energia na Ponta, zerando o impacto do horário mais caro. O App EnergyAI realiza essa simulação de viabilidade para **todos** os consumidores do Grupo B, independentemente do volume de consumo.

### 5.2 Regras de Simulação
```
SE consumo_medio > limite_compulsorio_branca (1000 kWh):
    # Estimar perfil de consumo se não houver relógio inteligente
    consumo_ponta = consumo_medio * 0.15
    consumo_int = consumo_medio * 0.10
    consumo_fp = consumo_medio * 0.75

    custo_branca = (consumo_ponta * tarifa_energia_ponta) + (consumo_int * tarifa_energia_intermediaria) + (consumo_fp * tarifa_energia_fora_ponta)
    
    # Simulação de Bateria dimensionada para cobrir Ponta e Intermediária
    capacidade_bateria_necessaria = (consumo_ponta + consumo_int) / 22 / eficiencia_bateria
    
    economia_mensal_bess = custo_branca - (consumo_medio * tarifa_energia_fora_ponta)
    payback_bess = investimento_bateria / economia_mensal_bess
```

---

## 6. Cálculo de CO2

### Fórmulas
```
# Fator de emissão (SIN - Sistema Interligado Nacional)
fator_emissao = 0.0817  kgCO2/kWh  (parametrizável)

# CO2 evitado
co2_mes = energia_economizada_kwh × fator_emissao
co2_ano = co2_mes × 12
co2_5anos = co2_ano × 5
co2_25anos = co2_ano × 25

# Equivalências
arvores_ano = co2_ano / 22  (1 árvore absorve ~22kg CO2/ano)
km_carro = co2_ano / 0.21  (1 km ≈ 0.21 kg CO2)
```

---

## 6. Exemplo Completo (Residencial)

```
Dados da fatura:
- Consumo médio: 350 kWh/mês
- Custo médio: R$ 315,00/mês
- Tipo: Residencial monofásico
- Taxa mínima: R$ 30,00 (30 kWh)
- COSIP: R$ 18,00
- Localidade: Belo Horizonte/MG
- HSP: 4.5 kWh/m²/dia

Cálculo Solar On-Grid:
- Consumo abatível: 350 - 30 = 320 kWh
- Consumo com simultaneidade (30%): 320 × 0.30 = 96 kWh
  (NOTA: a simultaneidade afeta o autoconsumo, não o dimensionamento)
  
CORREÇÃO: Para Grupo B com net metering, dimensiona-se para abater
todo o consumo abatível:
- Wpico = 320,000 / (4.5 × 30 × 0.78) = 3,037 Wp ≈ 3.0 kWp
- Investimento: 3,037 × 3.00 = R$ 9,111
- Painéis: ~6 painéis de 550W
  
- Geração mensal: 3,037 × 4.5 × 30 × 0.78 = 319.6 kWh ✓
- Conta residual: R$ 30 (mín) + R$ 12,60 (COSIP com desc 30%) = R$ 42,60
- Economia mensal: R$ 315 - R$ 42,60 = R$ 272,40
- Economia anual: R$ 3,268.80
- Payback: R$ 9,111 / R$ 3,268.80 = 2.8 anos

CO2:
- CO2 evitado/ano: 320 × 12 × 0.0817 = 313.7 kg
- Árvores equivalentes: 313.7 / 22 = 14.3 árvores/ano
- Km não percorridos: 313.7 / 0.21 = 1,493.8 km/ano
```

---

*Documento atualizado em: Abril 2026*
*Versão: 1.0*
