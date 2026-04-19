# Conformidade Legal - LGPD, Termos e Privacidade

---

## 1. LGPD — Lei Geral de Proteção de Dados

### 1.1 Dados Pessoais Coletados

| Dado | Finalidade | Base Legal |
|------|-----------|-----------|
| Nome | Identificação e relatório | Execução contratual |
| E-mail | Comunicação, login, notificações | Execução contratual |
| Telefone | Comunicação, WhatsApp (opcional) | Consentimento |
| Senha (hash) | Autenticação | Execução contratual |
| CPF/CNPJ | Identificação fiscal (profissional) | Obrigação legal |
| Empresa | Identificação (profissional) | Execução contratual |
| Dados de pagamento | Processamento de cobrança | Execução contratual |
| Faturas (PDF) | Prestação do serviço | Execução contratual |
| Dados da fatura | Análise e relatório | Execução contratual |
| IP, navegador | Segurança e auditoria | Legítimo interesse |
| Cookies | Funcionamento do sistema | Consentimento |

### 1.2 Medidas Técnicas Obrigatórias

- [ ] **Criptografia em trânsito**: TLS 1.3 em todas as conexões
- [ ] **Criptografia em repouso**: Dados sensíveis criptografados no banco
- [ ] **Hash de senhas**: bcrypt com salt (se não usar Clerk)
- [ ] **URLs assinadas**: PDFs nunca acessíveis publicamente
- [ ] **Controle de acesso**: Usuário só acessa seus próprios dados
- [ ] **Minimização de dados**: Coletar apenas o necessário
- [ ] **Retenção limitada**: Definir prazo de retenção para cada tipo de dado
- [ ] **Backup criptografado**: Backups protegidos com chave
- [ ] **Logs de acesso**: Registrar quem acessou o quê e quando
- [ ] **Anonimização**: Possibilidade de anonimizar dados sob solicitação

### 1.3 Direitos do Titular (Implementar)

| Direito | Implementação |
|---------|--------------|
| **Acesso** | Página /perfil com todos os dados |
| **Correção** | Edição de dados na página /perfil |
| **Eliminação** | Botão "Excluir minha conta" (+ confirmação) |
| **Portabilidade** | Exportar dados em JSON/CSV |
| **Revogação de consentimento** | Opt-out de e-mails e notificações |
| **Oposição** | Canal de contato para solicitações |

### 1.4 Retenção de Dados

| Tipo de Dado | Retenção | Após expirar |
|-------------|----------|-------------|
| Conta ativa | Enquanto ativa | - |
| Conta inativa | 2 anos após última atividade | Notificar e excluir |
| Faturas (PDF) | 5 anos | Excluir do storage |
| Dados de análise | 5 anos | Anonimizar |
| Logs de auditoria | 5 anos | Excluir |
| Dados de pagamento | 5 anos (obrigação fiscal) | Excluir |
| Conta excluída | 30 dias (período de arrependimento) | Excluir permanentemente |

### 1.5 Incidentes de Segurança

```
Em caso de vazamento de dados:
1. Identificar escopo do incidente (quais dados, quantos usuários)
2. Conter o incidente (revogar acessos, corrigir vulnerabilidade)
3. Avaliar risco aos titulares
4. Comunicar à ANPD em até 2 dias úteis (se risco relevante)
5. Comunicar aos titulares afetados
6. Documentar todo o incidente e ações tomadas
```

---

## 2. Termos de Uso (Estrutura)

### Seções Obrigatórias

1. **Definições**
   - APP EnergyAI, Usuário, Profissional, Cliente, Análise, Relatório

2. **Objeto do Serviço**
   - Análise automatizada de faturas de energia
   - Caráter estimativo e informativo dos resultados

3. **Cadastro e Conta**
   - Requisitos para cadastro
   - Responsabilidade sobre credenciais
   - Proibição de compartilhamento de conta

4. **Planos e Pagamentos**
   - Descrição dos planos
   - Política de cobrança
   - Condições de cancelamento
   - Política de reembolso

5. **Uso Aceitável**
   - Proibição de uso fraudulento
   - Não enviar documentos de terceiros sem autorização
   - Não tentar burlar limites do sistema

6. **Limitação de Responsabilidade**
   - Resultados são estimativos
   - Decisões devem ser validadas por profissional habilitado
   - Não nos responsabilizamos por decisões baseadas exclusivamente nos relatórios

7. **Propriedade Intelectual**
   - Software é propriedade do APP EnergyAI
   - Relatórios gerados podem ser usados livremente pelo contratante

8. **Disponibilidade**
   - SLA de 99.5% de uptime (meta)
   - Manutenções programadas com aviso prévio

9. **Modificações**
   - Termos podem ser alterados com aviso de 30 dias
   - Uso continuado implica aceitação

10. **Foro**
    - Comarca de [cidade sede da empresa]

---

## 3. Política de Privacidade (Estrutura)

### Seções Obrigatórias

1. **Controlador dos Dados**
   - Identificação da empresa (razão social, CNPJ, endereço)
   - Contato do DPO (Encarregado de Dados)
   - E-mail para solicitações: privacidade@EnergyAI.com.br

2. **Dados Coletados**
   - Tabela com todos os dados e finalidades (seção 1.1 acima)

3. **Finalidade do Tratamento**
   - Prestação do serviço
   - Comunicação com o usuário
   - Processamento de pagamentos
   - Melhorias do sistema
   - Segurança e prevenção de fraudes
   - Obrigações legais

4. **Base Legal**
   - Execução contratual (Art. 7º, V)
   - Consentimento (Art. 7º, I) — para marketing e WhatsApp
   - Legítimo interesse (Art. 7º, IX) — para segurança
   - Obrigação legal (Art. 7º, II) — para dados fiscais

5. **Compartilhamento de Dados**
   - Processadores de pagamento (Mercado Pago, Stripe)
   - Serviços de cloud (Google, Cloudflare, Vercel)
   - Transferência internacional (com salvaguardas)

6. **Segurança**
   - Medidas técnicas adotadas
   - Criptografia, controle de acesso, monitoramento

7. **Direitos do Titular**
   - Como exercer cada direito
   - Prazo de resposta: 15 dias

8. **Cookies**
   - Cookies essenciais (sessão)
   - Cookies de analytics (com consentimento)
   - Como desabilitar

9. **Retenção**
   - Prazos conforme tabela da seção 1.4

10. **Alterações**
    - Notificação por e-mail sobre mudanças relevantes

---

## 4. Disclaimer Obrigatório (Sistema e Relatório)

### Texto Padrão (exibir no dashboard e no PDF)

> **AVISO DE RESPONSABILIDADE**
>
> Os resultados apresentados neste relatório possuem caráter **estimativo e informativo**,
> baseados nos dados extraídos automaticamente da fatura de energia e nas premissas
> parametrizadas no sistema.
>
> Os cálculos de economia, investimento, payback e retorno são simulações baseadas em
> valores de referência que podem variar conforme condições de mercado, localidade,
> regulação vigente e características específicas da instalação.
>
> **Decisões contratuais, regulatórias, tarifárias, de engenharia ou investimento
> devem ser validadas por análise técnica detalhada realizada por profissional
> habilitado.**
>
> O APP EnergyAI não se responsabiliza por decisões tomadas com base exclusiva
> nas informações apresentadas neste relatório.

### Texto para Mercado Livre (adicional)

> A simulação de economia no Mercado Livre de Energia é **indicativa**. Os preços
> de referência utilizados podem variar significativamente conforme negociação,
> submercado, horizonte contratual e conjuntura do setor elétrico. Consulte um
> comercializador de energia autorizado pela CCEE antes de qualquer decisão.

### Texto para Solar (adicional)

> A estimativa de geração fotovoltaica considera a irradiação solar (HSP) da
> localidade conforme dados do CRESESB/CEPEL, com perdas padrão de 22%.
> A geração real pode variar conforme orientação, inclinação, sombreamento,
> temperatura e manutenção do sistema. O dimensionamento final deve ser
> realizado por engenheiro responsável.

---

## 5. Checklist de Conformidade

### Implementação LGPD
- [ ] Política de privacidade publicada e acessível
- [ ] Termos de uso publicados e acessíveis
- [ ] Checkbox de aceite no cadastro (não pré-marcado)
- [ ] Registro do aceite (data, hora, versão do documento)
- [ ] Página para exercício de direitos
- [ ] Funcionalidade de excluir conta
- [ ] Funcionalidade de exportar dados
- [ ] Opt-out de comunicações de marketing
- [ ] Banner de cookies (se usar analytics)
- [ ] DPO designado (mesmo que informalmente)
- [ ] Canal de comunicação para titulares
- [ ] Prazo de resposta ≤ 15 dias
- [ ] Registro de atividades de tratamento
- [ ] Avaliação de impacto (DPIA) para dados sensíveis

### Segurança
- [ ] HTTPS em todas as páginas
- [ ] Headers de segurança configurados
- [ ] Dados sensíveis criptografados no banco
- [ ] Backups criptografados
- [ ] Controle de acesso baseado em roles
- [ ] Logs de auditoria
- [ ] Plano de resposta a incidentes documentado
- [ ] Testes de segurança periódicos

---

*Documento atualizado em: Abril 2026*
*Versão: 1.0*
