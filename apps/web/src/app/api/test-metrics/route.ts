import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// TEMPORARY endpoint to test data access - REMOVE after auth is working
export async function GET() {
  try {
    const [
      totalPadrinhos,
      totalAfiliados,
      afiliadosPendentes,
      codigosDisponiveis,
      pagamentosPendentes,
      receitaTotal,
    ] = await Promise.all([
      // Total Padrinhos (pessoas_fisicas with role PADRINHO)
      supabaseAdmin
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'PADRINHO'),

      // Total Afiliados
      supabaseAdmin
        .from('afiliados')
        .select('*', { count: 'exact', head: true }),

      // Afiliados Pendentes
      supabaseAdmin
        .from('afiliados')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDENTE'),

      // Códigos Disponíveis
      supabaseAdmin
        .from('codigos_convite')
        .select('*', { count: 'exact', head: true })
        .eq('usado', false),

      // Pagamentos Pendentes
      supabaseAdmin
        .from('pagamentos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDENTE'),

      // Receita Total (sum of pagamentos confirmados)
      supabaseAdmin
        .from('pagamentos')
        .select('valor')
        .eq('status', 'CONFIRMADO'),
    ]);

    // Calculate receita total
    const receita = receitaTotal.data?.reduce(
      (sum, p) => sum + parseFloat(p.valor as any),
      0
    ) || 0;

    const metrics = {
      totalPadrinhos: totalPadrinhos.count || 0,
      totalAfiliados: totalAfiliados.count || 0,
      afiliadosPendentes: afiliadosPendentes.count || 0,
      codigosDisponiveis: codigosDisponiveis.count || 0,
      pagamentosPendentes: pagamentosPendentes.count || 0,
      receitaTotal: receita,
    };

    return NextResponse.json({
      success: true,
      metrics,
      note: 'TEMPORARY - Remove after auth working'
    });

  } catch (error: any) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
