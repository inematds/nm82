import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const padrinhoId = params.id;

    // Get afiliados for this padrinho with pessoa_fisica info
    const { data: afiliados, error } = await supabaseAdmin
      .from('afiliados')
      .select(`
        id,
        status,
        data_cadastro,
        data_aprovacao,
        afiliado_id
      `)
      .eq('padrinho_id', padrinhoId)
      .order('data_cadastro', { ascending: false });

    if (error) throw error;

    // Get pessoa_fisica info for each afiliado
    const afiliadosWithPessoa = await Promise.all(
      (afiliados || []).map(async (afiliado) => {
        const { data: pessoa } = await supabaseAdmin
          .from('pessoas_fisicas')
          .select('nome, email')
          .eq('id', afiliado.afiliado_id)
          .single();

        return {
          id: afiliado.id,
          nome: pessoa?.nome || 'N/A',
          email: pessoa?.email || 'N/A',
          status: afiliado.status,
          dataCadastro: afiliado.data_cadastro,
          dataAprovacao: afiliado.data_aprovacao,
        };
      })
    );

    return NextResponse.json(afiliadosWithPessoa);
  } catch (error: any) {
    console.error('Error fetching afiliados:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
