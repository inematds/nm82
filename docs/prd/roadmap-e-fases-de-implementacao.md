# 🚀 Roadmap e Fases de Implementação

### Visão Geral das Fases

| Fase | Duração | Objetivo | Módulos Principais |
|------|---------|----------|-------------------|
| **Fase 1: Fundação** | 2-3 semanas | Base segura e funcional | Autenticação, Dashboard Base, Migração |
| **Fase 2: Gestão Core** | 3-4 semanas | CRUD completo | Padrinhos, Afiliados, Códigos |
| **Fase 3: Pagamentos** | 2-3 semanas | Gestão financeira | Pagamentos, Reconciliação |
| **Fase 4: Analytics** | 2 semanas | Insights e relatórios | Dashboards avançados, Notificações |
| **Fase 5: Comunidade** | 2-3 semanas | Engajamento | Portal Padrinho, Gamificação |

---

### 📦 MVP (Minimum Viable Product)

**Definição**: Sistema funcional que substitui operações manuais críticas.

**Escopo**: Fase 1 + Fase 2 (5-7 semanas)

**Funcionalidades Incluídas**:
✅ RF-001: Autenticação e Autorização
✅ RF-002: Dashboard Administrativo
✅ RF-003: Gestão de Padrinhos
✅ RF-004: Gestão de Afiliados
✅ RF-005: Gestão de Códigos de Convite
✅ RF-010: Cadastro Público de Afiliado

**Funcionalidades Fora do MVP** (vêm depois):
⏭️ RF-006: Gestão de Pagamentos (Fase 3)
⏭️ RF-007: Relatórios e Analytics (Fase 4)
⏭️ RF-008: Portal do Padrinho (Fase 5)
⏭️ RF-009: Sistema de Notificações (Fase 4)

**Critério de Aceitação do MVP**:
- [ ] Admin consegue fazer login seguro
- [ ] Admin vê dashboard com métricas em tempo real
- [ ] Admin consegue aprovar afiliados sem acessar banco de dados
- [ ] Admin consegue ajustar convites de padrinhos
- [ ] Admin consegue gerar e gerenciar códigos de convite
- [ ] Afiliado consegue se cadastrar via link de padrinho
- [ ] Sistema notifica via email (integrado com n8n)
- [ ] Zero credenciais expostas no frontend
- [ ] RLS aplicado no Supabase
