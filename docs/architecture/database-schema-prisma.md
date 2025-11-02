# Database Schema (Prisma)

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==========================================
// AUTHENTICATION & AUTHORIZATION
// ==========================================

// Note: User table is managed by Supabase Auth (not in Prisma)
// We reference it via userId: String

enum Role {
  ADMIN
  PADRINHO
  AFILIADO
}

model UserRole {
  id        String   @id @default(uuid())
  userId    String   // FK to Supabase Auth user.id
  role      Role
  createdAt DateTime @default(now())

  @@unique([userId, role])
  @@map("user_roles")
}

// ==========================================
// CORE ENTITIES
// ==========================================

model PessoaFisica {
  id                   String    @id @default(uuid())
  nome                 String
  email                String    @unique
  cpf                  String?
  dataNascimento       DateTime? @map("data_nascimento")
  sexo                 String?
  cidade               String?
  uf                   String?   @db.VarChar(2)
  nichoAtuacao         String?   @map("nicho_atuacao")
  convitesEnviados     Int       @default(0) @map("convites_enviados")
  convitesUsados       Int       @default(0) @map("convites_usados")
  convitesDisponiveis  Int       @default(5) @map("convites_disponiveis")
  ativo                Boolean   @default(true)
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")

  // Relations
  afiliadosComoPadrinho Afiliado[] @relation("Padrinho")
  afiliadoComoAfiliado  Afiliado?  @relation("Afiliado")

  @@index([email])
  @@index([ativo])
  @@map("pessoas_fisicas")
}

enum AfiliadoStatus {
  PENDENTE          // Aguardando processamento automático
  ENVIADO           // Aprovado e email enviado
  JA_CADASTRADO     // Email já existe
  SEM_PADRINHO      // Padrinho não encontrado
  SEM_CONVITE       // Padrinho sem convites disponíveis
  APROVADO          // (Deprecated - usar ENVIADO)
  REJEITADO         // (Deprecated - usar JA_CADASTRADO, SEM_PADRINHO ou SEM_CONVITE)
}

model Afiliado {
  id              String          @id @default(uuid())
  afiliadoId      String          @unique @map("afiliado_id")
  padrinhoId      String          @map("padrinho_id")
  status          AfiliadoStatus  @default(PENDENTE)
  motivoRejeicao  String?         @map("motivo_rejeicao") @db.Text
  dataCadastro    DateTime        @default(now()) @map("data_cadastro")
  dataAprovacao   DateTime?       @map("data_aprovacao")
  emailEnviado    Boolean         @default(false) @map("email_enviado")
  codigoConviteId String?         @unique @map("codigo_convite_id")

  // Relations
  afiliado      PessoaFisica   @relation("Afiliado", fields: [afiliadoId], references: [id], onDelete: Cascade)
  padrinho      PessoaFisica   @relation("Padrinho", fields: [padrinhoId], references: [id], onDelete: Restrict)
  codigoConvite CodigoConvite? @relation(fields: [codigoConviteId], references: [id])

  @@index([padrinhoId])
  @@index([status])
  @@index([dataCadastro])
  @@map("afiliados")
}

model CodigoConvite {
  id              String    @id @default(uuid())
  codigo          String    @unique @db.VarChar(8)
  email           String?
  usado           Boolean   @default(false)
  dataAtribuicao  DateTime? @map("data_atribuicao")
  dataExpiracao   DateTime? @map("data_expiracao")
  createdAt       DateTime  @default(now()) @map("created_at")

  // Relations
  afiliado Afiliado?

  @@index([usado])
  @@index([dataExpiracao])
  @@map("codigos_convite")
}

// ==========================================
// EMAIL AUTOMATION SYSTEM
// ==========================================

model EmailTemplate {
  id              String   @id @default(uuid())
  nome            String
  codigo          String   @unique @db.VarChar(100)
  assunto         String   @db.Text
  corpo           String   @db.Text
  variaveis       Json     @default("[]")
  remetentNome    String?  @map("remetente_nome")
  remetenteEmail  String?  @map("remetente_email")
  ativo           Boolean  @default(true)
  criadoEm        DateTime @default(now()) @map("criado_em")
  atualizadoEm    DateTime @updatedAt @map("atualizado_em")

  @@index([codigo])
  @@index([ativo])
  @@map("email_templates")
}

model ConfiguracaoEmail {
  id           String   @id @default(uuid())
  chave        String   @unique @db.VarChar(100)
  valor        String   @db.Text
  tipo         String   @default("string") @db.VarChar(50)
  descricao    String?  @db.Text
  grupo        String   @default("geral") @db.VarChar(100)
  criptografado Boolean @default(false)
  criadoEm     DateTime @default(now()) @map("criado_em")
  atualizadoEm DateTime @updatedAt @map("atualizado_em")

  @@index([chave])
  @@index([grupo])
  @@map("configuracoes_email")
}

enum StatusEmail {
  PENDENTE
  ENVIADO
  FALHA
}

model LogEmail {
  id                 String      @id @default(uuid())
  templateCodigo     String?     @map("template_codigo") @db.VarChar(100)
  destinatarioEmail  String      @map("destinatario_email")
  destinatarioNome   String?     @map("destinatario_nome")
  assunto            String      @db.Text
  corpo              String      @db.Text
  variaveis          Json?
  status             StatusEmail @default(PENDENTE)
  erro               String?     @db.Text
  tentativas         Int         @default(0)
  afiliadoId         String?     @map("afiliado_id")
  padrinhoId         String?     @map("padrinho_id")
  enviadoEm          DateTime?   @map("enviado_em")
  criadoEm           DateTime    @default(now()) @map("criado_em")

  @@index([status])
  @@index([templateCodigo])
  @@index([destinatarioEmail])
  @@index([afiliadoId])
  @@index([criadoEm])
  @@map("log_emails")
}

// ==========================================
// NOTIFICATIONS & AUDIT
// ==========================================

enum TipoNotificacao {
  AFILIADO_APROVADO
  AFILIADO_CADASTRADO
  CONVITES_ESGOTADOS
  CODIGO_EXPIRANDO
}

model Notification {
  id        String           @id @default(uuid())
  userId    String           @map("user_id")
  tipo      TipoNotificacao
  titulo    String
  mensagem  String           @db.Text
  lida      Boolean          @default(false)
  link      String?
  createdAt DateTime         @default(now()) @map("created_at")

  @@index([userId, lida])
  @@index([createdAt])
  @@map("notifications")
}

model AuditLog {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  action     String
  entityType String   @map("entity_type")
  entityId   String   @map("entity_id")
  changes    Json
  ipAddress  String?  @map("ip_address")
  userAgent  String?  @map("user_agent") @db.Text
  timestamp  DateTime @default(now())

  @@index([userId])
  @@index([entityType, entityId])
  @@index([timestamp])
  @@map("audit_logs")
}
```

## Email Automation System

The schema includes tables for managing email templates and tracking sent emails:

- **`email_templates`** - Reusable email templates with variables
- **`configuracoes_email`** - Email service configuration settings
- **`log_emails`** - Audit log of all emails sent by the system

## Migration Strategy

**Migration Steps**:
```bash
# 1. Initialize Prisma with existing DB
npx prisma db pull

# 2. Review generated schema, refine manually

# 3. Create migration for new tables + indexes
npx prisma migrate dev --name init

# 4. Seed initial data (admin user role, templates, etc.)
npx prisma db seed

# 5. Deploy to production
npx prisma migrate deploy
```

**Data Backfill**:
- Script to create `UserRole` entries for existing users
- Normalize `afiliados.status` strings to enums
- Create default email templates

**RLS Policies** (Supabase Dashboard):
- Apply Row Level Security policies (see Security section)
- Test with different user roles
