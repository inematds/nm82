import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Buscar afiliados com UF (campo UF está na própria tabela afiliados)
    const { data: afiliados, error: afiliadosError } = await supabaseAdmin
      .from('afiliados')
      .select('uf');

    if (afiliadosError) throw afiliadosError;

    // Agrupar por UF
    const ufCount = new Map<string, number>();

    afiliados?.forEach((afiliado) => {
      const uf = afiliado.uf?.trim();
      if (uf) {
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
    console.error('Error fetching afiliados por UF:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
