# Sistema de Gestão de Convites e Afiliados

Sistema completo para gerenciamento de convites, afiliados e códigos promocionais.

## Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Autenticação**: NextAuth.js
- **UI**: React + Tailwind CSS + Radix UI
- **Monorepo**: Turborepo

## Estrutura do Projeto

```
Convites/
├── apps/
│   └── web/              # Aplicação Next.js principal
├── packages/
│   ├── database/         # Prisma schema e migrações
│   └── ui/              # Componentes compartilhados
├── scripts/             # Scripts utilitários
└── docs/               # Documentação
```

## Configuração Inicial

### 1. Pré-requisitos

- Node.js 18+ e npm
- Conta no Supabase (gratuita)
- Git

### 2. Clone o repositório

```bash
git clone <seu-repositorio>
cd Convites
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure as variáveis de ambiente

#### 4.1. Configure o banco de dados

Copie o arquivo de exemplo e configure suas credenciais:

```bash
cp packages/database/.env.example packages/database/.env
```

Edite `packages/database/.env` e configure:

```env
DATABASE_URL="postgresql://..."  # Sua connection string do Supabase
```

#### 4.2. Configure a aplicação web

```bash
cp apps/web/.env.example apps/web/.env
```

Edite `apps/web/.env` e configure:

```env
# Supabase (obtenha em: https://app.supabase.com/project/YOUR_PROJECT/settings/api)
NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-anon-key"
SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"

# NextAuth Secret (gere com: openssl rand -base64 32)
NEXTAUTH_SECRET="seu-secret-gerado"

# URLs
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 5. Configure o banco de dados

Execute as migrações do Prisma:

```bash
cd packages/database
npx prisma migrate deploy
npx prisma generate
```

### 6. Execute o projeto

Volte para a raiz e execute:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## Screenshots das Telas

Veja exemplos visuais do sistema:

![Tela do Sistema](./telas/photo_4918103494183553796_x.jpg)

![Dashboard](./telas/photo_4915851694369868596_w.jpg)

*Screenshots demonstrando a interface do sistema de gestão de convites e afiliados.*

## Scripts Disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Inicia o servidor de produção
npm run lint         # Executa o linter
```

## Segurança

### Arquivos que NÃO devem ser commitados

Os seguintes arquivos/diretórios estão protegidos pelo `.gitignore`:

- `reais/` - Dados sensíveis reais
- `.env` e `.env.local` - Credenciais
- `*.db` e `*.sqlite` - Bancos de dados locais
- `node_modules/` - Dependências

### Gerando Secrets

Para gerar um `NEXTAUTH_SECRET` seguro:

```bash
openssl rand -base64 32
```

## Obtendo Credenciais do Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Mantenha secreto!)

## Database Connection String

Para obter a connection string do Supabase:

1. Acesse **Settings** → **Database**
2. Escolha **Connection Pooling** (recomendado para produção)
3. Modo: **Transaction**
4. Copie a URI que começa com `postgresql://`

## Contribuindo

1. Nunca commite arquivos `.env`
2. Nunca commite dados sensíveis
3. Use o arquivo `.env.example` como referência
4. Mantenha as credenciais seguras

## Licença

[Especifique sua licença aqui]

## Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
