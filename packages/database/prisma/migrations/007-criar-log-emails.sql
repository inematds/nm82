-- Migration 007: Criar tabela de log de emails
-- Data: 2025-11-02
-- Descrição: Tabela para registrar todos os emails enviados (auditoria e debug)

-- Criar tabela de logs
CREATE TABLE IF NOT EXISTS log_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_codigo VARCHAR(100),
  destinatario_email VARCHAR(255) NOT NULL,
  destinatario_nome VARCHAR(255),
  assunto TEXT NOT NULL,
  corpo TEXT NOT NULL,
  variaveis JSONB, -- Variáveis usadas no template
  status VARCHAR(50) NOT NULL DEFAULT 'pendente', -- pendente, enviado, falha
  erro TEXT, -- Mensagem de erro se falhou
  tentativas INT DEFAULT 0,
  afiliado_id UUID, -- Referência ao afiliado relacionado
  padrinho_id UUID, -- Referência ao padrinho relacionado
  enviado_em TIMESTAMP WITH TIME ZONE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_log_emails_status ON log_emails(status);
CREATE INDEX IF NOT EXISTS idx_log_emails_template ON log_emails(template_codigo);
CREATE INDEX IF NOT EXISTS idx_log_emails_destinatario ON log_emails(destinatario_email);
CREATE INDEX IF NOT EXISTS idx_log_emails_afiliado ON log_emails(afiliado_id);
CREATE INDEX IF NOT EXISTS idx_log_emails_criado ON log_emails(criado_em DESC);

-- Comentários
COMMENT ON TABLE log_emails IS 'Log de todos os emails enviados pelo sistema';
COMMENT ON COLUMN log_emails.status IS 'Status: pendente, enviado, falha';
COMMENT ON COLUMN log_emails.tentativas IS 'Número de tentativas de envio';
COMMENT ON COLUMN log_emails.variaveis IS 'JSON com as variáveis usadas no template';

-- RLS
ALTER TABLE log_emails ENABLE ROW LEVEL SECURITY;

-- Policy: Admin pode ver tudo
DROP POLICY IF EXISTS "Admin pode ver logs" ON log_emails;
CREATE POLICY "Admin pode ver logs"
  ON log_emails
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
    )
  );

-- Policy: Sistema pode inserir logs
DROP POLICY IF EXISTS "Sistema pode inserir logs" ON log_emails;
CREATE POLICY "Sistema pode inserir logs"
  ON log_emails
  FOR INSERT
  WITH CHECK (true);

-- Policy: Sistema pode atualizar status
DROP POLICY IF EXISTS "Sistema pode atualizar logs" ON log_emails;
CREATE POLICY "Sistema pode atualizar logs"
  ON log_emails
  FOR UPDATE
  USING (true);

-- Função para limpar logs antigos (executar mensalmente)
CREATE OR REPLACE FUNCTION limpar_logs_emails_antigos()
RETURNS void AS $$
DECLARE
  retention_days INT;
BEGIN
  -- Buscar configuração de retenção
  SELECT valor::INT INTO retention_days
  FROM configuracoes_email
  WHERE chave = 'log_retention_dias';

  IF retention_days IS NULL THEN
    retention_days := 90; -- Padrão: 90 dias
  END IF;

  -- Deletar logs antigos
  DELETE FROM log_emails
  WHERE criado_em < NOW() - (retention_days || ' days')::INTERVAL;

  RAISE NOTICE 'Logs de emails com mais de % dias foram removidos', retention_days;
END;
$$ LANGUAGE plpgsql;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Tabela de log de emails criada com sucesso!';
END $$;
