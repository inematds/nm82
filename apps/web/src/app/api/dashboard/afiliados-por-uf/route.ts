import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Buscar afiliados
    const { data: afiliados, error: afiliadosError } = await supabaseAdmin
      .from('afiliados')
      .select('id, afiliado_id');

    if (afiliadosError) throw afiliadosError;

    // Buscar dados das pessoas físicas
    const pessoaIds = afiliados?.map((a) => a.afiliado_id).filter(Boolean) || [];

    if (pessoaIds.length === 0) {
      return NextResponse.json([]);
    }

    const { data: pessoas, error: pessoasError } = await supabaseAdmin
      .from('pessoas_fisicas')
      .select('id, uf')
      .in('id', pessoaIds);

    if (pessoasError) throw pessoasError;

    // Criar mapa de pessoa_id -> uf
    const pessoaUfMap = new Map<string, string>();
    pessoas?.forEach((p) => {
      if (p.uf && p.uf.trim() !== '') {
        pessoaUfMap.set(p.id, p.uf);
      }
    });

    // Agrupar por UF
    const ufCount = new Map<string, number>();

    afiliados?.forEach((afiliado) => {
      const uf = pessoaUfMap.get(afiliado.afiliado_id);
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
