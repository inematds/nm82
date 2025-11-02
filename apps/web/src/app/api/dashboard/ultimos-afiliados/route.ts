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

    // Get last 10 afiliados with their data (denormalized in afiliados table)
    const { data: afiliados, error: afiliadosError } = await supabaseAdmin
      .from('afiliados')
      .select('id, afiliado_id, padrinho_id, status, data_cadastro, data_email, nome, email, cidade, uf')
      .order('data_cadastro', { ascending: false })
      .limit(10);

    if (afiliadosError) {
      throw afiliadosError;
    }

    // Get padrinho data for each afiliado
    const afiliadosWithDetails = await Promise.all(
      (afiliados || []).map(async (afiliado) => {
        // Buscar dados do padrinho incluindo data_ultimo_pagamento
        const { data: padrinho } = await supabaseAdmin
          .from('pessoas_fisicas')
          .select('nome, cidade, uf, data_ultimo_pagamento')
          .eq('id', afiliado.padrinho_id)
          .single();

        // Formatar localização do afiliado (dados denormalizados)
        let localizacao = '-';
        if (afiliado.cidade && afiliado.uf) {
          localizacao = `${afiliado.cidade}, ${afiliado.uf}`;
        } else if (afiliado.uf) {
          localizacao = afiliado.uf;
        } else if (afiliado.cidade) {
          localizacao = afiliado.cidade;
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
          nome: afiliado.nome || 'N/A',
          email: afiliado.email || 'N/A',
          localizacao,
          padrinhoNome: padrinho?.nome || 'N/A',
          padrinhoLocalizacao,
          padrinhoDataUltimoPagamento: padrinho?.data_ultimo_pagamento || null,
          status: afiliado.status,
          dataCadastro: afiliado.data_cadastro,
          dataEmail: afiliado.data_email, // Substituído dataAprovacao por dataEmail
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
