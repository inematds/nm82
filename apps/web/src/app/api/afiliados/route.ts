import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // TEMPORARY: Auth disabled for development
    // TODO: Re-enable after creating admin user

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '100';

    // Build query - dados do afiliado estão denormalizados na tabela afiliados
    let query = supabaseAdmin
      .from('afiliados')
      .select(`
        id,
        afiliado_id,
        padrinho_id,
        status,
        data_cadastro,
        data_email,
        nome,
        email,
        cpf,
        data_nascimento,
        sexo,
        cidade,
        uf,
        nicho_atuacao,
        telefone
      `)
      .order('data_cadastro', { ascending: false })
      .limit(parseInt(limit));

    // Apply status filter if provided
    if (status && status !== 'TODOS') {
      query = query.eq('status', status);
    }

    const { data: afiliados, error: afiliadosError } = await query;

    if (afiliadosError) throw afiliadosError;

    // Get padrinho nome for each afiliado
    const afiliadosWithDetails = await Promise.all(
      (afiliados || []).map(async (afiliado) => {
        // Get padrinho pessoa com data do ultimo pagamento
        const { data: padrinhoPessoa } = await supabaseAdmin
          .from('pessoas_fisicas')
          .select('nome, data_ultimo_pagamento')
          .eq('id', afiliado.padrinho_id)
          .maybeSingle();

        return {
          id: afiliado.id,
          afiliadoId: afiliado.afiliado_id,
          padrinhoId: afiliado.padrinho_id,
          nome: afiliado.nome || 'N/A',
          email: afiliado.email || 'N/A',
          cpf: afiliado.cpf,
          dataNascimento: afiliado.data_nascimento,
          sexo: afiliado.sexo,
          cidade: afiliado.cidade,
          uf: afiliado.uf,
          nichoAtuacao: afiliado.nicho_atuacao,
          telefone: afiliado.telefone,
          status: afiliado.status,
          dataCadastro: afiliado.data_cadastro,
          dataEmail: afiliado.data_email,
          padrinhoNome: padrinhoPessoa?.nome || 'N/A',
          padrinhoDataUltimoPagamento: padrinhoPessoa?.data_ultimo_pagamento || null,
        };
      })
    );

    return NextResponse.json(afiliadosWithDetails);
  } catch (error: any) {
    console.error('Error fetching afiliados:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
