# Security & Performance

## Security Requirements

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

## Performance Optimization

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
