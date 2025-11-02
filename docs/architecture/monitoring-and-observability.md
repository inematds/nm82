# Monitoring and Observability

## Monitoring Stack

- **Frontend Monitoring:** Vercel Analytics (Core Web Vitals, page views, API latency)
- **Backend Monitoring:** Vercel Function Logs + Metrics (invocations, duration, errors)
- **Error Tracking:** Sentry (frontend + backend errors, performance monitoring)
- **Performance Monitoring:** Sentry Performance + Vercel Speed Insights
- **Database Monitoring:** Supabase Dashboard (query performance, connections, storage)

## Key Metrics

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

## Logging Strategy

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
