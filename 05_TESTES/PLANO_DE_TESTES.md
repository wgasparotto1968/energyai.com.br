# Plano de Testes - APP EnergyAI

---

## Estratégia de Testes por Fase

### Fase 1 — Testes Essenciais
- Testes manuais de todos os fluxos
- Testes de integração com gateways (sandbox)
- Testes de segurança básicos
- Testes de responsividade

### Fase 2 — Testes de Regras de Negócio
- Validação de cálculos contra planilha
- Testes com faturas reais (10+ concessionárias)
- Testes de geração de PDF

### Fase 3+ — Testes Automatizados
- Unit tests para regras de cálculo
- Integration tests para APIs
- E2E tests com Playwright

---

## Checklist de Testes por Módulo

### Landing Page
- [ ] Carrega em < 3 segundos
- [ ] Lighthouse Performance > 90
- [ ] Responsivo em 320px, 768px, 1024px, 1440px
- [ ] CTAs linkam corretamente
- [ ] SEO tags presentes (title, description, og:image)
- [ ] Funciona em Chrome, Firefox, Safari, Edge
- [ ] Funciona em iOS Safari e Android Chrome

### Autenticação
- [ ] Cadastro com dados válidos → sucesso
- [ ] Cadastro com e-mail duplicado → erro
- [ ] Cadastro sem campos obrigatórios → erro
- [ ] Login com credenciais corretas → sucesso
- [ ] Login com credenciais incorretas → erro
- [ ] Login com mais de 5 tentativas → rate limit
- [ ] Recuperação de senha → e-mail enviado
- [ ] Token de recuperação expirado → erro
- [ ] Redefinição de senha → sucesso
- [ ] Rota protegida sem login → redirect para /login
- [ ] Logout → sessão encerrada

### Pagamentos
- [ ] Assinatura via Pix (sandbox) → plano ativado
- [ ] Assinatura via cartão (sandbox) → plano ativado
- [ ] Consulta avulsa via Pix → análise liberada
- [ ] Consulta avulsa via cartão → análise liberada
- [ ] Pix expirado → permite gerar novo
- [ ] Cartão recusado → mensagem de erro clara
- [ ] Webhook Mercado Pago → atualiza status
- [ ] Webhook Stripe → atualiza status
- [ ] Limite de consultas Starter (11ª consulta) → bloqueio
- [ ] Limite de consultas Pro (51ª consulta) → bloqueio
- [ ] Premium sem limite → sem bloqueio
- [ ] Inadimplência → bloqueio de novas análises

### Upload de PDF
- [ ] Upload de PDF válido (< 10MB) → sucesso
- [ ] Upload de arquivo .jpg → rejeitar
- [ ] Upload de PDF > 10MB → rejeitar
- [ ] Upload de PDF corrompido → erro claro
- [ ] Upload de .jpg renomeado para .pdf → rejeitar (magic bytes)
- [ ] Drag-and-drop funciona
- [ ] Barra de progresso exibida
- [ ] Arquivo armazenado no R2 → URL não pública
- [ ] Processamento inicia automaticamente

### OCR e Parser
- [ ] Fatura CEMIG → dados extraídos corretamente
- [ ] Fatura CPFL → dados extraídos corretamente
- [ ] Fatura Enel SP → dados extraídos corretamente
- [ ] Fatura Energisa → dados extraídos corretamente
- [ ] Fatura Light → dados extraídos corretamente
- [ ] Classificação Grupo A → correta
- [ ] Classificação Grupo B → correta
- [ ] Confiança alta → campos marcados em verde
- [ ] Confiança baixa → alerta exibido
- [ ] Campos ausentes → sinalizados
- [ ] Fallback Tesseract → funciona quando Vision falha
- [ ] Timeout (> 60s) → mensagem de erro

### Regras de Negócio (Grupo A)
- [ ] Análise de demanda → sobrecontratação detectada
- [ ] Análise de demanda → subcontratação detectada
- [ ] Reativo → alerta gerado
- [ ] Verde x Azul → cenário mais vantajoso identificado
- [ ] B Optante (elegível) → comparativo gerado
- [ ] B Optante (não elegível) → motivo registrado
- [ ] Solar FV → investimento e payback calculados

### Regras de Negócio (Grupo B)
- [ ] Perfil → tipo e ligação identificados
- [ ] Solar on-grid → potência calculada corretamente
- [ ] Solar on-grid → payback calculado corretamente
- [ ] Híbrido → investimento e payback calculados
- [ ] Comparativo on-grid vs. híbrido → correto
- [ ] CO2 → valores coerentes

### Relatório PDF
- [ ] PDF gerado com todas as seções
- [ ] Gráficos renderizados no PDF
- [ ] Dados consistentes com dashboard
- [ ] Disclaimer presente
- [ ] Download funciona
- [ ] Tamanho < 5MB

### Segurança
- [ ] SQL Injection nos inputs → bloqueado
- [ ] XSS nos inputs → bloqueado
- [ ] CSRF → token validado
- [ ] Acesso a dados de outro usuário → bloqueado
- [ ] URL direta de PDF sem autenticação → bloqueado
- [ ] Headers de segurança presentes
- [ ] HTTPS forçado

---

## Faturas de Teste

Manter uma coleção de PDFs reais para testes:

```
05_TESTES/
├── faturas_teste/
│   ├── grupo_a/
│   │   ├── cemig_grupo_a.pdf
│   │   ├── cpfl_grupo_a.pdf
│   │   ├── enel_grupo_a.pdf
│   │   └── energisa_grupo_a.pdf
│   └── grupo_b/
│       ├── cemig_residencial.pdf
│       ├── cpfl_comercial.pdf
│       ├── enel_residencial.pdf
│       ├── light_residencial.pdf
│       └── copel_residencial.pdf
├── planilha_validacao.xlsx
└── PLANO_DE_TESTES.md
```

---

*Documento atualizado em: Abril 2026*
*Versão: 1.0*
