import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Count total padrinhos
    const { count: totalPadrinhos } = await supabaseAdmin
      .from('pessoas_fisicas')
      .select('*', { count: 'exact', head: true })
      .or('convites_enviados.gt.0,convites_disponiveis.gt.0,convites_usados.gt.0');

    // Get sum of convites
    const { data: pessoas } = await supabaseAdmin
      .from('pessoas_fisicas')
      .select('convites_enviados, convites_usados')
      .or('convites_enviados.gt.0,convites_usados.gt.0');

    let totalEnviados = 0;
    let totalUsados = 0;

    pessoas?.forEach((p) => {
      totalEnviados += p.convites_enviados || 0;
      totalUsados += p.convites_usados || 0;
    });

    // Cálculo correto: disponíveis = enviados - usados
    const totalDisponiveis = totalEnviados - totalUsados;

    // Get afiliados stats
    const { data: afiliados } = await supabaseAdmin
      .from('afiliados')
      .select('status');

    let afiliadosTotal = afiliados?.length || 0;
    let afiliadosPendentes = 0;
    let afiliadosAprovados = 0;
    let afiliadosRejeitados = 0;

    afiliados?.forEach((a) => {
      if (a.status === 'PENDENTE') afiliadosPendentes++;
      else if (a.status === 'APROVADO') afiliadosAprovados++;
      else if (a.status === 'REJEITADO') afiliadosRejeitados++;
    });

    return NextResponse.json({
      totalPadrinhos: totalPadrinhos || 0,
      convites: {
        enviados: totalEnviados,
        usados: totalUsados,
        disponiveis: totalDisponiveis,
      },
      afiliados: {
        total: afiliadosTotal,
        pendentes: afiliadosPendentes,
        aprovados: afiliadosAprovados,
        rejeitados: afiliadosRejeitados,
      },
    });
  } catch (error: any) {
    console.error('Error fetching padrinhos stats:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
