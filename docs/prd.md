# Product Requirements Document (PRD)
## nm82 - Sistema Integrado de Gestão de Comunidade e Marketing de Afiliados

**Versão**: 1.0
**Data**: 2025-11-01
**Projeto**: nm82 (substitui nm81)
**Product Owner**: Sarah
**Analista**: Mary
**Status**: Draft

---

## 📋 Change Log

| Data | Versão | Alterações | Autor |
|------|--------|------------|-------|
| 2025-11-01 | 1.0 | Criação inicial do PRD baseado na análise brownfield do nm81 | Sarah (PO) |

---

## 🎯 Visão do Produto

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

---

## 🎪 Stakeholders

| Papel | Nome/Grupo | Interesse | Envolvimento |
|-------|------------|-----------|--------------|
| **Product Owner** | Sarah | Garantir qualidade e completude do produto | Alto |
| **Business Analyst** | Mary | Garantir alinhamento com necessidades de negócio | Médio |
| **Founder/Sponsor** | Nei Maldaner | Visão da comunidade INEMA.VIP | Alto |
| **Administradores** | Equipe INEMA | Gerenciar comunidade e programa de afiliados | Alto |
| **Padrinhos** | Membros ativos | Convidar afiliados e acompanhar performance | Alto |
| **Afiliados** | Novos membros | Receber convite e acessar comunidade | Médio |
| **Arquiteto** | Jordan (próximo) | Definir arquitetura técnica | Alto |
| **Desenvolvedores** | Equipe dev | Implementar o sistema | Alto |

---

## 🎯 Objetivos de Negócio

### Objetivos Principais

1. **Eficiência Operacional**
   - Reduzir tempo de gestão manual em 80%
   - Automatizar aprovação de afiliados (de manual para 10min)
   - Eliminar necessidade de acesso direto ao banco de dados

2. **Segurança e Compliance**
   - Implementar autenticação segura
   - Aplicar Row Level Security (RLS) no Supabase
   - Remover credenciais expostas no frontend
   - Logs de auditoria para operações críticas

3. **Escalabilidade do Programa**
   - Suportar crescimento de 100 para 1000+ padrinhos
   - Processar 500+ convites/dia automaticamente
   - Dashboard em tempo real sem degradação

4. **Experiência do Usuário**
   - Interface moderna e intuitiva
   - Portal do padrinho com tracking de performance
   - Notificações in-app e via email
   - Mobile-responsive

5. **Insights e Decisão**
   - Métricas de conversão do funil de afiliados
   - Ranking de padrinhos por performance
   - Análise financeira (receita, LTV, churn)
   - Exportação de relatórios (CSV, Excel)

### Métricas de Sucesso

| Métrica | Baseline (nm81) | Objetivo (nm82) | Prazo |
|---------|-----------------|-----------------|-------|
| Tempo médio de aprovação de afiliado | 24h (manual) | 10min (auto) | MVP |
| Operações manuais/dia | 50+ | <5 | Fase 2 |
| Satisfação de padrinhos (NPS) | N/A | >40 | Fase 5 |
| Uptime do sistema | 95% | 99.5% | Fase 3 |
| Tempo de carregamento dashboard | N/A | <2s | MVP |

---

## 👥 Personas e User Journeys

### Persona 1: Administrador da Comunidade

**Nome**: Tiza
**Idade**: 35 anos
**Cargo**: Community Manager
**Tech Savviness**: Médio

**Necessidades**:
- Aprovar/rejeitar afiliados rapidamente
- Ajustar convites disponíveis para padrinhos
- Visualizar métricas gerais da comunidade
- Exportar relatórios para análise
- Resolver problemas de acesso

**Dores Atuais**:
- Precisa acessar Supabase Dashboard (complexo)
- Sem visão consolidada das operações
- Dificuldade em identificar problemas rapidamente

**Jobs to be Done**:
- Quando um afiliado se cadastra, eu preciso revisar e aprovar rapidamente para não perder o engajamento
- Quando um padrinho solicita mais convites, eu preciso validar e ajustar facilmente
- Quando preciso reportar ao fundador, eu preciso exportar dados confiáveis

---

### Persona 2: Padrinho

**Nome**: Carlos
**Idade**: 42 anos
**Perfil**: Empreendedor, membro ativo da comunidade
**Tech Savviness**: Médio

**Necessidades**:
- Ver quantos convites tenho disponíveis
- Acompanhar status dos meus afiliados
- Gerar link de convite facilmente
- Ver minha performance (ranking, conversão)
- Materiais de marketing prontos

**Dores Atuais**:
- Não sabe quantos convites usou/restam
- Sem feedback sobre afiliados convidados
- Link de convite manual (sujeito a erros)

**Jobs to be Done**:
- Quando quero convidar alguém, eu preciso de um link fácil de copiar e compartilhar
- Quando meu afiliado pergunta sobre o cadastro, eu preciso ver o status dele
- Quando quero me motivar, eu preciso ver minha posição no ranking

---

### Persona 3: Afiliado

**Nome**: Ana
**Idade**: 28 anos
**Perfil**: Profissional buscando desenvolvimento
**Tech Savviness**: Alto

**Necessidades**:
- Cadastro simples e rápido
- Feedback claro sobre status
- Instruções de acesso à comunidade
- Contato com padrinho

**Dores Atuais**:
- Cadastro ok, mas sem feedback de aprovação
- Não sabe quando terá acesso
- Link do Telegram vem por email (pode perder)

**Jobs to be Done**:
- Quando me cadastro, eu preciso de confirmação visual imediata
- Quando sou aprovada, eu preciso receber o link de acesso de forma clara
- Quando tenho dúvidas, eu preciso contatar meu padrinho facilmente

---

## 🏗️ Arquitetura de Alto Nível

### Stack Tecnológico

```yaml
Frontend:
  Framework: Next.js 14+ (App Router)
  UI: Shadcn/UI + Tailwind CSS
  State: React Query + Zustand
  Charts: Recharts
  Forms: React Hook Form + Zod

Backend:
  Runtime: Node.js (Next.js API Routes)
  ORM: Prisma
  Validation: Zod
  Auth: Supabase Auth + NextAuth.js

Database:
  Primary: Supabase PostgreSQL
  ORM: Prisma Client
  Storage: Supabase Storage
  Cache: React Query (client-side)

Infraestrutura:
  Hosting: Vercel
  Domain: inema.vip/app
  CI/CD: GitHub Actions
  Monitoring: Vercel Analytics + Sentry

Integrações:
  Email: Gmail API (via n8n) + Resend
  Automação: n8n (workflows existentes)
  Mensageria: Telegram Bot API
```

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  Dashboard  │  │   Gestão     │  │  Portal do     │ │
│  │   Admin     │  │  Afiliados   │  │   Padrinho     │ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ API Routes
┌──────────────────────▼──────────────────────────────────┐
│              BACKEND (Next.js API + Prisma)              │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │   Auth   │  │   CRUD   │  │  Logic   │  │Webhooks ││
│  │ Middleware│  │   APIs   │  │ Business │  │  n8n   ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
└──────────────────────┬──────────────────────────────────┘
                       │ Prisma ORM
┌──────────────────────▼──────────────────────────────────┐
│           DATABASE (Supabase PostgreSQL)                 │
├─────────────────────────────────────────────────────────┤
│  pessoas_fisicas │ afiliados │ padrinhos │ pagamentos   │
│  codigos_convite │ emails    │ email_attachments        │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              INTEGRAÇÕES EXTERNAS                        │
├─────────────────────────────────────────────────────────┤
│  n8n Workflows │ Gmail API │ Telegram Bot │ Supabase    │
│  (existentes)  │           │              │  Storage    │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Modelo de Dados

### Entidades Principais

```prisma
// Schema Prisma (simplificado)

model PessoaFisica {
  id                    String    @id @default(uuid())
  nome                  String
  email                 String    @unique
  cpf                   String?
  data_nascimento       DateTime?
  sexo                  String?
  cidade                String?
  uf                    String?
  nicho_atuacao         String?
  convites_enviados     Int       @default(0)
  convites_usados       Int       @default(0)
  convites_disponiveis  Int       @default(5)
  created_at            DateTime  @default(now())

  // Relações
  afiliadosComoPadrinho Afiliado[] @relation("Padrinho")
  afiliadoComoAfiliado  Afiliado?  @relation("Afiliado")
}

model Afiliado {
  id            String    @id @default(uuid())
  afiliado_id   String    @unique
  padrinho_id   String
  status        String    // "pendente", "aprovado", "rejeitado"
  data_cadastro DateTime  @default(now())
  data_email    DateTime?
  email_enviado Boolean   @default(false)

  // Relações
  afiliado      PessoaFisica @relation("Afiliado", fields: [afiliado_id], references: [id])
  padrinho      PessoaFisica @relation("Padrinho", fields: [padrinho_id], references: [id])
}

model CodigoConvite {
  id             String    @id @default(uuid())
  codigo         String    @unique
  email          String?
  data           DateTime?
  expiration     DateTime?
  atualizado_em  DateTime?
}

model Pagamento {
  id              String    @id @default(uuid())
  email           String
  valor           Decimal
  data_pagamento  DateTime
  tipo_pagamento  String    // "mensal", "anual"
  status          String    // "pendente", "confirmado"
}
```

### Regras de Negócio

1. **Padrinho**:
   - Inicia com 5 convites disponíveis
   - Ao convidar, `convites_usados++` e `convites_disponiveis--`
   - Admin pode ajustar `convites_disponiveis` manualmente
   - Padrinho deve estar ativo para seus convites funcionarem

2. **Afiliado**:
   - Status inicial: "pendente"
   - Após aprovação: status = "aprovado", recebe código de convite
   - Se padrinho não existir ou sem convites: status = "rejeitado"
   - Afiliado não pode ser padrinho de si mesmo

3. **Código de Convite**:
   - Gerados em lote e atribuídos sob demanda
   - Expiration configurável (default: 90 dias)
   - Código usado não pode ser reutilizado
   - Um email pode usar apenas um código

4. **Pagamento**:
   - Valores < R$50 = "mensal"
   - Valores >= R$100 = "anual"
   - Status inicial: "pendente" (até confirmação manual ou auto)
   - Pagamentos vincularão a pessoa_fisica via email

---

## 🎨 Requisitos Funcionais

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
- [ ] Como Admin, vejo cards com: total afiliados, total padrinhos, receita total, convites disponíveis
- [ ] Como Admin, vejo gráfico de novos afiliados (últimos 30 dias)
- [ ] Como Admin, vejo gráfico de receita por semana (12 semanas)
- [ ] Como Admin, vejo tabela com últimos 10 afiliados cadastrados
- [ ] Como Admin, vejo tabela com top 10 padrinhos ativos
- [ ] Como Admin, vejo alertas (pagamentos pendentes, afiliados sem padrinho, códigos expirados)
- [ ] Como Admin, posso clicar em métricas para filtrar dados relacionados
- [ ] Como sistema, atualizo dados a cada 30 segundos

**Métricas**:
| Métrica | Cálculo | Fonte |
|---------|---------|-------|
| Total Afiliados | COUNT(afiliados) | afiliados |
| Total Padrinhos | COUNT(DISTINCT padrinho_id) | afiliados |
| Receita Total | SUM(pagamentos.valor) | pagamentos |
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
- [ ] Como Admin, posso filtrar por status: pendente, aprovado, rejeitado
- [ ] Como Admin, posso ordenar por: data cadastro, nome, status
- [ ] Como Admin, posso aprovar afiliado pendente (bulk ou individual)
- [ ] Como Admin, posso rejeitar afiliado com motivo
- [ ] Como Admin, posso editar dados de um afiliado
- [ ] Como Admin, posso alterar padrinho de um afiliado
- [ ] Como Admin, vejo dados do padrinho vinculado
- [ ] Como Admin, posso exportar lista de afiliados (CSV)

**Fluxo de Aprovação**:
1. Afiliado se cadastra via link de convite → status "pendente"
2. Admin revisa cadastro
3. Admin aprova:
   - Status → "aprovado"
   - Sistema pega código disponível
   - Sistema atribui código ao email do afiliado
   - Sistema envia email com link Telegram
   - Sistema incrementa `convites_usados` do padrinho
   - Sistema notifica padrinho
4. Admin rejeita:
   - Status → "rejeitado"
   - Sistema registra motivo
   - Sistema notifica afiliado

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

### RF-006: Gestão de Pagamentos

**Prioridade**: 🔴 CRÍTICA
**MVP**: ⏭️ Fase 3

**Descrição**: Registro, confirmação e reconciliação de pagamentos.

**Critérios de Aceitação**:
- [ ] Como Admin, vejo lista de pagamentos com filtros (status, período, tipo)
- [ ] Como Admin, posso registrar pagamento manualmente
- [ ] Como Admin, posso fazer upload de comprovante (PDF/imagem)
- [ ] Como Admin, posso confirmar/rejeitar pagamento pendente
- [ ] Como Admin, vejo histórico de pagamentos por email
- [ ] Como Admin, posso vincular pagamento a pessoa_fisica
- [ ] Como Admin, vejo alertas de pagamentos duplicados
- [ ] Como sistema, integro com webhook do n8n para pagamentos processados via email

**Campos**:
- Email (obrigatório)
- Valor (obrigatório)
- Data do pagamento (obrigatório)
- Tipo: mensal/anual (calculado automaticamente)
- Status: pendente/confirmado/rejeitado
- Comprovante (anexo)
- Observações

---

### RF-007: Relatórios e Analytics

**Prioridade**: 🟡 ALTA
**MVP**: ⏭️ Fase 4

**Descrição**: Relatórios avançados e exportação de dados.

**Critérios de Aceitação**:
- [ ] Como Admin, vejo relatório de conversão do funil (cadastros → aprovações → ativos)
- [ ] Como Admin, vejo relatório de performance de padrinhos (ranking)
- [ ] Como Admin, vejo relatório financeiro (receita, LTV, churn)
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

3. **Financeiro**
   - Receita total/mensal/anual
   - MRR (Monthly Recurring Revenue)
   - Churn rate
   - LTV (Lifetime Value)

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

### RF-009: Sistema de Notificações

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
| Pagamento confirmado | Admin | ✅ | ❌ |

---

### RF-010: Cadastro Público de Afiliado

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

---

## 🚀 Roadmap e Fases de Implementação

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

---

## 🔒 Requisitos Não-Funcionais

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

---

## 🔗 Integrações

### Integração 1: n8n Workflows (Existentes)

**Direção**: Bidirecional
**Propósito**: Manter automações de email e envios bulk

**Endpoints nm82 → n8n**:
```
POST https://n8n.inema.vip/webhook/processar-pagamento
POST https://n8n.inema.vip/webhook/enviar-convite-bulk
```

**Endpoints n8n → nm82**:
```
POST https://inema.vip/api/webhooks/email-processado
POST https://inema.vip/api/webhooks/pagamento-confirmado
```

**Workflows Preservados**:
1. nm81-1: Processar emails Gmail com anexos
2. nm81-4: Fluxo de aprovação de convites (será substituído gradualmente)
3. nm81-3: Envio de convites em massa

---

### Integração 2: Supabase

**Direção**: nm82 → Supabase
**Propósito**: Persistência de dados

**Método**: Prisma ORM
**Auth**: Service Role Key (backend), Anon Key + RLS (frontend)

**Migração**:
- Manter tabelas existentes
- Adicionar RLS policies
- Criar tabelas auxiliares (user_roles, notifications, audit_logs)

---

### Integração 3: Telegram Bot

**Direção**: nm82 → Telegram
**Propósito**: Geração de links de acesso

**Método**: URL com código
**Formato**: `https://t.me/INEMAMembroBot?start={codigo}`

**Não há API direta** - apenas geração de URLs.

---

## 📋 Dependências e Riscos

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

---

## 📐 Critérios de Aceitação do Produto

### Critérios de Lançamento (Go-Live)

**MVP Fase 1+2 pode ir para produção quando**:
- [ ] Todos os requisitos do MVP (RF-001 a RF-005, RF-010) estão implementados
- [ ] Cobertura de testes >70%
- [ ] Performance: todas as páginas < 2s (Lighthouse >90)
- [ ] Segurança: RLS testado, sem credenciais expostas
- [ ] Homologação: 5 admins testaram por 1 semana sem bugs críticos
- [ ] Docs: README completo, Swagger de APIs publicado
- [ ] Monitoramento: Sentry configurado, alertas ativos

### Critérios de Sucesso (3 meses pós-lançamento)

- [ ] 90% das operações manuais eliminadas
- [ ] Tempo médio de aprovação de afiliado < 15min
- [ ] Zero incidentes de segurança
- [ ] NPS de admins >40
- [ ] Uptime >99%
- [ ] <5 bugs críticos reportados/mês

---

## 📎 Anexos

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

---

**Fim do PRD v1.0**

---

## 🚦 Próximos Passos

1. **Revisão do PRD** com stakeholders (Nei, Tiza, equipe)
2. **Transformar em Jordan (Architect)** para criar arquitetura detalhada
3. **Criar épicos** para cada fase
4. **Criar user stories** para MVP (Fase 1+2)
5. **Setup do projeto** (repositório, estrutura inicial)
