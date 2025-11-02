// Import afiliados - creates pessoa_fisica if doesn't exist
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

async function importAfiliados() {
  console.log('\n📦 Importing afiliados (with pessoa_fisica creation)...');

  const data = parseCSV('./reais/afiliados_rows.csv');

  console.log(`   Found ${data.length} records`);

  // Helper to parse dates
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date.toISOString();
    } catch {
      return null;
    }
  };

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of data) {
    try {
      // Skip if missing essential data
      if (!row.email || !row.padrinho_id) {
        console.log(`   ⚠️  Skipping - missing email or padrinho_id:`, row.nome || 'N/A');
        skipped++;
        continue;
      }

      const email = row.email.toLowerCase().trim();

      // 1. Find or create pessoa_fisica
      let { data: pessoa, error: pessoaError } = await supabase
        .from('pessoas_fisicas')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      let pessoaId;

      if (!pessoa) {
        // Create pessoa_fisica from afiliado data
        console.log(`   ➕ Creating pessoa for: ${row.nome} (${email})`);

        const novaPessoa = {
          id: require('crypto').randomUUID(),
          nome: row.nome || 'N/A',
          email: email,
          cpf: row.cpf || null,
          data_nascimento: parseDate(row.data_nascimento),
          sexo: row.sexo || null,
          cidade: row.cidade || null,
          uf: row.uf || null,
          nicho_atuacao: row.nicho_atuacao || null,
          convites_enviados: 0,
          convites_usados: 0,
          convites_disponiveis: 0, // Afiliado doesn't get invites
          ativo: true,
          created_at: parseDate(row.data_cadastro) || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: pessoaCriada, error: createError } = await supabase
          .from('pessoas_fisicas')
          .insert(novaPessoa)
          .select()
          .single();

        if (createError) {
          console.error(`   ❌ Error creating pessoa for ${email}:`, createError.message);
          skipped++;
          continue;
        }

        pessoaId = pessoaCriada.id;
      } else {
        pessoaId = pessoa.id;
      }

      // 2. Create or update afiliado
      const afiliado = {
        id: row.id,
        afiliado_id: pessoaId,
        padrinho_id: row.padrinho_id,
        status: row.status === 'Enviado' || row.status === 'Aprovado' ? 'APROVADO' : 'PENDENTE',
        motivo_rejeicao: null,
        data_cadastro: parseDate(row.data_cadastro) || new Date().toISOString(),
        data_aprovacao: row.status === 'Enviado' || row.status === 'Aprovado'
          ? parseDate(row.data_email || row.data_cadastro)
          : null,
        email_enviado: row.email_enviado === 'true' || row.email_enviado === 'True',
        codigo_convite_id: null, // Will be assigned later if needed
      };

      const { error: afiliadoError } = await supabase
        .from('afiliados')
        .upsert(afiliado, { onConflict: 'id' });

      if (afiliadoError) {
        console.error(`   ❌ Error creating afiliado for ${email}:`, afiliadoError.message);
        skipped++;
      } else {
        if (!pessoa) {
          created++;
          if (created % 10 === 0) {
            console.log(`   ✅ Progress: ${created} created, ${updated} updated`);
          }
        } else {
          updated++;
        }
      }

    } catch (error) {
      console.error(`   ❌ Unexpected error:`, error.message);
      skipped++;
    }
  }

  console.log(`\n✅ afiliados import complete:`);
  console.log(`   ${created} new pessoas + afiliados created`);
  console.log(`   ${updated} existing afiliados updated`);
  console.log(`   ${skipped} skipped (errors or missing data)`);
  console.log(`   Total: ${created + updated}/${data.length} processed`);
}

importAfiliados()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
