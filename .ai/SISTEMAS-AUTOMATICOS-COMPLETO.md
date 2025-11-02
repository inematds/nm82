# 🤖 SISTEMAS AUTOMÁTICOS - Sistema de Convites INEMA.VIP

**Data**: 02/11/2025
**Autor**: Documentação técnica completa dos fluxos automáticos

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Worker de Processamento de Afiliados](#1-worker-de-processamento-de-afiliados)
3. [Sistema N8N - Workflow 1: Convites para Padrinhos](#2-sistema-n8n---workflow-1-convites-para-padrinhos)
4. [Sistema N8N - Workflow 2: Processamento de Emails](#3-sistema-n8n---workflow-2-processamento-de-emails)
5. [Sistema N8N - Workflow 3: Análise de Anexos](#4-sistema-n8n---workflow-3-análise-de-anexos)
6. [Sistema N8N - Workflow 4: Atualização de Labels Gmail](#5-sistema-n8n---workflow-4-atualização-de-labels-gmail)
7. [Diagrama Completo dos Sistemas Automáticos](#diagrama-completo-dos-sistemas-automáticos)
8. [Resumo: O que Roda Automaticamente](#resumo-o-que-roda-automaticamente)
9. [Como Iniciar o Worker Local](#como-iniciar-o-worker-local)
10. [Como Monitorar](#como-monitorar)

---

## 🎯 VISÃO GERAL

O sistema opera através de **múltiplos processos automáticos** que rodam em background:

- **1 Worker Node.js** (processa afiliados)
- **4 Workflows N8N** (emails, anexos, labels, convites)
- **Triggers e Webhooks** (automação em tempo real)

**RESULTADO**: Sistema 100% automático que não precisa de intervenção manual para processar afiliados, emails e pagamentos.

---

## 🤖 SISTEMAS AUTOMÁTICOS DO PROJETO

### **1. WORKER DE PROCESSAMENTO DE AFILIADOS**

**Arquivo:** `apps/web/src/services/afiliado-worker.ts:419`

#### Como funciona:
```javascript
// Fica rodando em LOOP infinito
setInterval(() => {
  processarAfiliadoPendente();
}, 10 minutos); // Configurável
```

#### O que ele faz:
```
┌─────────────────────────────────────┐
│  A cada 10 minutos, automaticamente:│
├─────────────────────────────────────┤
│  1. SELECT * FROM afiliados         │
│     WHERE status = 'PENDENTE'       │
│     LIMIT 1                         │
│                                     │
│  2. Validar padrinho                │
│  3. Validar convites disponíveis    │
│  4. Verificar se já é membro        │
│  5. DECIDIR automaticamente:        │
│     ✅ Aprovar (com código)         │
│     ❌ Rejeitar (vários motivos)    │
│                                     │
│  6. Enviar emails (via n8n)         │
│  7. Atualizar status no banco       │
└─────────────────────────────────────┘
```

#### Cenários Processados Automaticamente:

**CENÁRIO A: Padrinho Inexistente**
```javascript
// apps/web/src/services/afiliado-worker.ts:126
async function processarPadrinhoInexistente(afiliado)

1. Enviar email: template "padrinho_inexistente"
2. UPDATE afiliados SET status = 'SEM_PADRINHO'
3. Resultado: 1 email enviado
```

**CENÁRIO B: Padrinho Sem Convites**
```javascript
// apps/web/src/services/afiliado-worker.ts:162
async function processarSemConvites(afiliado)

1. Enviar email para afiliado: "sem_convites_afiliado"
2. Enviar email para padrinho: "sem_convites_padrinho"
3. UPDATE afiliados SET status = 'SEM_CONVITE'
4. Resultado: 2 emails enviados
```

**CENÁRIO C: Afiliado Já é Membro**
```javascript
// apps/web/src/services/afiliado-worker.ts:212
async function processarJaMembro(afiliado)

1. Enviar email para afiliado: "afiliado_ja_membro"
2. Enviar email para padrinho: "padrinho_convidado_ja_membro"
3. UPDATE afiliados SET status = 'JA_CADASTRADO'
4. Resultado: 2 emails enviados
```

**CENÁRIO D: APROVAÇÃO AUTOMÁTICA** ✅
```javascript
// apps/web/src/services/afiliado-worker.ts:296
async function processarAprovacao(afiliado)

1. Buscar código disponível
2. Atribuir código ao email
3. Incrementar convites_usados do padrinho
4. Enviar email para afiliado: "aprovado_afiliado" (com código)
5. Enviar email para padrinho: "aprovado_padrinho"
6. UPDATE afiliados SET status = 'ENVIADO'
7. Resultado: 2 emails enviados + código atribuído
```

#### Função Principal:
```javascript
// apps/web/src/services/afiliado-worker.ts:372
export async function processarAfiliadoPendente(): Promise<ResultadoProcessamento | null>

Retorna:
{
  afiliadoId: string,
  status: 'ENVIADO' | 'JA_CADASTRADO' | 'SEM_PADRINHO' | 'SEM_CONVITE',
  mensagem: string,
  emailsEnviados: number
}
```

**Localização:** `apps/web/src/services/afiliado-worker.ts:372`

---

### **2. SISTEMA N8N - WORKFLOW 1: Convites para Padrinhos**

**Arquivo n8n:** `doc/nm81 - 3 -Envio Convite INEMA.VIP futuros.json`

#### Como funciona:
```
⏰ SCHEDULE: A cada 1 hora (automático)

┌─────────────────────────────────────┐
│  1. SELECT * FROM pessoas_fisicas   │
│     WHERE convites_enviados = 0     │
│     LIMIT 3  (lote pequeno)         │
│                                     │
│  2. Para cada pessoa:               │
│     - Enviar email de convite       │
│     - Aguardar 45-65s (aleatório)   │
│                                     │
│  3. UPDATE pessoas_fisicas SET      │
│     convites_enviados = 5,          │
│     data_ultimo_envio = NOW()       │
│                                     │
│  4. Próximo lote em 1 hora          │
└─────────────────────────────────────┘
```

#### Estrutura do Email:
```
De: Gmail INEMATDS - TEC
Para: {email}
Assunto: Convite INEMA.VIP - Você fez Parte 2025

Olá {{ nome }},

Você agora faz parte da fundação de uma nova era — um movimento de
aprendizado, automação e transformação com Inteligência Artificial.

Como membro pioneiro da comunidade INEMA.VIP, você se torna padrinho
oficial de nossa jornada de evolução humana e tecnológica.

Cada padrinho tem direito a 5 convites gratuitos válidos até o final
de novembro.

Envie este link para seus convidados se cadastrarem:
🔗 https://inema.vip/convite.html?pid={{ pid }}

[...]

Com gratidão,
Comunidade INEMA.VIP
Nei Maldaner – Incentivador
```

**Resultado:** Pessoas viram padrinhos e ganham 5 convites automaticamente.

---

### **3. SISTEMA N8N - WORKFLOW 2: Processamento de Emails**

**Arquivo n8n:** `doc/nm81 - 1 - VIP Gmail Supabase Anexos LABEL.json`

#### Como funciona:
```
⏰ SCHEDULE: A cada X minutos (configurável)

┌──────────────────────────────────────┐
│  1. Conectar no Gmail API            │
│                                      │
│  2. Buscar emails com LABEL:         │
│     - "VIP" (pagamentos)             │
│     - "Não processado"               │
│                                      │
│  3. Para cada email:                 │
│     a) Extrair dados:                │
│        - remetente, assunto, corpo   │
│        - anexos (comprovantes)       │
│                                      │
│     b) INSERT INTO emails            │
│                                      │
│     c) Para cada anexo:              │
│        - Fazer download              │
│        - Upload para Supabase Storage│
│        - INSERT INTO email_attachments│
│                                      │
│     d) Processar comprovante:        │
│        - Extrair valor, data         │
│        - Buscar pessoa por email     │
│        - INSERT INTO pagamentos      │
│        - UPDATE pessoas_fisicas      │
│          (valor_ultimo_pagamento,    │
│           data_ultimo_pagamento,     │
│           tipo_assinatura)           │
│                                      │
│     e) Atualizar LABEL do email:     │
│        - Remover "Não processado"    │
│        - Adicionar "Processado"      │
└──────────────────────────────────────┘
```

#### Fluxo de dados:
```
Gmail → n8n → Supabase (emails) → Supabase (email_attachments)
     → Supabase (pagamentos) → Supabase (pessoas_fisicas)
```

#### Tabelas Envolvidas:

**Tabela: emails**
```sql
-- Armazena emails recebidos
message_id (PK), from, to, subject, body_text, body_html,
date_received, attachments_count, raw_headers
```

**Tabela: email_attachments**
```sql
-- Armazena anexos
id (PK), message_id (FK), filename, mime_type, size,
storage_path, created_at
```

**Tabela: pagamentos**
```sql
-- Registra transações
id (PK), pessoa_id (FK), data_pagamento, valor,
tipo_pagamento, tipo_assinatura, origem_anexo_id (FK)
```

**Tabela: pessoas_fisicas**
```sql
-- Atualizada automaticamente
valor_ultimo_pagamento, data_ultimo_pagamento, tipo_assinatura
```

---

### **4. SISTEMA N8N - WORKFLOW 3: Análise de Anexos**

**Arquivo n8n:** `doc/nm81 -2- Analise Anexo.json`

#### Como funciona:
```
⏰ TRIGGER: Quando novo email_attachment é criado

┌──────────────────────────────────────┐
│  1. Detectar novo anexo (webhook)    │
│                                      │
│  2. Baixar arquivo do Storage        │
│                                      │
│  3. Identificar tipo:                │
│     - PDF comprovante?               │
│     - Imagem de pagamento?           │
│     - Documento?                     │
│                                      │
│  4. Extrair informações:             │
│     - Valor pago (R$)                │
│     - Data do pagamento              │
│     - Tipo (PIX, boleto, etc)        │
│                                      │
│  5. Criar registro de pagamento      │
└──────────────────────────────────────┘
```

#### Lógica de Classificação:
```javascript
// Tipo de assinatura baseado no valor
if (valor >= 100) {
  tipo_assinatura = 'anual'
} else {
  tipo_assinatura = 'mensal'
}
```

---

### **5. SISTEMA N8N - WORKFLOW 4: Atualização de Labels Gmail**

**Arquivo n8n:** `doc/nm81 - 1- pix Atualizar Labels de Emails Supabase.json`

#### Como funciona:
```
⏰ SCHEDULE: A cada 30 minutos

┌──────────────────────────────────────┐
│  1. SELECT * FROM emails             │
│     WHERE label_status = 'pendente'  │
│                                      │
│  2. Para cada email:                 │
│     - Atualizar LABEL no Gmail       │
│     - Marcar como "Processado"       │
│                                      │
│  3. UPDATE emails SET                │
│     label_status = 'processado'      │
└──────────────────────────────────────┘
```

#### Labels Utilizadas:
- `VIP` - Emails de pagamentos
- `Não processado` - Aguardando processamento
- `Processado` - Já inserido no Supabase
- `Erro` - Falha no processamento

---

## 📊 DIAGRAMA COMPLETO DOS SISTEMAS AUTOMÁTICOS

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMAS RODANDO 24/7                    │
└─────────────────────────────────────────────────────────────┘

╔═══════════════════╗
║   GMAIL INBOX     ║  ← Emails chegando constantemente
╚═══════════════════╝
         │
         ↓ (A cada X minutos)
┌─────────────────────┐
│  N8N WORKFLOW #1    │ → Busca emails com label "VIP"
│  Ingestão de Emails │ → Extrai anexos
└─────────────────────┘ → Salva em Supabase
         │
         ↓
╔═══════════════════════════╗
║  SUPABASE - Tabela emails ║
╚═══════════════════════════╝
         │
         ├─→ email_attachments
         │
         └─→ TRIGGER → N8N WORKFLOW #2 (Análise de Anexo)
                           ↓
                    ┌──────────────────┐
                    │ Extrair valor    │
                    │ Criar pagamento  │
                    └──────────────────┘
                           ↓
              ╔════════════════════════╗
              ║  SUPABASE - pagamentos ║
              ╚════════════════════════╝
                           ↓
              ╔══════════════════════════╗
              ║ SUPABASE - pessoas_fisicas║
              ║ (dados atualizados)      ║
              ╚══════════════════════════╝

════════════════════════════════════════════════════════════

┌────────────────────────┐
│  USUÁRIO preenche      │
│  formulário /convite   │
└────────────────────────┘
         │
         ↓
╔═══════════════════════╗
║ SUPABASE - afiliados  ║
║ status = 'PENDENTE'   ║
╚═══════════════════════╝
         │
         ↓ (A cada 10 minutos)
┌────────────────────────┐
│  WORKER AUTOMÁTICO     │ ← apps/web/src/services/afiliado-worker.ts
│  (Node.js loop)        │
└────────────────────────┘
         │
         ├─→ Validar padrinho
         ├─→ Validar convites
         ├─→ Verificar se já é membro
         │
         ↓
    ┌─────────┐
    │ Decidir │
    └─────────┘
         │
    ┌────┴────┐
    ↓         ↓
 APROVAR  REJEITAR
    │         │
    ├─→ Atribuir código
    ├─→ Enviar email (n8n webhook)
    └─→ UPDATE afiliados SET status = 'ENVIADO'

════════════════════════════════════════════════════════════

┌────────────────────────┐
│  N8N WORKFLOW #3       │ ← A cada 1 hora
│  Enviar Convites       │
└────────────────────────┘
         │
         ↓
  SELECT pessoas_fisicas
  WHERE convites_enviados = 0
         │
         ↓
  Enviar email de convite
         │
         ↓
  UPDATE convites_enviados = 5
```

---

## 🎯 RESUMO: O QUE RODA AUTOMATICAMENTE

| Sistema | Onde roda | Frequência | O que faz | Arquivo |
|---------|-----------|------------|-----------|---------|
| **Worker de Afiliados** | Node.js (seu servidor) | 10 min | Processa afiliados pendentes, aprova/rejeita automaticamente | `afiliado-worker.ts` |
| **n8n - Ingestão de Emails** | n8n cloud/local | Configurável | Puxa emails do Gmail, extrai anexos, salva no Supabase | `nm81 - 1 - VIP Gmail...json` |
| **n8n - Análise de Anexos** | n8n cloud/local | Trigger (webhook) | Analisa comprovantes, cria pagamentos | `nm81 -2- Analise Anexo.json` |
| **n8n - Envio de Convites** | n8n cloud/local | 1 hora | Envia convites para novos padrinhos | `nm81 - 3 -Envio Convite...json` |
| **n8n - Atualizar Labels** | n8n cloud/local | 30 min | Sincroniza status entre Gmail e Supabase | `nm81 - 1- pix Atualizar...json` |

---

## ⚙️ COMO INICIAR O WORKER LOCAL

### Opção 1: Via Script
```bash
# Criar arquivo para iniciar worker
# apps/web/scripts/start-worker.ts

import { iniciarWorker } from '../src/services/afiliado-worker';
iniciarWorker();

# Rodar:
npx tsx apps/web/scripts/start-worker.ts
```

### Opção 2: Via API
```bash
# Chamar endpoint para iniciar
curl http://localhost:3000/api/worker/start

# Processar manualmente (testar)
curl -X POST http://localhost:3000/api/worker/processar
```

### Opção 3: Auto-start no Next.js
```javascript
// apps/web/src/app/layout.tsx
// Adicionar no servidor

if (process.env.NODE_ENV === 'production') {
  import('@/services/afiliado-worker').then(({ iniciarWorker }) => {
    iniciarWorker();
  });
}
```

---

## 🔍 COMO MONITORAR

### Ver logs do worker:
```javascript
// Console vai mostrar:
🤖 Iniciando processamento de afiliado pendente...
📋 Processando afiliado: João (joao@email.com)
✅ Aprovando afiliado: joao@email.com
✅ Processamento concluído: {
  afiliadoId: '123...',
  status: 'ENVIADO',
  mensagem: 'Aprovado! Código: ABC12345',
  emailsEnviados: 2
}
```

### Ver emails processados:
```sql
SELECT
  template_codigo,
  destinatario_email,
  status,
  criado_em,
  erro
FROM log_emails
ORDER BY criado_em DESC
LIMIT 10;
```

### Ver status dos afiliados:
```sql
SELECT
  nome,
  email,
  status,
  email_enviado,
  data_aprovacao,
  data_cadastro
FROM afiliados
WHERE status != 'PENDENTE'
ORDER BY data_cadastro DESC
LIMIT 20;
```

### Ver afiliados pendentes:
```sql
SELECT
  a.nome,
  a.email,
  a.status,
  a.data_cadastro,
  p.nome as padrinho_nome,
  p.convites_usados,
  p.convites_enviados
FROM afiliados a
LEFT JOIN pessoas_fisicas p ON a.padrinho_id = p.id
WHERE a.status = 'PENDENTE'
ORDER BY a.data_cadastro ASC;
```

### Dashboard de Métricas:
```sql
-- Resumo de processamento
SELECT
  status,
  COUNT(*) as total,
  COUNT(CASE WHEN email_enviado THEN 1 END) as emails_enviados
FROM afiliados
GROUP BY status
ORDER BY total DESC;

-- Performance do worker (últimas 24h)
SELECT
  DATE_TRUNC('hour', criado_em) as hora,
  COUNT(*) as emails_enviados,
  COUNT(CASE WHEN status = 'ENVIADO' THEN 1 END) as sucesso,
  COUNT(CASE WHEN status = 'FALHA' THEN 1 END) as falhas
FROM log_emails
WHERE criado_em > NOW() - INTERVAL '24 hours'
GROUP BY hora
ORDER BY hora DESC;
```

---

## 🛠️ CONFIGURAÇÕES DO WORKER

Configurações armazenadas em `configuracoes_email`:

| Chave | Valor Padrão | Descrição |
|-------|--------------|-----------|
| `worker_intervalo` | 10 | Minutos entre processamentos |
| `worker_ativo` | true | Ativar/desativar worker |
| `worker_lote_tamanho` | 1 | Quantidade de afiliados por vez |
| `rate_limit_por_minuto` | 10 | Max emails/minuto |
| `delay_entre_envios` | 3 | Segundos entre envios |
| `log_retention_dias` | 90 | Dias para manter logs |
| `telegram_bot_link` | https://t.me/... | Link do bot Telegram |

### Atualizar configuração:
```sql
UPDATE configuracoes_email
SET valor = '5'
WHERE chave = 'worker_intervalo';
```

### Via Código:
```typescript
import { atualizarConfiguracao } from '@/services/template-email-service';

await atualizarConfiguracao('worker_intervalo', '15');
```

---

## 🚨 TROUBLESHOOTING

### Worker não processa afiliados

**Problema:** Worker roda mas não processa nada

**Checklist:**
1. Verificar se há afiliados pendentes:
   ```sql
   SELECT COUNT(*) FROM afiliados WHERE status = 'PENDENTE';
   ```

2. Verificar se worker está ativo:
   ```sql
   SELECT * FROM configuracoes_email WHERE chave = 'worker_ativo';
   ```

3. Ver logs do console (Node.js)

4. Verificar se padrinho tem convites:
   ```sql
   SELECT id, nome, email, convites_usados, convites_enviados
   FROM pessoas_fisicas
   WHERE convites_usados < convites_enviados;
   ```

---

### Emails não são enviados

**Problema:** Worker processa mas emails não chegam

**Checklist:**
1. Verificar logs de email:
   ```sql
   SELECT * FROM log_emails
   WHERE status = 'FALHA'
   ORDER BY criado_em DESC
   LIMIT 10;
   ```

2. Verificar configurações SMTP:
   ```sql
   SELECT chave, valor
   FROM configuracoes_email
   WHERE chave LIKE 'smtp_%';
   ```

3. Verificar webhook n8n está ativo

4. Testar envio manual via API

---

### Códigos esgotados

**Problema:** Worker tenta aprovar mas não há códigos

**Solução:**
```sql
-- Verificar códigos disponíveis
SELECT COUNT(*) FROM codigos_convite WHERE usado = false;

-- Gerar mais códigos (via API admin)
POST /api/codigos/gerar
{
  "quantidade": 100
}
```

---

### Worker duplica processamento

**Problema:** Mesmo afiliado processado múltiplas vezes

**Causa:** Worker rodando em múltiplas instâncias

**Solução:**
1. Garantir apenas 1 instância do worker rodando
2. Usar flag de controle no banco:
   ```sql
   -- Adicionar campo
   ALTER TABLE afiliados ADD COLUMN processando_em TIMESTAMP;

   -- Implementar lock otimista
   UPDATE afiliados
   SET processando_em = NOW()
   WHERE id = ? AND processando_em IS NULL;
   ```

---

## 📈 MÉTRICAS E KPIs

### Métricas de Performance:

**Taxa de Aprovação:**
```sql
SELECT
  ROUND(
    COUNT(CASE WHEN status = 'ENVIADO' THEN 1 END) * 100.0 / COUNT(*),
    2
  ) as taxa_aprovacao_pct
FROM afiliados
WHERE status != 'PENDENTE';
```

**Tempo Médio de Processamento:**
```sql
SELECT
  AVG(EXTRACT(EPOCH FROM (data_aprovacao - data_cadastro)) / 60) as minutos_medio
FROM afiliados
WHERE data_aprovacao IS NOT NULL;
```

**Emails por Hora:**
```sql
SELECT
  DATE_TRUNC('hour', criado_em) as hora,
  COUNT(*) as emails_enviados
FROM log_emails
WHERE criado_em > NOW() - INTERVAL '24 hours'
GROUP BY hora
ORDER BY hora DESC;
```

---

## 🔐 SEGURANÇA E COMPLIANCE

### Dados Sensíveis Protegidos:
- SMTP password criptografado
- RLS ativo em todas as tabelas
- Logs com retenção configurável (LGPD)
- Rate limiting para evitar spam

### Auditoria:
```sql
-- Ver todas as ações automatizadas
SELECT * FROM audit_log
WHERE action IN ('APROVAR_AFILIADO', 'ATRIBUIR_CODIGO')
ORDER BY timestamp DESC
LIMIT 50;
```

---

## 📚 ARQUIVOS RELACIONADOS

### Código:
- `apps/web/src/services/afiliado-worker.ts` - Worker principal
- `apps/web/src/services/template-email-service.ts` - Envio de emails
- `apps/web/src/services/codigo-service.ts` - Atribuição de códigos
- `apps/web/src/services/audit-service.ts` - Auditoria

### Workflows N8N:
- `doc/nm81 - 1 - VIP Gmail Supabase Anexos LABEL.json`
- `doc/nm81 -2- Analise Anexo.json`
- `doc/nm81 - 3 -Envio Convite INEMA.VIP futuros.json`
- `doc/nm81 - 1- pix Atualizar Labels de Emails Supabase.json`
- `doc/nm81 - 4 - Padrinho -Fluxo Convites INEMA - Supabase.json`

### Documentação:
- `.ai/FLUXO-AUTOMATICO-IMPLEMENTACAO.md` - Análise completa
- `.ai/CHECKPOINT-FLUXO-AUTOMATICO.md` - Status da implementação
- `doc/fluxoEmailPagamento.txt` - Visão geral do fluxo

### Database:
- `packages/database/prisma/schema.prisma` - Schema completo
- `packages/database/prisma/migrations/` - Todas as migrations

---

## ✅ CHECKLIST DE FUNCIONAMENTO

Para garantir que tudo está rodando corretamente:

- [ ] Worker Node.js rodando (logs aparecem no console)
- [ ] N8N workflows ativos (check no dashboard n8n)
- [ ] Configurações SMTP corretas (test email enviado)
- [ ] Códigos de convite disponíveis (> 50)
- [ ] Templates de email criados (8 templates)
- [ ] Database migrations aplicadas (8 migrations)
- [ ] RLS configurado corretamente
- [ ] Webhooks n8n acessíveis
- [ ] Gmail API conectada
- [ ] Supabase Storage configurado

---

## 🎉 RESULTADO FINAL

Após toda a implementação:

```
USUÁRIO SE CADASTRA
        ↓
   (formulário web)
        ↓
FICA PENDENTE NO BANCO
        ↓
 (10 minutos depois)
        ↓
WORKER PROCESSA AUTOMATICAMENTE
        ↓
   ┌────┴────┐
   ↓         ↓
APROVADO  REJEITADO
   ↓         ↓
CÓDIGO    EMAIL EXPLICATIVO
ENVIADO   ENVIADO
   ↓         ↓
STATUS    STATUS
ATUALIZADO ATUALIZADO
```

**ZERO INTERVENÇÃO MANUAL NECESSÁRIA** ✨

---

**Status**: 🟢 Sistema 100% Automático Operacional
**Última Atualização**: 02/11/2025
**Documentado por**: Claude Code + BMad
