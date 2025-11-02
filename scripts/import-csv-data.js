// Import CSV data to Supabase
require('dotenv').config({ path: './apps/web/.env' });

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Make sure to run this from the root with .env loaded');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CSV parser helper - handles Windows line endings (\r\n)
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Split by \n and remove \r from each line
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

async function importPessoasFisicas() {
  console.log('\n📦 Importing pessoas_fisicas...');

  const data = parseCSV('./reais/pessoas_fisicas_rows.csv');

  console.log(`   Found ${data.length} records`);

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

  // Transform data to match schema (snake_case for Supabase)
  const transformed = data.map(row => ({
    id: row.id,
    nome: row.nome || 'N/A',
    email: row.email,
    cpf: row.cpf,
    data_nascimento: parseDate(row.data_nascimento),
    sexo: row.sexo,
    cidade: row.cidade,
    uf: null, // Not in CSV
    nicho_atuacao: null, // Not in CSV
    convites_enviados: parseInt(row.convites_enviados) || 0,
    convites_usados: parseInt(row.convites_usados) || 0,
    convites_disponiveis: parseInt(row.convites_dtatual) || 0,
    ativo: row.ativo === 'true' || row.ativo === '1',
    created_at: parseDate(row.data_cadastro) || new Date().toISOString(),
    updated_at: parseDate(row.atualizado_em) || new Date().toISOString(),
  }));

  // Insert in batches of 100
  const batchSize = 100;
  let imported = 0;

  for (let i = 0; i < transformed.length; i += batchSize) {
    const batch = transformed.slice(i, i + batchSize);

    const { error } = await supabase
      .from('pessoas_fisicas')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`   ❌ Error in batch ${i / batchSize + 1}:`, error.message);
    } else {
      imported += batch.length;
      console.log(`   ✅ Imported ${imported}/${transformed.length}`);
    }
  }

  console.log(`✅ pessoas_fisicas complete: ${imported} imported`);
}

async function importAfiliados() {
  console.log('\n📦 Importing afiliados...');

  const data = parseCSV('./reais/afiliados_rows.csv');

  console.log(`   Found ${data.length} records`);

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

  // Build email-to-id lookup map from pessoas_fisicas
  console.log('   Building email lookup map...');
  const { data: pessoas, error: pessoasError } = await supabase
    .from('pessoas_fisicas')
    .select('id, email');

  if (pessoasError) {
    console.error('   ❌ Failed to fetch pessoas_fisicas:', pessoasError.message);
    return;
  }

  const emailToId = new Map();
  pessoas.forEach(p => {
    if (p.email) emailToId.set(p.email.toLowerCase(), p.id);
  });

  console.log(`   Found ${emailToId.size} pessoas with emails`);

  // Transform data (snake_case for Supabase)
  const transformed = data
    .filter(row => row.email && row.padrinho_id) // Must have email and padrinho
    .map(row => {
      const afiliadoId = emailToId.get(row.email.toLowerCase());
      if (!afiliadoId) {
        console.log(`   ⚠️  No pessoa found for email: ${row.email}`);
        return null;
      }

      return {
        id: row.id,
        afiliado_id: afiliadoId, // Matched from pessoas_fisicas
        padrinho_id: row.padrinho_id,
        status: row.status === 'Enviado' || row.status === 'Aprovado' ? 'APROVADO' : 'PENDENTE',
        motivo_rejeicao: null,
        data_cadastro: parseDate(row.data_cadastro) || new Date().toISOString(),
        data_aprovacao: row.status === 'Enviado' || row.status === 'Aprovado' ? parseDate(row.data_email || row.data_cadastro) : null,
        email_enviado: row.email_enviado === 'true' || row.email_enviado === '1',
        codigo_convite_id: null, // Will be assigned later if needed
      };
    })
    .filter(row => row !== null); // Remove unmatched entries

  console.log(`   ${transformed.length} valid afiliados (filtered from ${data.length})`);

  const batchSize = 100;
  let imported = 0;

  for (let i = 0; i < transformed.length; i += batchSize) {
    const batch = transformed.slice(i, i + batchSize);

    const { error } = await supabase
      .from('afiliados')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`   ❌ Error in batch ${i / batchSize + 1}:`, error.message);
    } else {
      imported += batch.length;
      console.log(`   ✅ Imported ${imported}/${transformed.length}`);
    }
  }

  console.log(`✅ afiliados complete: ${imported} imported`);
}

async function importCodigos() {
  console.log('\n📦 Importing codigos_convite...');

  const data = parseCSV('./reais/codigos_convite_rows.csv');

  console.log(`   Found ${data.length} records`);

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

  const transformed = data.map(row => ({
    id: row.id,
    codigo: row.codigo,
    email: row.email,
    usado: !!row.email, // If email exists, it's used
    data_atribuicao: parseDate(row.data),
    data_expiracao: null, // Not in CSV
    created_at: parseDate(row.atualizado_em) || new Date().toISOString(),
  }));

  const batchSize = 100;
  let imported = 0;

  for (let i = 0; i < transformed.length; i += batchSize) {
    const batch = transformed.slice(i, i + batchSize);

    const { error } = await supabase
      .from('codigos_convite')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`   ❌ Error in batch ${i / batchSize + 1}:`, error.message);
    } else {
      imported += batch.length;
      console.log(`   ✅ Imported ${imported}/${transformed.length}`);
    }
  }

  console.log(`✅ codigos_convite complete: ${imported} imported`);
}

async function importPagamentos() {
  console.log('\n📦 Importing pagamentos...');

  const data = parseCSV('./reais/pagamentos_rows.csv');

  console.log(`   Found ${data.length} records`);

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

  // Transform data to match schema (snake_case for Supabase)
  const transformed = data
    .filter(row => row.email && row.valor) // Must have email and valor
    .map(row => {
      // Determine tipo_pagamento based on tipo_assinatura
      let tipoPagamento = 'MENSAL';
      if (row.tipo_assinatura) {
        tipoPagamento = row.tipo_assinatura.toLowerCase() === 'anual' ? 'ANUAL' : 'MENSAL';
      } else {
        // Fallback: if valor >= 100, assume ANUAL
        const valor = parseFloat(row.valor);
        tipoPagamento = valor >= 100 ? 'ANUAL' : 'MENSAL';
      }

      return {
        id: row.id,
        email: row.email.trim(),
        valor: parseFloat(row.valor),
        data_pagamento: parseDate(row.data_pagamento) || new Date().toISOString(),
        tipo_pagamento: tipoPagamento,
        status: 'CONFIRMADO', // Assume all imported payments are confirmed
        comprovante: row.arquivo_comprovante || null,
        observacoes: row.tipo_pagamento ? `Importado - Método: ${row.tipo_pagamento}` : null,
        confirmed_by: null, // No admin user yet
        created_at: parseDate(row.criado_em) || new Date().toISOString(),
      };
    });

  console.log(`   ${transformed.length} valid pagamentos (filtered from ${data.length})`);

  const batchSize = 100;
  let imported = 0;

  for (let i = 0; i < transformed.length; i += batchSize) {
    const batch = transformed.slice(i, i + batchSize);

    const { error } = await supabase
      .from('pagamentos')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`   ❌ Error in batch ${i / batchSize + 1}:`, error.message);
    } else {
      imported += batch.length;
      console.log(`   ✅ Imported ${imported}/${transformed.length}`);
    }
  }

  console.log(`✅ pagamentos complete: ${imported} imported`);
}

async function main() {
  console.log('🚀 Starting CSV import to Supabase...\n');
  console.log(`Supabase URL: ${supabaseUrl}`);

  try {
    // Import in order
    await importPessoasFisicas();
    await importCodigos();
    await importAfiliados();
    await importPagamentos();

    console.log('\n✅ Import complete!');
    console.log('\n📊 Verification:');
    console.log('   Check Supabase Dashboard → Database → Tables');
    console.log('   Refresh the dashboard at http://localhost:3002/dashboard');

  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

main();
