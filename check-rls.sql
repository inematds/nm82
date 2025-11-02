-- ====================================
-- VERIFICAR E DESABILITAR RLS
-- ====================================

-- Verificar se RLS está ativo
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('pessoas_fisicas', 'afiliados', 'codigos_convite')
ORDER BY tablename;

-- Se RLS estiver ativo (rowsecurity = true), desabilitar:

-- Desabilitar RLS em pessoas_fisicas
ALTER TABLE pessoas_fisicas DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS em afiliados
ALTER TABLE afiliados DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS em codigos_convite
ALTER TABLE codigos_convite DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS em todas as outras tabelas também
ALTER TABLE pagamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE cartoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE emails DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_email DISABLE ROW LEVEL SECURITY;
ALTER TABLE log_emails DISABLE ROW LEVEL SECURITY;

-- Verificar novamente
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
