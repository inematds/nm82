-- ==========================================
-- CRIAR TODAS AS TABELAS NO SUPABASE
-- ==========================================
-- Execute no: Supabase Dashboard > SQL Editor > New query > Cole e Run

-- ==========================================
-- 1. ENUMS
-- ==========================================

CREATE TYPE "Role" AS ENUM ('ADMIN', 'PADRINHO', 'AFILIADO');
CREATE TYPE "AfiliadoStatus" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');
CREATE TYPE "TipoPagamento" AS ENUM ('MENSAL', 'ANUAL');
CREATE TYPE "StatusPagamento" AS ENUM ('PENDENTE', 'CONFIRMADO', 'REJEITADO');
CREATE TYPE "TipoNotificacao" AS ENUM ('AFILIADO_APROVADO', 'AFILIADO_CADASTRADO', 'CONVITES_ESGOTADOS', 'PAGAMENTO_CONFIRMADO', 'CODIGO_EXPIRANDO');

-- ==========================================
-- 2. USER ROLES
-- ==========================================

CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_roles_user_id_role_key" ON "user_roles"("user_id", "role");

-- ==========================================
-- 3. PESSOAS FISICAS
-- ==========================================

CREATE TABLE "pessoas_fisicas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT,
    "data_nascimento" TIMESTAMP(3),
    "sexo" TEXT,
    "cidade" TEXT,
    "uf" VARCHAR(2),
    "nicho_atuacao" TEXT,
    "convites_enviados" INTEGER NOT NULL DEFAULT 0,
    "convites_usados" INTEGER NOT NULL DEFAULT 0,
    "convites_disponiveis" INTEGER NOT NULL DEFAULT 5,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pessoas_fisicas_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pessoas_fisicas_email_key" ON "pessoas_fisicas"("email");
CREATE INDEX "pessoas_fisicas_email_idx" ON "pessoas_fisicas"("email");
CREATE INDEX "pessoas_fisicas_ativo_idx" ON "pessoas_fisicas"("ativo");

-- ==========================================
-- 4. CODIGOS DE CONVITE
-- ==========================================

CREATE TABLE "codigos_convite" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(8) NOT NULL,
    "email" TEXT,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "data_atribuicao" TIMESTAMP(3),
    "data_expiracao" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codigos_convite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "codigos_convite_codigo_key" ON "codigos_convite"("codigo");
CREATE INDEX "codigos_convite_usado_idx" ON "codigos_convite"("usado");
CREATE INDEX "codigos_convite_data_expiracao_idx" ON "codigos_convite"("data_expiracao");

-- ==========================================
-- 5. AFILIADOS
-- ==========================================

CREATE TABLE "afiliados" (
    "id" TEXT NOT NULL,
    "afiliado_id" TEXT NOT NULL,
    "padrinho_id" TEXT NOT NULL,
    "status" "AfiliadoStatus" NOT NULL DEFAULT 'PENDENTE',
    "motivo_rejeicao" TEXT,
    "data_cadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_aprovacao" TIMESTAMP(3),
    "email_enviado" BOOLEAN NOT NULL DEFAULT false,
    "codigo_convite_id" TEXT,

    CONSTRAINT "afiliados_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "afiliados_afiliado_id_key" ON "afiliados"("afiliado_id");
CREATE UNIQUE INDEX "afiliados_codigo_convite_id_key" ON "afiliados"("codigo_convite_id");
CREATE INDEX "afiliados_padrinho_id_idx" ON "afiliados"("padrinho_id");
CREATE INDEX "afiliados_status_idx" ON "afiliados"("status");
CREATE INDEX "afiliados_data_cadastro_idx" ON "afiliados"("data_cadastro");

ALTER TABLE "afiliados" ADD CONSTRAINT "afiliados_afiliado_id_fkey" FOREIGN KEY ("afiliado_id") REFERENCES "pessoas_fisicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "afiliados" ADD CONSTRAINT "afiliados_padrinho_id_fkey" FOREIGN KEY ("padrinho_id") REFERENCES "pessoas_fisicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "afiliados" ADD CONSTRAINT "afiliados_codigo_convite_id_fkey" FOREIGN KEY ("codigo_convite_id") REFERENCES "codigos_convite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ==========================================
-- 6. PAGAMENTOS
-- ==========================================

CREATE TABLE "pagamentos" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "data_pagamento" TIMESTAMP(3) NOT NULL,
    "tipo_pagamento" "TipoPagamento" NOT NULL,
    "status" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE',
    "comprovante" TEXT,
    "observacoes" TEXT,
    "confirmed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pagamentos_email_idx" ON "pagamentos"("email");
CREATE INDEX "pagamentos_status_idx" ON "pagamentos"("status");
CREATE INDEX "pagamentos_data_pagamento_idx" ON "pagamentos"("data_pagamento");

-- ==========================================
-- 7. EMAILS
-- ==========================================

CREATE TABLE "emails" (
    "message_id" TEXT NOT NULL,
    "thread_id" TEXT,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body_text" TEXT,
    "body_html" TEXT,
    "date_received" TIMESTAMP(3) NOT NULL,
    "labels" TEXT[],
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("message_id")
);

CREATE INDEX "emails_from_idx" ON "emails"("from");
CREATE INDEX "emails_date_received_idx" ON "emails"("date_received");

-- ==========================================
-- 8. EMAIL ATTACHMENTS
-- ==========================================

CREATE TABLE "email_attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storage_path" TEXT NOT NULL,
    "storage_url" TEXT NOT NULL,
    "valor" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_attachments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "email_attachments_message_id_idx" ON "email_attachments"("message_id");

ALTER TABLE "email_attachments" ADD CONSTRAINT "email_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "emails"("message_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ==========================================
-- 9. NOTIFICATIONS
-- ==========================================

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tipo" "TipoNotificacao" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_user_id_lida_idx" ON "notifications"("user_id", "lida");
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- ==========================================
-- 10. AUDIT LOGS
-- ==========================================

CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- ==========================================
-- DONE! All tables created
-- ==========================================
-- Verify with: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
