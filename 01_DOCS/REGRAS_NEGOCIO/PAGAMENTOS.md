# Regras de Negócio - Pagamentos e Planos

---

## 1. Planos de Assinatura (Profissional)

| Plano | Preço | Faturas/mês | Público |
|-------|-------|-------------|---------|
| **Starter** | R$ 49,90/mês | 10 | Consultores individuais |
| **Pro** | R$ 199,00/mês | 50 | Empresas pequenas |
| **Premium** | R$ 699,00/mês | Ilimitado | Grandes integradores |

### Regras de Assinatura
```
1. Profissional deve escolher plano durante ou após o cadastro
2. Plano ativa somente após confirmação do primeiro pagamento
3. Cobrança recorrente no mesmo dia do mês da assinatura
4. Limite de consultas reseta no início de cada ciclo de cobrança
5. Se pagamento falhar, status muda para 'past_due'
6. Após 3 dias em 'past_due', bloquear novas análises
7. Profissional pode fazer upgrade a qualquer momento
   - Diferença é cobrada proporcional ao tempo restante
8. Profissional pode fazer downgrade
   - Aplica-se no próximo ciclo de cobrança
9. Cancelamento:
   - Acesso mantido até fim do ciclo pago
   - Sem reembolso proporcional
   - Análises anteriores permanecem acessíveis
```

### Controle de Limite
```
ANTES de cada análise:
  SE usuario.type == 'professional':
    assinatura = buscar_assinatura_ativa(usuario)
    
    SE assinatura.status != 'active':
      BLOQUEAR → "Sua assinatura não está ativa"
    
    SE assinatura.plan != 'premium':
      SE assinatura.queries_used >= assinatura.queries_limit:
        BLOQUEAR → "Limite de análises atingido. Faça upgrade."
    
    PERMITIR → incrementar queries_used
```

---

## 2. Consulta Avulsa (Cliente)

### Regras
```
Preço: R$ 99,00 por análise

Fluxo:
1. Cliente faz upload do PDF
2. Sistema cria payment com type='single', status='pending'
3. Sistema exibe tela de pagamento (Pix ou Cartão)
4. Cliente paga
5. Webhook confirma pagamento
6. Sistema muda payment.status → 'confirmed'
7. Sistema enfileira processamento da fatura
8. Resultado liberado após processamento

Regras de acesso:
- Cliente NÃO pode ver resultado antes do pagamento confirmado
- Se pagamento falhar, upload fica salvo mas análise não inicia
- Cliente pode tentar pagar novamente (mesmo upload)
- Análise paga fica acessível permanentemente
```

---

## 3. Gateways de Pagamento

### 3.1 Mercado Pago

**Uso principal**: Pix (pagamento instantâneo)

```
Integração:
- API de Preferência (MercadoPago SDK)
- Webhook para notificação de pagamento
- Suporta: Pix, cartão de crédito, boleto

Webhooks:
- payment.created → Registrar tentativa
- payment.approved → Confirmar pagamento
- payment.rejected → Registrar falha
- payment.refunded → Registrar estorno

Taxas Mercado Pago (ref. 2026):
- Pix: 0,99% por transação
- Cartão à vista: 4,98%
- Liberação do Pix: Imediata
```

### 3.2 Stripe

**Uso principal**: Cartão de crédito + Assinaturas recorrentes

```
Integração:
- Stripe Checkout (redirect seguro)
- Stripe Billing (assinaturas)
- Customer Portal (gestão pelo cliente)
- Webhooks para eventos

Webhooks:
- checkout.session.completed → Pagamento concluído
- invoice.paid → Parcela de assinatura paga
- invoice.payment_failed → Falha na cobrança
- customer.subscription.updated → Assinatura alterada
- customer.subscription.deleted → Assinatura cancelada

Taxas Stripe (ref. 2026):
- Cartão: 3,99% + R$ 0,39 por transação
- Não cobra por assinatura (só pela transação)
```

### 3.3 Fluxo de Webhook (Ambos)

```
Webhook recebido:
1. Verificar assinatura/autenticidade do webhook
2. Identificar tipo de evento
3. Buscar payment no banco pelo gateway_payment_id
4. Atualizar status do payment
5. SE pagamento confirmado:
   a. SE type == 'subscription':
      - Ativar/renovar assinatura
      - Resetar queries_used = 0
   b. SE type == 'single':
      - Liberar análise (invoice.status → 'queued')
6. Enviar notificação ao usuário
7. Registrar no audit_log
8. Responder 200 OK ao gateway
```

---

## 4. Fluxo de Pagamento Visual

### Assinatura (Profissional)

```
/planos
  │
  ├── Seleciona plano (Starter/Pro/Premium)
  ├── Seleciona método (Pix ou Cartão)
  │
  ├── [Se Pix - Mercado Pago]
  │   ├── Exibe QR Code
  │   ├── Timer de expiração (30 min)
  │   ├── Polling a cada 5s para verificar pagamento
  │   └── Confirmou → Ativa plano → Redireciona /dashboard
  │
  └── [Se Cartão - Stripe]
      ├── Redirect para Stripe Checkout
      ├── Usuário preenche dados do cartão
      ├── Stripe processa e retorna
      └── Success → Ativa plano → Redireciona /dashboard
```

### Consulta Avulsa (Cliente)

```
/analise/nova
  │
  ├── Upload do PDF (validado)
  ├── Exibe resumo: "Análise de fatura — R$ 99,00"
  ├── Seleciona método (Pix ou Cartão)
  │
  ├── [Se Pix]
  │   ├── Gera QR Code (Mercado Pago)
  │   ├── Polling para confirmação
  │   └── Confirmou → Inicia OCR → Exibe progresso
  │
  └── [Se Cartão]
      ├── Stripe Checkout
      └── Confirmou → Inicia OCR → Exibe progresso
```

---

## 5. Tratamento de Erros

| Cenário | Ação |
|---------|------|
| Pix expirou (30 min) | Permitir gerar novo QR Code |
| Cartão recusado | Exibir erro, permitir tentar outro cartão |
| Webhook não recebido | Job que verifica pagamentos pendentes a cada 5 min |
| Pagamento duplicado | Detectar por idempotency_key, ignorar segundo |
| Estorno solicitado | Reverter status, bloquear acesso à análise |
| Cobrança recorrente falhou | E-mail de aviso, 3 retentativas automáticas |

---

## 6. Segurança de Pagamentos

- [ ] Nunca armazenar dados de cartão (Stripe cuida disso)
- [ ] Validar assinatura de todos os webhooks
- [ ] Usar idempotency keys para evitar processamento duplo
- [ ] Rate limiting nas rotas de pagamento
- [ ] Log de todas as transações no audit_log
- [ ] Criptografar dados financeiros sensíveis em trânsito (TLS)
- [ ] PCI DSS compliance via Stripe (não processamos cartão)

---

*Documento atualizado em: Abril 2026*
*Versão: 1.0*
