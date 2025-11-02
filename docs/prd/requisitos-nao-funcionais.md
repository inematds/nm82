# 🔒 Requisitos Não-Funcionais

### RNF-001: Performance

| Métrica | Requisito | Medição |
|---------|-----------|---------|
| Tempo de carregamento inicial | < 2s | Lighthouse |
| Tempo de resposta API | < 500ms (p95) | Vercel Analytics |
| Consultas ao banco | < 200ms (p95) | Prisma logs |
| Dashboard refresh | < 1s | React Query |

### RNF-002: Segurança

- [ ] HTTPS obrigatório (certificado válido)
- [ ] Credenciais em variáveis de ambiente (.env)
- [ ] Row Level Security (RLS) no Supabase por perfil
- [ ] Tokens JWT com expiração (7 dias)
- [ ] Sanitização de inputs (proteção XSS)
- [ ] Rate limiting em APIs (100 req/min por IP)
- [ ] Logs de auditoria para operações críticas
- [ ] 2FA opcional para Admins (Fase 3+)

### RNF-003: Disponibilidade

- [ ] Uptime: 99.5% (máximo 3.6h downtime/mês)
- [ ] Backup diário automático do banco (Supabase)
- [ ] Monitoramento com Sentry (erros) e Vercel (uptime)
- [ ] Alertas para Admin em caso de downtime

### RNF-004: Usabilidade

- [ ] Interface responsiva (mobile, tablet, desktop)
- [ ] Suporte a navegadores: Chrome, Firefox, Safari, Edge (últimas 2 versões)
- [ ] Acessibilidade WCAG 2.1 AA (mínimo)
- [ ] Loading states em todas as operações assíncronas
- [ ] Mensagens de erro claras e acionáveis
- [ ] Confirmações para ações destrutivas

### RNF-005: Manutenibilidade

- [ ] Código TypeScript (type-safe)
- [ ] Cobertura de testes: >70% (unitários + integração)
- [ ] Documentação de APIs (Swagger/OpenAPI)
- [ ] README com instruções de setup
- [ ] Conventional Commits (padrão de mensagens)
- [ ] CI/CD com GitHub Actions
