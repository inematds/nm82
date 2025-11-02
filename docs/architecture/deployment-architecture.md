# Deployment Architecture

## Deployment Strategy

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

## CI/CD Pipeline

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

## Environments

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
