# 📎 Anexos

### A. Glossário

| Termo | Definição |
|-------|-----------|
| **Padrinho** | Membro da comunidade que convida novos afiliados |
| **Afiliado** | Novo membro convidado por um padrinho |
| **Código de Convite** | Código alfanumérico para acessar o bot do Telegram |
| **nm81** | Sistema atual (workflows n8n + páginas HTML isoladas) |
| **nm82** | Novo sistema integrado (este PRD) |
| **RLS** | Row Level Security (políticas de acesso no Supabase) |
| **MVP** | Minimum Viable Product (Fases 1+2) |

### B. Referências

- Análise Brownfield do nm81 (Mary - Business Analyst)
- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Prisma Documentation: https://www.prisma.io/docs

### C. Histórico de Decisões

| Data | Decisão | Justificativa | Aprovado por |
|------|---------|---------------|--------------|
| 2025-11-01 | Stack: Next.js + Prisma + Supabase | Compatibilidade com infra atual, expertise da equipe | Sarah (PO) |
| 2025-11-01 | MVP = Fases 1+2 (5-7 semanas) | Eliminar 90% das operações manuais rapidamente | Sarah (PO) |
| 2025-11-01 | Preservar workflows n8n existentes | Evitar retrabalho, integração via webhooks | Sarah (PO) |
