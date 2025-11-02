// Import ONLY pagamentos CSV
require('dotenv').config({ path: './apps/web/.env' });

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CSV parser helper - handles Windows line endings
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n').map(line => line.replace(/\r$/, ''));
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, index) => {
      const value = values[index]?.trim();
      obj[header] = value === '' || value === 'null' || value === undefined ? null : value;
    });
    return obj;
  });
}

async function importPagamentos() {
  console.log('\n📦 Importing pagamentos...');

  const data = parseCSV('./reais/pagamentos_rows.csv');

  console.log(`   Found ${data.length} records`);

  // Debug: show first record
  if (data.length > 0) {
    console.log('   First record columns:', Object.keys(data[0]));
    console.log('   Sample email:', data[0].email);
    console.log('   Sample valor:', data[0].valor);
  }

  // Helper to parse dates safely
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date.toISOString();
    } catch {
      return null;
    }
  };

  // Transform data
  const transformed = data
    .filter(row => row.email && row.valor)
    .map(row => {
      // Determine tipo_pagamento
      let tipoPagamento = 'MENSAL';
      if (row.tipo_assinatura) {
        tipoPagamento = row.tipo_assinatura.toLowerCase() === 'anual' ? 'ANUAL' : 'MENSAL';
      } else {
        const valor = parseFloat(row.valor);
        tipoPagamento = valor >= 100 ? 'ANUAL' : 'MENSAL';
      }

      return {
        id: row.id,
        email: row.email.trim(),
        valor: parseFloat(row.valor),
        data_pagamento: parseDate(row.data_pagamento) || new Date().toISOString(),
        tipo_pagamento: tipoPagamento,
        status: 'CONFIRMADO',
        comprovante: row.arquivo_comprovante || null,
        observacoes: row.tipo_pagamento ? `Importado - Método: ${row.tipo_pagamento}` : null,
        confirmed_by: null,
        created_at: parseDate(row.criado_em) || new Date().toISOString(),
      };
    });

  console.log(`   ${transformed.length} valid pagamentos`);

  if (transformed.length === 0) {
    console.error('   ❌ No valid pagamentos to import! Check CSV format.');
    return;
  }

  const batchSize = 100;
  let imported = 0;

  for (let i = 0; i < transformed.length; i += batchSize) {
    const batch = transformed.slice(i, i + batchSize);

    const { error } = await supabase
      .from('pagamentos')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`   ❌ Error in batch ${i / batchSize + 1}:`, error.message);
      console.error('   Sample record causing error:', JSON.stringify(batch[0], null, 2));
    } else {
      imported += batch.length;
      console.log(`   ✅ Imported ${imported}/${transformed.length}`);
    }
  }

  console.log(`✅ pagamentos complete: ${imported} imported`);
}

importPagamentos()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
