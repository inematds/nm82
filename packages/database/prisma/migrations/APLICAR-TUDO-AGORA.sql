-- ========================================
-- MIGRATION CONSOLIDADA - SISTEMA DE EMAILS AUTOMÁTICOS
-- ========================================
-- 
-- Este arquivo contém TODAS as migrations necessárias para o sistema de emails.
-- Execute ESTE ARQUIVO ÚNICO no Supabase SQL Editor para criar tudo de uma vez.
--
-- Data: 02/11/2025
-- Migrations incluídas: 003, 004, 005, 006, 007, 008, 009
--
-- O que será criado:
-- ✅ Tabela: email_templates (8 templates)
-- ✅ Tabela: configuracoes_email (23 configurações)
-- ✅ Tabela: log_emails (auditoria)
-- ✅ Enum: AfiliadoStatus (novos valores)
-- ✅ RLS Policies (segurança)
-- ✅ Triggers (timestamps automáticos)
--
-- COMO USAR:
-- 1. Copie TODO este arquivo
-- 2. Acesse Supabase Dashboard → SQL Editor
-- 3. Cole e execute
-- 4. Aguarde conclusão (pode levar alguns segundos)
-- 5. Verifique: SELECT * FROM email_templates;
--
-- ========================================

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
-- Migration 005: Popular templates de email iniciais
-- Data: 2025-11-02
-- Descrição: Inserir templates padrão baseados nos workflows nm81-3 e nm81-4

-- Template 1: Convite para Padrinho
INSERT INTO email_templates (codigo, nome, assunto, corpo, variaveis, remetente_nome, remetente_email) VALUES
('convite_padrinho', 'Convite para se tornar Padrinho', 'Convite INEMA.VIP - Você fez Parte 2025',
'Olá {{ nome }},

Você agora faz parte da fundação de uma nova era — um movimento de aprendizado, automação e transformação com Inteligência Artificial.

Como membro pioneiro da comunidade INEMA.VIP, você se torna padrinho oficial de nossa jornada de evolução humana e tecnológica.
Sua missão é simples: compartilhar o conhecimento e convidar pessoas que, assim como você, desejam crescer e se transformar.

Cada padrinho tem direito a 5 convites gratuitos válidos até o final de novembro.
Envie este link para seus convidados se cadastrarem:

🔗 {{ link_convite }}

Ao acessar o link, o convidado encontrará um espaço inspirador de aprendizado com foco em:
🌐 Comunicação com as Máquinas (FEP – Engenharia de Prompts)
⚙️ Automação Empreendedora (FAE – Sucesso com Automações)
🧠 Influência e Comportamento Humano (FNCIA – Neurociência Aplicada)

---

Juntos, vamos moldar o futuro com propósito e consciência.
Obrigado por ser parte dessa história.

Com gratidão,
Comunidade INEMA.VIP
Nei Maldaner – Incentivador
Autoaprendizado, Inovação e Evolução Humana',
'["nome", "link_convite", "pid"]'::jsonb,
'INEMA.VIP',
'inematds@gmail.com');

-- Template 2: Padrinho Inexistente
INSERT INTO email_templates (codigo, nome, assunto, corpo, variaveis, remetente_nome, remetente_email) VALUES
('padrinho_inexistente', 'Aviso: Padrinho não encontrado', 'Promoção do Convite do INEMA.VIP',
'Olá! 👋

Verificamos que o padrinho indicado não existe ou o link que você usou está incorreto.
Por favor, confirme com o seu padrinho — ele pode te enviar o link correto de convite para que você participe da promoção e entre na nossa Comunidade INEMA.VIP.

Essa promoção é exclusiva para novos participantes convidados pelos padrinhos, que têm a oportunidade de apresentar o acesso à nossa comunidade com mais de 20 áreas de conteúdo e autoaprendizagem.

💬 Assim que tiver o link certo, é só clicar e concluir o cadastro!

INEMA.VIP
Comunidade de Autoaprendizagem',
'["nome"]'::jsonb,
'INEMA.VIP',
'inematds@gmail.com');

-- Template 3: Sem Convites - Afiliado
INSERT INTO email_templates (codigo, nome, assunto, corpo, variaveis, remetente_nome, remetente_email) VALUES
('sem_convites_afiliado', 'Aviso: Padrinho sem convites', 'Promoção Convite INEMA VIP',
'Olá! 👋

Infelizmente, este padrinho já não tem mais convites disponíveis no momento. 😔
Mas não se preocupe! 💫 Você pode falar com a Tiza no INEMA.Comunidade, que está ajudando a ver novas oportunidades e promoções para participar da Comunidade INEMA.VIP.

Ela sempre encontra um jeitinho de ajudar quem realmente quer fazer parte e aproveitar nossos conteúdos e programas de autoaprendizagem em mais de 20 áreas.

💬 Entra em contato com ela e diz que você veio por recomendação de um padrinho — talvez ela consiga algo especial pra você!

💬 Qualquer dúvida, é só chamar!
INEMA.VIP',
'["nome"]'::jsonb,
'INEMA.VIP',
'inematds@gmail.com');

-- Template 4: Sem Convites - Padrinho
INSERT INTO email_templates (codigo, nome, assunto, corpo, variaveis, remetente_nome, remetente_email) VALUES
('sem_convites_padrinho', 'Aviso: Convites esgotados', 'Promoção de Padrinho INEMA VIP',
'Olá! 👋

Seus convites já se esgotaram nesta promoção. 🎉
Isso mostra que você realmente está ajudando muita gente a entrar na Comunidade INEMA.VIP e se desenvolver com nossos conteúdos! 🙌

Mas se quiser ganhar mais convites, fala com a Tiza — talvez ela consiga liberar mais alguns para você continuar convidando novos afiliados e espalhando esse movimento de crescimento e aprendizado.

💬 Ela está cuidando dos ajustes e sempre dá um jeitinho de ajudar quem está engajado na comunidade!

💬 Qualquer dúvida, é só chamar!
INEMA.VIP',
'["nome", "padrinho_nome"]'::jsonb,
'INEMA.VIP',
'inematds@gmail.com');

-- Template 5: Afiliado Já é Membro
INSERT INTO email_templates (codigo, nome, assunto, corpo, variaveis, remetente_nome, remetente_email) VALUES
('afiliado_ja_membro', 'Aviso: Já é membro', 'Promoção Convite INEMA VIP',
'Olá! 🌟

A promoção atual é voltada especialmente para novas pessoas que ainda não fazem parte da Comunidade INEMA.VIP.

Verificamos que seu cadastro já está ativo na nossa comunidade, então você já faz parte do nosso grupo de aprendizado e conexões!

🙌  Mas se quiser aproveitar alguma outra promoção ou benefício, pode conversar com a Tiza, que está ajudando os membros a encontrarem novas oportunidades e desafios dentro da comunidade.

Lembrando que esta ação faz parte da Promoção dos Padrinhos, onde membros da comunidade podem convidar seus Afiliados e oferecer a chance de crescer e se desenvolver com nossos conteúdos — são mais de 20 áreas de conhecimento e autoaprendizagem disponíveis.

💬 Qualquer dúvida, é só chamar!
INEMA.VIP',
'["nome"]'::jsonb,
'INEMA.VIP',
'inematds@gmail.com');

-- Template 6: Padrinho - Convidado Já é Membro
INSERT INTO email_templates (codigo, nome, assunto, corpo, variaveis, remetente_nome, remetente_email) VALUES
('padrinho_convidado_ja_membro', 'Aviso: Convidado já é membro', 'Promoção Convite INEMA VIP',
'Olá! 🌟

A promoção atual é voltada especialmente para novas pessoas que ainda não fazem parte da Comunidade INEMA.VIP.

Verificamos que o cadastro do Afiliado já está ativo na nossa comunidade, então ele já faz parte do nosso grupo de aprendizado e conexões!

Então pode enviar o Convite para outro.

🙌  Mas se quiser aproveitar alguma outra promoção ou benefício, pode conversar com a Tiza, que está ajudando os membros a encontrarem novas oportunidades e desafios dentro da comunidade.

Lembrando que esta ação faz parte da Promoção dos Padrinhos, onde membros da comunidade podem convidar seus Afiliados e oferecer a chance de crescer e se desenvolver com nossos conteúdos — são mais de 20 áreas de conhecimento e autoaprendizagem disponíveis.

💬 Qualquer dúvida, é só chamar!
INEMA.VIP',
'["nome", "afiliado_nome", "afiliado_email"]'::jsonb,
'INEMA.VIP',
'inematds@gmail.com');

-- Template 7: Aprovado - Afiliado
INSERT INTO email_templates (codigo, nome, assunto, corpo, variaveis, remetente_nome, remetente_email) VALUES
('aprovado_afiliado', 'Acesso Aprovado - Afiliado', 'Promoção Convite INEMA.VIP - Acesso Aprovado',
'Olá! 👋

Seu acesso à Comunidade INEMA.VIP já está disponível! 🎉
Você pode entrar agora mesmo clicando neste link:

👉 https://t.me/INEMAMembroBot?start={{ codigo }}

Ao entrar, no GRUPO INEMA.VIP procure o tópico "REPOSITÓRIOS" — lá você encontrará os links para todos os outros grupos e áreas da comunidade.

Sabemos que tudo que é novo e grande exige um tempo de adaptação e aprendizado, e é exatamente por isso que ninguém caminha sozinho por aqui. 🌱

Conte com seu padrinho e com a Tiza, que são seus pontos de apoio dentro da comunidade. Eles vão te orientar, esclarecer dúvidas e ajudar você a aproveitar ao máximo tudo que o INEMA.VIP oferece.

Temos muito conteúdo e diversas áreas de desenvolvimento, então vá com calma — domine uma por vez, explore, pratique e aproveite cada aprendizado.

Seu acesso Liberado até fim de Novembro 2025!

Bem-vindo(a) à comunidade! 🌟
Você acaba de entrar em um ambiente feito para crescer, aprender e transformar.

INEMA.VIP
Comunidade de Autoaprendizado.

Agradecimento ao Teu Padrinho:
{{ padrinho_nome }}',
'["nome", "codigo", "padrinho_nome"]'::jsonb,
'INEMA.VIP',
'inematds@gmail.com');

-- Template 8: Aprovado - Padrinho
INSERT INTO email_templates (codigo, nome, assunto, corpo, variaveis, remetente_nome, remetente_email) VALUES
('aprovado_padrinho', 'Acesso Aprovado - Notificação Padrinho', 'Promoção Convites INEMA.VIP - Aprovado Afiliado',
'Olá, Padrinho! 🌟

Temos uma ótima notícia:

{{ afiliado_nome }}
{{ afiliado_email }}

Acaba de ganhar acesso à Comunidade INEMA.VIP! 🎉
Esperamos que, com essa oportunidade, ele possa se desenvolver, descobrir novas habilidades e ajudar muitas outras pessoas, além de expandir todo o seu potencial.

E o seu papel nisso é essencial. 🙌
Como padrinho, você tem a missão de ajudá-lo a compreender nossa comunidade, mostrar como tudo funciona e, principalmente, inspirá-lo a manter a determinação para alcançar resultados reais.

Fique feliz — porque cada pessoa que você apoia é uma semente de transformação.
Acreditamos que quem ajuda o outro a crescer, cresce muito mais. 🌱

Essa é a nossa filosofia. 💫

INEMA.VIP
Comunidade de Autoaprendizagem.',
'["nome", "afiliado_nome", "afiliado_email"]'::jsonb,
'INEMA.VIP',
'inematds@gmail.com');

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ 8 templates de email criados com sucesso!';
END $$;
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
-- Migration 008: Atualizar enum AfiliadoStatus
-- Data: 2025-11-02
-- Descrição: Adicionar novos status baseados no fluxo automático

-- Adicionar novos valores ao enum
ALTER TYPE "AfiliadoStatus" ADD VALUE IF NOT EXISTS 'ENVIADO';
ALTER TYPE "AfiliadoStatus" ADD VALUE IF NOT EXISTS 'JA_CADASTRADO';
ALTER TYPE "AfiliadoStatus" ADD VALUE IF NOT EXISTS 'SEM_PADRINHO';

-- Comentários sobre o uso dos status
COMMENT ON TYPE "AfiliadoStatus" IS '
Status do afiliado no fluxo automático:
- PENDENTE: Aguardando processamento automático
- ENVIADO: Aprovado automaticamente e email com código enviado
- JA_CADASTRADO: Email já existe na base ou padrinho sem convites
- SEM_PADRINHO: Padrinho não encontrado ou link inválido
- APROVADO: (Deprecated) Manter por compatibilidade
- REJEITADO: (Deprecated) Manter por compatibilidade
';

DO $$
BEGIN
  RAISE NOTICE '✅ Enum AfiliadoStatus atualizado com sucesso!';
  RAISE NOTICE 'Novos status: ENVIADO, JA_CADASTRADO, SEM_PADRINHO';
END $$;
-- Migration 009: Adicionar status SEM_CONVITE
-- Data: 2025-11-02
-- Descrição: Adicionar status específico para quando padrinho não tem convites

-- Adicionar novo valor ao enum
ALTER TYPE "AfiliadoStatus" ADD VALUE IF NOT EXISTS 'SEM_CONVITE';

-- Comentário atualizado
COMMENT ON TYPE "AfiliadoStatus" IS '
Status do afiliado no fluxo automático:
- PENDENTE: Aguardando processamento automático
- ENVIADO: Aprovado automaticamente e email com código enviado
- JA_CADASTRADO: Email já existe na base de pessoas_fisicas
- SEM_PADRINHO: Padrinho não encontrado ou link inválido
- SEM_CONVITE: Padrinho sem convites disponíveis
- APROVADO: (Deprecated) Manter por compatibilidade
- REJEITADO: (Deprecated) Manter por compatibilidade
';

DO $$
BEGIN
  RAISE NOTICE '✅ Status SEM_CONVITE adicionado com sucesso!';
  RAISE NOTICE 'Agora temos distinção clara entre sem padrinho e sem convites';
END $$;
