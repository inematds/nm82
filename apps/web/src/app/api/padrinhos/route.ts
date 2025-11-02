import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // TEMPORARY: Auth disabled for development
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    // Get all afiliados with padrinho info in ONE query
    const { data: afiliados, error: afiliadosError } = await supabaseAdmin
      .from('afiliados')
      .select('padrinho_id, status');

    if (afiliadosError) throw afiliadosError;

    // Group afiliados by padrinho
    const afiliadosByPadrinho = new Map<string, {
      total: number;
      pendentes: number;
      aprovados: number;
      rejeitados: number;
    }>();

    afiliados?.forEach((afiliado) => {
      const padrinhoId = afiliado.padrinho_id;
      if (!afiliadosByPadrinho.has(padrinhoId)) {
        afiliadosByPadrinho.set(padrinhoId, {
          total: 0,
          pendentes: 0,
          aprovados: 0,
          rejeitados: 0,
        });
      }

      const stats = afiliadosByPadrinho.get(padrinhoId)!;
      stats.total++;

      if (afiliado.status === 'PENDENTE') stats.pendentes++;
      else if (afiliado.status === 'APROVADO') stats.aprovados++;
      else if (afiliado.status === 'REJEITADO') stats.rejeitados++;
    });

    // Get all pessoas_fisicas that are padrinhos
    const { data: pessoas, error: pessoasError } = await supabaseAdmin
      .from('pessoas_fisicas')
      .select('*')
      .or('convites_enviados.gt.0,convites_disponiveis.gt.0,convites_usados.gt.0')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (pessoasError) throw pessoasError;

    // Build response with stats
    const padrinhosWithStats = (pessoas || []).map((pessoa) => {
      const stats = afiliadosByPadrinho.get(pessoa.id) || {
        total: 0,
        pendentes: 0,
        aprovados: 0,
        rejeitados: 0,
      };

      const enviados = pessoa.convites_enviados || 0;
      const usados = pessoa.convites_usados || 0;
      const disponiveis = enviados - usados; // Cálculo correto: enviados - usados

      return {
        id: pessoa.id,
        nome: pessoa.nome,
        email: pessoa.email,
        cpf: pessoa.cpf,
        nicho_atuacao: pessoa.nicho_atuacao,
        data_nascimento: pessoa.data_nascimento,
        sexo: pessoa.sexo,
        cidade: pessoa.cidade,
        uf: pessoa.uf,
        ativo: pessoa.ativo,
        convitesEnviados: enviados,
        convitesUsados: usados,
        convitesDisponiveis: disponiveis,
        totalAfiliados: stats.total,
        afiliadosPendentes: stats.pendentes,
        afiliadosAprovados: stats.aprovados,
        afiliadosRejeitados: stats.rejeitados,
        createdAt: pessoa.created_at,
      };
    });

    return NextResponse.json(padrinhosWithStats);
  } catch (error: any) {
    console.error('Error fetching padrinhos:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
