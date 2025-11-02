-- ========================================
-- SCRIPT SIMPLES: Tornar seu usuário ADMIN
-- ========================================
--
-- ⚠️ IMPORTANTE: Substitua 'seu@email.com' pelo seu email!
--
-- Execute no Supabase SQL Editor
-- ========================================

-- Primeiro, veja seu user_id atual
SELECT id, email FROM auth.users WHERE email = 'seu@email.com';

-- Depois, adicione role ADMIN
-- (Copie o ID do passo anterior e cole abaixo)

INSERT INTO user_roles (user_id, role, created_at)
VALUES (
  'COLE_SEU_USER_ID_AQUI',  -- ⚠️ Substitua pelo ID do passo anterior
  'ADMIN',
  NOW()
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Verificar se funcionou
SELECT * FROM user_roles WHERE user_id = 'COLE_SEU_USER_ID_AQUI';

-- ✅ Deve mostrar role = ADMIN
