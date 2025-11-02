# 📋 Resumo Executivo - Implementação RF-003 e RF-004

**Data:** 02/11/2025
**Para:** Equipe de Desenvolvimento
**De:** Arquiteto de Software

---

## 🎯 Objetivo

Implementar fluxos críticos de gestão de afiliados e padrinhos com garantias de:
- ✅ **Consistência de dados** (ACID transactions)
- ✅ **Rastreabilidade completa** (audit log + logging)
- ✅ **Monitoramento em tempo real** (métricas + alertas)
- ✅ **Resiliência** (retry automático, validações)

---

## 📊 O Que Será Implementado

### RF-003: Gestão de Padrinhos
- Ajuste de convites disponíveis
- Histórico de afiliados convidados
- Filtros avançados
- Export CSV

### RF-004: Gestão de Afiliados (CRÍTICO)
**Fluxo de Aprovação Completo:**
1. Admin clica em "Aprovar" afiliado pendente
2. Sistema valida (status, padrinho ativo, convites disponíveis)
3. Sistema atribui código de convite (transaction)
4. Sistema incrementa convites usados do padrinho
5. Sistema envia email com link Telegram
6. Sistema notifica padrinho

**Garantias:**
- ✅ Atomicidade (tudo ou nada)
- ✅ Código único por afiliado
- ✅ Sem race conditions
- ✅ Retry automático em falhas de email

---

## 🏗️ Arquitetura Proposta

### Componentes Principais

```
┌─────────────────────────────────────────────────────┐
│                 Frontend (Admin)                    │
│  ┌─────────────────────────────────────────────┐  │
│  │  Aprovação Dialog                           │  │
│  │  - Preview dos dados                        │  │
│  │  - Validações antes de enviar               │  │
│  │  - Feedback em tempo real                   │  │
│  └─────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              API Route (Next.js)                    │
│  POST /api/afiliados/[id]/aprovar                  │
│                                                      │
│  1. Auth & Permissions (ADMIN only)                │
│  2. Validações iniciais                            │
│  3. Transaction START                              │
│     ├─ Atribuir código (SELECT FOR UPDATE)        │
│     ├─ Atualizar afiliado (status → APROVADO)    │
│     ├─ Incrementar convites_usados do padrinho   │
│     └─ Audit log                                  │
│  4. Transaction COMMIT                             │
│  5. Notificações (async, não bloqueante)          │
│                                                      │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│            Services (Lógica de Negócio)            │
│  ┌──────────────────┐  ┌──────────────────┐       │
│  │ AfiliadoService  │  │  CodigoService   │       │
│  │ - aprovar()      │  │  - assign()      │       │
│  │ - rejeitar()     │  │  - getAvailable()│       │
│  │ - aprovarBulk()  │  └──────────────────┘       │
│  └──────────────────┘                              │
│  ┌──────────────────┐  ┌──────────────────┐       │
│  │  EmailService    │  │  AuditService    │       │
│  │ - sendWithRetry()│  │  - log()         │       │
│  └──────────────────┘  └──────────────────┘       │
└─────────────────────────────────────────────────────┘
```

### Transaction Flow (CRÍTICO)

```
BEGIN TRANSACTION (Isolation: SERIALIZABLE)
    │
    ├─> SELECT codigo WHERE usado=false FOR UPDATE
    │   (Previne race condition)
    │
    ├─> UPDATE codigo SET usado=true, email=...
    │
    ├─> UPDATE afiliado SET status='APROVADO', codigo_id=...
    │
    ├─> UPDATE padrinho SET convites_usados = convites_usados + 1
    │
    └─> INSERT audit_log (action='APROVAR_AFILIADO', ...)
    │
COMMIT
    │
    └─> Send Email (async, não bloqueante)
```

---

## 📈 Monitoramento e Observabilidade

### 1. Logging Estruturado (Pino)

Cada etapa do fluxo gera logs:

```json
{
  "level": "info",
  "flow": "APROVAR_AFILIADO",
  "flowId": "abc123",
  "msg": "CODIGO_ATRIBUIDO",
  "codigoId": "xyz789",
  "duration": 245
}
```

**Benefícios:**
- Rastreamento completo end-to-end
- Debug facilitado em produção
- Compliance LGPD (redact de dados sensíveis)

### 2. Métricas de Performance

```javascript
FlowMetrics.recordDuration('APROVAR_AFILIADO', 1250);

// Dashboard de métricas:
{
  count: 1523,      // Total de aprovações
  avg: 1250,        // Tempo médio: 1.25s
  p95: 1800,        // 95% em menos de 1.8s
  p99: 2500,        // 99% em menos de 2.5s
}
```

**SLA Definido:** P95 < 2 segundos

### 3. Alertas Automáticos

| Evento | Severity | Ação |
|--------|----------|------|
| Códigos esgotados | 🔴 Critical | Email + Slack |
| Falha em aprovação | 🟡 Warning | Notificação in-app |
| Tempo > 5s | 🔵 Info | Log apenas |

---

## ⚠️ Principais Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| **Código já atribuído a outro** | Transaction com SELECT FOR UPDATE |
| **Padrinho sem convites** | Validação antes da transaction |
| **Falha no envio de email** | Retry automático (3x) + notificação |
| **Inconsistência de dados** | Transaction ACID + job de validação diária |
| **n8n webhook offline** | Timeout 5s + fila de retry |

---

## 📅 Cronograma

| Fase | Duração | Entregas |
|------|---------|----------|
| **1. Fundação** | 2-3 dias | Logging, métricas, AfiliadoService |
| **2. Aprovação** | 3-4 dias | Fluxo completo com transaction |
| **3. Rejeição** | 1-2 dias | UI + notificações |
| **4. Padrinhos** | 2-3 dias | Histórico, filtros, export |
| **5. Melhorias** | 2-3 dias | Bulk approval, validação |

**Total:** 10-15 dias úteis

---

## ✅ Critérios de Sucesso

### Performance
- [ ] P95 < 2 segundos
- [ ] Taxa de sucesso > 99%

### Confiabilidade
- [ ] 0 inconsistências de dados
- [ ] 100% de auditoria

### Observabilidade
- [ ] Logs em todas as etapas
- [ ] Métricas coletadas
- [ ] Alertas configurados

---

## 🚀 Próximos Passos

1. **Aprovação deste documento**
2. **Setup do ambiente de logging**
3. **Implementação do AfiliadoService**
4. **Testes de integração**
5. **Deploy em staging**
6. **Validação com dados reais**
7. **Deploy em produção**

---

## 📞 Contato

**Dúvidas técnicas:** Ver documento completo em `docs/arquitetura/fluxo-aprovacao-rf-003-004.md`

**Referências:**
- PRD: `docs/prd/requisitos-funcionais.md`
- Integrações: `docs/prd/integracoes.md`
- Código atual: `apps/web/src/app/api/afiliados/`

---

**Criado:** 02/11/2025
**Status:** ✅ Pronto para implementação
