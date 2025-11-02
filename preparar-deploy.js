const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');

console.log('🚀 PREPARANDO PROJETO PARA DEPLOY\n');

// 1. Gerar NEXTAUTH_SECRET
console.log('🔐 Gerando NEXTAUTH_SECRET...');
const nextauthSecret = crypto.randomBytes(32).toString('base64');
console.log(`   ✅ Secret gerado: ${nextauthSecret}\n`);

// 2. Verificar arquivos essenciais
console.log('📋 Verificando arquivos essenciais...');
const essentialFiles = [
  'package.json',
  'apps/web/package.json',
  'apps/web/next.config.mjs',
  'vercel.json',
  '.gitignore'
];

let allFilesExist = true;
essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - FALTANDO!`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Alguns arquivos essenciais estão faltando!\n');
  process.exit(1);
}

console.log('\n✅ Todos os arquivos essenciais encontrados!\n');

// 3. Testar build local
console.log('🔨 Testando build de produção...');
console.log('   (Isso pode levar alguns minutos)\n');

try {
  console.log('   📦 Instalando dependências...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('\n   🏗️  Fazendo build...');
  execSync('cd apps/web && npm run build', { stdio: 'inherit' });

  console.log('\n   ✅ Build concluído com sucesso!\n');
} catch (error) {
  console.log('\n   ❌ Erro no build!');
  console.log('   Corrija os erros acima antes de fazer deploy.\n');
  process.exit(1);
}

// 4. Mostrar variáveis de ambiente necessárias
console.log('📝 VARIÁVEIS DE AMBIENTE PARA CONFIGURAR NA VERCEL:\n');
console.log('─'.repeat(60));
console.log('NEXT_PUBLIC_SUPABASE_URL=https://xetowlvhhnxewvglxklo.supabase.co');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldG93bHZoaG54ZXd2Z2x4a2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzAwNzYsImV4cCI6MjA3NzY0NjA3Nn0.7iBFO1s-jQfnpI4iS646SBofpliptNxrwFBAwEvWD1U');
console.log('SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldG93bHZoaG54ZXd2Z2x4a2xvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA3MDA3NiwiZXhwIjoyMDc3NjQ2MDc2fQ.ez6zCnr4Of6WFijcBPKMuLOGCNe3PUBLsUQ7rbEyzMk');
console.log(`NEXTAUTH_SECRET=${nextauthSecret}`);
console.log('NEXTAUTH_URL=https://SEU-PROJETO.vercel.app');
console.log('─'.repeat(60));

// 5. Próximos passos
console.log('\n✅ PROJETO PRONTO PARA DEPLOY!\n');
console.log('📋 PRÓXIMOS PASSOS:\n');
console.log('1. Commitar o código:');
console.log('   git add .');
console.log('   git commit -m "feat: Preparar para deploy em produção"');
console.log('   git push\n');
console.log('2. Acessar https://vercel.com');
console.log('3. Importar repositório do GitHub');
console.log('4. Configurar Root Directory como: apps/web');
console.log('5. Adicionar as variáveis de ambiente acima');
console.log('6. Clicar em Deploy\n');
console.log('📖 Leia o arquivo GUIA-DEPLOY-VERCEL.md para mais detalhes!\n');

// Salvar variáveis em arquivo para referência
const envContent = `# VARIÁVEIS DE AMBIENTE PARA VERCEL
# Copie e cole estas variáveis no painel da Vercel

NEXT_PUBLIC_SUPABASE_URL=https://xetowlvhhnxewvglxklo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldG93bHZoaG54ZXd2Z2x4a2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzAwNzYsImV4cCI6MjA3NzY0NjA3Nn0.7iBFO1s-jQfnpI4iS646SBofpliptNxrwFBAwEvWD1U
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldG93bHZoaG54ZXd2Z2x4a2xvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA3MDA3NiwiZXhwIjoyMDc3NjQ2MDc2fQ.ez6zCnr4Of6WFijcBPKMuLOGCNe3PUBLsUQ7rbEyzMk
NEXTAUTH_SECRET=${nextauthSecret}
NEXTAUTH_URL=https://SEU-PROJETO.vercel.app

# IMPORTANTE: Após criar o projeto na Vercel, atualize NEXTAUTH_URL com a URL real
`;

fs.writeFileSync('.env.production', envContent);
console.log('💾 Variáveis salvas em .env.production (não será commitado)\n');
