-- Migration 010: Corrigir RLS recursion em user_roles
-- Data: 2025-11-02
-- Descrição: Resolver erro "infinite recursion detected in policy for relation user_roles"
--
-- PROBLEMA: A tabela user_roles não pode ter RLS que verifica a própria tabela
-- SOLUÇÃO: Permitir que usuários autenticados leiam suas próprias roles

-- Desabilitar RLS temporariamente
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Deletar policies antigas (se existirem)
DROP POLICY IF EXISTS "Users can read own roles" ON user_roles;
DROP POLICY IF EXISTS "Admin can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Authenticated users can read own roles" ON user_roles;

-- Habilitar RLS novamente
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Usuários autenticados podem LER suas próprias roles
-- (Isso permite que o sistema saiba se o usuário é ADMIN)
CREATE POLICY "Authenticated users can read own roles"
  ON user_roles
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy 2: Apenas service_role pode INSERIR/ATUALIZAR/DELETAR
-- (Não verificamos se é ADMIN porque causaria recursão)
CREATE POLICY "Service role can manage all roles"
  ON user_roles
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Comentários
COMMENT ON TABLE user_roles IS 'Roles dos usuários - RLS configurado para evitar recursão infinita';

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies corrigidas!';
  RAISE NOTICE 'Agora usuários podem ler suas próprias roles sem recursão';
  RAISE NOTICE 'Apenas service_role pode modificar roles';
END $$;
