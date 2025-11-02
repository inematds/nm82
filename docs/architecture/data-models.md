# Data Models

## Conceptual Model Overview

The nm82 system models three primary user types (**Admin**, **Padrinho**, **Afiliado**) and their interactions within a community affiliate program. Key entities include:

1. **User** - Authentication record (Supabase Auth)
2. **UserRole** - Maps users to roles (Admin/Padrinho/Afiliado)
3. **PessoaFisica** - Profile data for all users
4. **Afiliado** - Relationship between padrinho and afiliado
5. **CodigoConvite** - Telegram access codes
6. **Pagamento** - Payment records
7. **Email** + **EmailAttachment** - Processed Gmail messages (from n8n)
8. **Notification** - In-app notifications
9. **AuditLog** - Security audit trail

---

## User

**Purpose:** Authentication record managed by Supabase Auth (external to Prisma schema)

**Key Attributes:**
- `id`: UUID - Supabase Auth user ID
- `email`: String - User's email (unique)
- `created_at`: DateTime - Account creation timestamp

**TypeScript Interface:**

```typescript
// Supabase Auth User (not in Prisma - managed by Supabase)
interface SupabaseUser {
  id: string;
  email: string;
  created_at: string;
  // ...other Supabase Auth fields
}
```

**Relationships:**
- One-to-one with UserRole
- One-to-one with PessoaFisica (via email)

---

## UserRole

**Purpose:** Maps users to their role(s) in the system for authorization

**Key Attributes:**
- `id`: UUID - Primary key
- `userId`: UUID - Foreign key to Supabase Auth user
- `role`: Enum - "ADMIN" | "PADRINHO" | "AFILIADO"
- `createdAt`: DateTime - Role assignment timestamp

**TypeScript Interface:**

```typescript
enum UserRole {
  ADMIN = "ADMIN",
  PADRINHO = "PADRINHO",
  AFILIADO = "AFILIADO",
}

interface UserRoleRecord {
  id: string;
  userId: string;
  role: UserRole;
  createdAt: Date;
}
```

**Relationships:**
- Many-to-one with User (user can have multiple roles)

---

## PessoaFisica

**Purpose:** Profile and demographic data for all users (admins, padrinhos, afiliados)

**Key Attributes:**
- `id`: UUID - Primary key
- `nome`: String - Full name
- `email`: String - Email (unique, links to Supabase Auth)
- `cpf`: String? - Brazilian tax ID (optional)
- `dataNascimento`: Date? - Birth date
- `sexo`: String? - Gender
- `cidade`: String? - City
- `uf`: String? - State (2 chars)
- `nichoAtuacao`: String? - Niche/area of interest
- `convitesEnviados`: Int - Count of invites sent (as padrinho)
- `convitesUsados`: Int - Count of invites used (accepted afiliados)
- `convitesDisponiveis`: Int - Available invites remaining (default: 5)
- `ativo`: Boolean - Whether user is active (default: true)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**TypeScript Interface:**

```typescript
interface PessoaFisica {
  id: string;
  nome: string;
  email: string;
  cpf?: string | null;
  dataNascimento?: Date | null;
  sexo?: string | null;
  cidade?: string | null;
  uf?: string | null;
  nichoAtuacao?: string | null;
  convitesEnviados: number;
  convitesUsados: number;
  convitesDisponiveis: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations (populated by Prisma)
  afiliadosComoPadrinho?: Afiliado[];
  afiliadoComoAfiliado?: Afiliado | null;
}
```

**Relationships:**
- One-to-many with Afiliado (as padrinho)
- One-to-one with Afiliado (as afiliado)
- One-to-one with UserRole (via email → userId)

---

## Afiliado

**Purpose:** Represents the relationship between a padrinho and an afiliado

**Key Attributes:**
- `id`: UUID - Primary key
- `afiliadoId`: UUID - FK to PessoaFisica (the afiliado)
- `padrinhoId`: UUID - FK to PessoaFisica (the padrinho)
- `status`: Enum - "PENDENTE" | "APROVADO" | "REJEITADO"
- `motivoRejeicao`: String? - Reason if rejected
- `dataCadastro`: DateTime - Registration timestamp
- `dataAprovacao`: DateTime? - Approval timestamp
- `emailEnviado`: Boolean - Whether approval email was sent
- `codigoConviteId`: UUID? - FK to CodigoConvite (assigned on approval)

**TypeScript Interface:**

```typescript
enum AfiliadoStatus {
  PENDENTE = "PENDENTE",
  APROVADO = "APROVADO",
  REJEITADO = "REJEITADO",
}

interface Afiliado {
  id: string;
  afiliadoId: string;
  padrinhoId: string;
  status: AfiliadoStatus;
  motivoRejeicao?: string | null;
  dataCadastro: Date;
  dataAprovacao?: Date | null;
  emailEnviado: boolean;
  codigoConviteId?: string | null;

  // Relations
  afiliado: PessoaFisica;
  padrinho: PessoaFisica;
  codigoConvite?: CodigoConvite | null;
}
```

**Relationships:**
- Many-to-one with PessoaFisica (afiliado)
- Many-to-one with PessoaFisica (padrinho)
- One-to-one with CodigoConvite (optional, assigned on approval)

**Business Rules:**
- `afiliadoId` != `padrinhoId` (cannot be own padrinho)
- On approval: status → APROVADO, assign CodigoConvite, increment padrinho's `convitesUsados`
- Padrinho must have `convitesDisponiveis > 0` and `ativo = true`

---

## CodigoConvite

**Purpose:** Telegram Bot access codes for approved afiliados

**Key Attributes:**
- `id`: UUID - Primary key
- `codigo`: String - Alphanumeric code (8 chars, unique)
- `email`: String? - Email of assigned afiliado (null if available)
- `usado`: Boolean - Whether code has been assigned
- `dataAtribuicao`: DateTime? - When code was assigned
- `dataExpiracao`: DateTime? - Expiration date (90 days from generation)
- `createdAt`: DateTime

**TypeScript Interface:**

```typescript
interface CodigoConvite {
  id: string;
  codigo: string;
  email?: string | null;
  usado: boolean;
  dataAtribuicao?: Date | null;
  dataExpiracao?: Date | null;
  createdAt: Date;

  // Relations
  afiliado?: Afiliado | null;
}

// Helper function
function generateTelegramLink(codigo: string): string {
  return `https://t.me/INEMAMembroBot?start=${codigo}`;
}
```

**Relationships:**
- One-to-one with Afiliado (optional - null if code is available)

**Business Rules:**
- Codes are pre-generated in batches by Admin
- Once assigned (`email` != null, `usado` = true), cannot be reused
- Expired codes (`dataExpiracao` < now) cannot be assigned

---

## Pagamento

**Purpose:** Payment records for monthly/annual subscriptions

**Key Attributes:**
- `id`: UUID - Primary key
- `email`: String - Payer's email
- `valor`: Decimal - Payment amount
- `dataPagamento`: DateTime - Payment date
- `tipoPagamento`: Enum - "MENSAL" | "ANUAL" (calculated from valor)
- `status`: Enum - "PENDENTE" | "CONFIRMADO" | "REJEITADO"
- `comprovante`: String? - URL to uploaded receipt (Supabase Storage)
- `observacoes`: String? - Admin notes
- `confirmedBy`: UUID? - Admin user ID who confirmed
- `createdAt`: DateTime

**TypeScript Interface:**

```typescript
enum TipoPagamento {
  MENSAL = "MENSAL", // valor < 50
  ANUAL = "ANUAL",   // valor >= 100
}

enum StatusPagamento {
  PENDENTE = "PENDENTE",
  CONFIRMADO = "CONFIRMADO",
  REJEITADO = "REJEITADO",
}

interface Pagamento {
  id: string;
  email: string;
  valor: number; // Decimal as number
  dataPagamento: Date;
  tipoPagamento: TipoPagamento;
  status: StatusPagamento;
  comprovante?: string | null;
  observacoes?: string | null;
  confirmedBy?: string | null;
  createdAt: Date;

  // Relations (optional - via email lookup)
  pessoaFisica?: PessoaFisica | null;
}
```

**Relationships:**
- Many-to-one with PessoaFisica (via email lookup, not FK)

**Business Rules:**
- `tipoPagamento` auto-calculated: valor < R$50 = MENSAL, valor >= R$100 = ANUAL
- Initial status: PENDENTE
- Admins can confirm or reject with observacoes

---

## Email & EmailAttachment

**Purpose:** Processed emails from Gmail (via n8n), primarily for payment receipts

**Key Attributes (Email)**:
- `messageId`: String - Gmail message ID (PK)
- `threadId`: String? - Gmail thread ID
- `from`: String - Sender email
- `to`: String - Recipient email
- `subject`: String - Email subject
- `bodyText`: String? - Plain text body
- `bodyHtml`: String? - HTML body
- `dateReceived`: DateTime - Email received timestamp
- `labels`: String[] - Gmail labels
- `processedAt`: DateTime - When n8n processed it

**Key Attributes (EmailAttachment)**:
- `id`: UUID - Primary key
- `messageId`: String - FK to Email
- `filename`: String - Original filename
- `mimeType`: String - File MIME type
- `size`: Int - File size in bytes
- `storagePath`: String - Path in Supabase Storage
- `storageUrl`: String - Public URL to file
- `valor`: Decimal? - Extracted payment value (if applicable)
- `createdAt`: DateTime

**TypeScript Interfaces:**

```typescript
interface Email {
  messageId: string;
  threadId?: string | null;
  from: string;
  to: string;
  subject: string;
  bodyText?: string | null;
  bodyHtml?: string | null;
  dateReceived: Date;
  labels: string[];
  processedAt: Date;

  // Relations
  attachments: EmailAttachment[];
}

interface EmailAttachment {
  id: string;
  messageId: string;
  filename: string;
  mimeType: string;
  size: number;
  storagePath: string;
  storageUrl: string;
  valor?: number | null;
  createdAt: Date;

  // Relations
  email: Email;
}
```

**Relationships:**
- Email has many EmailAttachments
- EmailAttachment belongs to one Email

**Note:** These tables are primarily **read-only** in nm82 - written by n8n workflows

---

## Notification

**Purpose:** In-app notifications for users

**Key Attributes:**
- `id`: UUID - Primary key
- `userId`: UUID - FK to User (Supabase Auth)
- `tipo`: Enum - "AFILIADO_APROVADO" | "AFILIADO_CADASTRADO" | "CONVITES_ESGOTADOS" | etc.
- `titulo`: String - Notification title
- `mensagem`: String - Notification body
- `lida`: Boolean - Read status (default: false)
- `link`: String? - Optional link to related resource
- `createdAt`: DateTime

**TypeScript Interface:**

```typescript
enum TipoNotificacao {
  AFILIADO_APROVADO = "AFILIADO_APROVADO",
  AFILIADO_CADASTRADO = "AFILIADO_CADASTRADO",
  CONVITES_ESGOTADOS = "CONVITES_ESGOTADOS",
  PAGAMENTO_CONFIRMADO = "PAGAMENTO_CONFIRMADO",
  CODIGO_EXPIRANDO = "CODIGO_EXPIRANDO",
}

interface Notification {
  id: string;
  userId: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  link?: string | null;
  createdAt: Date;
}
```

**Relationships:**
- Many-to-one with User

---

## AuditLog

**Purpose:** Security audit trail for critical operations

**Key Attributes:**
- `id`: UUID - Primary key
- `userId`: UUID - User who performed the action
- `action`: String - Action type (e.g., "APROVAR_AFILIADO", "AJUSTAR_CONVITES")
- `entityType`: String - Entity affected (e.g., "Afiliado", "PessoaFisica")
- `entityId`: String - ID of affected entity
- `changes`: JSON - Before/after values
- `ipAddress`: String? - Request IP
- `userAgent`: String? - Browser user agent
- `timestamp`: DateTime

**TypeScript Interface:**

```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
  ipAddress?: string | null;
  userAgent?: string | null;
  timestamp: Date;
}
```

**Relationships:**
- Many-to-one with User
