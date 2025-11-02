-- ========================================
-- 🚨 FIX URGENTE - Execute AGORA no Supabase
-- ========================================
--
-- Este script corrige 2 problemas críticos:
-- 1. Recursão infinita nas RLS policies de user_roles
-- 2. Torna você ADMIN
--
-- ⚠️ IMPORTANTE: Substitua 'SEU_EMAIL@gmail.com' pelo seu email real!
--
-- ========================================

-- ========================================
-- PROBLEMA 1: Corrigir recursão infinita em user_roles
-- ========================================

ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Deletar policies antigas
DROP POLICY IF EXISTS "Authenticated users can read own roles" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Admin can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON user_roles;

-- Habilitar RLS novamente
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Usuários autenticados podem LER suas próprias roles
CREATE POLICY "Authenticated users can read own roles"
  ON user_roles
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy 2: Service role pode gerenciar tudo
CREATE POLICY "Service role can manage all roles"
  ON user_roles
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ========================================
-- PROBLEMA 2: Tornar você ADMIN
-- ========================================

-- Primeiro, deletar role antiga (se existir)
DELETE FROM user_roles
WHERE user_id IN (
  SELECT id::text
  FROM auth.users
  WHERE email = 'SEU_EMAIL@gmail.com'  -- ⚠️ ALTERE AQUI!
);

-- Depois, adicionar role ADMIN
INSERT INTO user_roles (id, user_id, role, created_at)
SELECT
  gen_random_uuid()::text,
  id::text,
  'ADMIN',
  NOW()
FROM auth.users
WHERE email = 'SEU_EMAIL@gmail.com';  -- ⚠️ ALTERE AQUI!

-- ========================================
-- Verificar se funcionou
-- ========================================

SELECT
  ur.user_id,
  ur.role,
  au.email
FROM user_roles ur
JOIN auth.users au ON au.id::text = ur.user_id
WHERE au.email = 'SEU_EMAIL@gmail.com';  -- ⚠️ ALTERE AQUI!

-- Deve retornar sua role como ADMIN!

-- ========================================
-- Mensagem final
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ RLS policies de user_roles corrigidas!';
  RAISE NOTICE '✅ Você agora é ADMIN!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
  RAISE NOTICE '1. Volte para o sistema e faça LOGOUT';
  RAISE NOTICE '2. Faça LOGIN novamente';
  RAISE NOTICE '3. Agora deve funcionar!';
  RAISE NOTICE '';
END $$;
