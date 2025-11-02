import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // TEMPORARY: Auth disabled for development
    // TODO: Re-enable after creating admin user

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '100';

    // Build query
    let query = supabaseAdmin
      .from('afiliados')
      .select(`
        id,
        afiliado_id,
        padrinho_id,
        status,
        data_cadastro,
        data_aprovacao
      `)
      .order('data_cadastro', { ascending: false })
      .limit(parseInt(limit));

    // Apply status filter if provided
    if (status && status !== 'TODOS') {
      query = query.eq('status', status);
    }

    const { data: afiliados, error: afiliadosError } = await query;

    if (afiliadosError) throw afiliadosError;

    // Get pessoa_fisica data for each afiliado (nome, email) + padrinho nome
    const afiliadosWithDetails = await Promise.all(
      (afiliados || []).map(async (afiliado) => {
        // Get afiliado pessoa
        const { data: afiliadoPessoa } = await supabaseAdmin
          .from('pessoas_fisicas')
          .select('nome, email')
          .eq('id', afiliado.afiliado_id)
          .single();

        // Get padrinho pessoa
        const { data: padrinhoPessoa } = await supabaseAdmin
          .from('pessoas_fisicas')
          .select('nome')
          .eq('id', afiliado.padrinho_id)
          .maybeSingle();

        return {
          id: afiliado.id,
          nome: afiliadoPessoa?.nome || 'N/A',
          email: afiliadoPessoa?.email || 'N/A',
          status: afiliado.status,
          dataCadastro: afiliado.data_cadastro,
          dataAprovacao: afiliado.data_aprovacao,
          padrinhoNome: padrinhoPessoa?.nome || 'N/A',
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
