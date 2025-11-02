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

    // Fetch metrics in parallel
    const [
      totalPessoasFisicas,
      pessoasFisicasAtivas,
      totalPadrinhos,
      totalAfiliados,
      afiliadosPendentes,
      afiliadosAprovados,
      afiliadosRejeitados,
      codigosDisponiveis,
      codigosUsados,
    ] = await Promise.all([
      // Total Pessoas Físicas
      supabaseAdmin
        .from('pessoas_fisicas')
        .select('*', { count: 'exact', head: true }),

      // Pessoas Físicas Ativas
      supabaseAdmin
        .from('pessoas_fisicas')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true),

      // Total Padrinhos - pessoas que têm convites enviados, usados ou disponíveis
      supabaseAdmin
        .from('pessoas_fisicas')
        .select('*', { count: 'exact', head: true })
        .or('convites_enviados.gt.0,convites_disponiveis.gt.0,convites_usados.gt.0'),

      // Total Afiliados
      supabaseAdmin
        .from('afiliados')
        .select('*', { count: 'exact', head: true }),

      // Afiliados Pendentes
      supabaseAdmin
        .from('afiliados')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDENTE'),

      // Afiliados Aprovados
      supabaseAdmin
        .from('afiliados')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'APROVADO'),

      // Afiliados Rejeitados
      supabaseAdmin
        .from('afiliados')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'REJEITADO'),

      // Códigos Disponíveis
      supabaseAdmin
        .from('codigos_convite')
        .select('*', { count: 'exact', head: true })
        .eq('usado', false),

      // Códigos Usados
      supabaseAdmin
        .from('codigos_convite')
        .select('*', { count: 'exact', head: true })
        .eq('usado', true),
    ]);

    // Buscar distribuição por UF
    const { data: pessoasComUF } = await supabaseAdmin
      .from('pessoas_fisicas')
      .select('uf')
      .not('uf', 'is', null)
      .neq('uf', '');

    // Contar por UF
    const ufCount = new Map<string, number>();
    pessoasComUF?.forEach((pessoa) => {
      const uf = pessoa.uf?.trim();
      if (uf) {
        ufCount.set(uf, (ufCount.get(uf) || 0) + 1);
      }
    });

    // Top 5 UFs
    const topUFs = Array.from(ufCount.entries())
      .map(([uf, count]) => ({ uf, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const metrics = {
      totalPessoasFisicas: totalPessoasFisicas.count || 0,
      pessoasFisicasAtivas: pessoasFisicasAtivas.count || 0,
      pessoasFisicasInativas: (totalPessoasFisicas.count || 0) - (pessoasFisicasAtivas.count || 0),
      topUFs,
      totalPadrinhos: totalPadrinhos.count || 0,
      totalAfiliados: totalAfiliados.count || 0,
      afiliadosPendentes: afiliadosPendentes.count || 0,
      afiliadosAprovados: afiliadosAprovados.count || 0,
      afiliadosRejeitados: afiliadosRejeitados.count || 0,
      codigosDisponiveis: codigosDisponiveis.count || 0,
      codigosUsados: codigosUsados.count || 0,
    };

    return NextResponse.json(metrics);

  } catch (error: any) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
