# Banco de Dados - APP EnergyAI

## Diagrama Entidade-Relacionamento (Textual)

```
users ─────────────┬──────── profiles
  │                │
  │                ├──────── subscriptions
  │                │
  ├── payments ────┘
  │
  ├── invoices ──── invoice_data
  │       │
  │       └──────── analysis_results ──── analysis_scenarios
  │
  ├── notifications
  │
  └── api_keys (Fase 4)

admin_params (configurações globais)
audit_log (trilha de auditoria)
```

---

## Tabelas Detalhadas

### users
Armazena todos os usuários do sistema.

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id        VARCHAR(255) UNIQUE,  -- ID externo do Clerk
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    phone           VARCHAR(20),
    type            VARCHAR(20) NOT NULL CHECK (type IN ('professional', 'client')),
    email_verified  BOOLEAN DEFAULT false,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_type ON users(type);
```

### profiles
Dados adicionais do profissional.

```sql
CREATE TABLE profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company         VARCHAR(255),
    cnpj_cpf        VARCHAR(18),
    plan            VARCHAR(20) CHECK (plan IN ('starter', 'pro', 'premium')),
    logo_url        VARCHAR(500),  -- White-label (Fase 4)
    brand_color     VARCHAR(7),    -- White-label (Fase 4)
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### subscriptions
Assinaturas de profissionais.

```sql
CREATE TABLE subscriptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID REFERENCES users(id) ON DELETE CASCADE,
    plan                    VARCHAR(20) NOT NULL CHECK (plan IN ('starter', 'pro', 'premium')),
    status                  VARCHAR(20) NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'active', 'cancelled', 'expired', 'past_due')),
    gateway                 VARCHAR(20) NOT NULL CHECK (gateway IN ('mercadopago', 'stripe')),
    gateway_subscription_id VARCHAR(255),
    amount                  DECIMAL(10,2) NOT NULL,
    currency                VARCHAR(3) DEFAULT 'BRL',
    current_period_start    TIMESTAMP WITH TIME ZONE,
    current_period_end      TIMESTAMP WITH TIME ZONE,
    queries_used            INTEGER DEFAULT 0,
    queries_limit           INTEGER DEFAULT 0,
    cancelled_at            TIMESTAMP WITH TIME ZONE,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

### payments
Histórico de todos os pagamentos.

```sql
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    invoice_id      UUID,  -- Referência à fatura (para pagamento avulso)
    type            VARCHAR(20) NOT NULL CHECK (type IN ('subscription', 'single')),
    amount          DECIMAL(10,2) NOT NULL,
    currency        VARCHAR(3) DEFAULT 'BRL',
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'processing', 'confirmed', 'failed', 'refunded')),
    gateway         VARCHAR(20) NOT NULL CHECK (gateway IN ('mercadopago', 'stripe')),
    gateway_payment_id VARCHAR(255),
    payment_method  VARCHAR(20),  -- 'pix', 'credit_card', 'debit_card'
    metadata        JSONB DEFAULT '{}',
    paid_at         TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_gateway_id ON payments(gateway_payment_id);
```

### invoices
Faturas de energia enviadas pelos usuários.

```sql
CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    payment_id      UUID REFERENCES payments(id) ON DELETE SET NULL,
    file_url        VARCHAR(500) NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    file_size       INTEGER NOT NULL,
    file_hash       VARCHAR(64) NOT NULL,  -- SHA-256 para integridade
    status          VARCHAR(20) NOT NULL DEFAULT 'uploaded'
                    CHECK (status IN ('uploaded', 'queued', 'processing', 'completed', 'failed')),
    error_message   TEXT,
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created ON invoices(created_at DESC);
```

### invoice_data
Dados extraídos da fatura pelo OCR + IA.

```sql
CREATE TABLE invoice_data (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id              UUID UNIQUE REFERENCES invoices(id) ON DELETE CASCADE,
    
    -- Metadados do processamento
    ocr_engine              VARCHAR(20),  -- 'google_vision', 'tesseract'
    parser_engine           VARCHAR(20),  -- 'gpt4', 'claude', 'regex'
    raw_text                TEXT,
    processing_time_ms      INTEGER,
    
    -- Dados do cliente
    client_name             VARCHAR(255),
    client_name_confidence  DECIMAL(3,2),
    
    -- Dados da concessionária
    utility_company         VARCHAR(255),
    utility_company_confidence DECIMAL(3,2),
    
    -- Dados da unidade consumidora
    consumer_unit           VARCHAR(50),
    consumer_class          VARCHAR(100),
    consumer_subclass       VARCHAR(100),
    connection_type         VARCHAR(20),  -- 'monofasico', 'bifasico', 'trifasico'
    voltage_level           VARCHAR(20),  -- 'baixa', 'media', 'alta'
    
    -- Classificação tarifária
    tariff_group            VARCHAR(2),   -- 'A' ou 'B'
    tariff_group_confidence DECIMAL(3,2),
    tariff_modality         VARCHAR(50),  -- 'azul', 'verde', 'convencional'
    tariff_subgroup         VARCHAR(10),  -- 'A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3'
    
    -- Consumo e demanda
    monthly_consumption_kwh DECIMAL(12,2),
    contracted_demand_kw    DECIMAL(12,2),
    measured_demand_kw      DECIMAL(12,2),
    reactive_power_kvarh    DECIMAL(12,2),
    
    -- Valores financeiros
    total_amount            DECIMAL(12,2),
    energy_amount           DECIMAL(12,2),
    demand_amount           DECIMAL(12,2),
    taxes_icms              DECIMAL(12,2),
    taxes_pis_cofins        DECIMAL(12,2),
    cosip                   DECIMAL(12,2),
    wire_b                  DECIMAL(12,2),
    minimum_rate            DECIMAL(12,2),
    reactive_surcharge      DECIMAL(12,2),
    
    -- Datas
    reference_date          DATE,
    due_date                DATE,
    reading_date            DATE,
    
    -- Indicadores especiais
    has_distributed_gen     BOOLEAN DEFAULT false,
    has_free_market         BOOLEAN DEFAULT false,
    distributed_gen_kwh     DECIMAL(12,2),
    
    -- Histórico (JSON)
    history_12m             JSONB DEFAULT '[]',
    -- Formato: [{"month": "2025-01", "consumption_kwh": 450, "demand_kw": 100, "amount": 1500.00}]
    
    -- Todos os campos extraídos (backup completo)
    all_extracted_fields    JSONB DEFAULT '{}',
    
    -- Resumo de confiança
    confidence_summary      JSONB DEFAULT '{}',
    -- Formato: {"high": 15, "medium": 3, "low": 2, "missing": 1}
    
    -- Localização (para HSP)
    location_city           VARCHAR(100),
    location_state          VARCHAR(2),
    location_cep            VARCHAR(9),
    hsp_value               DECIMAL(4,2),
    hsp_source              VARCHAR(100),
    
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoice_data_invoice ON invoice_data(invoice_id);
CREATE INDEX idx_invoice_data_group ON invoice_data(tariff_group);
```

### analysis_results
Resultados consolidados da análise.

```sql
CREATE TABLE analysis_results (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id          UUID UNIQUE REFERENCES invoices(id) ON DELETE CASCADE,
    invoice_data_id     UUID REFERENCES invoice_data(id) ON DELETE CASCADE,
    
    -- Classificação
    tariff_group        VARCHAR(2) NOT NULL,
    unit_type           VARCHAR(20),  -- 'residential', 'commercial', 'industrial'
    
    -- Resumo financeiro
    current_monthly_cost    DECIMAL(12,2),
    potential_savings_month DECIMAL(12,2),
    potential_savings_year  DECIMAL(12,2),
    best_scenario_name      VARCHAR(100),
    best_scenario_payback_months INTEGER,
    total_investment        DECIMAL(12,2),
    
    -- CO2
    co2_avoided_month_kg    DECIMAL(12,2),
    co2_avoided_year_kg     DECIMAL(12,2),
    co2_avoided_5y_kg       DECIMAL(12,2),
    co2_trees_equivalent    DECIMAL(8,1),
    co2_km_equivalent       DECIMAL(12,1),
    
    -- Alertas
    alerts                  JSONB DEFAULT '[]',
    -- Formato: [{"type": "warning", "title": "...", "description": "..."}]
    
    -- Recomendações
    recommendations         JSONB DEFAULT '[]',
    -- Formato: [{"priority": 1, "title": "...", "description": "...", "savings": 500.00}]
    
    -- Premissas usadas
    params_snapshot         JSONB DEFAULT '{}',
    
    -- Relatório PDF
    pdf_url                 VARCHAR(500),
    pdf_generated_at        TIMESTAMP WITH TIME ZONE,
    
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analysis_invoice ON analysis_results(invoice_id);
```

### analysis_scenarios
Cenários individuais de economia.

```sql
CREATE TABLE analysis_scenarios (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id         UUID REFERENCES analysis_results(id) ON DELETE CASCADE,
    
    name                VARCHAR(100) NOT NULL,
    type                VARCHAR(50) NOT NULL,
    -- Tipos: 'demand_adjustment', 'reactive_correction', 'tariff_comparison',
    --        'b_optante', 'solar_ongrid', 'solar_hybrid', 'free_market',
    --        'grid_zero', 'bess', 'combined'
    
    is_eligible         BOOLEAN DEFAULT true,
    eligibility_reason  TEXT,
    
    -- Valores
    current_cost_month  DECIMAL(12,2),
    projected_cost_month DECIMAL(12,2),
    savings_month       DECIMAL(12,2),
    savings_year        DECIMAL(12,2),
    investment          DECIMAL(12,2),
    payback_months      INTEGER,
    roi_5_years         DECIMAL(12,2),
    roi_10_years        DECIMAL(12,2),
    roi_25_years        DECIMAL(12,2),
    
    -- CO2 do cenário
    co2_avoided_year_kg DECIMAL(12,2),
    
    -- Detalhes (específicos por tipo)
    details             JSONB DEFAULT '{}',
    
    -- Gráficos (dados para renderização)
    chart_data          JSONB DEFAULT '{}',
    
    sort_order          INTEGER DEFAULT 0,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scenarios_analysis ON analysis_scenarios(analysis_id);
```

### admin_params
Parâmetros globais do sistema (editáveis pelo admin).

```sql
CREATE TABLE admin_params (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key             VARCHAR(100) UNIQUE NOT NULL,
    value           VARCHAR(500) NOT NULL,
    type            VARCHAR(20) DEFAULT 'number',  -- 'number', 'text', 'boolean', 'json'
    description     TEXT,
    category        VARCHAR(50),  -- 'solar', 'co2', 'bess', 'market', 'general'
    min_value       DECIMAL(12,4),
    max_value       DECIMAL(12,4),
    updated_by      UUID REFERENCES users(id),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Valores iniciais
INSERT INTO admin_params (key, value, type, description, category) VALUES
('solar_ongrid_cost_per_wp', '3.00', 'number', 'Custo por Wp solar on-grid (R$)', 'solar'),
('solar_hybrid_cost_per_wp', '6.00', 'number', 'Custo por Wp solar híbrido (R$)', 'solar'),
('solar_loss_factor', '0.22', 'number', 'Fator de perda solar (%)', 'solar'),
('simultaneity_residential', '0.30', 'number', 'Fator de simultaneidade residencial', 'solar'),
('simultaneity_commercial', '0.50', 'number', 'Fator de simultaneidade comercial', 'solar'),
('simultaneity_hybrid', '0.85', 'number', 'Fator de simultaneidade híbrido', 'solar'),
('co2_emission_factor', '0.0817', 'number', 'Fator de emissão CO2 (kgCO2/kWh)', 'co2'),
('cosip_discount', '0.30', 'number', 'Desconto COSIP para payback (%)', 'general'),
('demand_safety_margin', '0.10', 'number', 'Margem de segurança demanda (%)', 'general'),
('bess_cost_per_kwh', '2500.00', 'number', 'Custo BESS por kWh (R$)', 'bess'),
('bess_lifespan_years', '10', 'number', 'Vida útil BESS (anos)', 'bess'),
('bess_efficiency', '0.90', 'number', 'Eficiência da bateria (%)', 'bess'),
('b_optante_threshold_kw', '112', 'number', 'Limite de demanda para B Optante (kW)', 'general');
```

### audit_log
Trilha de auditoria para rastreabilidade.

```sql
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(50),  -- 'user', 'invoice', 'payment', 'param', etc.
    entity_id       UUID,
    old_value       JSONB,
    new_value       JSONB,
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
```

### notifications
Notificações do sistema.

```sql
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    link            VARCHAR(500),
    is_read         BOOLEAN DEFAULT false,
    sent_email      BOOLEAN DEFAULT false,
    sent_whatsapp   BOOLEAN DEFAULT false,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

---

## Prisma Schema (Resumido)

O schema Prisma será a fonte de verdade do banco de dados.
As migrações serão geradas automaticamente com `npx prisma migrate dev`.

Arquivo: `prisma/schema.prisma`

---

## Políticas de Backup

| Frequência | Tipo | Retenção |
|-----------|------|----------|
| A cada 6 horas | Point-in-time recovery | 7 dias |
| Diário | Snapshot completo | 30 dias |
| Semanal | Snapshot completo | 90 dias |
| Mensal | Snapshot completo | 1 ano |

---

*Documento atualizado em: Abril 2026*
*Versão: 1.0*
