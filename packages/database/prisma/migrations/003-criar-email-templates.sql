-- Migration 003: Criar tabela de templates de email
-- Data: 2025-11-02
-- Descrição: Tabela para gerenciar templates de emails configuráveis pelo admin

-- Criar tabela de templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  codigo VARCHAR(100) UNIQUE NOT NULL,
  assunto TEXT NOT NULL,
  corpo TEXT NOT NULL,
  variaveis JSONB DEFAULT '[]'::jsonb, -- Lista de variáveis disponíveis para este template
  remetente_nome VARCHAR(255),
  remetente_email VARCHAR(255),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_email_templates_codigo ON email_templates(codigo);
CREATE INDEX IF NOT EXISTS idx_email_templates_ativo ON email_templates(ativo);

-- Comentários nas colunas
COMMENT ON TABLE email_templates IS 'Templates de emails configuráveis para automação';
COMMENT ON COLUMN email_templates.codigo IS 'Código único identificador do template (ex: padrinho_inexistente)';
COMMENT ON COLUMN email_templates.variaveis IS 'Array JSON com nomes das variáveis disponíveis (ex: ["nome", "email", "codigo"])';
COMMENT ON COLUMN email_templates.corpo IS 'Corpo do email com variáveis no formato {{ variavel }}';

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_email_templates_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualização automática
DROP TRIGGER IF EXISTS trigger_update_email_templates_timestamp ON email_templates;
CREATE TRIGGER trigger_update_email_templates_timestamp
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_timestamp();

-- RLS (Row Level Security) - Admin pode tudo, outros podem apenas ler
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Admin pode fazer tudo
DROP POLICY IF EXISTS "Admin pode gerenciar templates" ON email_templates;
CREATE POLICY "Admin pode gerenciar templates"
  ON email_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
    )
  );

-- Policy: Sistema pode ler templates ativos
DROP POLICY IF EXISTS "Sistema pode ler templates ativos" ON email_templates;
CREATE POLICY "Sistema pode ler templates ativos"
  ON email_templates
  FOR SELECT
  USING (ativo = true);
