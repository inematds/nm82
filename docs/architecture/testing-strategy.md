# Testing Strategy

## Testing Pyramid

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

## Test Organization

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

## Test Examples

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
