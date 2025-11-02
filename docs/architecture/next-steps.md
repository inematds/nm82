# Next Steps

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
