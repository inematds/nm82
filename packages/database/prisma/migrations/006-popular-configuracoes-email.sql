-- Migration 006: Popular configurações de email
-- Data: 2025-11-02
-- Descrição: Inserir configurações padrão para SMTP e envio de emails

-- Configurações SMTP
INSERT INTO configuracoes_email (chave, valor, tipo, descricao, grupo) VALUES
('smtp_host', 'smtp.gmail.com', 'string', 'Servidor SMTP para envio de emails', 'smtp'),
('smtp_port', '587', 'number', 'Porta do servidor SMTP (587 para TLS, 465 para SSL)', 'smtp'),
('smtp_secure', 'false', 'boolean', 'Usar SSL/TLS direto (true para porta 465)', 'smtp'),
('smtp_user', '', 'string', 'Usuário/email para autenticação SMTP', 'smtp'),
('smtp_password', '', 'string', 'Senha ou App Password do Gmail', 'smtp');

-- Configurações de Remetente
INSERT INTO configuracoes_email (chave, valor, tipo, descricao, grupo) VALUES
('remetente_nome', 'INEMA.VIP', 'string', 'Nome que aparece como remetente dos emails', 'remetente'),
('remetente_email', 'inematds@gmail.com', 'string', 'Email que aparece como remetente', 'remetente'),
('remetente_reply_to', 'inematds@gmail.com', 'string', 'Email para respostas (Reply-To)', 'remetente');

-- Configurações de Limites e Segurança
INSERT INTO configuracoes_email (chave, valor, tipo, descricao, grupo) VALUES
('rate_limit_por_minuto', '10', 'number', 'Máximo de emails por minuto', 'limites'),
('rate_limit_por_hora', '100', 'number', 'Máximo de emails por hora', 'limites'),
('delay_entre_envios', '3', 'number', 'Delay em segundos entre envios (evitar spam)', 'limites'),
('max_tentativas', '3', 'number', 'Número máximo de tentativas em caso de falha', 'limites');

-- Configurações do Worker
INSERT INTO configuracoes_email (chave, valor, tipo, descricao, grupo) VALUES
('worker_intervalo', '10', 'number', 'Intervalo em minutos para processar afiliados pendentes', 'worker'),
('worker_ativo', 'true', 'boolean', 'Ativar/desativar processamento automático', 'worker'),
('worker_lote_tamanho', '1', 'number', 'Processar quantos afiliados por vez', 'worker'),
('worker_debug', 'false', 'boolean', 'Ativar logs detalhados do worker', 'worker');

-- Configurações de Templates
INSERT INTO configuracoes_email (chave, valor, tipo, descricao, grupo) VALUES
('template_usar_html', 'true', 'boolean', 'Permitir HTML nos templates de email', 'templates'),
('template_sanitizar', 'true', 'boolean', 'Sanitizar HTML para prevenir XSS', 'templates');

-- Configurações de Logs
INSERT INTO configuracoes_email (chave, valor, tipo, descricao, grupo) VALUES
('log_emails_enviados', 'true', 'boolean', 'Registrar todos os emails enviados', 'logs'),
('log_emails_falhas', 'true', 'boolean', 'Registrar falhas de envio', 'logs'),
('log_retention_dias', '90', 'number', 'Quantos dias manter logs de emails', 'logs');

-- Link de Convite
INSERT INTO configuracoes_email (chave, valor, tipo, descricao, grupo) VALUES
('url_convite_base', 'http://localhost:3000/convite', 'string', 'URL base para página de convite', 'geral'),
('telegram_bot_link', 'https://t.me/INEMAMembroBot?start=', 'string', 'Link do bot do Telegram', 'geral');

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Configurações de email criadas com sucesso!';
  RAISE NOTICE '⚠️  IMPORTANTE: Configure smtp_user e smtp_password no painel admin';
END $$;
