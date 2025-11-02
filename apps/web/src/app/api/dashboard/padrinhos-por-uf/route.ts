import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Buscar pessoas físicas que são padrinhos (têm convites)
    const { data: padrinhos, error } = await supabaseAdmin
      .from('pessoas_fisicas')
      .select('uf')
      .or('convites_enviados.gt.0,convites_disponiveis.gt.0,convites_usados.gt.0');

    if (error) throw error;

    // Agrupar por UF
    const ufCount = new Map<string, number>();

    padrinhos?.forEach((padrinho: any) => {
      const uf = padrinho.uf;
      if (uf && uf.trim() !== '') {
        ufCount.set(uf, (ufCount.get(uf) || 0) + 1);
      }
    });

    // Converter para array e ordenar
    const stats = Array.from(ufCount.entries())
      .map(([uf, count]) => ({ uf, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 estados

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching padrinhos por UF:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
