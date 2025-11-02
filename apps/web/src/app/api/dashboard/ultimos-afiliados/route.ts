import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // TEMPORARY: Auth disabled for development
    // TODO: Re-enable after creating admin user
    /*
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRoles = (session.user as any).roles || [];
    if (!userRoles.includes('ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    */

    // Get last 10 afiliados with their pessoa_fisica data
    const { data: afiliados, error: afiliadosError } = await supabaseAdmin
      .from('afiliados')
      .select('id, afiliado_id, padrinho_id, status, data_cadastro, data_aprovacao')
      .order('data_cadastro', { ascending: false })
      .limit(10);

    if (afiliadosError) {
      throw afiliadosError;
    }

    // Get pessoa_fisica data for each afiliado
    const afiliadosWithDetails = await Promise.all(
      (afiliados || []).map(async (afiliado) => {
        // Buscar dados do afiliado (pessoa física)
        const { data: pessoa } = await supabaseAdmin
          .from('pessoas_fisicas')
          .select('nome, email, cidade, uf')
          .eq('id', afiliado.afiliado_id)
          .single();

        // Buscar dados do padrinho
        const { data: padrinho } = await supabaseAdmin
          .from('pessoas_fisicas')
          .select('nome, cidade, uf')
          .eq('id', afiliado.padrinho_id)
          .single();

        // Formatar localização do afiliado
        let localizacao = '-';
        if (pessoa?.cidade && pessoa?.uf) {
          localizacao = `${pessoa.cidade}, ${pessoa.uf}`;
        } else if (pessoa?.uf) {
          localizacao = pessoa.uf;
        } else if (pessoa?.cidade) {
          localizacao = pessoa.cidade;
        }

        // Formatar localização do padrinho
        let padrinhoLocalizacao = '';
        if (padrinho?.cidade && padrinho?.uf) {
          padrinhoLocalizacao = `${padrinho.cidade}, ${padrinho.uf}`;
        } else if (padrinho?.uf) {
          padrinhoLocalizacao = padrinho.uf;
        } else if (padrinho?.cidade) {
          padrinhoLocalizacao = padrinho.cidade;
        }

        return {
          id: afiliado.id,
          nome: pessoa?.nome || 'N/A',
          email: pessoa?.email || 'N/A',
          localizacao,
          padrinhoNome: padrinho?.nome || 'N/A',
          padrinhoLocalizacao,
          status: afiliado.status,
          dataCadastro: afiliado.data_cadastro,
          dataAprovacao: afiliado.data_aprovacao,
        };
      })
    );

    return NextResponse.json(afiliadosWithDetails);

  } catch (error: any) {
    console.error('Error fetching últimos afiliados:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
