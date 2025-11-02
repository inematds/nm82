# 📋 Dependências e Riscos

### Dependências Externas

| Dependência | Criticidade | Mitigação |
|-------------|-------------|-----------|
| Supabase (uptime) | 🔴 CRÍTICA | Backups diários, cache local |
| n8n (workflows) | 🟡 ALTA | Fila de retry, logs detalhados |
| Gmail API (quotas) | 🟡 ALTA | Rate limiting, alternativa: Resend |
| Vercel (hosting) | 🔴 CRÍTICA | Monitoramento, plano pago |

### Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Migração de dados falhar | Média | Alto | Testes em ambiente staging, rollback plan |
| RLS mal configurado expor dados | Baixa | Crítico | Code review, testes de segurança |
| Performance degradar com 1000+ usuários | Média | Médio | Testes de carga, otimização de queries |
| Integração n8n quebrar | Baixa | Médio | Testes de integração, webhooks com retry |
| Escopo aumentar (scope creep) | Alta | Médio | PO deve validar mudanças, priorizar MVP |
