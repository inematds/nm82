# ✅ FIX: Error "relation usuarios does not exist"

## 🔍 Problema Identificado

O erro ocorreu porque as RLS (Row Level Security) policies nas migrations estavam referenciando uma tabela `usuarios` que não existe no banco de dados.

## 🛠️ Correção Aplicada

Atualizei **TODAS** as migrations para usar a tabela correta: `user_roles`

### Arquivos Corrigidos:

1. ✅ `packages/database/prisma/migrations/APLICAR-TUDO-AGORA.sql` (consolidado)
2. ✅ `packages/database/prisma/migrations/003-criar-email-templates.sql`
3. ✅ `packages/database/prisma/migrations/004-criar-configuracoes-email.sql`
4. ✅ `packages/database/prisma/migrations/007-criar-log-emails.sql`

### Mudança Realizada:

**ANTES (incorreto):**
```sql
EXISTS (
  SELECT 1 FROM usuarios u
  WHERE u.id = auth.uid()
  AND u.role = 'ADMIN'
)
```

**DEPOIS (correto):**
```sql
EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur."userId" = auth.uid()::text
  AND ur.role = 'ADMIN'
)
```

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
