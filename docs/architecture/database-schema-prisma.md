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
  PENDENTE
  APROVADO
  REJEITADO
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
  codigoConviteId String?         @map("codigo_convite_id")

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

enum TipoPagamento {
  MENSAL
  ANUAL
}

enum StatusPagamento {
  PENDENTE
  CONFIRMADO
  REJEITADO
}

model Pagamento {
  id              String          @id @default(uuid())
  email           String
  valor           Decimal         @db.Decimal(10, 2)
  dataPagamento   DateTime        @map("data_pagamento")
  tipoPagamento   TipoPagamento   @map("tipo_pagamento")
  status          StatusPagamento @default(PENDENTE)
  comprovante     String?         @db.Text
  observacoes     String?         @db.Text
  confirmedBy     String?         @map("confirmed_by") // User ID
  createdAt       DateTime        @default(now()) @map("created_at")

  @@index([email])
  @@index([status])
  @@index([dataPagamento])
  @@map("pagamentos")
}

// ==========================================
// EMAIL PROCESSING (read-only from n8n)
// ==========================================

model Email {
  messageId     String             @id @map("message_id")
  threadId      String?            @map("thread_id")
  from          String
  to            String
  subject       String
  bodyText      String?            @map("body_text") @db.Text
  bodyHtml      String?            @map("body_html") @db.Text
  dateReceived  DateTime           @map("date_received")
  labels        String[]
  processedAt   DateTime           @default(now()) @map("processed_at")

  // Relations
  attachments EmailAttachment[]

  @@index([from])
  @@index([dateReceived])
  @@map("emails")
}

model EmailAttachment {
  id          String   @id @default(uuid())
  messageId   String   @map("message_id")
  filename    String
  mimeType    String   @map("mime_type")
  size        Int
  storagePath String   @map("storage_path")
  storageUrl  String   @map("storage_url") @db.Text
  valor       Decimal? @db.Decimal(10, 2)
  createdAt   DateTime @default(now()) @map("created_at")

  // Relations
  email Email @relation(fields: [messageId], references: [messageId], onDelete: Cascade)

  @@index([messageId])
  @@map("email_attachments")
}

// ==========================================
// NOTIFICATIONS & AUDIT
// ==========================================

enum TipoNotificacao {
  AFILIADO_APROVADO
  AFILIADO_CADASTRADO
  CONVITES_ESGOTADOS
  PAGAMENTO_CONFIRMADO
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

## Migration Strategy from nm81

**Current Supabase Tables → Prisma Migration:**

1. **Preserve existing data**:
   - `pessoas_fisicas` - Keep structure, add indexes
   - `afiliados` - Normalize status values to enum
   - `codigos_convite` - Add `usado` boolean
   - `pagamentos` - Add `tipoPagamento` enum, `status` enum
   - `emails` + `email_attachments` - Keep as-is (written by n8n)

2. **New tables** (create via Prisma migration):
   - `user_roles` - Map Supabase Auth users to roles
   - `notifications` - In-app notification system
   - `audit_logs` - Security audit trail

3. **Migration Steps**:
   ```bash
   # 1. Initialize Prisma with existing DB
   npx prisma db pull

   # 2. Review generated schema, refine manually

   # 3. Create migration for new tables + indexes
   npx prisma migrate dev --name add_auth_and_audit

   # 4. Seed initial data (admin user role, etc.)
   npx prisma db seed

   # 5. Deploy to production
   npx prisma migrate deploy
   ```

4. **Data Backfill**:
   - Script to create `UserRole` entries for existing users
   - Normalize `afiliados.status` strings to enums
   - Calculate `tipoPagamento` based on `valor`

5. **RLS Policies** (Supabase Dashboard):
   - Apply Row Level Security policies (see Security section)
   - Test with different user roles
