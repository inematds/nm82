-- ====================================
-- CRIAR ESTRUTURA COMPLETA DO BANCO
-- Gerado a partir do schema.prisma
-- Data: 2025-11-02
-- ====================================

-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/xetowlvhhnxewvglxklo/sql
-- 2. Copie e cole TODO este SQL
-- 3. Clique em "RUN" para executar

-- ====================================
-- ENUMS
-- ====================================

CREATE TYPE "Role" AS ENUM ('ADMIN', 'PADRINHO', 'AFILIADO');
CREATE TYPE "TipoNotificacao" AS ENUM ('AFILIADO_APROVADO', 'AFILIADO_CADASTRADO', 'CONVITES_ESGOTADOS', 'PAGAMENTO_CONFIRMADO', 'CODIGO_EXPIRANDO');
CREATE TYPE "StatusEmail" AS ENUM ('PENDENTE', 'ENVIADO', 'FALHA');

-- ====================================
-- TABELAS PRINCIPAIS
-- ====================================

-- UserRole
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_roles_userId_role_key" UNIQUE ("userId", "role")
);

CREATE INDEX "user_roles_userId_role_idx" ON "user_roles"("userId", "role");

-- PessoaFisica
CREATE TABLE "pessoas_fisicas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "cpf" TEXT,
    "data_nascimento" TIMESTAMP(3),
    "sexo" TEXT,
    "cidade" TEXT,
    "uf" VARCHAR(2),
    "nicho_atuacao" TEXT,
    "escolaridade" TEXT,
    "data_ultimo_pagamento" DATE,
    "valor_ultimo_pagamento" DECIMAL(10,2),
    "tipo_assinatura" TEXT,
    "data_vencimento" DATE,
    "data_primeiro_contato" TIMESTAMP(3),
    "data_cadastro" TIMESTAMP(3),
    "data_ultimo_envio" TIMESTAMP(3),
    "convites_dtatual" TIMESTAMP(3),
    "convites_enviados" INTEGER NOT NULL DEFAULT 0,
    "convites_usados" INTEGER NOT NULL DEFAULT 0,
    "convites_disponiveis" INTEGER NOT NULL DEFAULT 5,
    "cartao" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3)
);

CREATE INDEX "pessoas_fisicas_email_idx" ON "pessoas_fisicas"("email");
CREATE INDEX "pessoas_fisicas_ativo_idx" ON "pessoas_fisicas"("ativo");

-- Afiliado
CREATE TABLE "afiliados" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "afiliado_id" TEXT,
    "padrinho_id" TEXT NOT NULL,
    "data_cadastro" TIMESTAMP(3) NOT NULL,
    "email_enviado" BOOLEAN NOT NULL DEFAULT false,
    "data_email" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "nome" TEXT,
    "email" TEXT,
    "cpf" TEXT,
    "data_nascimento" DATE,
    "sexo" TEXT,
    "cidade" TEXT,
    "uf" VARCHAR(2),
    "nicho_atuacao" TEXT,
    "telefone" TEXT,
    CONSTRAINT "afiliados_padrinho_id_fkey" FOREIGN KEY ("padrinho_id") REFERENCES "pessoas_fisicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "afiliados_padrinho_id_idx" ON "afiliados"("padrinho_id");
CREATE INDEX "afiliados_status_idx" ON "afiliados"("status");
CREATE INDEX "afiliados_data_cadastro_idx" ON "afiliados"("data_cadastro");
CREATE INDEX "afiliados_email_idx" ON "afiliados"("email");

-- CodigoConvite
CREATE TABLE "codigos_convite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL UNIQUE,
    "email" TEXT,
    "data" DATE,
    "atualizado_em" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "codigos_convite_email_idx" ON "codigos_convite"("email");
CREATE INDEX "codigos_convite_data_idx" ON "codigos_convite"("data");

-- Pagamento
CREATE TABLE "pagamentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pessoa_id" TEXT NOT NULL,
    "data_pagamento" DATE NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "tipo_assinatura" TEXT NOT NULL,
    "tipo_pagamento" TEXT NOT NULL,
    "data_vencimento" DATE,
    "arquivo_comprovante" TEXT,
    "origem_anexo_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL,
    "Nome" TEXT,
    "CPF" TEXT,
    "email" TEXT,
    CONSTRAINT "pagamentos_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "pessoas_fisicas"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "pagamentos_pessoa_id_idx" ON "pagamentos"("pessoa_id");
CREATE INDEX "pagamentos_email_idx" ON "pagamentos"("email");
CREATE INDEX "pagamentos_data_pagamento_idx" ON "pagamentos"("data_pagamento");

-- Cartao (integração externa - Stripe)
CREATE TABLE "cartoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "Email" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Created (UTC)" TIMESTAMP(3) NOT NULL,
    "Status" TEXT NOT NULL,
    "Total Spend" DECIMAL(10,2) NOT NULL,
    "Payment Count" INTEGER NOT NULL
);

CREATE INDEX "cartoes_Email_idx" ON "cartoes"("Email");
CREATE INDEX "cartoes_Status_idx" ON "cartoes"("Status");

-- ====================================
-- EMAIL PROCESSING (n8n)
-- ====================================

CREATE TABLE "emails" (
    "message_id" TEXT NOT NULL PRIMARY KEY,
    "thread_id" TEXT,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body_text" TEXT,
    "body_html" TEXT,
    "date_received" TIMESTAMP(3) NOT NULL,
    "labels" TEXT[],
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "emails_from_idx" ON "emails"("from");
CREATE INDEX "emails_date_received_idx" ON "emails"("date_received");

CREATE TABLE "email_attachments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storage_path" TEXT NOT NULL,
    "storage_url" TEXT NOT NULL,
    "valor" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "email_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "emails"("message_id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "email_attachments_message_id_idx" ON "email_attachments"("message_id");

-- ====================================
-- NOTIFICATIONS & AUDIT
-- ====================================

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "tipo" "TipoNotificacao" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "notifications_user_id_lida_idx" ON "notifications"("user_id", "lida");
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- ====================================
-- EMAIL AUTOMATION SYSTEM
-- ====================================

CREATE TABLE "email_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "codigo" VARCHAR(100) NOT NULL UNIQUE,
    "assunto" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "variaveis" JSONB NOT NULL DEFAULT '[]',
    "remetente_nome" TEXT,
    "remetente_email" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "email_templates_codigo_idx" ON "email_templates"("codigo");
CREATE INDEX "email_templates_ativo_idx" ON "email_templates"("ativo");

CREATE TABLE "configuracoes_email" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chave" VARCHAR(100) NOT NULL UNIQUE,
    "valor" TEXT NOT NULL,
    "tipo" VARCHAR(50) NOT NULL DEFAULT 'string',
    "descricao" TEXT,
    "grupo" VARCHAR(100) NOT NULL DEFAULT 'geral',
    "criptografado" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "configuracoes_email_chave_idx" ON "configuracoes_email"("chave");
CREATE INDEX "configuracoes_email_grupo_idx" ON "configuracoes_email"("grupo");

CREATE TABLE "log_emails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "template_codigo" VARCHAR(100),
    "destinatario_email" TEXT NOT NULL,
    "destinatario_nome" TEXT,
    "assunto" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "variaveis" JSONB,
    "status" "StatusEmail" NOT NULL DEFAULT 'PENDENTE',
    "erro" TEXT,
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "afiliado_id" TEXT,
    "padrinho_id" TEXT,
    "enviado_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "log_emails_status_idx" ON "log_emails"("status");
CREATE INDEX "log_emails_template_codigo_idx" ON "log_emails"("template_codigo");
CREATE INDEX "log_emails_destinatario_email_idx" ON "log_emails"("destinatario_email");
CREATE INDEX "log_emails_afiliado_id_idx" ON "log_emails"("afiliado_id");
CREATE INDEX "log_emails_criado_em_idx" ON "log_emails"("criado_em");

-- ====================================
-- CONCLUÍDO!
-- ====================================
-- ✅ Todas as tabelas criadas
-- ✅ Todos os índices criados
-- ✅ Todas as relações (FKs) criadas
-- ✅ Todos os enums criados
