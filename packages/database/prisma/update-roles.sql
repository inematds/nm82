-- ==========================================
-- ATUALIZAR ENUM DE ROLES
-- ==========================================
-- Execute no: Supabase Dashboard > SQL Editor > New query > Cole e Run

-- 1. Adicionar novos valores ao enum Role
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'EDITOR';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'VIEWER';

-- 2. Verificar valores do enum
-- SELECT enum_range(NULL::Role);

-- Resultado esperado: {ADMIN,PADRINHO,AFILIADO,EDITOR,VIEWER}
