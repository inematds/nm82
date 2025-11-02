# API Specification

## REST API Overview

**Base URL**: `https://inema.vip/api`
**Authentication**: JWT token in `Authorization: Bearer <token>` header
**Response Format**: JSON
**Error Format**: See Error Handling section

## API Endpoints

### Authentication

```yaml
POST /api/auth/signup
  Body: { email, password, nome }
  Returns: { user, session }
  Public: Yes

POST /api/auth/login
  Body: { email, password }
  Returns: { user, session, role }
  Public: Yes

POST /api/auth/logout
  Returns: { success: true }
  Auth: Required

GET /api/auth/me
  Returns: { user, role, pessoa }
  Auth: Required
```

### Padrinhos

```yaml
GET /api/padrinhos
  Query: { page, limit, search, ativo }
  Returns: { padrinhos: PessoaFisica[], total, page, totalPages }
  Auth: ADMIN

GET /api/padrinhos/:id
  Returns: { padrinho: PessoaFisica, afiliados: Afiliado[] }
  Auth: ADMIN | PADRINHO (own)

PATCH /api/padrinhos/:id
  Body: Partial<PessoaFisica>
  Returns: { padrinho: PessoaFisica }
  Auth: ADMIN

POST /api/padrinhos/:id/ajustar-convites
  Body: { convites: number }
  Returns: { padrinho: PessoaFisica }
  Auth: ADMIN
  Audit: Log change
```

### Afiliados

```yaml
GET /api/afiliados
  Query: { page, limit, search, status, padrinhoId }
  Returns: { afiliados: Afiliado[], total, page, totalPages }
  Auth: ADMIN | PADRINHO (own afiliados only)

GET /api/afiliados/:id
  Returns: { afiliado: Afiliado, padrinho: PessoaFisica }
  Auth: ADMIN | PADRINHO (own) | AFILIADO (own)

POST /api/afiliados/cadastro
  Body: { padrinhoId, nome, email, cpf?, ... }
  Returns: { afiliado: Afiliado }
  Public: Yes (via convite link)
  Validations: Padrinho exists, has convites, email unique

POST /api/afiliados/:id/aprovar
  Body: { codigoConviteId?: string } // optional - auto-assign if not provided
  Returns: { afiliado: Afiliado, codigoConvite: CodigoConvite }
  Auth: ADMIN
  Side Effects:
    - Assign codigo
    - Increment padrinho convites_usados
    - Send email notification (via n8n webhook)
    - Create notifications

POST /api/afiliados/:id/rejeitar
  Body: { motivo: string }
  Returns: { afiliado: Afiliado }
  Auth: ADMIN
  Side Effects: Send email notification

PATCH /api/afiliados/:id
  Body: Partial<Afiliado>
  Returns: { afiliado: Afiliado }
  Auth: ADMIN
```

### Códigos de Convite

```yaml
GET /api/codigos
  Query: { page, limit, usado, expirado }
  Returns: { codigos: CodigoConvite[], stats: { total, disponiveis, usados, expirados } }
  Auth: ADMIN

POST /api/codigos/gerar
  Body: { quantidade: number, diasExpiracao?: number }
  Returns: { codigos: CodigoConvite[] }
  Auth: ADMIN

DELETE /api/codigos/:id/liberar
  Returns: { codigo: CodigoConvite }
  Auth: ADMIN
  Side Effects: Reset email, usado = false
```

### Pagamentos

```yaml
GET /api/pagamentos
  Query: { page, limit, status, email, dataInicio, dataFim }
  Returns: { pagamentos: Pagamento[], total }
  Auth: ADMIN

POST /api/pagamentos
  Body: { email, valor, dataPagamento, comprovante?, observacoes? }
  Returns: { pagamento: Pagamento }
  Auth: ADMIN

POST /api/pagamentos/:id/confirmar
  Body: { observacoes?: string }
  Returns: { pagamento: Pagamento }
  Auth: ADMIN
  Audit: Log confirmation

POST /api/pagamentos/:id/rejeitar
  Body: { observacoes: string }
  Returns: { pagamento: Pagamento }
  Auth: ADMIN
  Audit: Log rejection
```

### Dashboard & Analytics

```yaml
GET /api/dashboard/metrics
  Returns: {
    totalAfiliados: number,
    totalPadrinhos: number,
    receitaTotal: number,
    convitesDisponiveis: number,
    afiliadosPendentes: number
  }
  Auth: ADMIN

GET /api/dashboard/afiliados-por-dia
  Query: { dias: number } // default 30
  Returns: { date: string, count: number }[]
  Auth: ADMIN

GET /api/dashboard/receita-por-semana
  Query: { semanas: number } // default 12
  Returns: { week: string, receita: number }[]
  Auth: ADMIN

GET /api/dashboard/ranking-padrinhos
  Query: { limit: number } // default 10
  Returns: { padrinho: PessoaFisica, convitesUsados: number, taxaConversao: number }[]
  Auth: ADMIN

GET /api/padrinhos/me/dashboard
  Returns: {
    convitesDisponiveis: number,
    convitesUsados: number,
    afiliados: Afiliado[],
    ranking: number
  }
  Auth: PADRINHO
```

### Notificações

```yaml
GET /api/notifications
  Query: { lida?: boolean, limit: number }
  Returns: { notifications: Notification[], unreadCount: number }
  Auth: Required

PATCH /api/notifications/:id/ler
  Returns: { notification: Notification }
  Auth: Required (own notification)

PATCH /api/notifications/ler-todas
  Returns: { count: number }
  Auth: Required
```

### Webhooks (n8n integration)

```yaml
POST /api/webhooks/email-processado
  Body: { messageId, from, subject, attachments }
  Returns: { success: true }
  Auth: Webhook secret (env var)
  Side Effects: Process payment info, create Pagamento record

POST /api/webhooks/pagamento-confirmado
  Body: { pagamentoId, email, valor }
  Returns: { success: true }
  Auth: Webhook secret
  Side Effects: Update Pagamento status
```

## Request/Response Examples

### POST /api/afiliados/cadastro

**Request:**
```json
{
  "padrinhoId": "uuid-padrinho",
  "nome": "João Silva",
  "email": "joao@example.com",
  "cpf": "123.456.789-00",
  "dataNascimento": "1990-01-01",
  "sexo": "Masculino",
  "cidade": "São Paulo",
  "uf": "SP",
  "nichoAtuacao": "Tecnologia"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "afiliado": {
      "id": "uuid-afiliado",
      "afiliadoId": "uuid-pessoa",
      "padrinhoId": "uuid-padrinho",
      "status": "PENDENTE",
      "dataCadastro": "2025-11-01T10:00:00Z"
    },
    "message": "Cadastro realizado! Aguarde aprovação."
  }
}
```

**Error (400):**
```json
{
  "error": {
    "code": "PADRINHO_SEM_CONVITES",
    "message": "O padrinho não possui convites disponíveis",
    "timestamp": "2025-11-01T10:00:00Z",
    "requestId": "req_abc123"
  }
}
```
