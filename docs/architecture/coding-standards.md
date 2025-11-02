# Coding Standards

## Critical Fullstack Rules

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

## Naming Conventions

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
