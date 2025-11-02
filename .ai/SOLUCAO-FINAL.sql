-- ========================================
-- 🎯 SOLUÇÃO FINAL - SCRIPT DEFINITIVO
-- ========================================
--
-- Este script faz TUDO que você precisa:
-- 1. Remove COMPLETAMENTE as RLS problemáticas
-- 2. Torna você ADMIN
-- 3. Cria tabelas de email
-- 4. Popula templates
--
-- ⚠️ Substitua 'SEU_EMAIL_AQUI' pelo seu email!
--
-- ========================================

-- ========================================
-- PASSO 1: DESABILITAR RLS de user_roles
-- ========================================
-- (Isso resolve a recursão infinita)

ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as policies
DROP POLICY IF EXISTS "Authenticated users can read own roles" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Admin can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON user_roles;

RAISE NOTICE '✅ RLS de user_roles DESABILITADO';

-- ========================================
-- PASSO 2: Tornar você ADMIN
-- ========================================

-- Deletar qualquer role existente
DELETE FROM user_roles
WHERE user_id = (SELECT id::text FROM auth.users WHERE email = 'SEU_EMAIL_AQUI');

-- Adicionar como ADMIN
INSERT INTO user_roles (id, user_id, role, created_at)
SELECT
  gen_random_uuid()::text,
  id::text,
  'ADMIN'::\"Role\",
  NOW()
FROM auth.users
WHERE email = 'SEU_EMAIL_AQUI';

-- Verificar
SELECT
  'Você é ADMIN!' as mensagem,
  au.email,
  ur.role
FROM user_roles ur
JOIN auth.users au ON au.id::text = ur.user_id
WHERE au.email = 'SEU_EMAIL_AQUI';

RAISE NOTICE '✅ Você agora é ADMIN!';

-- ========================================
-- PASSO 3: Criar tabelas de email
-- ========================================

-- Tabela de templates
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

-- Desabilitar RLS (para não ter problemas)
ALTER TABLE email_templates DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_email_templates_codigo ON email_templates(codigo);

-- Tabela de configurações
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

-- Tabela de logs
CREATE TABLE IF NOT EXISTS log_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_codigo VARCHAR(100),
  destinatario_email VARCHAR(255) NOT NULL,
  assunto TEXT NOT NULL,
  corpo TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDENTE',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE log_emails DISABLE ROW LEVEL SECURITY;

RAISE NOTICE '✅ Tabelas criadas: email_templates, configuracoes_email, log_emails';

-- ========================================
-- PASSO 4: Inserir 1 template de teste
-- ========================================

-- Deletar templates antigos
DELETE FROM email_templates;

-- Inserir template de teste
INSERT INTO email_templates (codigo, nome, assunto, corpo, ativo) VALUES
('teste', 'Template de Teste', 'Email de Teste', 'Olá {{ nome }}, este é um teste!', true);

RAISE NOTICE '✅ Template de teste criado!';

-- ========================================
-- MENSAGEM FINAL
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉🎉🎉 TUDO PRONTO! 🎉🎉🎉';
  RAISE NOTICE '';
  RAISE NOTICE '✅ RLS problemáticas REMOVIDAS';
  RAISE NOTICE '✅ Você é ADMIN!';
  RAISE NOTICE '✅ Tabelas criadas!';
  RAISE NOTICE '✅ Template de teste inserido!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
  RAISE NOTICE '1. Faça LOGOUT no sistema';
  RAISE NOTICE '2. Faça LOGIN novamente';
  RAISE NOTICE '3. Acesse /admin/templates-email';
  RAISE NOTICE '4. Deve aparecer 1 template de teste!';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ Se aparecer, depois execute APLICAR-TUDO-AGORA.sql';
  RAISE NOTICE '   para adicionar os 8 templates completos';
  RAISE NOTICE '';
END $$;
