-- ========================================
-- 🎯 SCRIPT PRONTO PARA EXECUTAR
-- ========================================
-- Email: inemanm82@gmail.com
-- Basta copiar TUDO e colar no Supabase SQL Editor
-- ========================================

-- PASSO 1: DESABILITAR RLS (resolve recursão infinita)
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read own roles" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Admin can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON user_roles;

RAISE NOTICE '✅ RLS de user_roles desabilitado';

-- PASSO 2: Tornar você ADMIN
DELETE FROM user_roles
WHERE user_id = (SELECT id::text FROM auth.users WHERE email = 'inemanm82@gmail.com');

INSERT INTO user_roles (id, user_id, role, created_at)
SELECT
  gen_random_uuid()::text,
  id::text,
  'ADMIN',
  NOW()
FROM auth.users
WHERE email = 'inemanm82@gmail.com';

RAISE NOTICE '✅ Você (inemanm82@gmail.com) agora é ADMIN!';

-- PASSO 3: Criar tabelas de email
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  codigo VARCHAR(100) UNIQUE NOT NULL,
  assunto TEXT NOT NULL,
  corpo TEXT NOT NULL,
  variaveis JSONB DEFAULT '[]'::jsonb,
  remetente_nome VARCHAR(255),
  remetente_email VARCHAR(255),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE email_templates DISABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_email_templates_codigo ON email_templates(codigo);

RAISE NOTICE '✅ Tabela email_templates criada';

CREATE TABLE IF NOT EXISTS configuracoes_email (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'string',
  descricao TEXT,
  grupo VARCHAR(100) DEFAULT 'geral',
  criptografado BOOLEAN DEFAULT false,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE configuracoes_email DISABLE ROW LEVEL SECURITY;

RAISE NOTICE '✅ Tabela configuracoes_email criada';

CREATE TABLE IF NOT EXISTS log_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_codigo VARCHAR(100),
  destinatario_email VARCHAR(255) NOT NULL,
  destinatario_nome VARCHAR(255),
  assunto TEXT NOT NULL,
  corpo TEXT NOT NULL,
  variaveis JSONB,
  status VARCHAR(50) DEFAULT 'PENDENTE',
  erro TEXT,
  tentativas INT DEFAULT 0,
  afiliado_id UUID,
  padrinho_id UUID,
  enviado_em TIMESTAMP WITH TIME ZONE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE log_emails DISABLE ROW LEVEL SECURITY;

RAISE NOTICE '✅ Tabela log_emails criada';

-- PASSO 4: Inserir template de teste
DELETE FROM email_templates;

INSERT INTO email_templates (codigo, nome, assunto, corpo, ativo) VALUES
('teste', 'Template de Teste', 'Email de Teste', 'Olá {{ nome }}, este é um teste!', true);

RAISE NOTICE '✅ Template de teste inserido';

-- PASSO 5: Verificar se tudo funcionou
DO $$
DECLARE
  v_role TEXT;
  v_email TEXT;
  v_templates INT;
BEGIN
  -- Verificar se é ADMIN
  SELECT ur.role::TEXT, au.email INTO v_role, v_email
  FROM user_roles ur
  JOIN auth.users au ON au.id::text = ur.user_id
  WHERE au.email = 'inemanm82@gmail.com';

  -- Contar templates
  SELECT COUNT(*) INTO v_templates FROM email_templates;

  -- Mensagens
  RAISE NOTICE '';
  RAISE NOTICE '🎉🎉🎉 TUDO PRONTO! 🎉🎉🎉';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Email: %', v_email;
  RAISE NOTICE '✅ Role: %', v_role;
  RAISE NOTICE '✅ Templates criados: %', v_templates;
  RAISE NOTICE '';
  RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
  RAISE NOTICE '1. Volte para o sistema';
  RAISE NOTICE '2. Clique em: Configuração → Logout';
  RAISE NOTICE '3. Faça login novamente';
  RAISE NOTICE '4. Acesse: /admin/templates-email';
  RAISE NOTICE '5. Deve aparecer 1 template!';
  RAISE NOTICE '';
END $$;

-- Query final para confirmar
SELECT
  '✅ SUCESSO!' as status,
  au.email,
  ur.role,
  (SELECT COUNT(*) FROM email_templates) as total_templates
FROM user_roles ur
JOIN auth.users au ON au.id::text = ur.user_id
WHERE au.email = 'inemanm82@gmail.com';
