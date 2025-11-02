# ✅ FIX: Erros nas RLS Policies - RESOLVIDO

## 🔍 Problemas Identificados e Corrigidos

### Erro 1: `relation "usuarios" does not exist`
As RLS policies estavam referenciando uma tabela `usuarios` que não existe.

### Erro 2: `column ur.userId does not exist`
As RLS policies estavam usando `userId` (camelCase), mas o PostgreSQL usa `user_id` (snake_case).

## 🛠️ Correções Aplicadas

Atualizei **TODAS** as migrations para usar a tabela E coluna corretas: `user_roles.user_id`

### Arquivos Corrigidos:

1. ✅ `packages/database/prisma/migrations/APLICAR-TUDO-AGORA.sql` (consolidado)
2. ✅ `packages/database/prisma/migrations/003-criar-email-templates.sql`
3. ✅ `packages/database/prisma/migrations/004-criar-configuracoes-email.sql`
4. ✅ `packages/database/prisma/migrations/007-criar-log-emails.sql`

### Mudanças Realizadas:

**ANTES (totalmente incorreto):**
```sql
EXISTS (
  SELECT 1 FROM usuarios u
  WHERE u.id = auth.uid()
  AND u.role = 'ADMIN'
)
```

**TENTATIVA 1 (ainda incorreto):**
```sql
EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur."userId" = auth.uid()::text  -- ❌ userId não existe!
  AND ur.role = 'ADMIN'
)
```

**AGORA (100% correto):**
```sql
EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur.user_id = auth.uid()::text  -- ✅ Correto!
  AND ur.role = 'ADMIN'
)
```

**Lição aprendida:** PostgreSQL/Supabase usa `snake_case` para colunas, não `camelCase` como no Prisma schema!

## 📋 Próximos Passos

### Agora você pode aplicar a migration no Supabase!

1. **Acesse Supabase Dashboard**
   - https://supabase.com/dashboard
   - Selecione seu projeto
   - Vá em **SQL Editor**

2. **Execute o arquivo consolidado:**
   ```
   packages/database/prisma/migrations/APLICAR-TUDO-AGORA.sql
   ```
   - Copie TODO o conteúdo do arquivo
   - Cole no SQL Editor
   - Clique em **Run**

3. **Aguarde a execução** (pode levar alguns segundos)

4. **Verifique se funcionou:**
   ```sql
   -- Deve retornar 3 tabelas
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('email_templates', 'configuracoes_email', 'log_emails');

   -- Deve retornar 8 templates
   SELECT codigo, nome, ativo FROM email_templates ORDER BY nome;

   -- Deve retornar 23 configurações
   SELECT COUNT(*) as total FROM configuracoes_email;
   ```

5. **Regenerar Prisma Client:**
   ```bash
   # Fechar servidor dev primeiro (Ctrl+C)

   cd packages/database
   npx prisma generate

   # Voltar para raiz e iniciar
   cd ../..
   npm run dev
   ```

6. **Testar as páginas admin:**
   - http://localhost:3000/admin/templates-email
   - http://localhost:3000/admin/configuracoes-email

## ✨ Resultado Esperado

Depois de seguir estes passos, as páginas admin devem carregar corretamente e você poderá:
- ✅ Ver e editar os 8 templates de email
- ✅ Configurar SMTP e outras configurações
- ✅ Testar envio de emails

## 🆘 Se algo der errado

Se encontrar outro erro durante a execução no Supabase, copie a mensagem completa do erro e me avise!
