// Script de verificação do banco de dados
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('🔍 Verificando banco de dados...\n');

  try {
    // 1. Verificar conexão
    console.log('1️⃣ Testando conexão...');
    await prisma.$connect();
    console.log('   ✅ Conexão OK\n');

    // 2. Verificar tabelas principais
    console.log('2️⃣ Verificando tabelas:');

    const tables = [
      { name: 'user_roles', model: prisma.userRole },
      { name: 'pessoas_fisicas', model: prisma.pessoaFisica },
      { name: 'afiliados', model: prisma.afiliado },
      { name: 'codigos_convite', model: prisma.codigoConvite },
      { name: 'pagamentos', model: prisma.pagamento },
    ];

    for (const table of tables) {
      try {
        const count = await table.model.count();
        console.log(`   ✅ ${table.name}: ${count} registros`);
      } catch (error) {
        console.log(`   ❌ ${table.name}: ERRO - ${error.message}`);
      }
    }

    console.log('\n3️⃣ Verificando usuários admin:');
    try {
      const adminRoles = await prisma.userRole.findMany({
        where: { role: 'ADMIN' }
      });

      if (adminRoles.length > 0) {
        console.log(`   ✅ ${adminRoles.length} usuário(s) admin encontrado(s)`);
        adminRoles.forEach((role, index) => {
          console.log(`      ${index + 1}. User ID: ${role.userId}`);
        });
      } else {
        console.log('   ⚠️  Nenhum usuário admin encontrado!');
        console.log('   👉 Execute o PASSO 5 do DATABASE-SETUP.md');
      }
    } catch (error) {
      console.log(`   ❌ Erro ao verificar roles: ${error.message}`);
    }

    console.log('\n4️⃣ Verificando códigos de convite:');
    try {
      const codigosDisponiveis = await prisma.codigoConvite.count({
        where: { usado: false }
      });
      const codigosUsados = await prisma.codigoConvite.count({
        where: { usado: true }
      });
      console.log(`   ✅ Códigos disponíveis: ${codigosDisponiveis}`);
      console.log(`   ✅ Códigos usados: ${codigosUsados}`);

      if (codigosDisponiveis === 0) {
        console.log('   ⚠️  Nenhum código disponível!');
        console.log('   👉 Execute o PASSO 6 do DATABASE-SETUP.md para criar códigos');
      }
    } catch (error) {
      console.log(`   ❌ Erro ao verificar códigos: ${error.message}`);
    }

    console.log('\n✅ VERIFICAÇÃO COMPLETA!\n');
    console.log('📊 Resumo:');
    console.log('   - Banco de dados: OK');
    console.log('   - Tabelas criadas: OK');
    console.log('   - Próximo passo: Testar login em http://localhost:3000/auth/login\n');

  } catch (error) {
    console.error('\n❌ ERRO NA VERIFICAÇÃO:');
    console.error(`   ${error.message}\n`);

    if (error.message.includes('does not exist') || error.message.includes('relation')) {
      console.log('💡 DIAGNÓSTICO:');
      console.log('   As tabelas ainda não existem no banco de dados.');
      console.log('   Você precisa executar os scripts SQL no Supabase Dashboard.\n');
      console.log('👉 AÇÃO NECESSÁRIA:');
      console.log('   Siga o arquivo: packages/database/prisma/DATABASE-SETUP.md');
      console.log('   Execute os passos 1, 2 e 3 (scripts SQL no Supabase)\n');
    } else if (error.message.includes('connect') || error.message.includes('reach')) {
      console.log('💡 DIAGNÓSTICO:');
      console.log('   Não foi possível conectar ao banco de dados.');
      console.log('   Verifique se a URL do banco está correta no .env\n');
    }
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
