import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Get all afiliados to calculate stats
    const { data: afiliados, error } = await supabaseAdmin
      .from('afiliados')
      .select('status');

    if (error) throw error;

    // Count by status
    const statusCounts: Record<string, number> = {};

    afiliados?.forEach((afiliado) => {
      const status = afiliado.status || 'desconhecido';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Calculate totals
    const total = afiliados?.length || 0;

    return NextResponse.json({
      total,
      byStatus: statusCounts,
      // Breakdown by specific statuses
      pendente: statusCounts['pendente'] || 0,
      enviado: statusCounts['Enviado'] || 0,
      jaCadastrado: statusCounts['Já Cadastrado'] || 0,
      rejeitado: statusCounts['Rejeitado'] || 0,
    });
  } catch (error: any) {
    console.error('Error fetching afiliados stats:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
