/**
 * Script para listar templates de email do banco de dados
 * Execução: node scripts/listar-templates.js
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Carregar .env de apps/web
require('dotenv').config({ path: path.join(__dirname, '..', 'apps', 'web', '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function listarTemplates() {
  console.log('📋 Listando templates de email do banco...\n');

  try {
    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('codigo');

    if (error) throw error;

    if (!templates || templates.length === 0) {
      console.log('⚠️  Nenhum template encontrado no banco.');
      return;
    }

    console.log(`✅ ${templates.length} templates encontrados:\n`);
    console.log('─'.repeat(80));

    templates.forEach((t, index) => {
      console.log(`\n${index + 1}. 📧 ${t.nome}`);
      console.log(`   Código: ${t.codigo}`);
      console.log(`   Assunto: ${t.assunto}`);
      console.log(`   Remetente: ${t.remetente_nome} <${t.remetente_email}>`);
      console.log(`   Variáveis: ${JSON.stringify(t.variaveis || [])}`);
      console.log(`   Ativo: ${t.ativo ? '✅ Sim' : '❌ Não'}`);
      console.log(`   Criado em: ${new Date(t.criado_em).toLocaleString('pt-BR')}`);

      // Preview do corpo (primeiras 2 linhas)
      const linhas = t.corpo.split('\n').filter(l => l.trim());
      console.log(`   Preview: ${linhas[0].substring(0, 60)}${linhas[0].length > 60 ? '...' : ''}`);
    });

    console.log('\n' + '─'.repeat(80));
    console.log(`\n📊 Total: ${templates.length} templates`);

    // Estatísticas
    const ativos = templates.filter(t => t.ativo).length;
    const inativos = templates.length - ativos;
    console.log(`   ✅ Ativos: ${ativos}`);
    console.log(`   ❌ Inativos: ${inativos}\n`);

  } catch (error) {
    console.error('❌ Erro ao buscar templates:', error.message);
    process.exit(1);
  }
}

listarTemplates()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
