-- ==========================================
-- FIX: Desabilitar RLS para email_templates e configuracoes_email
-- ==========================================
-- PROBLEMA: Prisma conecta via PostgreSQL direto, não via Supabase Auth
--           O RLS verifica auth.uid() que retorna NULL em conexões diretas
-- SOLUÇÃO: Desabilitar RLS nessas tabelas de configuração do sistema
--
-- Execute este script no Supabase SQL Editor

-- ==========================================
-- 1. EMAIL_TEMPLATES - Desabilitar RLS
-- ==========================================

-- Remover todas as políticas antigas
DROP POLICY IF EXISTS "Admin pode gerenciar templates" ON email_templates;
DROP POLICY IF EXISTS "Sistema pode ler templates ativos" ON email_templates;

-- Desabilitar RLS (tabelas de configuração do sistema não precisam de RLS)
ALTER TABLE email_templates DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. CONFIGURACOES_EMAIL - Desabilitar RLS
-- ==========================================

-- Remover todas as políticas antigas
DROP POLICY IF EXISTS "Admin pode gerenciar configuracoes" ON configuracoes_email;
DROP POLICY IF EXISTS "Sistema pode ler configuracoes ativas" ON configuracoes_email;

-- Desabilitar RLS
ALTER TABLE configuracoes_email DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. LOG_EMAILS - Desabilitar RLS (se existir)
-- ==========================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Admin pode gerenciar logs" ON log_emails CASCADE;
DROP POLICY IF EXISTS "Sistema pode inserir logs" ON log_emails CASCADE;

-- Desabilitar RLS
ALTER TABLE log_emails DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- DONE! ✅
-- ==========================================
-- Agora o Prisma poderá acessar essas tabelas de configuração
-- RLS continua ativo em outras tabelas sensíveis (usuarios, afiliados, etc.)
