# 🎯 Visão do Produto

### Declaração de Visão

**nm82** é uma plataforma web integrada que permite à comunidade INEMA.VIP gerenciar completamente seu programa de marketing de afiliados (padrinhos e afiliados), automatizar processos de onboarding, controlar pagamentos, e fornecer insights através de dashboards e relatórios analíticos.

### Problema que Resolve

**Situação Atual (nm81)**:
- Sistema fragmentado (n8n workflows + páginas HTML isoladas)
- Sem autenticação - painéis administrativos públicos
- Gestão manual de dados via Supabase Dashboard
- Credenciais expostas no frontend (risco de segurança)
- Sem interface para CRUD de entidades principais
- Relatórios limitados e sem exportação
- Zero controle de acesso por perfil

**Impacto**:
- Operações manuais consomem tempo da equipe
- Risco de segurança alto
- Experiência do usuário fragmentada
- Dificuldade em escalar o programa de afiliados
- Impossibilidade de tracking efetivo de performance

### Solução Proposta

Construir uma **aplicação web moderna e segura** que:
1. Centraliza todas as operações em uma interface unificada
2. Implementa autenticação e autorização por perfil (Admin, Padrinho, Afiliado)
3. Fornece CRUD completo para todas as entidades
4. Automatiza workflows de aprovação e notificação
5. Gera relatórios e dashboards em tempo real
6. Integra-se com os workflows n8n existentes
7. Mantém compatibilidade com o banco Supabase atual
