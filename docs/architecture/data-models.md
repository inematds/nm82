# Data Models

## Conceptual Model Overview

The nm82 system models three primary user types (**Admin**, **Padrinho**, **Afiliado**) and their interactions within a community affiliate program. Key entities include:

1. **User** - Authentication record (Supabase Auth)
2. **UserRole** - Maps users to roles (Admin/Padrinho/Afiliado)
3. **PessoaFisica** - Profile data for all users
4. **Afiliado** - Relationship between padrinho and afiliado
5. **CodigoConvite** - Telegram access codes
6. **EmailTemplate** + **ConfiguracaoEmail** + **LogEmail** - Email automation system
7. **Notification** - In-app notifications
8. **AuditLog** - Security audit trail

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
- `status`: Enum - "PENDENTE" | "ENVIADO" | "JA_CADASTRADO" | "SEM_PADRINHO" | "SEM_CONVITE" | "APROVADO" (deprecated) | "REJEITADO" (deprecated)
- `motivoRejeicao`: String? - Reason if rejected (deprecated)
- `dataCadastro`: DateTime - Registration timestamp
- `dataAprovacao`: DateTime? - Approval timestamp (deprecated)
- `emailEnviado`: Boolean - Whether approval email was sent
- `codigoConviteId`: UUID? - FK to CodigoConvite (assigned on approval)

**TypeScript Interface:**

```typescript
enum AfiliadoStatus {
  PENDENTE = "PENDENTE",
  ENVIADO = "ENVIADO",
  JA_CADASTRADO = "JA_CADASTRADO",
  SEM_PADRINHO = "SEM_PADRINHO",
  SEM_CONVITE = "SEM_CONVITE",
  APROVADO = "APROVADO", // deprecated
  REJEITADO = "REJEITADO", // deprecated
}

interface Afiliado {
  id: string;
  afiliadoId: string;
  padrinhoId: string;
  status: AfiliadoStatus;
  motivoRejeicao?: string | null; // deprecated
  dataCadastro: Date;
  dataAprovacao?: Date | null; // deprecated
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
- On approval: status → ENVIADO, assign CodigoConvite, increment padrinho's `convitesUsados`
- Padrinho must have `convitesDisponiveis > 0` and `ativo = true`
- If padrinho not found: status → SEM_PADRINHO
- If padrinho has no convites: status → SEM_CONVITE
- If email already registered: status → JA_CADASTRADO

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

## Email Automation System

**Purpose:** System for managing and sending automated emails for system notifications

The email automation system consists of three main tables:

1. **EmailTemplate** - Reusable email templates with placeholders
2. **ConfiguracaoEmail** - Email sending configuration
3. **LogEmail** - History of all emails sent

**Key Attributes (EmailTemplate)**:
- `id`: UUID - Primary key
- `nome`: String - Template name (e.g., "afiliado_aprovado")
- `assunto`: String - Email subject with placeholders
- `corpo`: String - Email body (HTML or plain text)
- `variaveis`: String[] - Available placeholder variables
- `ativo`: Boolean - Whether template is active
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Key Attributes (ConfiguracaoEmail)**:
- `id`: UUID - Primary key
- `chave`: String - Configuration key (unique)
- `valor`: String - Configuration value
- `descricao`: String? - Description
- `updatedAt`: DateTime

**Key Attributes (LogEmail)**:
- `id`: UUID - Primary key
- `para`: String - Recipient email
- `assunto`: String - Email subject
- `corpo`: String - Email body (as sent)
- `templateId`: UUID? - FK to EmailTemplate (if used)
- `status`: Enum - "ENVIADO" | "FALHA" | "PENDENTE"
- `erro`: String? - Error message if failed
- `enviadoEm`: DateTime? - When email was sent
- `createdAt`: DateTime

**TypeScript Interfaces:**

```typescript
interface EmailTemplate {
  id: string;
  nome: string;
  assunto: string;
  corpo: string;
  variaveis: string[];
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ConfiguracaoEmail {
  id: string;
  chave: string;
  valor: string;
  descricao?: string | null;
  updatedAt: Date;
}

enum StatusEmail {
  ENVIADO = "ENVIADO",
  FALHA = "FALHA",
  PENDENTE = "PENDENTE",
}

interface LogEmail {
  id: string;
  para: string;
  assunto: string;
  corpo: string;
  templateId?: string | null;
  status: StatusEmail;
  erro?: string | null;
  enviadoEm?: Date | null;
  createdAt: Date;

  // Relations
  template?: EmailTemplate | null;
}
```

**Relationships:**
- LogEmail many-to-one with EmailTemplate (optional)

**Business Rules:**
- Templates support variable placeholders like `{{nome}}`, `{{codigo_convite}}`, etc.
- ConfiguracaoEmail stores SMTP settings, sender info, etc.
- All sent emails are logged in LogEmail for audit trail
- Failed emails can be retried

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
