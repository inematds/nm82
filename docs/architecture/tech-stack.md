# Tech Stack

## Technology Stack Table

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
