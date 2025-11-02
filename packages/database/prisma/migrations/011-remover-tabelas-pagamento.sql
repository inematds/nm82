-- Migration: 011-remover-tabelas-pagamento.sql
-- Description: Remove payment-related tables and enums from database
-- Date: 2025-11-02
-- Author: System Cleanup

-- Drop tables (order matters due to foreign keys)
DROP TABLE IF EXISTS email_attachments CASCADE;
DROP TABLE IF EXISTS emails CASCADE;
DROP TABLE IF EXISTS pagamentos CASCADE;

-- Drop enums
DROP TYPE IF EXISTS "StatusPagamento" CASCADE;
DROP TYPE IF EXISTS "TipoPagamento" CASCADE;

-- Update TipoNotificacao enum to remove PAGAMENTO_CONFIRMADO
-- First create new enum without PAGAMENTO_CONFIRMADO
CREATE TYPE "TipoNotificacao_new" AS ENUM (
  'AFILIADO_APROVADO',
  'AFILIADO_CADASTRADO',
  'CONVITES_ESGOTADOS',
  'CODIGO_EXPIRANDO'
);

-- Update notifications table to use new enum
ALTER TABLE notifications
  ALTER COLUMN tipo TYPE "TipoNotificacao_new"
  USING tipo::text::"TipoNotificacao_new";

-- Drop old enum and rename new one
DROP TYPE "TipoNotificacao";
ALTER TYPE "TipoNotificacao_new" RENAME TO "TipoNotificacao";

-- Delete any existing PAGAMENTO_CONFIRMADO notifications
DELETE FROM notifications WHERE tipo::text = 'PAGAMENTO_CONFIRMADO';
