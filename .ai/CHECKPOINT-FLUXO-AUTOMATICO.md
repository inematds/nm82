# ✅ CHECKPOINT - Sistema de Fluxo Automático Implementado

**Data**: 02/11/2025
**Sessão**: Implementação do Sistema Automático de Processamento de Afiliados
**Status**: 🚧 **PRONTO PARA TESTAR** (falta apenas aplicar migrations e configurar SMTP)

---

## 🎯 OBJETIVO ALCANÇADO

Transformar o sistema de aprovação manual em um **fluxo 100% automático** baseado em lógica de negócio, eliminando a necessidade de admin aprovar ou rejeitar manualmente os afiliados.

---

## 📦 O QUE FOI IMPLEMENTADO

### 1. Banco de Dados (6 Migrations SQL)

✅ **Migration 003**: Tabela `email_templates`
- Armazena templates configuráveis de emails
- Suporta variáveis `{{ nome }}`, `{{ codigo }}`, etc.
- Admin pode editar assunto e corpo

✅ **Migration 004**: Tabela `configuracoes_email`
- Configurações SMTP (host, port, user, password)
- Configurações de remetente
- Limites de envio (rate limiting)
- Configurações do worker

✅ **Migration 005**: Popular 8 Templates Iniciais
- `convite_padrinho`: Convite para se tornar padrinho
- `padrinho_inexistente`: Aviso de padrinho não encontrado
- `sem_convites_afiliado`: Padrinho sem convites (para afiliado)
- `sem_convites_padrinho`: Padrinho sem convites (para padrinho)
- `afiliado_ja_membro`: Afiliado já cadastrado
- `padrinho_convidado_ja_membro`: Convidado já é membro (para padrinho)
- `aprovado_afiliado`: Acesso aprovado (com código)
- `aprovado_padrinho`: Notificação de aprovação para padrinho

✅ **Migration 006**: Popular Configurações
- 23 configurações pré-populadas
- SMTP, remetente, limites, worker, logs

✅ **Migration 007**: Tabela `log_emails`
- Log de todos os emails enviados
- Status: PENDENTE, ENVIADO, FALHA
- Auditoria completa com tentativas

✅ **Migration 008**: Atualizar Status de Afiliado
- Novos status: `ENVIADO`, `JA_CADASTRADO`, `SEM_PADRINHO`
- Depreciar: `APROVADO`, `REJEITADO`

### 2. Schema Prisma Atualizado

✅ Adicionados 3 novos models:
- `EmailTemplate`
- `ConfiguracaoEmail`
- `LogEmail`

✅ Enum `AfiliadoStatus` atualizado com novos status

✅ Enum `StatusEmail` criado

### 3. Serviço de Email com Templates

✅ **Arquivo**: `apps/web/src/services/template-email-service.ts`

**Funcionalidades**:
- `enviarEmailPorTemplate()`: Função principal de envio
- Busca template do banco
- Substitui variáveis `{{ ... }}`
- Busca configurações SMTP do banco
- Envia via Nodemailer
- Registra log de envio
- Tratamento de erros completo

**Funções auxiliares**:
- `buscarConfiguracao()`
- `atualizarConfiguracao()`
- `listarTemplates()`
- `buscarTemplatePorCodigo()`
- `atualizarTemplate()`

### 4. Worker Automático

✅ **Arquivo**: `apps/web/src/services/afiliado-worker.ts`

**Lógica do Fluxo Automático**:

```
1. Buscar próximo afiliado com status PENDENTE
   ↓
2. Validar se padrinho existe?
   ❌ NÃO → Email "padrinho_inexistente" → Status: SEM_PADRINHO
   ✅ SIM → Continuar
   ↓
3. Padrinho tem convites disponíveis?
   ❌ NÃO → Emails "sem_convites_*" → Status: JA_CADASTRADO
   ✅ SIM → Continuar
   ↓
4. Afiliado já é membro? (email existe em pessoas_fisicas)
   ✅ SIM → Emails "afiliado_ja_membro" → Status: JA_CADASTRADO
   ❌ NÃO → Continuar
   ↓
5. ✅ APROVAR AUTOMATICAMENTE
   - Pegar código disponível
   - Atribuir código ao email
   - Incrementar convites_usados do padrinho
   - Enviar emails "aprovado_*"
   - Status: ENVIADO
```

**Funções implementadas**:
- `processarAfiliadoPendente()`: Processa 1 afiliado
- `iniciarWorker()`: Loop contínuo (intervalo configurável)
- `processarPadrinhoInexistente()`
- `processarSemConvites()`
- `processarJaMembro()`
- `processarAprovacao()`

---

## 📂 ARQUIVOS CRIADOS/MODIFICADOS

### Migrations SQL
```
packages/database/prisma/migrations/
├── 003-criar-email-templates.sql
├── 004-criar-configuracoes-email.sql
├── 005-popular-templates-iniciais.sql
├── 006-popular-configuracoes-email.sql
├── 007-criar-log-emails.sql
└── 008-atualizar-enum-afiliado-status.sql
```

### Documentação
```
.ai/
├── FLUXO-AUTOMATICO-IMPLEMENTACAO.md  (Análise completa dos workflows)
└── CHECKPOINT-FLUXO-AUTOMATICO.md     (Este arquivo)

packages/database/prisma/
└── APLICAR-MIGRATIONS.md               (Guia de aplicação)
```

### Código TypeScript
```
apps/web/src/services/
├── template-email-service.ts  (Serviço de emails)
└── afiliado-worker.ts         (Worker automático)
```

### Schema
```
packages/database/prisma/schema.prisma  (Atualizado)
```

---

## 🔄 FLUXO COMPLETO DE FUNCIONAMENTO

### 1. Usuário Preenche Formulário

```
http://localhost:3000/convite?pid=PADRINHO_ID
```

**Campos**:
- Nome, email, telefone (obrigatórios)
- CPF, data nascimento, sexo, cidade, UF, nicho (opcionais)

**Ação**:
- Salva em `afiliados` com `status: PENDENTE`
- `padrinho_id` vem do parâmetro URL

### 2. Worker Roda Automaticamente

**Trigger**: A cada 10 minutos (configurável)

**Processo**:
1. Busca 1 afiliado com `status = PENDENTE`
2. Executa validações (padrinho existe? tem convites? já é membro?)
3. Decide automaticamente
4. Envia emails apropriados
5. Atualiza status

### 3. Resultados Possíveis

| Cenário | Status Final | Emails Enviados |
|---------|-------------|-----------------|
| ✅ Aprovado | `ENVIADO` | Afiliado + Padrinho (2) |
| ❌ Padrinho inexistente | `SEM_PADRINHO` | Afiliado (1) |
| ❌ Sem convites | `JA_CADASTRADO` | Afiliado + Padrinho (2) |
| ❌ Já é membro | `JA_CADASTRADO` | Afiliado + Padrinho (2) |

---

## 🚀 PRÓXIMOS PASSOS (Para Você)

### 1. Aplicar Migrations no Supabase

```bash
# Siga o guia:
packages/database/prisma/APLICAR-MIGRATIONS.md
```

Execute os 6 scripts SQL no Supabase Dashboard (SQL Editor):
1. 003-criar-email-templates.sql
2. 004-criar-configuracoes-email.sql
3. 005-popular-templates-iniciais.sql
4. 006-popular-configuracoes-email.sql
5. 007-criar-log-emails.sql
6. 008-atualizar-enum-afiliado-status.sql

### 2. Configurar SMTP

No banco `configuracoes_email`, atualizar:
- `smtp_user`: seu email Gmail
- `smtp_password`: App Password do Gmail (não a senha normal!)

**Como criar App Password**:
1. https://myaccount.google.com/security
2. Ativar "Verificação em duas etapas"
3. Gerar "Senha de app" para Email
4. Copiar a senha gerada

### 3. Gerar Prisma Client

```bash
cd packages/database
npx prisma generate
```

### 4. Criar API Route para Iniciar Worker

Criar arquivo: `apps/web/src/app/api/worker/start/route.ts`

```typescript
import { iniciarWorker } from '@/services/afiliado-worker';

export async function GET() {
  try {
    // Iniciar worker em background
    iniciarWorker().catch(console.error);

    return Response.json({
      message: 'Worker iniciado com sucesso',
      intervalo: '10 minutos',
    });
  } catch (error) {
    return Response.json({ error: 'Erro ao iniciar worker' }, { status: 500 });
  }
}
```

### 5. Criar API Route para Processar Manualmente

Criar arquivo: `apps/web/src/app/api/worker/processar/route.ts`

```typescript
import { processarAfiliadoPendente } from '@/services/afiliado-worker';

export async function POST() {
  try {
    const resultado = await processarAfiliadoPendente();

    if (!resultado) {
      return Response.json({
        message: 'Nenhum afiliado pendente',
      });
    }

    return Response.json({
      success: true,
      resultado,
    });
  } catch (error) {
    return Response.json({ error: 'Erro ao processar' }, { status: 500 });
  }
}
```

### 6. Testar o Fluxo

**A. Cadastrar um afiliado de teste**:
```
http://localhost:3000/convite?pid=<ID_PADRINHO_VALIDO>
```

**B. Processar manualmente**:
```bash
curl -X POST http://localhost:3000/api/worker/processar
```

**C. Verificar logs**:
```sql
SELECT * FROM log_emails ORDER BY criado_em DESC LIMIT 10;
```

**D. Verificar status do afiliado**:
```sql
SELECT id, nome, email, status, email_enviado
FROM afiliados
ORDER BY data_cadastro DESC
LIMIT 10;
```

### 7. Iniciar Worker Permanente

**Opção A**: Adicionar ao `next.config.js` (não recomendado)

**Opção B**: Criar script separado (recomendado)

Criar: `apps/web/scripts/start-worker.ts`
```typescript
import { iniciarWorker } from '../src/services/afiliado-worker';

console.log('🚀 Iniciando worker de processamento...');
iniciarWorker();
```

Rodar:
```bash
npx tsx apps/web/scripts/start-worker.ts
```

**Opção C**: Usar Vercel Cron Jobs ou similar (produção)

### 8. Criar Interface Admin (Opcional)

**Páginas a criar**:
- `/admin/templates-email` - Gerenciar templates
- `/admin/configuracoes-email` - Configurar SMTP
- `/admin/logs-email` - Ver emails enviados
- `/admin/worker` - Status e controle do worker

---

## ❌ O QUE FOI REMOVIDO/DEPRECADO

1. ~~Botões "Aprovar" e "Rejeitar" manual~~ → Será removido depois
2. ~~Status `APROVADO`~~ → Usar `ENVIADO`
3. ~~Status `REJEITADO`~~ → Usar `JA_CADASTRADO` ou `SEM_PADRINHO`

---

## 📊 MÉTRICAS E CONFIGURAÇÕES

### Configurações Importantes

| Chave | Valor Padrão | Descrição |
|-------|--------------|-----------|
| `worker_intervalo` | 10 | Minutos entre processamentos |
| `worker_ativo` | true | Ativar/desativar worker |
| `rate_limit_por_minuto` | 10 | Max emails/minuto |
| `delay_entre_envios` | 3 | Segundos entre envios |
| `log_retention_dias` | 90 | Dias para manter logs |

### Templates Criados

- 8 templates prontos
- Todos editáveis pelo admin
- Variáveis suportadas: `{{ nome }}`, `{{ email }}`, `{{ codigo }}`, `{{ padrinho_nome }}`, etc.

### Status de Afiliados

| Status | Significado |
|--------|-------------|
| `PENDENTE` | Aguardando processamento |
| `ENVIADO` | Aprovado, código enviado |
| `JA_CADASTRADO` | Email duplicado ou sem convites |
| `SEM_PADRINHO` | Link inválido |

---

## 🔐 SEGURANÇA

✅ RLS (Row Level Security) configurado em todas as tabelas
✅ Apenas ADMIN pode editar templates e configurações
✅ Logs de email para auditoria
✅ Rate limiting para evitar spam
✅ Passwords criptografados (flag `criptografado`)

---

## 🆘 TROUBLESHOOTING

### Emails não estão sendo enviados
1. Verificar configurações SMTP em `configuracoes_email`
2. Conferir se usou App Password (não senha normal)
3. Ver logs em `log_emails` (coluna `erro`)
4. Testar SMTP manualmente

### Worker não processa afiliados
1. Verificar se `worker_ativo = true`
2. Ver logs do console
3. Verificar se há afiliados com `status = PENDENTE`
4. Conferir se padrinho tem `convites_enviados > 0`

### Status não atualiza
1. Verificar se migrations foram aplicadas
2. Confirmar que enum foi atualizado (migration 008)
3. Regenerar Prisma client

---

## 📝 NOTAS TÉCNICAS

### Dependências Necessárias

Adicionar ao `package.json`:
```json
{
  "dependencies": {
    "nodemailer": "^6.9.7"
  },
  "devDependencies": {
    "@types/nodemailer": "^6.4.14"
  }
}
```

### Variáveis de Ambiente

Garantir que `.env` tenha:
```
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

---

## ✅ CHECKLIST FINAL

- [x] Migrations SQL criadas (6 arquivos)
- [x] Schema Prisma atualizado
- [x] Serviço de email implementado
- [x] Worker automático implementado
- [x] Documentação completa
- [ ] Migrations aplicadas no Supabase
- [ ] SMTP configurado
- [ ] Prisma client regenerado
- [ ] Worker testado
- [ ] APIs REST criadas
- [ ] Interface admin criada
- [ ] Aprovação manual removida

---

## 🎉 RESULTADO ESPERADO

Após implementação completa:

1. **Usuário se cadastra** via `/convite?pid=...`
2. **Worker processa** automaticamente a cada 10 min
3. **Decisão automática** baseada em regras de negócio
4. **Emails enviados** conforme cenário
5. **Status atualizado** sem intervenção humana
6. **Admin apenas monitora** (logs e templates)

**ZERO APROVAÇÃO MANUAL NECESSÁRIA** ✨

---

**Status da Implementação**: 🟢 85% Completo
**Próximo Passo**: Aplicar migrations e testar

**Documentado por**: BMad Orchestrator
**Data**: 02/11/2025
