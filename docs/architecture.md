# nm82 - Fullstack Architecture Document
## Sistema Integrado de Gestão de Comunidade INEMA.VIP

**Versão**: 1.0
**Data**: 2025-11-01
**Arquiteto**: Winston
**Status**: Technical Specification

---

## 📋 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-11-01 | 1.0 | Initial fullstack architecture document | Winston (Architect) |

---

## 🎯 Introduction

This document outlines the complete fullstack architecture for **nm82**, including backend systems, frontend implementation, database design, security patterns, and deployment strategy. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This architecture replaces the fragmented nm81 system (n8n workflows + isolated HTML pages) with a modern, secure, integrated web application built on **Next.js 14+** with **App Router**, **Prisma ORM**, and **Supabase PostgreSQL**.

### Project Context

**From PRD (Sarah)**:
- **Vision**: Integrated platform for INEMA.VIP community management and affiliate marketing program
- **MVP Scope**: Phases 1+2 (Authentication + Core CRUD) - 5-7 weeks
- **Key Goals**:
  - Eliminate 90% of manual operations
  - Secure authentication with role-based access (Admin, Padrinho, Afiliado)
  - Real-time dashboards with metrics
  - Integration with existing n8n workflows

**From Brownfield Analysis (Mary)**:
- Current system: 23% complete as integrated platform
- Critical gaps: No auth, no backend, exposed credentials, manual data management
- Existing infrastructure: Supabase DB, n8n workflows, Gmail API, Telegram Bot

---

## 🏗️ High Level Architecture

### Technical Summary

nm82 is a **monolithic Next.js fullstack application** deployed on **Vercel**, leveraging Next.js App Router for server-side rendering (SSR) and API Routes for backend logic. The architecture follows a **Jamstack-inspired pattern** with server-rendered pages, serverless API functions, and **Prisma ORM** for type-safe database access to **Supabase PostgreSQL**.

Authentication is handled via **Supabase Auth** with **NextAuth.js** for session management. The frontend uses **React Server Components (RSC)** for optimal performance, with **Shadcn/UI** components styled by **Tailwind CSS**. State management combines **React Query** for server state and **Zustand** for client state.

The system integrates with existing **n8n workflows** via webhooks, preserving email processing and bulk operations while adding a unified admin interface. **Row Level Security (RLS)** on Supabase ensures data isolation by user role, and all sensitive operations are logged for audit compliance.

This architecture achieves PRD goals by providing a secure, performant, and maintainable platform that scales from 100 to 1000+ users while maintaining sub-2-second page loads and 99.5% uptime.

---

### Platform and Infrastructure Choice

**Platform:** Vercel + Supabase
**Key Services:**
- **Frontend & Backend Hosting**: Vercel (Edge Network + Serverless Functions)
- **Database**: Supabase PostgreSQL (managed Postgres with RLS)
- **Authentication**: Supabase Auth + NextAuth.js
- **File Storage**: Supabase Storage (S3-compatible)
- **CDN**: Vercel Edge Network (built-in)
- **Monitoring**: Vercel Analytics + Sentry
- **CI/CD**: GitHub Actions + Vercel Git Integration

**Deployment Host and Regions:**
- **Primary Region**: us-east-1 (Vercel + Supabase)
- **Edge Locations**: Global (Vercel Edge Network)
- **Database Region**: us-east-1 (Supabase)

**Rationale**:
- Vercel provides seamless Next.js deployment with zero-config SSR/API Routes
- Supabase offers Postgres + Auth + Storage in one platform (already in use)
- No vendor lock-in - can migrate to self-hosted if needed
- Cost-effective for MVP stage
- Excellent DX (Developer Experience)

---

### Repository Structure

**Structure:** Monorepo
**Monorepo Tool:** npm workspaces (native, no additional tooling needed)
**Package Organization:**
- `apps/web` - Main Next.js application (frontend + API routes)
- `packages/database` - Prisma schema and migrations
- `packages/shared` - Shared TypeScript types and utilities
- `packages/config` - Shared config files (ESLint, TypeScript, Tailwind)

**Rationale**:
- Simple monorepo structure sufficient for MVP
- Native npm workspaces avoid additional complexity
- Clear separation of concerns
- Shared types ensure frontend/backend consistency
- Easy to add more packages later (e.g., mobile app, admin CLI)

---

### High Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "Vercel Edge Network"
        CDN[CDN/Edge Cache]
    end

    subgraph "Next.js App - Vercel"
        subgraph "Frontend (RSC)"
            Pages[Pages/Routes]
            Components[React Components]
            ClientState[Client State]
        end

        subgraph "Backend (API Routes)"
            AuthAPI[Auth APIs]
            CRUDAPI[CRUD APIs]
            WebhookAPI[Webhook APIs]
            Middleware[Middleware Layer]
        end

        Prisma[Prisma Client]
    end

    subgraph "Supabase Platform"
        Auth[Supabase Auth]
        DB[(PostgreSQL + RLS)]
        Storage[Supabase Storage]
    end

    subgraph "External Integrations"
        N8N[n8n Workflows]
        Gmail[Gmail API]
        Telegram[Telegram Bot]
    end

    Browser --> CDN
    Mobile --> CDN
    CDN --> Pages

    Pages --> Components
    Components --> ClientState
    Components --> CRUDAPI

    CRUDAPI --> Middleware
    AuthAPI --> Middleware
    WebhookAPI --> Middleware

    Middleware --> Prisma
    Middleware --> Auth

    Prisma --> DB
    Auth --> DB
    Storage --> DB

    WebhookAPI --> N8N
    N8N --> Gmail
    N8N --> WebhookAPI

    CRUDAPI -.->|Email notifications| N8N
    DB -.->|Telegram link| Telegram

    style Browser fill:#e1f5ff
    style Mobile fill:#e1f5ff
    style DB fill:#ffe0b2
    style Auth fill:#c8e6c9
    style N8N fill:#fff9c4
```

---

### Architectural Patterns

- **Jamstack Architecture:** Server-rendered pages with serverless API functions - _Rationale:_ Optimal performance (SSR) + scalability (serverless) + developer experience

- **API Gateway Pattern:** Next.js API Routes as single entry point - _Rationale:_ Centralized auth, rate limiting, and error handling for all backend operations

- **Repository Pattern:** Prisma models abstracted via service layer - _Rationale:_ Testability, maintainability, and database migration flexibility

- **Component-Based UI:** Reusable React components with TypeScript + Shadcn/UI - _Rationale:_ Type safety, consistency, and rapid development with pre-built components

- **Server-First Data Fetching:** React Server Components + Server Actions - _Rationale:_ Reduced JavaScript bundle size, improved SEO, faster initial page loads

- **Role-Based Access Control (RBAC):** Middleware + RLS for multi-layered security - _Rationale:_ Defense in depth - both application and database enforce permissions

- **Webhook Integration Pattern:** Bidirectional webhooks with n8n - _Rationale:_ Preserve existing automations while adding new capabilities, loose coupling

---

## 🔧 Tech Stack

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| **Frontend Language** | TypeScript | 5.3+ | Type-safe JavaScript for frontend | Industry standard for large-scale React apps, catches errors at compile time |
| **Frontend Framework** | Next.js (App Router) | 14.2+ | React meta-framework with SSR/SSG | Best-in-class DX, RSC support, built-in routing, API routes, Vercel integration |
| **UI Component Library** | Shadcn/UI | Latest | Accessible, customizable component library | Copy-paste approach (no npm bloat), Radix UI primitives, full control |
| **CSS Framework** | Tailwind CSS | 3.4+ | Utility-first CSS framework | Rapid development, consistent design system, tree-shakeable, small bundle |
| **State Management** | React Query + Zustand | 5.x + 4.x | Server state (RQ) + Client state (Zustand) | React Query for server data caching/sync, Zustand for UI state (lightweight) |
| **Form Handling** | React Hook Form + Zod | 7.x + 3.x | Forms with validation | Best performance (uncontrolled), Zod for type-safe schema validation |
| **Charts** | Recharts | 2.x | Data visualization library | React-first, composable, responsive charts for dashboards |
| **Backend Language** | TypeScript | 5.3+ | Type-safe JavaScript for backend | Same language as frontend, shared types, Prisma integration |
| **Backend Framework** | Next.js API Routes | 14.2+ | Serverless API functions | Integrated with frontend, automatic API routing, Vercel serverless deployment |
| **API Style** | REST | N/A | RESTful HTTP APIs | Simple, well-understood, sufficient for CRUD operations |
| **ORM** | Prisma | 5.x | Type-safe database ORM | Auto-generated types, migrations, excellent DX, Supabase compatibility |
| **Database** | PostgreSQL (Supabase) | 15+ | Relational database with RLS | Already in use (nm81), RLS for security, Supabase managed |
| **Cache** | React Query | 5.x | Client-side query cache | Built into React Query, reduces API calls, stale-while-revalidate pattern |
| **File Storage** | Supabase Storage | Latest | S3-compatible object storage | Already in use (nm81), integrated with Supabase Auth, RLS support |
| **Authentication** | Supabase Auth + NextAuth.js | Latest + 5.x | User authentication + session management | Supabase Auth for user db, NextAuth for Next.js integration, JWT tokens |
| **Frontend Testing** | Vitest + React Testing Library | 1.x + 14.x | Unit tests for components/hooks | Fast (Vite-based), Jest-compatible API, first-class React support |
| **Backend Testing** | Vitest | 1.x | Unit tests for API routes/services | Same test runner as frontend, TypeScript support, fast |
| **E2E Testing** | Playwright | 1.x | End-to-end browser testing | Multi-browser, reliable, auto-wait, great for critical user flows |
| **Build Tool** | Turbopack (Next.js) | Built-in | Fast bundler for Next.js | Next.js default, faster than Webpack, incremental builds |
| **Bundler** | SWC (Next.js) | Built-in | Rust-based JS/TS compiler | Faster than Babel, integrated with Next.js, minification included |
| **Package Manager** | npm | 10+ | Dependency management | Native monorepo support (workspaces), ubiquitous, no extra config |
| **CI/CD** | GitHub Actions | N/A | Automated testing and deployment | Free for public repos, Vercel integration, flexible workflows |
| **Monitoring** | Vercel Analytics + Sentry | Latest + 7.x | Performance + Error tracking | Vercel Analytics for Web Vitals, Sentry for error tracking/alerting |
| **Logging** | Pino | 8.x | Structured logging library | Fast, JSON-based logs, works well with serverless, Vercel compatible |

---

## 📊 Data Models

### Conceptual Model Overview

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

### User

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

### UserRole

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

### PessoaFisica

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

### Afiliado

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

### CodigoConvite

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

### Pagamento

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

### Email & EmailAttachment

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

### Notification

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

### AuditLog

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

---

## 🗄️ Database Schema (Prisma)

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

### Migration Strategy from nm81

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

---

## 🔌 API Specification

### REST API Overview

**Base URL**: `https://inema.vip/api`
**Authentication**: JWT token in `Authorization: Bearer <token>` header
**Response Format**: JSON
**Error Format**: See Error Handling section

### API Endpoints

#### Authentication

```yaml
POST /api/auth/signup
  Body: { email, password, nome }
  Returns: { user, session }
  Public: Yes

POST /api/auth/login
  Body: { email, password }
  Returns: { user, session, role }
  Public: Yes

POST /api/auth/logout
  Returns: { success: true }
  Auth: Required

GET /api/auth/me
  Returns: { user, role, pessoa }
  Auth: Required
```

#### Padrinhos

```yaml
GET /api/padrinhos
  Query: { page, limit, search, ativo }
  Returns: { padrinhos: PessoaFisica[], total, page, totalPages }
  Auth: ADMIN

GET /api/padrinhos/:id
  Returns: { padrinho: PessoaFisica, afiliados: Afiliado[] }
  Auth: ADMIN | PADRINHO (own)

PATCH /api/padrinhos/:id
  Body: Partial<PessoaFisica>
  Returns: { padrinho: PessoaFisica }
  Auth: ADMIN

POST /api/padrinhos/:id/ajustar-convites
  Body: { convites: number }
  Returns: { padrinho: PessoaFisica }
  Auth: ADMIN
  Audit: Log change
```

#### Afiliados

```yaml
GET /api/afiliados
  Query: { page, limit, search, status, padrinhoId }
  Returns: { afiliados: Afiliado[], total, page, totalPages }
  Auth: ADMIN | PADRINHO (own afiliados only)

GET /api/afiliados/:id
  Returns: { afiliado: Afiliado, padrinho: PessoaFisica }
  Auth: ADMIN | PADRINHO (own) | AFILIADO (own)

POST /api/afiliados/cadastro
  Body: { padrinhoId, nome, email, cpf?, ... }
  Returns: { afiliado: Afiliado }
  Public: Yes (via convite link)
  Validations: Padrinho exists, has convites, email unique

POST /api/afiliados/:id/aprovar
  Body: { codigoConviteId?: string } // optional - auto-assign if not provided
  Returns: { afiliado: Afiliado, codigoConvite: CodigoConvite }
  Auth: ADMIN
  Side Effects:
    - Assign codigo
    - Increment padrinho convites_usados
    - Send email notification (via n8n webhook)
    - Create notifications

POST /api/afiliados/:id/rejeitar
  Body: { motivo: string }
  Returns: { afiliado: Afiliado }
  Auth: ADMIN
  Side Effects: Send email notification

PATCH /api/afiliados/:id
  Body: Partial<Afiliado>
  Returns: { afiliado: Afiliado }
  Auth: ADMIN
```

#### Códigos de Convite

```yaml
GET /api/codigos
  Query: { page, limit, usado, expirado }
  Returns: { codigos: CodigoConvite[], stats: { total, disponiveis, usados, expirados } }
  Auth: ADMIN

POST /api/codigos/gerar
  Body: { quantidade: number, diasExpiracao?: number }
  Returns: { codigos: CodigoConvite[] }
  Auth: ADMIN

DELETE /api/codigos/:id/liberar
  Returns: { codigo: CodigoConvite }
  Auth: ADMIN
  Side Effects: Reset email, usado = false
```

#### Pagamentos

```yaml
GET /api/pagamentos
  Query: { page, limit, status, email, dataInicio, dataFim }
  Returns: { pagamentos: Pagamento[], total }
  Auth: ADMIN

POST /api/pagamentos
  Body: { email, valor, dataPagamento, comprovante?, observacoes? }
  Returns: { pagamento: Pagamento }
  Auth: ADMIN

POST /api/pagamentos/:id/confirmar
  Body: { observacoes?: string }
  Returns: { pagamento: Pagamento }
  Auth: ADMIN
  Audit: Log confirmation

POST /api/pagamentos/:id/rejeitar
  Body: { observacoes: string }
  Returns: { pagamento: Pagamento }
  Auth: ADMIN
  Audit: Log rejection
```

#### Dashboard & Analytics

```yaml
GET /api/dashboard/metrics
  Returns: {
    totalAfiliados: number,
    totalPadrinhos: number,
    receitaTotal: number,
    convitesDisponiveis: number,
    afiliadosPendentes: number
  }
  Auth: ADMIN

GET /api/dashboard/afiliados-por-dia
  Query: { dias: number } // default 30
  Returns: { date: string, count: number }[]
  Auth: ADMIN

GET /api/dashboard/receita-por-semana
  Query: { semanas: number } // default 12
  Returns: { week: string, receita: number }[]
  Auth: ADMIN

GET /api/dashboard/ranking-padrinhos
  Query: { limit: number } // default 10
  Returns: { padrinho: PessoaFisica, convitesUsados: number, taxaConversao: number }[]
  Auth: ADMIN

GET /api/padrinhos/me/dashboard
  Returns: {
    convitesDisponiveis: number,
    convitesUsados: number,
    afiliados: Afiliado[],
    ranking: number
  }
  Auth: PADRINHO
```

#### Notificações

```yaml
GET /api/notifications
  Query: { lida?: boolean, limit: number }
  Returns: { notifications: Notification[], unreadCount: number }
  Auth: Required

PATCH /api/notifications/:id/ler
  Returns: { notification: Notification }
  Auth: Required (own notification)

PATCH /api/notifications/ler-todas
  Returns: { count: number }
  Auth: Required
```

#### Webhooks (n8n integration)

```yaml
POST /api/webhooks/email-processado
  Body: { messageId, from, subject, attachments }
  Returns: { success: true }
  Auth: Webhook secret (env var)
  Side Effects: Process payment info, create Pagamento record

POST /api/webhooks/pagamento-confirmado
  Body: { pagamentoId, email, valor }
  Returns: { success: true }
  Auth: Webhook secret
  Side Effects: Update Pagamento status
```

### Request/Response Examples

#### POST /api/afiliados/cadastro

**Request:**
```json
{
  "padrinhoId": "uuid-padrinho",
  "nome": "João Silva",
  "email": "joao@example.com",
  "cpf": "123.456.789-00",
  "dataNascimento": "1990-01-01",
  "sexo": "Masculino",
  "cidade": "São Paulo",
  "uf": "SP",
  "nichoAtuacao": "Tecnologia"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "afiliado": {
      "id": "uuid-afiliado",
      "afiliadoId": "uuid-pessoa",
      "padrinhoId": "uuid-padrinho",
      "status": "PENDENTE",
      "dataCadastro": "2025-11-01T10:00:00Z"
    },
    "message": "Cadastro realizado! Aguarde aprovação."
  }
}
```

**Error (400):**
```json
{
  "error": {
    "code": "PADRINHO_SEM_CONVITES",
    "message": "O padrinho não possui convites disponíveis",
    "timestamp": "2025-11-01T10:00:00Z",
    "requestId": "req_abc123"
  }
}
```

---

## 🧩 Components & Services

### Frontend Components (Next.js App Router)

#### Component Architecture

```
apps/web/src/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Authenticated routes
│   │   ├── dashboard/             # Admin dashboard
│   │   │   ├── page.tsx           # Main dashboard page (RSC)
│   │   │   ├── metrics/           # Metrics components
│   │   │   └── layout.tsx         # Dashboard layout
│   │   ├── padrinhos/             # Padrinhos management
│   │   │   ├── page.tsx           # List page
│   │   │   ├── [id]/              # Detail page
│   │   │   └── components/        # Padrinho-specific components
│   │   ├── afiliados/             # Afiliados management
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   └── components/
│   │   ├── codigos/               # Código management
│   │   ├── pagamentos/            # Payment management
│   │   └── layout.tsx             # Authenticated layout (sidebar, header)
│   ├── (public)/                  # Public routes
│   │   ├── convite/               # Public signup form
│   │   │   └── page.tsx
│   │   ├── login/                 # Login page
│   │   └── layout.tsx             # Public layout
│   ├── api/                       # API Routes (backend)
│   │   ├── auth/
│   │   ├── padrinhos/
│   │   ├── afiliados/
│   │   ├── codigos/
│   │   ├── pagamentos/
│   │   ├── dashboard/
│   │   ├── notifications/
│   │   └── webhooks/
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
├── components/                    # Shared components
│   ├── ui/                        # Shadcn/UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── dashboard/                 # Dashboard-specific
│   │   ├── metric-card.tsx
│   │   ├── chart-afiliados.tsx
│   │   └── alert-widget.tsx
│   ├── forms/                     # Reusable forms
│   │   ├── afiliado-form.tsx
│   │   ├── padrinho-form.tsx
│   │   └── pagamento-form.tsx
│   ├── tables/                    # Data tables
│   │   ├── afiliados-table.tsx
│   │   ├── padrinhos-table.tsx
│   │   └── data-table.tsx (generic)
│   └── layout/                    # Layout components
│       ├── sidebar.tsx
│       ├── header.tsx
│       ├── nav.tsx
│       └── footer.tsx
├── lib/                           # Utilities & clients
│   ├── api-client.ts              # API client wrapper
│   ├── auth.ts                    # Auth helpers
│   ├── prisma.ts                  # Prisma client
│   ├── supabase-client.ts         # Supabase client
│   └── utils.ts                   # General utils
├── hooks/                         # Custom React hooks
│   ├── use-auth.ts                # Auth state hook
│   ├── use-afiliados.ts           # Afiliados data hook
│   ├── use-padrinhos.ts
│   └── use-dashboard.ts
├── stores/                        # Zustand stores
│   ├── auth-store.ts              # Auth state
│   └── ui-store.ts                # UI state (modals, sidebar)
└── styles/                        # Additional styles
    └── themes.ts                  # Tailwind theme extensions
```

### Backend Services (API Routes + Services Layer)

```
apps/web/src/app/api/
├── auth/
│   └── [...nextauth]/route.ts     # NextAuth.js config
├── padrinhos/
│   ├── route.ts                   # GET /api/padrinhos (list)
│   ├── [id]/
│   │   ├── route.ts               # GET/PATCH /api/padrinhos/:id
│   │   └── ajustar-convites/
│   │       └── route.ts           # POST
├── afiliados/
│   ├── route.ts
│   ├── [id]/
│   │   ├── route.ts
│   │   ├── aprovar/route.ts       # POST
│   │   └── rejeitar/route.ts      # POST
│   └── cadastro/route.ts          # POST (public)
└── ... (similar structure for other resources)

apps/web/src/services/
├── afiliado-service.ts            # Business logic for afiliados
├── padrinho-service.ts
├── codigo-service.ts
├── pagamento-service.ts
├── notification-service.ts
├── audit-service.ts
└── email-service.ts               # n8n webhook calls
```

**Service Layer Pattern:**

```typescript
// services/afiliado-service.ts
import { prisma } from '@/lib/prisma';
import { codigoService } from './codigo-service';
import { notificationService } from './notification-service';
import { auditService } from './audit-service';
import { emailService } from './email-service';

export const afiliadoService = {
  async aprovar(afiliadoId: string, userId: string) {
    // Business logic with transaction
    return await prisma.$transaction(async (tx) => {
      // 1. Get afiliado with padrinho
      const afiliado = await tx.afiliado.findUniqueOrThrow({
        where: { id: afiliadoId },
        include: { padrinho: true, afiliado: true },
      });

      // 2. Assign available codigo
      const codigo = await codigoService.assignToEmail(afiliado.afiliado.email, tx);

      // 3. Update afiliado status
      const updated = await tx.afiliado.update({
        where: { id: afiliadoId },
        data: {
          status: 'APROVADO',
          dataAprovacao: new Date(),
          codigoConviteId: codigo.id,
        },
      });

      // 4. Increment padrinho convites_usados
      await tx.pessoaFisica.update({
        where: { id: afiliado.padrinhoId },
        data: { convitesUsados: { increment: 1 } },
      });

      // 5. Create notifications
      await notificationService.create({
        userId: afiliado.afiliadoId, // Assuming userId = pessoa.id
        tipo: 'AFILIADO_APROVADO',
        titulo: 'Cadastro Aprovado!',
        mensagem: `Seu acesso foi aprovado. Código: ${codigo.codigo}`,
      }, tx);

      // 6. Send email via n8n
      await emailService.sendApprovalEmail({
        to: afiliado.afiliado.email,
        nome: afiliado.afiliado.nome,
        codigo: codigo.codigo,
        padrinho: afiliado.padrinho.nome,
      });

      // 7. Audit log
      await auditService.log({
        userId,
        action: 'APROVAR_AFILIADO',
        entityType: 'Afiliado',
        entityId: afiliadoId,
        changes: { status: { from: afiliado.status, to: 'APROVADO' } },
      }, tx);

      return { afiliado: updated, codigo };
    });
  },

  // ... other methods
};
```

---

## 🔐 Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant NextAuth
    participant SupabaseAuth
    participant API
    participant Database

    User->>Frontend: Enter email/password
    Frontend->>NextAuth: POST /api/auth/callback/credentials
    NextAuth->>SupabaseAuth: signInWithPassword()
    SupabaseAuth->>Database: Verify credentials
    Database-->>SupabaseAuth: User record
    SupabaseAuth-->>NextAuth: Session + JWT
    NextAuth->>Database: Query UserRole
    Database-->>NextAuth: Role(s)
    NextAuth-->>Frontend: Session cookie + user data
    Frontend->>Frontend: Store session in cookie (httpOnly)
    Frontend-->>User: Redirect to /dashboard

    Note over User,Database: Subsequent requests

    User->>Frontend: Access protected route
    Frontend->>API: GET /api/padrinhos (with session cookie)
    API->>NextAuth: getServerSession()
    NextAuth-->>API: Session { user, role }
    API->>API: Check role permissions
    alt Authorized
        API->>Database: Query data (with RLS)
        Database-->>API: Filtered results
        API-->>Frontend: Data
    else Unauthorized
        API-->>Frontend: 403 Forbidden
    end
```

### Authorization Model

**Two-Layer Security:**

1. **Application Layer** (Next.js Middleware + API Routes):
   - Middleware checks session existence and role
   - API routes validate specific permissions
   - Service layer enforces business rules

2. **Database Layer** (Supabase RLS):
   - Row Level Security policies filter queries
   - Even if app layer fails, DB enforces access control
   - Defense in depth

**Role Permissions Matrix:**

| Resource | ADMIN | PADRINHO | AFILIADO |
|----------|-------|----------|----------|
| View all afiliados | ✅ | Own only | Own only |
| Approve afiliados | ✅ | ❌ | ❌ |
| Edit padrinho data | ✅ | Own only | ❌ |
| Adjust convites | ✅ | ❌ | ❌ |
| View dashboard | ✅ | Limited | Limited |
| Generate códigos | ✅ | ❌ | ❌ |
| Manage pagamentos | ✅ | ❌ | ❌ |

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE pessoas_fisicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE afiliados ENABLE ROW LEVEL SECURITY;
-- ... repeat for all tables

-- Policy: Admins can see all
CREATE POLICY "Admins can see all pessoas_fisicas"
ON pessoas_fisicas
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'ADMIN'
  )
);

-- Policy: Padrinhos can see themselves and their afiliados
CREATE POLICY "Padrinhos can see own record and afiliados"
ON pessoas_fisicas
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR
  id IN (
    SELECT afiliado_id FROM afiliados
    WHERE padrinho_id = (
      SELECT id FROM pessoas_fisicas
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
);

-- Policy: Afiliados can see themselves
CREATE POLICY "Afiliados can see own record"
ON pessoas_fisicas
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Policy: Admins can update all
CREATE POLICY "Admins can update all pessoas_fisicas"
ON pessoas_fisicas
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'ADMIN'
  )
);

-- Policy: Padrinhos can update own record
CREATE POLICY "Padrinhos can update own record"
ON pessoas_fisicas
FOR UPDATE
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'PADRINHO'
  )
);

-- ... similar policies for other tables
```

### Authentication Middleware

```typescript
// middleware.ts (Next.js)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_ROUTES = ['/login', '/convite'];
const ADMIN_ROUTES = ['/dashboard', '/padrinhos', '/afiliados', '/codigos', '/pagamentos'];
const PADRINHO_ROUTES = ['/portal'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check authentication
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check role-based access
  const role = token.role as string;

  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  if (PADRINHO_ROUTES.some(route => pathname.startsWith(route))) {
    if (role !== 'PADRINHO' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### API Route Authorization Helper

```typescript
// lib/auth-helpers.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth();

  const userRoles = await prisma.userRole.findMany({
    where: { userId: session.user.id },
  });

  const hasRole = userRoles.some(ur => allowedRoles.includes(ur.role));

  if (!hasRole) {
    throw new Error('Forbidden');
  }

  return { session, roles: userRoles.map(ur => ur.role) };
}

// Usage in API route
// app/api/padrinhos/route.ts
import { requireRole } from '@/lib/auth-helpers';

export async function GET() {
  try {
    await requireRole(['ADMIN']);

    // ... fetch padrinhos

  } catch (error) {
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    throw error;
  }
}
```

---

## 🚀 Deployment Architecture

### Deployment Strategy

**Frontend Deployment:**
- **Platform:** Vercel (automatic via Git integration)
- **Build Command:** `npm run build` (Next.js production build)
- **Output Directory:** `.next` (automatic)
- **CDN/Edge:** Vercel Edge Network (global CDN with 100+ PoPs)
- **Environment:** Production branch = `main`, Staging branch = `develop`

**Backend Deployment:**
- **Platform:** Vercel Serverless Functions (bundled with frontend)
- **Build Command:** Same as frontend (unified Next.js app)
- **Deployment Method:** Git push triggers automatic deployment
- **Function Region:** us-east-1 (configurable per route)
- **Cold Start Mitigation:** Keep functions warm with scheduled pings

**Database:**
- **Platform:** Supabase (managed PostgreSQL)
- **Region:** us-east-1
- **Backups:** Automatic daily backups (7-day retention), point-in-time recovery
- **Connection Pooling:** PgBouncer (built-in)

---

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Build
        run: npm run build

  e2e-tests:
    runs-on: ubuntu-latest
    needs: lint-and-test
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          NEXTAUTH_URL: http://localhost:3000
```

```yaml
# .github/workflows/deploy.yml (Vercel handles this automatically via Git integration)
# Optional: Manual deployment trigger

name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

### Environments

| Environment | Frontend URL | Backend URL | Purpose | Database | Branch |
|-------------|--------------|-------------|---------|----------|--------|
| **Development** | `http://localhost:3000` | `http://localhost:3000/api` | Local development | Local Supabase or staging | N/A |
| **Staging** | `https://nm82-staging.vercel.app` | `https://nm82-staging.vercel.app/api` | Pre-production testing | Staging Supabase instance | `develop` |
| **Production** | `https://inema.vip` | `https://inema.vip/api` | Live environment | Production Supabase | `main` |

**Environment Variables:**

```.env
# Development (.env.local)
DATABASE_URL="postgresql://user:pass@localhost:5432/nm82_dev"
NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-dev-secret"
N8N_WEBHOOK_SECRET="your-webhook-secret"

# Production (Vercel Environment Variables)
DATABASE_URL="postgresql://..." # Supabase connection string
NEXT_PUBLIC_SUPABASE_URL="https://lcmaaossplssflfrrank.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..." # From Supabase dashboard
SUPABASE_SERVICE_ROLE_KEY="..." # From Supabase dashboard (server-side only)
NEXTAUTH_URL="https://inema.vip"
NEXTAUTH_SECRET="..." # Generate via openssl rand -base64 32
N8N_WEBHOOK_SECRET="..." # Shared secret for n8n webhooks
SENTRY_DSN="..." # Error tracking
```

---

## 🛡️ Security & Performance

### Security Requirements

**Frontend Security:**
- **CSP Headers:** `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;`
- **XSS Prevention:** React automatic escaping + DOMPurify for user-generated HTML
- **Secure Storage:** Session tokens in httpOnly cookies (not localStorage)

**Backend Security:**
- **Input Validation:** Zod schemas on all API routes (validate before processing)
- **Rate Limiting:** 100 req/min per IP (using Vercel Edge Config or Upstash Redis)
- **CORS Policy:** Strict origin whitelist (`inema.vip`, staging domain)
- **SQL Injection:** Prisma parameterized queries (ORM protects against SQL injection)

**Authentication Security:**
- **Token Storage:** JWT in httpOnly, secure, sameSite=lax cookies
- **Session Management:** NextAuth.js session strategy with 7-day expiration
- **Password Policy:** Min 8 chars, bcrypt hashing (Supabase Auth default)

**Audit Logging:**
- Log all CRUD operations on sensitive entities (Afiliado, PessoaFisica, Pagamento)
- Include userId, timestamp, IP, changes (before/after)
- Retention: 1 year

---

### Performance Optimization

**Frontend Performance:**
- **Bundle Size Target:** < 200KB initial JS bundle (First Load JS)
- **Loading Strategy:**
  - Server Components by default (zero JS for static content)
  - Client Components only when needed (forms, interactive UI)
  - Dynamic imports for heavy components (charts, modals)
- **Caching Strategy:**
  - React Query with 5-minute stale time for dashboard metrics
  - Vercel Edge Cache for static pages (1 hour CDN cache)
  - `next/image` for automatic image optimization

**Backend Performance:**
- **Response Time Target:** <500ms (p95), <200ms (p50)
- **Database Optimization:**
  - Indexes on frequently queried columns (see Prisma schema `@@index`)
  - Connection pooling via PgBouncer (Supabase default)
  - Query optimization with Prisma `include` (avoid N+1 queries)
  - Pagination for list endpoints (default 20 items/page)
- **Caching Strategy:**
  - React Query caches API responses client-side
  - No server-side cache for MVP (add Redis later if needed)

**Monitoring:**
- Vercel Analytics for Web Vitals (LCP, FID, CLS)
- Sentry for error tracking + performance monitoring
- Prisma query logging in development

---

## 🧪 Testing Strategy

### Testing Pyramid

```
        /\
       /  \  E2E (Playwright)
      /    \  - Critical user flows
     /------\  - 5-10 tests
    /        \
   / Integration \ (Vitest + MSW)
  /  (API Routes) \  - API endpoint tests
 /------------------\  - 20-30 tests
/                    \
/   Unit Tests        \ (Vitest + RTL)
/  (Components/Utils)  \  - 50-100 tests
/________________________\
```

### Test Organization

**Frontend Tests:**

```
apps/web/src/
├── components/
│   └── __tests__/
│       ├── metric-card.test.tsx
│       ├── afiliado-form.test.tsx
│       └── data-table.test.tsx
├── hooks/
│   └── __tests__/
│       ├── use-auth.test.ts
│       └── use-afiliados.test.ts
└── lib/
    └── __tests__/
        ├── api-client.test.ts
        └── utils.test.ts
```

**Backend Tests:**

```
apps/web/src/app/api/
├── afiliados/
│   ├── route.ts
│   └── route.test.ts  # API route tests
└── ...

apps/web/src/services/
├── afiliado-service.ts
└── afiliado-service.test.ts  # Service layer tests
```

**E2E Tests:**

```
apps/web/tests/e2e/
├── auth.spec.ts              # Login/logout
├── afiliado-approval.spec.ts # Admin approves afiliado
├── padrinho-dashboard.spec.ts
└── cadastro-public.spec.ts   # Public signup flow
```

### Test Examples

**Frontend Component Test (Vitest + RTL):**

```typescript
// components/__tests__/metric-card.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricCard } from '../dashboard/metric-card';

describe('MetricCard', () => {
  it('renders metric value and label', () => {
    render(
      <MetricCard
        label="Total Afiliados"
        value={42}
        icon={<UserIcon />}
        trend="+12%"
      />
    );

    expect(screen.getByText('Total Afiliados')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('applies correct styling for positive trend', () => {
    const { container } = render(
      <MetricCard label="Test" value={10} trend="+5%" />
    );

    const trend = screen.getByText('+5%');
    expect(trend).toHaveClass('text-green-600');
  });
});
```

**Backend API Test (Vitest + Prisma Mock):**

```typescript
// app/api/afiliados/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/auth-helpers');
vi.mock('@/lib/prisma', () => ({
  prisma: {
    afiliado: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('GET /api/afiliados', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns paginated afiliados for admin', async () => {
    vi.mocked(requireRole).mockResolvedValue({
      session: { user: { id: 'admin-id' } },
      roles: ['ADMIN'],
    });

    vi.mocked(prisma.afiliado.findMany).mockResolvedValue([
      { id: '1', nome: 'João', status: 'PENDENTE' },
      { id: '2', nome: 'Maria', status: 'APROVADO' },
    ]);

    vi.mocked(prisma.afiliado.count).mockResolvedValue(2);

    const request = new Request('http://localhost/api/afiliados?page=1&limit=20');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toEqual({
      afiliados: expect.arrayContaining([
        expect.objectContaining({ nome: 'João' }),
      ]),
      total: 2,
      page: 1,
      totalPages: 1,
    });
  });

  it('returns 401 for unauthenticated user', async () => {
    vi.mocked(requireRole).mockRejectedValue(new Error('Unauthorized'));

    const request = new Request('http://localhost/api/afiliados');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});
```

**E2E Test (Playwright):**

```typescript
// tests/e2e/afiliado-approval.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Afiliado Approval Flow', () => {
  test('admin can approve pending afiliado', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@inema.vip');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Navigate to afiliados page
    await page.waitForURL('/dashboard');
    await page.click('a[href="/afiliados"]');

    // Filter by pendente
    await page.selectOption('select[name="status"]', 'PENDENTE');

    // Click on first afiliado
    await page.click('tbody tr:first-child');

    // Approve
    await page.click('button:has-text("Aprovar")');

    // Confirm modal
    await page.click('button:has-text("Confirmar")');

    // Check success message
    await expect(page.locator('.toast')).toContainText('Afiliado aprovado com sucesso');

    // Verify status changed
    await expect(page.locator('.status-badge')).toContainText('APROVADO');
  });
});
```

---

## 📐 Coding Standards

### Critical Fullstack Rules

- **Type Sharing:** Always define shared types in `packages/shared/src/types` and import from `@nm82/shared`. Never duplicate type definitions between frontend and backend.

- **API Calls:** Never make direct `fetch()` calls in components - always use the service layer (`lib/api-client.ts`) which handles auth headers, error handling, and retries.

- **Environment Variables:** Access only through typed config objects in `lib/config.ts`, never `process.env` directly. This enables runtime validation and prevents missing vars.

- **Error Handling:** All API routes must use the standard error handler middleware (`lib/error-handler.ts`) to ensure consistent error format and logging.

- **State Updates:** Never mutate Prisma objects directly - use Prisma's update/create methods. Never mutate React state directly - use setState or Zustand actions.

- **Database Queries:** Always use Prisma ORM - never raw SQL. Use transactions for multi-step operations. Prefer `findUniqueOrThrow` over `findUnique` to fail fast.

- **Authorization:** Every API route must call `requireAuth()` or `requireRole()` before processing. Never trust client-sent role data.

- **Form Validation:** All forms must use React Hook Form + Zod schemas. Define schema once, use on both frontend (form validation) and backend (API validation).

- **Async Operations:** Always handle loading and error states in UI. Use React Query's `isLoading`, `isError`, `data` pattern.

- **File Uploads:** Always upload to Supabase Storage via API route (not directly from frontend). Validate file type and size on backend.

---

### Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| **Components** | PascalCase | - | `AfiliadoForm.tsx`, `MetricCard.tsx` |
| **Hooks** | camelCase with `use` prefix | - | `useAuth.ts`, `useAfiliados.ts` |
| **API Routes** | - | kebab-case | `/api/afiliados`, `/api/codigos/gerar` |
| **Database Tables** | - | snake_case | `pessoas_fisicas`, `codigos_convite` |
| **Prisma Models** | PascalCase | PascalCase | `PessoaFisica`, `CodigoConvite` |
| **Services** | - | camelCase with `Service` suffix | `afiliadoService`, `emailService` |
| **Types/Interfaces** | PascalCase | PascalCase | `Afiliado`, `PagamentoStatus` |
| **Enums** | SCREAMING_SNAKE_CASE | SCREAMING_SNAKE_CASE | `AFILIADO_STATUS.PENDENTE` |

---

## ❗ Error Handling Strategy

### Error Response Format

```typescript
// Standard API error response
interface ApiError {
  error: {
    code: string;           // Machine-readable error code
    message: string;         // Human-readable message
    details?: Record<string, any>; // Additional context
    timestamp: string;       // ISO timestamp
    requestId: string;       // Unique request ID for debugging
  };
}

// Example:
{
  "error": {
    "code": "PADRINHO_SEM_CONVITES",
    "message": "O padrinho não possui convites disponíveis",
    "details": {
      "padrinhoId": "uuid-123",
      "convitesDisponiveis": 0
    },
    "timestamp": "2025-11-01T10:00:00Z",
    "requestId": "req_abc123"
  }
}
```

### Error Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Service
    participant Database

    Client->>API: POST /api/afiliados/cadastro
    API->>API: Validate request body (Zod)
    alt Validation fails
        API-->>Client: 400 Bad Request (validation errors)
    end

    API->>Service: afiliadoService.create()
    Service->>Database: Check padrinho exists
    alt Padrinho not found
        Database-->>Service: null
        Service-->>API: throw AppError("PADRINHO_NAO_ENCONTRADO")
        API-->>Client: 404 Not Found
    end

    Service->>Database: Check convites disponíveis
    alt No convites
        Service-->>API: throw AppError("PADRINHO_SEM_CONVITES")
        API-->>Client: 400 Bad Request
    end

    Service->>Database: Create afiliado
    alt Database error
        Database-->>Service: PrismaClientKnownRequestError
        Service-->>API: throw AppError("DATABASE_ERROR")
        API->>API: Log error to Sentry
        API-->>Client: 500 Internal Server Error
    end

    Database-->>Service: Created afiliado
    Service-->>API: Return afiliado
    API-->>Client: 201 Created
```

### Frontend Error Handling

```typescript
// hooks/use-afiliados.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/components/ui/use-toast';

export function useCreateAfiliado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AfiliadoCreateInput) =>
      apiClient.post('/afiliados/cadastro', data),

    onSuccess: () => {
      queryClient.invalidateQueries(['afiliados']);
      toast({
        title: 'Sucesso!',
        description: 'Cadastro realizado. Aguarde aprovação.',
        variant: 'success',
      });
    },

    onError: (error: ApiError) => {
      // Map error codes to user-friendly messages
      const messages: Record<string, string> = {
        PADRINHO_NAO_ENCONTRADO: 'O padrinho informado não foi encontrado. Verifique o link de convite.',
        PADRINHO_SEM_CONVITES: 'O padrinho não possui convites disponíveis no momento.',
        EMAIL_JA_CADASTRADO: 'Este email já está cadastrado.',
        VALIDATION_ERROR: 'Verifique os campos do formulário.',
      };

      toast({
        title: 'Erro no cadastro',
        description: messages[error.error.code] || 'Ocorreu um erro. Tente novamente.',
        variant: 'destructive',
      });

      // Log to Sentry if 500 error
      if (error.error.code === 'INTERNAL_SERVER_ERROR') {
        console.error('Server error:', error);
        // Sentry.captureException(error);
      }
    },
  });
}
```

### Backend Error Handling

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// lib/error-handler.ts
import { AppError } from './errors';
import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';

export function handleError(error: unknown): Response {
  const requestId = crypto.randomUUID();

  // Known application errors
  if (error instanceof AppError) {
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      { status: error.statusCode }
    );
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint violation
    if (error.code === 'P2002') {
      return Response.json(
        {
          error: {
            code: 'DUPLICATE_ENTRY',
            message: 'Este registro já existe',
            details: { fields: error.meta?.target },
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: 409 }
      );
    }

    // P2025: Record not found
    if (error.code === 'P2025') {
      return Response.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Registro não encontrado',
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: 404 }
      );
    }
  }

  // Unknown errors - log to Sentry
  Sentry.captureException(error, {
    tags: { requestId },
  });

  return Response.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Ocorreu um erro interno. Tente novamente mais tarde.',
        timestamp: new Date().toISOString(),
        requestId,
      },
    },
    { status: 500 }
  );
}

// Usage in API route
export async function POST(request: Request) {
  try {
    // ... API logic
  } catch (error) {
    return handleError(error);
  }
}
```

---

## 📊 Monitoring and Observability

### Monitoring Stack

- **Frontend Monitoring:** Vercel Analytics (Core Web Vitals, page views, API latency)
- **Backend Monitoring:** Vercel Function Logs + Metrics (invocations, duration, errors)
- **Error Tracking:** Sentry (frontend + backend errors, performance monitoring)
- **Performance Monitoring:** Sentry Performance + Vercel Speed Insights
- **Database Monitoring:** Supabase Dashboard (query performance, connections, storage)

### Key Metrics

**Frontend Metrics:**
- **Core Web Vitals:**
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1
- **JavaScript Errors:** < 1% error rate
- **API Response Times:** p50 < 200ms, p95 < 500ms
- **User Interactions:** Button clicks, form submissions

**Backend Metrics:**
- **Request Rate:** Requests per minute
- **Error Rate:** < 1% of total requests
- **Response Time:** p50 < 200ms, p95 < 500ms, p99 < 1s
- **Database Query Performance:** Slow queries (> 500ms) count
- **Function Cold Starts:** Frequency and duration

**Business Metrics (via Custom Events):**
- Afiliados created per day
- Approval rate (aprovados / cadastrados)
- Padrinho engagement (convites usados)
- Payment confirmation time

### Logging Strategy

```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  base: {
    env: process.env.NODE_ENV,
    revision: process.env.VERCEL_GIT_COMMIT_SHA,
  },
});

// Usage
logger.info({ userId, afiliadoId }, 'Afiliado aprovado');
logger.error({ error, requestId }, 'Erro ao processar webhook');
```

---

## 🚦 Next Steps

1. **Setup Project Repository**
   - Initialize Next.js app with TypeScript
   - Configure Prisma with Supabase connection
   - Setup Shadcn/UI and Tailwind CSS
   - Configure NextAuth.js

2. **Database Setup**
   - Run Prisma migrations on Supabase
   - Apply RLS policies
   - Seed initial data (admin user, test codes)

3. **Implement MVP (Phase 1 - Foundation)**
   - Authentication pages (login, signup)
   - Protected route middleware
   - Basic dashboard layout with sidebar
   - Dashboard metrics (static first, then API)

4. **Implement MVP (Phase 2 - Core CRUD)**
   - Padrinhos management (list, detail, edit)
   - Afiliados management (list, approve/reject)
   - Códigos de convite (list, generate)
   - Public cadastro page

5. **Integration**
   - n8n webhook endpoints
   - Email notification service
   - Supabase Storage for file uploads

6. **Testing & Deployment**
   - Write tests (unit, integration, E2E)
   - Setup CI/CD pipeline
   - Deploy to staging
   - UAT with admins
   - Deploy to production

---

**Fim da Arquitetura v1.0**

Este documento será complementado com:
- `/BMad:agents:architect *shard-prd` para dividir em arquivos menores
- Épicos e User Stories (criados pelo PO)
- Documentação de componentes específicos conforme desenvolvimento
