-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Apply estas policies no Supabase SQL Editor
-- Dashboard > SQL Editor > New query > Cole este arquivo > Run

-- ==========================================
-- 1. ENABLE RLS ON ALL TABLES
-- ==========================================

ALTER TABLE pessoas_fisicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE afiliados ENABLE ROW LEVEL SECURITY;
ALTER TABLE codigos_convite ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. HELPER FUNCTION: Check if user is Admin
-- ==========================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. HELPER FUNCTION: Check if user is Padrinho
-- ==========================================

CREATE OR REPLACE FUNCTION is_padrinho()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role = 'PADRINHO'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. PESSOAS_FISICAS POLICIES
-- ==========================================

-- Policy: Admins can see all
CREATE POLICY "Admins can see all pessoas_fisicas"
ON pessoas_fisicas
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role = 'ADMIN'
  )
);

-- Policy: Padrinhos can see themselves and their afiliados
CREATE POLICY "Padrinhos can see own record and afiliados"
ON pessoas_fisicas
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR
  id IN (
    SELECT afiliado_id FROM afiliados
    WHERE padrinho_id IN (
      SELECT id FROM pessoas_fisicas
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
);

-- Policy: Afiliados can see themselves
CREATE POLICY "Afiliados can see own record"
ON pessoas_fisicas
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Policy: Admins can update all
CREATE POLICY "Admins can update all pessoas_fisicas"
ON pessoas_fisicas
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role = 'ADMIN'
  )
);

-- Policy: Padrinhos can update own record
CREATE POLICY "Padrinhos can update own record"
ON pessoas_fisicas
FOR UPDATE
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role = 'PADRINHO'
  )
);

-- Policy: Admins can insert
CREATE POLICY "Admins can insert pessoas_fisicas"
ON pessoas_fisicas
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role = 'ADMIN'
  )
);

-- ==========================================
-- 5. AFILIADOS POLICIES
-- ==========================================

-- Policy: Admins can see all
CREATE POLICY "Admins can see all afiliados"
ON afiliados
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role = 'ADMIN'
  )
);

-- Policy: Padrinhos can see their own afiliados
CREATE POLICY "Padrinhos can see own afiliados"
ON afiliados
FOR SELECT
TO authenticated
USING (
  padrinho_id IN (
    SELECT id FROM pessoas_fisicas
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Policy: Afiliados can see own record
CREATE POLICY "Afiliados can see own afiliado record"
ON afiliados
FOR SELECT
TO authenticated
USING (
  afiliado_id IN (
    SELECT id FROM pessoas_fisicas
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Policy: Admins can update all
CREATE POLICY "Admins can update all afiliados"
ON afiliados
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role = 'ADMIN'
  )
);

-- Policy: Admins can insert
CREATE POLICY "Admins can insert afiliados"
ON afiliados
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role = 'ADMIN'
  )
);

-- ==========================================
-- 6. CODIGOS_CONVITE POLICIES
-- ==========================================

-- Policy: Admins can see all
CREATE POLICY "Admins can see all codigos_convite"
ON codigos_convite
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role = 'ADMIN'
  )
);

-- Policy: Admins can manage all
CREATE POLICY "Admins can manage codigos_convite"
ON codigos_convite
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role = 'ADMIN'
  )
);

-- ==========================================
-- 7. PAGAMENTOS POLICIES
-- ==========================================

-- Policy: Admins can see all
CREATE POLICY "Admins can see all pagamentos"
ON pagamentos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role = 'ADMIN'
  )
);

-- Policy: Padrinhos can see own pagamentos
CREATE POLICY "Padrinhos can see own pagamentos"
ON pagamentos
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Policy: Admins can manage all
CREATE POLICY "Admins can manage pagamentos"
ON pagamentos
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role = 'ADMIN'
  )
);

-- ==========================================
-- 8. EMAILS & ATTACHMENTS POLICIES (READ-ONLY)
-- ==========================================

-- Policy: Admins can see all emails
CREATE POLICY "Admins can see all emails"
ON emails
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role = 'ADMIN'
  )
);

-- Policy: Admins can see all email_attachments
CREATE POLICY "Admins can see all email_attachments"
ON email_attachments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role = 'ADMIN'
  )
);

-- ==========================================
-- 9. NOTIFICATIONS POLICIES
-- ==========================================

-- Policy: Users can see own notifications
CREATE POLICY "Users can see own notifications"
ON notifications
FOR SELECT
TO authenticated
USING (
  user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Policy: Users can update own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications
FOR UPDATE
TO authenticated
USING (
  user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Policy: System can insert notifications (via service role)
CREATE POLICY "Service role can insert notifications"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (true); -- Will use service role key

-- ==========================================
-- 10. AUDIT_LOGS POLICIES (READ-ONLY FOR ADMINS)
-- ==========================================

-- Policy: Admins can see all audit logs
CREATE POLICY "Admins can see all audit_logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role = 'ADMIN'
  )
);

-- Policy: System can insert audit logs (via service role)
CREATE POLICY "Service role can insert audit_logs"
ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true); -- Will use service role key

-- ==========================================
-- 11. USER_ROLES POLICIES
-- ==========================================

-- Policy: Admins can see all roles
CREATE POLICY "Admins can see all user_roles"
ON user_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role = 'ADMIN'
  )
);

-- Policy: Users can see own roles
CREATE POLICY "Users can see own roles"
ON user_roles
FOR SELECT
TO authenticated
USING (
  user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Policy: Admins can manage roles
CREATE POLICY "Admins can manage user_roles"
ON user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role = 'ADMIN'
  )
);

-- ==========================================
-- DONE! All RLS policies applied
-- ==========================================
-- Verify with: SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
