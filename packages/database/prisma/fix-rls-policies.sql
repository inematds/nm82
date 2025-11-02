-- Fix RLS Policies - Remove Infinite Recursion
-- Execute este script no Supabase SQL Editor para corrigir o erro de recursão

-- ==========================================
-- 1. DROP ALL EXISTING POLICIES
-- ==========================================

-- Drop policies from user_roles
DROP POLICY IF EXISTS "Admins can see all user_roles" ON user_roles;
DROP POLICY IF EXISTS "Users can see own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user_roles" ON user_roles;

-- Drop helper functions
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_padrinho();

-- ==========================================
-- 2. CREATE SIMPLER RLS POLICIES
-- ==========================================

-- USER_ROLES policies (NO recursion - use auth.uid() directly)
CREATE POLICY "user_roles_select_own"
ON user_roles
FOR SELECT
TO authenticated
USING (
  "userId" = auth.uid()::text
);

-- Allow service role (admin operations via backend)
CREATE POLICY "user_roles_all_service"
ON user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ==========================================
-- 3. SIMPLE CHECK FOR OTHER TABLES
-- ==========================================
-- For other tables, we'll use a simpler approach: check if userId exists in user_roles

-- PESSOAS_FISICAS policies - simplified
DROP POLICY IF EXISTS "Admins can see all pessoas_fisicas" ON pessoas_fisicas;
DROP POLICY IF EXISTS "Padrinhos can see own record and afiliados" ON pessoas_fisicas;
DROP POLICY IF EXISTS "Afiliados can see own record" ON pessoas_fisicas;
DROP POLICY IF EXISTS "Admins can update all pessoas_fisicas" ON pessoas_fisicas;
DROP POLICY IF EXISTS "Padrinhos can update own record" ON pessoas_fisicas;
DROP POLICY IF EXISTS "Admins can insert pessoas_fisicas" ON pessoas_fisicas;

-- Allow all authenticated users to read their own data
CREATE POLICY "pessoas_fisicas_select_own"
ON pessoas_fisicas
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Service role has full access
CREATE POLICY "pessoas_fisicas_all_service"
ON pessoas_fisicas
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- AFILIADOS policies - simplified
DROP POLICY IF EXISTS "Admins can see all afiliados" ON afiliados;
DROP POLICY IF EXISTS "Padrinhos can see own afiliados" ON afiliados;
DROP POLICY IF EXISTS "Afiliados can see own afiliado record" ON afiliados;
DROP POLICY IF EXISTS "Admins can update all afiliados" ON afiliados;
DROP POLICY IF EXISTS "Admins can insert afiliados" ON afiliados;

-- Service role has full access
CREATE POLICY "afiliados_all_service"
ON afiliados
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- CODIGOS_CONVITE policies - simplified
DROP POLICY IF EXISTS "Admins can see all codigos_convite" ON codigos_convite;
DROP POLICY IF EXISTS "Admins can manage codigos_convite" ON codigos_convite;

CREATE POLICY "codigos_all_service"
ON codigos_convite
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- PAGAMENTOS policies - simplified
DROP POLICY IF EXISTS "Admins can see all pagamentos" ON pagamentos;
DROP POLICY IF EXISTS "Padrinhos can see own pagamentos" ON pagamentos;
DROP POLICY IF EXISTS "Admins can manage pagamentos" ON pagamentos;

CREATE POLICY "pagamentos_all_service"
ON pagamentos
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- EMAILS policies - simplified
DROP POLICY IF EXISTS "Admins can see all emails" ON emails;
DROP POLICY IF EXISTS "Service role can insert emails" ON emails;

CREATE POLICY "emails_all_service"
ON emails
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- EMAIL_ATTACHMENTS policies - simplified
DROP POLICY IF EXISTS "Admins can see all email_attachments" ON email_attachments;
DROP POLICY IF EXISTS "Service role can insert email_attachments" ON email_attachments;

CREATE POLICY "email_attachments_all_service"
ON email_attachments
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- NOTIFICATIONS policies - keep user-specific
DROP POLICY IF EXISTS "Users can see own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can see all notifications" ON notifications;

CREATE POLICY "notifications_select_own"
ON notifications
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()::text
);

CREATE POLICY "notifications_update_own"
ON notifications
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()::text
)
WITH CHECK (
  user_id = auth.uid()::text
);

CREATE POLICY "notifications_all_service"
ON notifications
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- AUDIT_LOGS policies - simplified
DROP POLICY IF EXISTS "Admins can see all audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "Service role can insert audit_logs" ON audit_logs;

CREATE POLICY "audit_logs_all_service"
ON audit_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ==========================================
-- DONE! RLS Policies Fixed
-- ==========================================
-- Now all backend API calls will use SUPABASE_SERVICE_ROLE_KEY
-- which bypasses RLS and has full access
-- Individual users can only see their own data
