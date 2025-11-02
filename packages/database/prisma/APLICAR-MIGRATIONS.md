# 🗄️ Como Aplicar as Migrations

Este documento explica como aplicar as migrations SQL no Supabase.

---

## 📋 Ordem de Aplicação

Execute os scripts **na ordem numérica** no SQL Editor do Supabase:

### 1️⃣ Migration 003 - Email Templates
```bash
packages/database/prisma/migrations/003-criar-email-templates.sql
```
**O que faz**: Cria tabela `email_templates` para gerenciar templates de emails

### 2️⃣ Migration 004 - Configurações Email
```bash
packages/database/prisma/migrations/004-criar-configuracoes-email.sql
```
**O que faz**: Cria tabela `configuracoes_email` para SMTP e configurações

### 3️⃣ Migration 005 - Popular Templates
```bash
packages/database/prisma/migrations/005-popular-templates-iniciais.sql
```
**O que faz**: Insere 8 templates padrão baseados nos workflows

### 4️⃣ Migration 006 - Popular Configurações
```bash
packages/database/prisma/migrations/006-popular-configuracoes-email.sql
```
**O que faz**: Insere configurações padrão (SMTP, limites, worker, etc)

### 5️⃣ Migration 007 - Log de Emails
```bash
packages/database/prisma/migrations/007-criar-log-emails.sql
```
**O que faz**: Cria tabela `log_emails` para auditoria

### 6️⃣ Migration 008 - Atualizar Status
```bash
packages/database/prisma/migrations/008-atualizar-enum-afiliado-status.sql
```
**O que faz**: Adiciona novos status: `ENVIADO`, `JA_CADASTRADO`, `SEM_PADRINHO`

---

## 🚀 Passo a Passo

### Opção A: Supabase Dashboard (Recomendado)

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **SQL Editor**
4. Para cada migration:
   - Clique em **New query**
   - Copie e cole o conteúdo do arquivo SQL
   - Clique em **Run** (ou Ctrl+Enter)
   - Aguarde mensagem de sucesso ✅

### Opção B: CLI do Supabase

```bash
# Se tiver Supabase CLI instalado
cd packages/database/prisma/migrations

# Executar cada migration
supabase db execute --file 003-criar-email-templates.sql
supabase db execute --file 004-criar-configuracoes-email.sql
supabase db execute --file 005-popular-templates-iniciais.sql
supabase db execute --file 006-popular-configuracoes-email.sql
supabase db execute --file 007-criar-log-emails.sql
supabase db execute --file 008-atualizar-enum-afiliado-status.sql
```

---

## ✅ Verificar se Funcionou

Após aplicar todas as migrations, execute:

```sql
-- Verificar tabelas criadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('email_templates', 'configuracoes_email', 'log_emails');

-- Verificar templates inseridos
SELECT codigo, nome, ativo FROM email_templates ORDER BY nome;

-- Deve retornar 8 templates:
-- 1. afiliado_ja_membro
-- 2. aprovado_afiliado
-- 3. aprovado_padrinho
-- 4. convite_padrinho
-- 5. padrinho_convidado_ja_membro
-- 6. padrinho_inexistente
-- 7. sem_convites_afiliado
-- 8. sem_convites_padrinho

-- Verificar configurações
SELECT grupo, COUNT(*) as total
FROM configuracoes_email
GROUP BY grupo
ORDER BY grupo;

-- Deve retornar:
-- geral:     2 configurações
-- limites:   4 configurações
-- logs:      3 configurações
-- remetente: 3 configurações
-- smtp:      5 configurações
-- templates: 2 configurações
-- worker:    4 configurações
```

---

## ⚙️ Próximos Passos Após Migrations

### 1. Configurar SMTP

Acesse o painel admin e configure:
- `smtp_user`: seu email do Gmail
- `smtp_password`: App Password do Gmail (não use a senha normal!)

**Como criar App Password no Gmail:**
1. Vá em: https://myaccount.google.com/security
2. Ative "Verificação em duas etapas"
3. Vá em "Senhas de app"
4. Gere uma senha para "Email"
5. Use essa senha no campo `smtp_password`

### 2. Atualizar Prisma Client

```bash
cd packages/database
npx prisma generate
```

### 3. Testar Envio de Email

Crie um teste simples:

```typescript
import { enviarEmailPorTemplate } from '@/services/template-email-service';

await enviarEmailPorTemplate({
  templateCodigo: 'padrinho_inexistente',
  destinatario: {
    email: 'teste@exemplo.com',
    nome: 'Teste',
  },
  variaveis: {
    nome: 'João da Silva',
  },
});
```

---

## 🔄 Reverter Migrations (se necessário)

Se precisar desfazer as mudanças:

```sql
-- Reverter Migration 008
-- (Não é possível remover valores de ENUM, apenas deprecar)

-- Reverter Migration 007
DROP TABLE IF EXISTS log_emails CASCADE;

-- Reverter Migration 006
DELETE FROM configuracoes_email;

-- Reverter Migration 005
DELETE FROM email_templates;

-- Reverter Migration 004
DROP TABLE IF EXISTS configuracoes_email CASCADE;

-- Reverter Migration 003
DROP TABLE IF EXISTS email_templates CASCADE;
```

---

## 📝 Notas Importantes

1. **Backup**: Sempre faça backup antes de aplicar migrations em produção
2. **Ordem**: Execute as migrations NA ORDEM (003 → 008)
3. **Erros**: Se uma migration falhar, corrija o erro antes de prosseguir
4. **RLS**: As políticas de segurança (RLS) estão configuradas automaticamente
5. **SMTP**: Configure as credenciais SMTP antes de testar envios

---

## 🆘 Problemas Comuns

### ❌ "relation already exists"
**Solução**: A tabela já existe. Pule esta migration ou delete a tabela antes.

### ❌ "permission denied"
**Solução**: Use um usuário com permissões de admin no Supabase.

### ❌ "duplicate key value"
**Solução**: Os dados já foram inseridos. Use `ON CONFLICT DO NOTHING` ou delete antes.

### ❌ Emails não estão sendo enviados
**Solução**:
1. Verifique configurações SMTP em `configuracoes_email`
2. Verifique se usou App Password (não a senha normal)
3. Verifique logs em `log_emails` para ver erros

---

**Pronto!** Suas migrations estão aplicadas. Agora você pode:
- Configurar templates no admin
- Iniciar o worker automático
- Testar o fluxo completo
