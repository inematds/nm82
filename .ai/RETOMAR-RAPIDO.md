# 🚀 Guia Rápido para Retomar - NM82

## ✅ Status: MVP 95% COMPLETO

## 🔥 Comandos Essenciais

### Iniciar Servidor
```bash
cd C:\Users\neima\projetosCC\Convites\apps\web
npm run dev
```
**URL:** http://localhost:3000

### Verificar se Está Rodando
```bash
netstat -ano | findstr :3000
# Deve mostrar: PID 19428 (ou outro)
```

---

## 📱 Páginas Funcionando

| Página | URL | Status | Descrição |
|--------|-----|--------|-----------|
| Dashboard | /dashboard | ✅ | Métricas + 2 gráficos (afiliados/padrinhos por dia) |
| **Pessoas** | /pessoas | ✅ | Edição completa de pessoas físicas |
| Padrinhos | /padrinhos | ✅ | Lista + editar convites (com dados do padrinho) |
| Afiliados | /afiliados | ✅ | Lista + stats + gráfico |
| Códigos | /codigos | ✅ | Lista + gerar + gráfico |
| **Usuários** | /admin/usuarios | ✅ **NOVO** | Gerenciamento completo de usuários e permissões |
| Admin | /admin | ✅ | Anonimização de dados |

---

## 🎯 Última Feature Implementada

### PÁGINA PESSOAS (NOVO)
**Local:** http://localhost:3000/pessoas
**Menu:** 2º item (ícone Contact)

**O que faz:**
- Lista todas as pessoas físicas (3,616 registros)
- Busca por nome, email ou CPF
- **Edita TODOS os campos:**
  - Dados Pessoais: Nome*, Email*, CPF, Data Nascimento, Sexo
  - Localização: Cidade, UF
  - Profissional: Nicho de Atuação
  - Convites: Enviados, Usados (com preview)
  - Status: Ativo/Inativo

**APIs Criadas:**
- `GET /api/pessoas-fisicas?search=X&limit=N`
- `GET /api/pessoas-fisicas/[id]`
- `PUT /api/pessoas-fisicas/[id]`

**Arquivos:**
- `apps/web/src/app/(auth)/pessoas/page.tsx` (524 linhas)
- `apps/web/src/app/api/pessoas-fisicas/route.ts`
- `apps/web/src/app/api/pessoas-fisicas/[id]/route.ts`

---

## 📊 Dados Atuais

- **Pessoas Físicas:** 3,616 (3,614 Ativas / 2 Inativas)
- **Top 5 Localizações:** SP (14), RJ (10), BA (7), GO (4), CE (4)
- **Padrinhos:** 3,560
- **Afiliados:** 133 (4 Pendentes / 56 Aprovados / 73 Rejeitados)
- **Códigos:** 1,000 (935 Disponíveis / 65 Usados)
- **Convites:** 5,000 Enviados / 25 Usados / 4,975 Disponíveis

---

## ⚠️ IMPORTANTE: Correções Aplicadas

### 1. Middleware Auth DESABILITADO
**Arquivo:** `apps/web/src/middleware.ts` (linhas 16-39)
**Motivo:** Desenvolvimento sem auth
**⚠️ PRODUÇÃO:** Descomentar para reativar

### 2. Disponíveis = Enviados - Usados
**Cálculo:** Dinâmico (não usa coluna DB)
**Motivo:** Coluna tinha valor fixo errado (2025)

### 3. Status Afiliados CORRIGIDO
**Executado:** POST `/api/afiliados/fix-status`
**Resultado:** 143 registros corrigidos
- "Enviado" → APROVADO (63)
- "Já Cadastrado" → REJEITADO (75)

---

## 🛠️ Se Algo Quebrar

### Página 404
```bash
# Verificar se arquivo existe
ls apps/web/src/app/\(auth\)/NOME_DA_PAGINA/page.tsx

# Verificar imports (label, dialogfooter, etc)
# Problema comum: imports faltando
```

### API Erro 500
```bash
# Ver logs no terminal onde npm run dev está rodando
# Verificar console.error no código
# NOVO: Logging detalhado em pessoas/page.tsx e API
```

### Dados Zerados
```bash
# Verificar query SQL
# Problema comum: .or() ou .eq() errado
# Ver: apps/web/src/app/api/dashboard/metrics/route.ts linha 35
```

### Debugging Página Pessoas
**Logging Detalhado Adicionado:**
- ✅ Frontend: Console logs em handleEditar, handleSalvar, fetchPessoas
- ✅ Backend: Console logs no PUT /api/pessoas-fisicas/[id]
- **Como ver logs:**
  1. Abra Developer Tools (F12) no navegador
  2. Vá para aba Console
  3. Tente editar uma pessoa
  4. Veja os logs com emojis: 📝 🔍 💾 📡 📥 ✅ ❌
  5. Terminal do servidor também mostra logs do backend

---

## 📁 Estrutura Importante

```
apps/web/src/
├── app/
│   ├── (auth)/              # Páginas autenticadas
│   │   ├── dashboard/
│   │   ├── pessoas/         # ← NOVO
│   │   ├── padrinhos/
│   │   ├── afiliados/
│   │   ├── codigos/
│   │   └── admin/
│   └── api/                 # APIs
│       ├── dashboard/
│       ├── pessoas-fisicas/ # ← NOVO
│       ├── padrinhos/
│       ├── afiliados/
│       ├── codigos/
│       └── admin/
├── components/
│   ├── ui/                  # Shadcn components
│   └── layout/
│       └── sidebar.tsx      # Menu lateral
└── lib/
    └── supabase.ts          # Cliente Supabase
```

---

## 🔗 Links Úteis

**Documentação Completa:** `.ai/ESTADO-ATUAL-DESENVOLVIMENTO.md`
**Resumo Anterior:** `.ai/RESUMO-FINAL.md`
**Schema DB:** `packages/database/prisma/create-tables.sql`

---

## 🎨 Menu Lateral (Ordem)

1. Dashboard (LayoutDashboard)
2. **Pessoas** (Contact)
3. Padrinhos (Users)
4. Afiliados (UserCheck)
5. Códigos (Ticket)
6. **Configuração** (Settings) ← DROPDOWN (clique na engrenagem)
   - **Usuários** (UserCog)
   - Anonimização (Settings)

~~Pagamentos (REMOVIDO)~~

---

## ✨ Features Implementadas

### Sessão Anterior
- [x] Paginação (50/100/200/500) em Afiliados, Códigos
- [x] Gráficos no Dashboard (Afiliados + Padrinhos por dia)
- [x] Removido menu Pagamentos e card Receita
- [x] Dialog de edição Padrinhos com dados completos
- [x] **Página Pessoas com edição completa**
- [x] Anonimização de dados
- [x] Todas correções de bugs

### Sessão Atual (01/11/2025 - 22:00+)
- [x] **Status dos Afiliados no Dashboard** ← NOVO
  - 3 cards de status (Pendentes, Aprovados, Rejeitados)
  - Cores: Amarelo, Verde, Vermelho
  - Percentuais calculados dinamicamente
- [x] **Gráficos de Pizza por Estado** ← NOVO
  - Afiliados por UF (Top 10)
  - Padrinhos por UF (Top 10 - vazio pois UF não preenchido)
  - Cores variadas com legenda
- [x] **Removido completamente Pagamentos/Receita**
  - API de métricas sem pagamentos
  - Adicionado: Códigos Usados no dashboard
- [x] **Correção erro página Pessoas**
  - SelectItem com value vazio causava erro
  - Logging detalhado adicionado
- [x] **Lista Últimos Afiliados MELHORADA** ← NOVO
  - Tabela com 4 colunas
  - Mostra Padrinho + Localização do afiliado
  - Localização formatada (Cidade, UF ou só UF)
- [x] **Anonimização CORRIGIDA E FUNCIONANDO** ← IMPORTANTE
  - Corrigido: Emails únicos com index
  - Corrigido: Busca TODOS os 3.616 registros (não apenas 1.000)
  - **3.186 de 3.616 registros anonimizados com sucesso**
  - Nomes: João Silva Santos, Maria Oliveira Lima, etc.
  - Emails: @email.com, @teste.com, @exemplo.com, @demo.com

---

## 🚀 Próximos Passos Sugeridos

1. ✅ Testar página Pessoas
2. ✅ Testar edição de pessoa
3. ✅ Sistema de usuários completo
4. ✅ Dashboard com métricas de pessoas físicas
5. 📋 **Implementar RF-003 e RF-004** ← PRÓXIMO
   - Ver: `docs/arquitetura/fluxo-aprovacao-rf-003-004.md`
   - Ver: `docs/arquitetura/RESUMO-EXECUTIVO.md`
6. ⏳ Implementar export CSV
7. ⏳ Adicionar toast notifications
8. ⏳ Melhorar responsividade mobile
9. ⏳ Preparar para deploy

---

---

## 👥 SISTEMA DE USUÁRIOS (NOVO - 02/11/2025)

### Features Implementadas
- [x] **Autenticação com NextAuth** - Já estava configurado
- [x] **Página de Login** - `/auth/login`
- [x] **Gerenciamento de Usuários** - `/admin/usuarios`
- [x] **Criar novos usuários** com email, senha e permissões
- [x] **Editar usuários** (nome, email, roles)
- [x] **Deletar usuários**
- [x] **Trocar senha** (admin pode resetar senha de qualquer usuário)
- [x] **Sistema de Roles** (ADMIN, EDITOR, VIEWER)

### Roles/Permissões
| Role | Descrição | Permissões |
|------|-----------|------------|
| **ADMIN** | Administrador | Acesso total - pode criar/editar/deletar tudo, incluindo gerenciar usuários |
| **EDITOR** | Editor | Pode ler e editar dados (pessoas, padrinhos, afiliados, códigos) mas NÃO pode gerenciar usuários |
| **VIEWER** | Visualizador | Apenas leitura - não pode editar nada |

### APIs Criadas
- `GET /api/usuarios` - Listar todos os usuários
- `POST /api/usuarios` - Criar novo usuário
- `GET /api/usuarios/[id]` - Buscar usuário específico
- `PUT /api/usuarios/[id]` - Atualizar usuário (nome, email, roles)
- `DELETE /api/usuarios/[id]` - Deletar usuário
- `POST /api/usuarios/change-password` - Trocar senha

### Arquivos
- **Páginas:**
  - `apps/web/src/app/(public)/auth/login/page.tsx` - Login
  - `apps/web/src/app/(auth)/admin/usuarios/page.tsx` - Gerenciamento (750+ linhas)
- **APIs:**
  - `apps/web/src/app/api/usuarios/route.ts` - GET/POST
  - `apps/web/src/app/api/usuarios/[id]/route.ts` - GET/PUT/DELETE
  - `apps/web/src/app/api/usuarios/change-password/route.ts` - POST
- **Auth:**
  - `apps/web/src/lib/auth.ts` - NextAuth config
  - `apps/web/src/middleware.ts` - Middleware (DESABILITADO para dev)
  - `apps/web/src/lib/permissions.ts` - Helpers de permissões
- **Database:**
  - `packages/database/prisma/update-roles.sql` - Script para adicionar EDITOR/VIEWER ao enum

### Como Usar

#### 1. Executar script SQL no Supabase
```sql
-- No Supabase Dashboard > SQL Editor
-- Execute o conteúdo de: packages/database/prisma/update-roles.sql
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'EDITOR';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'VIEWER';
```

#### 2. Criar primeiro usuário ADMIN manualmente
Como a auth está desabilitada, você pode criar usuários pela página `/admin/usuarios`.
Quando ativar a auth, será necessário ter pelo menos um ADMIN criado.

#### 3. Ativar Autenticação (PRODUÇÃO)
Descomentar o código em `apps/web/src/middleware.ts` (linhas 18-39)

### Status Atual
⚠️ **AUTH DESABILITADA** - Para desenvolvimento
✅ Todas as funcionalidades implementadas e testáveis
✅ Sistema de permissões pronto para ser aplicado

---

---

## 📖 Documentação Completa

**Ver detalhes completos da sessão:** `.ai/SESSAO-02-11-2025.md`

Este arquivo contém:
- Todas as APIs criadas com exemplos
- Estrutura completa de arquivos
- Testes realizados
- Como usar cada feature
- Próximos passos sugeridos
- Troubleshooting

---

**Última Atualização:** 02/11/2025 - 02:00
**Sistema:** Funcionando ✅
**Servidor:** http://localhost:3000
**Sessão Atual:**
- ✅ Sistema Completo de Usuários + Permissões (ADMIN/EDITOR/VIEWER)
- ✅ Menu "Configuração" com dropdown (Usuários + Anonimização)
- ✅ Atualização de roles funcionando 100%
- ✅ Documentação completa gerada
- ✅ **Dashboard com métricas de Pessoas Físicas**
  - Total de Pessoas Físicas: 3,616
  - Pessoas Ativas/Inativas (com %)
  - Top 5 Localizações (UF): SP, RJ, BA, GO, CE
- ✅ **Arquitetura RF-003/RF-004 documentada** ← NOVO
  - Diagrama de sequência completo
  - Estratégia de monitoramento
  - Análise de riscos e mitigações
  - Cronograma de implementação (10-15 dias)
