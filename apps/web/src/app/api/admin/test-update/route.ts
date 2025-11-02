import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('🔍 Testando update de 1 registro...');

    // 1. Buscar a primeira pessoa
    const { data: pessoas, error: fetchError } = await supabaseAdmin
      .from('pessoas_fisicas')
      .select('id, nome, email')
      .limit(1);

    if (fetchError) {
      console.error('❌ Erro ao buscar:', fetchError);
      return NextResponse.json({ error: 'Erro ao buscar', details: fetchError }, { status: 500 });
    }

    if (!pessoas || pessoas.length === 0) {
      return NextResponse.json({ error: 'Nenhuma pessoa encontrada' }, { status: 404 });
    }

    const pessoa = pessoas[0];
    console.log('📄 Pessoa encontrada:', pessoa);

    // 2. Tentar atualizar
    const novoNome = 'TESTE ' + new Date().getTime();
    const novoEmail = `teste${Date.now()}@email.com`;

    console.log('📝 Tentando atualizar para:', { nome: novoNome, email: novoEmail });

    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('pessoas_fisicas')
      .update({
        nome: novoNome,
        email: novoEmail,
      })
      .eq('id', pessoa.id)
      .select();

    if (updateError) {
      console.error('❌ Erro ao atualizar:', updateError);
      return NextResponse.json({
        error: 'Erro ao atualizar',
        details: updateError,
        pessoa: pessoa
      }, { status: 500 });
    }

    console.log('✅ Update executado! Resposta:', updateData);

    // 3. Buscar novamente para confirmar
    const { data: pessoaAtualizada, error: refetchError } = await supabaseAdmin
      .from('pessoas_fisicas')
      .select('id, nome, email')
      .eq('id', pessoa.id)
      .single();

    if (refetchError) {
      console.error('❌ Erro ao buscar novamente:', refetchError);
    }

    console.log('🔄 Pessoa após update:', pessoaAtualizada);

    return NextResponse.json({
      success: true,
      antes: pessoa,
      updateResponse: updateData,
      depois: pessoaAtualizada,
      atualizado: pessoaAtualizada?.nome === novoNome && pessoaAtualizada?.email === novoEmail
    });

  } catch (error: any) {
    console.error('💥 Erro geral:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
