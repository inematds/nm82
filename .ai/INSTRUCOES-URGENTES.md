# ✅ INSTRUÇÕES URGENTES - Aplicar Antes de Testar

## 🔧 PROBLEMA RESOLVIDO

O erro `relation "usuarios" does not exist` foi corrigido!
As RLS policies agora referenciam a tabela correta: `user_roles`

## 🚨 PRÓXIMO PASSO

As páginas admin estão dando erro porque as tabelas ainda não foram criadas no banco de dados.

---

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### PASSO 1: Aplicar Migrations no Supabase

1. Acesse: **Supabase Dashboard** → https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **SQL Editor**
4. Execute os scripts **EM ORDEM**:

#### Script 1: Email Templates
```
packages/database/prisma/migrations/003-criar-email-templates.sql
```
Copie TODO o conteúdo e execute no SQL Editor

#### Script 2: Configurações Email
```
packages/database/prisma/migrations/004-criar-configuracoes-email.sql
```
Copie TODO o conteúdo e execute no SQL Editor

#### Script 3: Popular Templates
```
packages/database/prisma/migrations/005-popular-templates-iniciais.sql
```
Copie TODO o conteúdo e execute no SQL Editor

#### Script 4: Popular Configurações
```
packages/database/prisma/migrations/006-popular-configuracoes-email.sql
```
Copie TODO o conteúdo e execute no SQL Editor

#### Script 5: Log Emails
```
packages/database/prisma/migrations/007-criar-log-emails.sql
```
Copie TODO o conteúdo e execute no SQL Editor

#### Script 6: Status SEM_CONVITE
```
packages/database/prisma/migrations/008-atualizar-enum-afiliado-status.sql
```
Copie TODO o conteúdo e execute no SQL Editor

#### Script 7: Status SEM_CONVITE (adicional)
```
packages/database/prisma/migrations/009-adicionar-status-sem-convite.sql
```
Copie TODO o conteúdo e execute no SQL Editor

---

### PASSO 2: Gerar Prisma Client

**IMPORTANTE**: Feche o servidor de desenvolvimento primeiro!

```bash
# Parar o servidor (Ctrl+C no terminal)

# Regenerar Prisma Client
cd packages/database
npx prisma generate

# Voltar para raiz e iniciar servidor
cd ../..
npm run dev
```

---

### PASSO 3: Testar

Acesse:
- http://localhost:3000/admin/templates-email
- http://localhost:3000/admin/configuracoes-email

Deve funcionar! 🎉

---

## 🔍 VERIFICAR SE FUNCIONOU

Execute no Supabase SQL Editor:

```sql
-- Verificar tabelas criadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('email_templates', 'configuracoes_email', 'log_emails');

-- Deve retornar 3 tabelas
```

```sql
-- Verificar templates inseridos
SELECT codigo, nome, ativo FROM email_templates ORDER BY nome;

-- Deve retornar 8 templates
```

```sql
-- Verificar configurações
SELECT COUNT(*) as total FROM configuracoes_email;

-- Deve retornar 23 configurações
```

---

## ❌ SE AINDA DER ERRO

### Erro: "Prisma Client não encontrado"

```bash
# Deletar node_modules do Prisma
rm -rf node_modules/.prisma

# Reinstalar
npm install

# Gerar novamente
cd packages/database
npx prisma generate
```

### Erro: "Tabela não existe"

Verifique se executou TODAS as migrations no Supabase.

### Erro: "Não autorizado"

Faça login como ADMIN no sistema.

---

## 📝 ORDEM CORRETA

1. ✅ Aplicar migrations no Supabase (scripts 003 a 009)
2. ✅ Fechar servidor dev
3. ✅ Executar `npx prisma generate`
4. ✅ Iniciar servidor dev
5. ✅ Testar páginas admin

---

## 🆘 AJUDA RÁPIDA

**Se não conseguir aplicar as migrations**:

Eu posso criar um script único que executa tudo de uma vez. Avise se precisar.

**Se o Prisma não gerar**:

Pode ser necessário fechar TODOS os processos Node.js:
- Fechar VSCode
- Fechar terminal
- Abrir novamente
- Tentar novamente

---

**STATUS**: ⏳ Aguardando aplicação das migrations

Depois que aplicar, tudo vai funcionar perfeitamente! 🚀
