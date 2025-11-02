const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '../packages/database/.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!');
  console.error('   Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mapping from original CSV status to database status
const statusMapping = {
  'Enviado': 'APROVADO',
  'Já Cadastrado': 'REJEITADO',
  'pendente': 'PENDENTE',
  'Sem Padrinho': 'REJEITADO',
};

async function fixAfiliadosStatus() {
  console.log('🔄 Iniciando correção de status dos afiliados...\n');

  // Read CSV file
  const csvContent = fs.readFileSync('./reais/afiliados_rows.csv', 'utf-8');
  const lines = csvContent.trim().split('\n').map(line => line.replace(/\r$/, ''));
  const headers = lines[0].split(',').map(h => h.trim());

  const idIndex = headers.indexOf('id');
  const statusIndex = headers.indexOf('status');

  if (idIndex === -1 || statusIndex === -1) {
    throw new Error('Colunas id ou status não encontradas no CSV');
  }

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  const statusCounts = {
    'PENDENTE': 0,
    'APROVADO': 0,
    'REJEITADO': 0,
  };

  // Process each line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const values = line.split(',').map(v => v.trim());
    const id = values[idIndex];
    const originalStatus = values[statusIndex];

    if (!id) {
      console.log(`⚠️  Linha ${i + 1}: ID vazio, pulando...`);
      skipped++;
      continue;
    }

    // Map status
    const newStatus = statusMapping[originalStatus] || 'PENDENTE';
    statusCounts[newStatus]++;

    try {
      // Update status in database
      const { error } = await supabase
        .from('afiliados')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        console.error(`❌ Erro ao atualizar ${id}: ${error.message}`);
        errors++;
      } else {
        updated++;
        if (updated % 10 === 0) {
          console.log(`   Atualizados: ${updated}/${lines.length - 1}`);
        }
      }
    } catch (err) {
      console.error(`❌ Erro ao processar ${id}:`, err.message);
      errors++;
    }
  }

  console.log('\n✅ Correção concluída!\n');
  console.log('📊 Resumo:');
  console.log(`   Atualizados: ${updated}`);
  console.log(`   Pulados: ${skipped}`);
  console.log(`   Erros: ${errors}`);
  console.log('\n📈 Distribuição de Status:');
  console.log(`   PENDENTE: ${statusCounts.PENDENTE}`);
  console.log(`   APROVADO: ${statusCounts.APROVADO}`);
  console.log(`   REJEITADO: ${statusCounts.REJEITADO}`);
  console.log(`   TOTAL: ${statusCounts.PENDENTE + statusCounts.APROVADO + statusCounts.REJEITADO}`);
}

fixAfiliadosStatus()
  .then(() => {
    console.log('\n✅ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
