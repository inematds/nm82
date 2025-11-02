-- Migration 004: Criar tabela de configurações de email
-- Data: 2025-11-02
-- Descrição: Tabela para configurações SMTP e remetente de emails

-- Criar tabela de configurações
CREATE TABLE IF NOT EXISTS configuracoes_email (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
  descricao TEXT,
  grupo VARCHAR(100) DEFAULT 'geral', -- smtp, remetente, limites, etc
  criptografado BOOLEAN DEFAULT false, -- Se o valor está criptografado (senhas)
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_configuracoes_email_chave ON configuracoes_email(chave);
CREATE INDEX IF NOT EXISTS idx_configuracoes_email_grupo ON configuracoes_email(grupo);

-- Comentários
COMMENT ON TABLE configuracoes_email IS 'Configurações globais do sistema de envio de emails';
COMMENT ON COLUMN configuracoes_email.chave IS 'Chave única da configuração (ex: smtp_host)';
COMMENT ON COLUMN configuracoes_email.tipo IS 'Tipo de dado: string, number, boolean, json';
COMMENT ON COLUMN configuracoes_email.grupo IS 'Grupo da configuração para organização';
COMMENT ON COLUMN configuracoes_email.criptografado IS 'Indica se o valor deve ser tratado como sensível';

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_configuracoes_email_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualização
DROP TRIGGER IF EXISTS trigger_update_configuracoes_email_timestamp ON configuracoes_email;
CREATE TRIGGER trigger_update_configuracoes_email_timestamp
  BEFORE UPDATE ON configuracoes_email
  FOR EACH ROW
  EXECUTE FUNCTION update_configuracoes_email_timestamp();

-- RLS (Row Level Security)
ALTER TABLE configuracoes_email ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas admin pode gerenciar
DROP POLICY IF EXISTS "Admin pode gerenciar configuracoes" ON configuracoes_email;
CREATE POLICY "Admin pode gerenciar configuracoes"
  ON configuracoes_email
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
    )
  );

-- Policy: Sistema pode ler configurações
DROP POLICY IF EXISTS "Sistema pode ler configuracoes" ON configuracoes_email;
CREATE POLICY "Sistema pode ler configuracoes"
  ON configuracoes_email
  FOR SELECT
  USING (true); -- Sistema precisa ler para funcionar
