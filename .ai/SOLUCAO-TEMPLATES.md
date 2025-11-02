# ✅ SOLUÇÃO: Corrigir Templates de Email

## 🔍 Diagnóstico Completo

**Problema Encontrado:**
- ✅ Conexão com banco funcionando (outros formulários OK)
- ❌ Templates de email com erro 500
- ❌ Configurações de email com erro 500

**Causa Raiz:**
As tabelas `email_templates` e `configuracoes_email` têm **Row Level Security (RLS)** ativado. O RLS verifica `auth.uid()` para autenticação, mas o Prisma se conecta diretamente ao PostgreSQL (não via Supabase Auth), então `auth.uid()` retorna `NULL` e o acesso é negado.

## 🛠️ Como Corrigir

### Passo 1: Abrir Supabase SQL Editor

1. Acesse: https://app.supabase.com/project/ojlzvjnulppspqpuruqw/sql/new
2. Faça login se necessário

### Passo 2: Executar o Script SQL

1. Abra o arquivo: `.ai/FIX-EMAIL-TEMPLATES-RLS.sql`
2. Copie TODO o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (botão verde)

### Passo 3: Verificar Resultado

Se aparecer ✅ **"Success. No rows returned"**, o script foi executado com sucesso!

### Passo 4: Testar no Navegador

1. Vá para: http://localhost:3000/admin/templates-email
2. A página deve carregar os templates sem erro
3. Se ainda mostrar erro, recarregue a página (F5)

## 📋 O Que o Script Faz

```sql
-- Remove políticas RLS antigas
DROP POLICY IF EXISTS "Admin pode gerenciar templates" ON email_templates;
DROP POLICY IF EXISTS "Sistema pode ler templates ativos" ON email_templates;

-- Desabilita RLS (tabelas de configuração não precisam de RLS)
ALTER TABLE email_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_email DISABLE ROW LEVEL SECURITY;
ALTER TABLE log_emails DISABLE ROW LEVEL SECURITY;
```

**Por que é seguro:**
- Essas são tabelas de configuração do sistema (não dados sensíveis de usuários)
- O backend já tem autenticação e autorização
- RLS continua ativo em tabelas sensíveis (user_roles, pessoas_fisicas, afiliados, etc.)

## ❓ Se Ainda Houver Problemas

1. Verifique se o servidor está rodando: http://localhost:3000
2. Verifique o console do servidor (onde você rodou `npm run dev`)
3. Procure por erros relacionados a "email_templates" ou "configuracoes_email"
4. Se o erro persistir, envie print do erro

## ✅ Próximos Passos Após Corrigir

Depois que os templates funcionarem:
1. Configure os templates de email no painel admin
2. Configure as credenciais SMTP em "Configurações de Email"
3. Teste o envio de emails
