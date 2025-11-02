import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Listas de nomes e sobrenomes para gerar nomes falsos
const primeirosNomes = [
  'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Juliana', 'Lucas', 'Fernanda',
  'Rafael', 'Camila', 'Bruno', 'Patricia', 'Rodrigo', 'Amanda', 'Gustavo', 'Beatriz',
  'Felipe', 'Larissa', 'Marcelo', 'Carla', 'André', 'Renata', 'Paulo', 'Mariana',
  'Ricardo', 'Tatiana', 'Diego', 'Gabriela', 'Vitor', 'Aline', 'Thiago', 'Daniela',
  'Leandro', 'Vanessa', 'Alexandre', 'Priscila', 'Matheus', 'Sandra', 'Leonardo', 'Luciana',
  'Gabriel', 'Claudia', 'Henrique', 'Cristina', 'Fabio', 'Monica', 'Roberto', 'Adriana',
  'Daniel', 'Simone', 'Marcio', 'Silvia', 'Eduardo', 'Elaine', 'Anderson', 'Viviane',
  'Fernando', 'Rosana', 'Cesar', 'Denise', 'Sergio', 'Sabrina', 'Ivan', 'Roberta',
];

const sobrenomes = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
  'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Rocha', 'Almeida',
  'Nascimento', 'Araújo', 'Melo', 'Barbosa', 'Cardoso', 'Correia', 'Dias', 'Teixeira',
  'Moreira', 'Fernandes', 'Monteiro', 'Mendes', 'Barros', 'Freitas', 'Pinto', 'Castro',
  'Moura', 'Campos', 'Ramos', 'Cavalcanti', 'Soares', 'Nunes', 'Vieira', 'Miranda',
  'Azevedo', 'Braga', 'Cunha', 'Farias', 'Lopes', 'Machado', 'Nogueira', 'Pinheiro',
];

function gerarNomeFalso(index: number): string {
  const primeiroNome = primeirosNomes[index % primeirosNomes.length];
  const sobrenome1 = sobrenomes[Math.floor(index / primeirosNomes.length) % sobrenomes.length];
  const sobrenome2 = sobrenomes[(index * 7) % sobrenomes.length];
  return `${primeiroNome} ${sobrenome1} ${sobrenome2}`;
}

function gerarEmailFalso(nome: string, index: number): string {
  const nomeLimpo = nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, '.');

  const dominio = ['email.com', 'teste.com', 'exemplo.com', 'demo.com'][index % 4];

  // SEMPRE adicionar o index para garantir unicidade
  return `${nomeLimpo}.${index}@${dominio}`;
}

export async function POST() {
  try {
    // TEMPORARY: Auth disabled for development
    // In production, add proper auth check here

    console.log('Iniciando anonimização de dados...');

    // 1. Buscar TODAS as pessoas_fisicas em lotes (Supabase limita a 1000 por query)
    let allPessoas: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: pessoasBatch, error: fetchError } = await supabaseAdmin
        .from('pessoas_fisicas')
        .select('id')
        .order('created_at', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (fetchError) throw fetchError;

      if (!pessoasBatch || pessoasBatch.length === 0) {
        hasMore = false;
      } else {
        allPessoas = allPessoas.concat(pessoasBatch);
        console.log(`Buscado lote ${page + 1}: ${pessoasBatch.length} registros (Total: ${allPessoas.length})`);

        if (pessoasBatch.length < pageSize) {
          hasMore = false;
        }
        page++;
      }
    }

    const pessoas = allPessoas;

    if (!pessoas || pessoas.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Nenhuma pessoa encontrada',
      });
    }

    console.log(`✅ Total de ${pessoas.length} pessoas para anonimizar`);

    // 2. Atualizar em lotes de 100 para melhor performance
    const batchSize = 100;
    let updated = 0;
    let errors = 0;

    for (let i = 0; i < pessoas.length; i += batchSize) {
      const batch = pessoas.slice(i, i + batchSize);

      // Preparar updates em paralelo para este lote
      const updatePromises = batch.map((pessoa, indexInBatch) => {
        const globalIndex = i + indexInBatch;
        const nomeFalso = gerarNomeFalso(globalIndex);
        const emailFalso = gerarEmailFalso(nomeFalso, globalIndex);

        return supabaseAdmin
          .from('pessoas_fisicas')
          .update({
            nome: nomeFalso,
            email: emailFalso,
          })
          .eq('id', pessoa.id);
      });

      // Executar todas as atualizações do lote em paralelo
      const results = await Promise.allSettled(updatePromises);

      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          if (result.value.error) {
            errors++;
            console.error(`❌ Erro ao atualizar registro ${i + idx}:`, result.value.error);
          } else {
            updated++;
            // Log de sucesso para os primeiros registros
            if (updated <= 5) {
              console.log(`✅ Registro ${i + idx} atualizado com sucesso`);
            }
          }
        } else {
          errors++;
          console.error(`❌ Promise rejeitada ${i + idx}:`, result.reason);
        }
      });

      console.log(`Progresso: ${Math.min(i + batchSize, pessoas.length)}/${pessoas.length}`);
    }

    console.log('Anonimização concluída!');

    return NextResponse.json({
      success: true,
      message: `Dados anonimizados com sucesso!`,
      stats: {
        total: pessoas.length,
        updated,
        errors,
      },
    });
  } catch (error: any) {
    console.error('Error anonymizing data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}
