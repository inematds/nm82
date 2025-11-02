-- ========================================
-- CRIAR USUÁRIO ADMIN
-- ========================================
--
-- Execute este script no Supabase SQL Editor para dar role ADMIN
-- ao seu usuário atual.
--
-- IMPORTANTE: Substitua o email abaixo pelo SEU email!
-- ========================================

-- PASSO 1: Verificar se já tem role ADMIN
SELECT
  ur.id,
  ur."userId" as user_id,
  ur.role,
  au.email
FROM user_roles ur
JOIN auth.users au ON au.id::text = ur."userId"
WHERE au.email = 'SEU_EMAIL_AQUI@gmail.com';  -- ⚠️ ALTERE AQUI!

-- Se não retornar nada ou retornar role diferente de ADMIN, continue:

-- PASSO 2: Deletar role antiga (se existir)
DELETE FROM user_roles
WHERE "userId" IN (
  SELECT id::text
  FROM auth.users
  WHERE email = 'SEU_EMAIL_AQUI@gmail.com'  -- ⚠️ ALTERE AQUI!
);

-- PASSO 3: Adicionar role ADMIN
INSERT INTO user_roles ("userId", role, "createdAt")
SELECT
  id::text,
  'ADMIN'::\"Role\",
  NOW()
FROM auth.users
WHERE email = 'SEU_EMAIL_AQUI@gmail.com';  -- ⚠️ ALTERE AQUI!

-- PASSO 4: Verificar se funcionou
SELECT
  ur.id,
  ur."userId" as user_id,
  ur.role,
  au.email
FROM user_roles ur
JOIN auth.users au ON au.id::text = ur."userId"
WHERE au.email = 'SEU_EMAIL_AQUI@gmail.com';  -- ⚠️ ALTERE AQUI!

-- Deve retornar sua role como ADMIN!

DO $$
BEGIN
  RAISE NOTICE '✅ Role ADMIN atribuída com sucesso!';
  RAISE NOTICE '🔄 Faça logout e login novamente no sistema para atualizar sua sessão';
END $$;
