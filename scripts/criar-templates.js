/**
 * Script para criar templates de email no banco de dados
 * Execução: node scripts/criar-templates.js
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Carregar .env de apps/web (onde estão as variáveis do Supabase)
require('dotenv').config({ path: path.join(__dirname, '..', 'apps', 'web', '.env') });

// Debug: verificar variáveis
console.log('📍 Verificando variáveis de ambiente...');
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL não encontrada no .env');
  process.exit(1);
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não encontrada no .env');
  process.exit(1);
}
console.log('✅ Variáveis de ambiente carregadas\n');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const templates = [
  {
    codigo: 'convite_padrinho',
    nome: 'Convite para se tornar Padrinho',
    assunto: 'Convite INEMA.VIP - Você fez Parte 2025',
    corpo: `Olá {{ nome }},

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
Autoaprendizado, Inovação e Evolução Humana`,
    variaveis: ["nome", "link_convite", "pid"],
    remetente_nome: 'INEMA.VIP',
    remetente_email: 'inematds@gmail.com',
    ativo: true
  },

  {
    codigo: 'padrinho_inexistente',
    nome: 'Aviso: Padrinho não encontrado',
    assunto: 'Promoção do Convite do INEMA.VIP',
    corpo: `Olá! 👋

Verificamos que o padrinho indicado não existe ou o link que você usou está incorreto.
Por favor, confirme com o seu padrinho — ele pode te enviar o link correto de convite para que você participe da promoção e entre na nossa Comunidade INEMA.VIP.

Essa promoção é exclusiva para novos participantes convidados pelos padrinhos, que têm a oportunidade de apresentar o acesso à nossa comunidade com mais de 20 áreas de conteúdo e autoaprendizagem.

💬 Assim que tiver o link certo, é só clicar e concluir o cadastro!

INEMA.VIP
Comunidade de Autoaprendizagem`,
    variaveis: ["nome"],
    remetente_nome: 'INEMA.VIP',
    remetente_email: 'inematds@gmail.com',
    ativo: true
  },

  {
    codigo: 'sem_convites_afiliado',
    nome: 'Aviso: Padrinho sem convites',
    assunto: 'Promoção Convite INEMA VIP',
    corpo: `Olá! 👋

Infelizmente, este padrinho já não tem mais convites disponíveis no momento. 😔
Mas não se preocupe! 💫 Você pode falar com a Tiza no INEMA.Comunidade, que está ajudando a ver novas oportunidades e promoções para participar da Comunidade INEMA.VIP.

Ela sempre encontra um jeitinho de ajudar quem realmente quer fazer parte e aproveitar nossos conteúdos e programas de autoaprendizagem em mais de 20 áreas.

💬 Entra em contato com ela e diz que você veio por recomendação de um padrinho — talvez ela consiga algo especial pra você!

💬 Qualquer dúvida, é só chamar!
INEMA.VIP`,
    variaveis: ["nome"],
    remetente_nome: 'INEMA.VIP',
    remetente_email: 'inematds@gmail.com',
    ativo: true
  },

  {
    codigo: 'sem_convites_padrinho',
    nome: 'Aviso: Convites esgotados',
    assunto: 'Promoção de Padrinho INEMA VIP',
    corpo: `Olá! 👋

Seus convites já se esgotaram nesta promoção. 🎉
Isso mostra que você realmente está ajudando muita gente a entrar na Comunidade INEMA.VIP e se desenvolver com nossos conteúdos! 🙌

Mas se quiser ganhar mais convites, fala com a Tiza — talvez ela consiga liberar mais alguns para você continuar convidando novos afiliados e espalhando esse movimento de crescimento e aprendizado.

💬 Ela está cuidando dos ajustes e sempre dá um jeitinho de ajudar quem está engajado na comunidade!

💬 Qualquer dúvida, é só chamar!
INEMA.VIP`,
    variaveis: ["nome", "padrinho_nome"],
    remetente_nome: 'INEMA.VIP',
    remetente_email: 'inematds@gmail.com',
    ativo: true
  },

  {
    codigo: 'afiliado_ja_membro',
    nome: 'Aviso: Já é membro',
    assunto: 'Promoção Convite INEMA VIP',
    corpo: `Olá! 🌟

A promoção atual é voltada especialmente para novas pessoas que ainda não fazem parte da Comunidade INEMA.VIP.

Verificamos que seu cadastro já está ativo na nossa comunidade, então você já faz parte do nosso grupo de aprendizado e conexões!

🙌  Mas se quiser aproveitar alguma outra promoção ou benefício, pode conversar com a Tiza, que está ajudando os membros a encontrarem novas oportunidades e desafios dentro da comunidade.

Lembrando que esta ação faz parte da Promoção dos Padrinhos, onde membros da comunidade podem convidar seus Afiliados e oferecer a chance de crescer e se desenvolver com nossos conteúdos — são mais de 20 áreas de conhecimento e autoaprendizagem disponíveis.

💬 Qualquer dúvida, é só chamar!
INEMA.VIP`,
    variaveis: ["nome"],
    remetente_nome: 'INEMA.VIP',
    remetente_email: 'inematds@gmail.com',
    ativo: true
  },

  {
    codigo: 'padrinho_convidado_ja_membro',
    nome: 'Aviso: Convidado já é membro',
    assunto: 'Promoção Convite INEMA VIP',
    corpo: `Olá! 🌟

A promoção atual é voltada especialmente para novas pessoas que ainda não fazem parte da Comunidade INEMA.VIP.

Verificamos que o cadastro do Afiliado já está ativo na nossa comunidade, então ele já faz parte do nosso grupo de aprendizado e conexões!

Então pode enviar o Convite para outro.

🙌  Mas se quiser aproveitar alguma outra promoção ou benefício, pode conversar com a Tiza, que está ajudando os membros a encontrarem novas oportunidades e desafios dentro da comunidade.

Lembrando que esta ação faz parte da Promoção dos Padrinhos, onde membros da comunidade podem convidar seus Afiliados e oferecer a chance de crescer e se desenvolver com nossos conteúdos — são mais de 20 áreas de conhecimento e autoaprendizagem disponíveis.

💬 Qualquer dúvida, é só chamar!
INEMA.VIP`,
    variaveis: ["nome", "afiliado_nome", "afiliado_email"],
    remetente_nome: 'INEMA.VIP',
    remetente_email: 'inematds@gmail.com',
    ativo: true
  },

  {
    codigo: 'aprovado_afiliado',
    nome: 'Acesso Aprovado - Afiliado',
    assunto: 'Promoção Convite INEMA.VIP - Acesso Aprovado',
    corpo: `Olá! 👋

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
{{ padrinho_nome }}`,
    variaveis: ["nome", "codigo", "padrinho_nome"],
    remetente_nome: 'INEMA.VIP',
    remetente_email: 'inematds@gmail.com',
    ativo: true
  },

  {
    codigo: 'aprovado_padrinho',
    nome: 'Acesso Aprovado - Notificação Padrinho',
    assunto: 'Promoção Convites INEMA.VIP - Aprovado Afiliado',
    corpo: `Olá, Padrinho! 🌟

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
Comunidade de Autoaprendizagem.`,
    variaveis: ["nome", "afiliado_nome", "afiliado_email"],
    remetente_nome: 'INEMA.VIP',
    remetente_email: 'inematds@gmail.com',
    ativo: true
  }
];

async function criarTemplates() {
  console.log('🚀 Iniciando criação de templates de email...\n');

  let criados = 0;
  let atualizados = 0;
  let erros = 0;

  for (const template of templates) {
    try {
      // Verificar se já existe
      const { data: existente } = await supabase
        .from('email_templates')
        .select('id')
        .eq('codigo', template.codigo)
        .single();

      if (existente) {
        // Atualizar
        const { error } = await supabase
          .from('email_templates')
          .update(template)
          .eq('codigo', template.codigo);

        if (error) throw error;
        console.log(`✅ Atualizado: ${template.codigo} - ${template.nome}`);
        atualizados++;
      } else {
        // Criar novo
        const { error } = await supabase
          .from('email_templates')
          .insert(template);

        if (error) throw error;
        console.log(`✨ Criado: ${template.codigo} - ${template.nome}`);
        criados++;
      }
    } catch (error) {
      console.error(`❌ Erro em ${template.codigo}:`, error.message);
      erros++;
    }
  }

  console.log('\n📊 RESUMO:');
  console.log(`   ✨ Criados: ${criados}`);
  console.log(`   ✅ Atualizados: ${atualizados}`);
  console.log(`   ❌ Erros: ${erros}`);
  console.log(`   📝 Total: ${templates.length} templates\n`);

  if (erros === 0) {
    console.log('🎉 Todos os templates foram processados com sucesso!');
  }
}

criarTemplates()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
