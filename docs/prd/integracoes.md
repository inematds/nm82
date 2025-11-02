# 🔗 Integrações

### Integração 1: n8n Workflows (Existentes)

**Direção**: Bidirecional
**Propósito**: Manter automações de email e envios bulk

**Endpoints nm82 → n8n**:
```
POST https://n8n.inema.vip/webhook/processar-pagamento
POST https://n8n.inema.vip/webhook/enviar-convite-bulk
```

**Endpoints n8n → nm82**:
```
POST https://inema.vip/api/webhooks/email-processado
POST https://inema.vip/api/webhooks/pagamento-confirmado
```

**Workflows Preservados**:
1. nm81-1: Processar emails Gmail com anexos
2. nm81-4: Fluxo de aprovação de convites (será substituído gradualmente)
3. nm81-3: Envio de convites em massa

---

### Integração 2: Supabase

**Direção**: nm82 → Supabase
**Propósito**: Persistência de dados

**Método**: Prisma ORM
**Auth**: Service Role Key (backend), Anon Key + RLS (frontend)

**Migração**:
- Manter tabelas existentes
- Adicionar RLS policies
- Criar tabelas auxiliares (user_roles, notifications, audit_logs)

---

### Integração 3: Telegram Bot

**Direção**: nm82 → Telegram
**Propósito**: Geração de links de acesso

**Método**: URL com código
**Formato**: `https://t.me/INEMAMembroBot?start={codigo}`

**Não há API direta** - apenas geração de URLs.
