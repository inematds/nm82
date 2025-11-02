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
