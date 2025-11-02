# 🎨 Requisitos Funcionais

### RF-001: Autenticação e Autorização

**Prioridade**: 🔴 CRÍTICA
**MVP**: ✅ Fase 1

**Descrição**: Sistema de login seguro com perfis de acesso diferenciados.

**Critérios de Aceitação**:
- [ ] Como usuário, posso fazer login com email/senha
- [ ] Como usuário, posso recuperar minha senha via email
- [ ] Como sistema, implemento 3 perfis: Admin, Padrinho, Afiliado
- [ ] Como Admin, tenho acesso a todas as funcionalidades
- [ ] Como Padrinho, tenho acesso apenas ao meu portal
- [ ] Como Afiliado, tenho acesso apenas à minha área
- [ ] Como sistema, aplico RLS no Supabase por perfil
- [ ] Como sistema, mantenho sessão por 7 dias (remember me)
- [ ] Como sistema, logo out automático após 30 dias

**Regras de Negócio**:
- Login com Supabase Auth
- Perfil determinado pela tabela `user_roles`
- Middleware Next.js protege rotas por perfil
- Token JWT com claims de perfil

---

### RF-002: Dashboard Administrativo

**Prioridade**: 🔴 CRÍTICA
**MVP**: ✅ Fase 1

**Descrição**: Painel central com métricas e operações principais.

**Critérios de Aceitação**:
- [ ] Como Admin, vejo cards com: total afiliados, total padrinhos, convites disponíveis
- [ ] Como Admin, vejo gráfico de novos afiliados (últimos 30 dias)
- [ ] Como Admin, vejo tabela com últimos 10 afiliados cadastrados
- [ ] Como Admin, vejo tabela com top 10 padrinhos ativos
- [ ] Como Admin, vejo alertas (afiliados sem padrinho, códigos expirados)
- [ ] Como Admin, posso clicar em métricas para filtrar dados relacionados
- [ ] Como sistema, atualizo dados a cada 30 segundos

**Métricas**:
| Métrica | Cálculo | Fonte |
|---------|---------|-------|
| Total Afiliados | COUNT(afiliados) | afiliados |
| Total Padrinhos | COUNT(DISTINCT padrinho_id) | afiliados |
| Convites Disponíveis | SUM(pessoas_fisicas.convites_disponiveis) | pessoas_fisicas |

---

### RF-003: Gestão de Padrinhos

**Prioridade**: 🔴 CRÍTICA
**MVP**: ✅ Fase 2

**Descrição**: CRUD completo de padrinhos com ajustes de convites.

**Critérios de Aceitação**:
- [ ] Como Admin, vejo lista paginada de padrinhos (20/página)
- [ ] Como Admin, posso buscar padrinho por nome, email ou ID
- [ ] Como Admin, posso filtrar por: ativo/inativo, com/sem convites
- [ ] Como Admin, posso ordenar por: nome, convites usados, data cadastro
- [ ] Como Admin, posso ver detalhes completos de um padrinho
- [ ] Como Admin, posso editar dados de um padrinho
- [ ] Como Admin, posso ativar/desativar um padrinho
- [ ] Como Admin, posso ajustar `convites_disponiveis` de um padrinho
- [ ] Como Admin, vejo histórico de afiliados convidados por padrinho
- [ ] Como Admin, posso exportar lista de padrinhos (CSV)

**Campos do Formulário**:
- Nome (obrigatório)
- Email (obrigatório, único)
- CPF
- Telefone
- Convites disponíveis (ajustável)
- Status ativo (toggle)

---

### RF-004: Gestão de Afiliados

**Prioridade**: 🔴 CRÍTICA
**MVP**: ✅ Fase 2

**Descrição**: CRUD completo de afiliados com aprovação e tracking.

**Critérios de Aceitação**:
- [ ] Como Admin, vejo lista paginada de afiliados (20/página)
- [ ] Como Admin, posso buscar afiliado por nome, email, padrinho
- [ ] Como Admin, posso filtrar por status: PENDENTE, ENVIADO, JA_CADASTRADO, SEM_PADRINHO, SEM_CONVITE
- [ ] Como Admin, posso ordenar por: data cadastro, nome, status
- [ ] Como Admin, posso aprovar afiliado pendente (bulk ou individual)
- [ ] Como Admin, posso editar dados de um afiliado
- [ ] Como Admin, posso alterar padrinho de um afiliado
- [ ] Como Admin, vejo dados do padrinho vinculado
- [ ] Como Admin, posso exportar lista de afiliados (CSV)

**Fluxo de Aprovação**:
1. Afiliado se cadastra via link de convite → status "PENDENTE"
2. Admin revisa cadastro
3. Admin aprova:
   - Status → "ENVIADO"
   - Sistema pega código disponível
   - Sistema atribui código ao email do afiliado
   - Sistema envia email com link Telegram
   - Sistema incrementa `convites_usados` do padrinho
   - Sistema notifica padrinho
4. Se padrinho não existir: status → "SEM_PADRINHO"
5. Se padrinho sem convites: status → "SEM_CONVITE"
6. Se email já cadastrado: status → "JA_CADASTRADO"

---

### RF-005: Gestão de Códigos de Convite

**Prioridade**: 🟡 ALTA
**MVP**: ✅ Fase 2

**Descrição**: Gerenciamento de códigos de acesso ao Telegram.

**Critérios de Aceitação**:
- [ ] Como Admin, vejo lista de códigos com status (disponível, usado, expirado)
- [ ] Como Admin, posso gerar códigos em lote (quantidade configurável)
- [ ] Como Admin, posso definir data de expiração padrão
- [ ] Como Admin, vejo qual email está usando cada código
- [ ] Como Admin, posso desassociar código de um email (liberar)
- [ ] Como Admin, posso marcar código como expirado manualmente
- [ ] Como Admin, vejo estatísticas: total, disponíveis, usados, expirados
- [ ] Como sistema, marco códigos como expirados automaticamente

**Formato do Código**:
- Alfanumérico, 8 caracteres
- Exemplo: `A7X9K2M5`
- Único, case-insensitive

---

### RF-006: Relatórios e Analytics

**Prioridade**: 🟡 ALTA
**MVP**: ⏭️ Fase 4

**Descrição**: Relatórios avançados e exportação de dados.

**Critérios de Aceitação**:
- [ ] Como Admin, vejo relatório de conversão do funil (cadastros → aprovações → ativos)
- [ ] Como Admin, vejo relatório de performance de padrinhos (ranking)
- [ ] Como Admin, vejo relatório de engajamento (uso de convites, tempo de resposta)
- [ ] Como Admin, posso filtrar relatórios por período customizado
- [ ] Como Admin, posso exportar qualquer relatório em CSV/Excel
- [ ] Como Admin, vejo gráficos interativos (drill-down)
- [ ] Como sistema, armazeno snapshots diários para análises históricas

**Relatórios Principais**:
1. **Funil de Conversão**
   - Cadastros recebidos
   - Aprovações (% conversão)
   - Primeiros acessos (% ativação)

2. **Performance de Padrinhos**
   - Ranking por convites usados
   - Taxa de aprovação dos seus afiliados
   - Tempo médio de cadastro dos convidados

---

### RF-007: Sistema de Notificações

**Prioridade**: 🟡 ALTA
**MVP**: ⏭️ Fase 4

**Descrição**: Central de notificações in-app e via email.

**Critérios de Aceitação**:
- [ ] Como usuário, vejo badge com quantidade de notificações não lidas
- [ ] Como usuário, posso abrir central de notificações
- [ ] Como usuário, posso marcar notificações como lidas
- [ ] Como usuário, posso configurar preferências (quais receber)
- [ ] Como Padrinho, recebo notificação quando afiliado é aprovado
- [ ] Como Afiliado, recebo notificação quando sou aprovado
- [ ] Como Admin, recebo notificação de novos cadastros pendentes
- [ ] Como sistema, envio email para notificações críticas

**Tipos de Notificações**:
| Evento | Destinatário | In-App | Email |
|--------|--------------|--------|-------|
| Afiliado cadastrado | Admin | ✅ | ⚠️ |
| Afiliado aprovado | Afiliado | ✅ | ✅ |
| Afiliado aprovado | Padrinho | ✅ | ✅ |
| Convites esgotados | Padrinho | ✅ | ✅ |

---

### RF-008: Portal do Padrinho

**Prioridade**: 🟡 ALTA
**MVP**: ⏭️ Fase 5

**Descrição**: Dashboard personalizado para padrinhos acompanharem seus afiliados.

**Critérios de Aceitação**:
- [ ] Como Padrinho, vejo meus convites disponíveis e usados
- [ ] Como Padrinho, vejo lista dos meus afiliados (nome, email, status)
- [ ] Como Padrinho, posso copiar meu link de convite com um clique
- [ ] Como Padrinho, vejo minha posição no ranking geral
- [ ] Como Padrinho, vejo gráfico da minha evolução (convites/mês)
- [ ] Como Padrinho, posso baixar materiais de marketing (templates)
- [ ] Como Padrinho, recebo notificações quando afiliado é aprovado
- [ ] Como Padrinho, posso enviar mensagem para meus afiliados (via sistema)

**Link de Convite**:
- Formato: `https://inema.vip/convite?pid={padrinho_id}`
- Padrinho pode compartilhar em redes sociais, WhatsApp, email
- Sistema rastreia cliques (opcional - Fase 5+)

---

### RF-009: Cadastro Público de Afiliado

**Prioridade**: 🔴 CRÍTICA
**MVP**: ✅ Fase 1 (Migração do atual)

**Descrição**: Página pública para cadastro via link de padrinho.

**Critérios de Aceitação**:
- [ ] Como visitante, acesso via link com `?pid={padrinho_id}`
- [ ] Como visitante, vejo informações sobre a comunidade
- [ ] Como visitante, preencho formulário de cadastro
- [ ] Como visitante, recebo feedback imediato de cadastro (sucesso/erro)
- [ ] Como sistema, valido se padrinho existe e está ativo
- [ ] Como sistema, valido se padrinho tem convites disponíveis
- [ ] Como sistema, valido se email já está cadastrado
- [ ] Como sistema, crio registro com status "pendente"
- [ ] Como sistema, notifico Admin de novo cadastro
- [ ] Como sistema, envio email de confirmação para afiliado

**Validações**:
- Padrinho deve existir em `pessoas_fisicas`
- Padrinho deve ter `convites_disponiveis > 0`
- Email não pode estar duplicado
- Campos obrigatórios: nome, email
- CPF: validação de formato (se preenchido)
