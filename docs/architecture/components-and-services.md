# Components & Services

## Frontend Components (Next.js App Router)

### Component Architecture

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

## Backend Services (API Routes + Services Layer)

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

## Service Layer Pattern

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
