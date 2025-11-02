import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dias = parseInt(searchParams.get('dias') || '30');

    // Get padrinhos from pessoas_fisicas with convites
    const { data: padrinhos, error } = await supabaseAdmin
      .from('pessoas_fisicas')
      .select('created_at')
      .or('convites_enviados.gt.0,convites_disponiveis.gt.0,convites_usados.gt.0')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Calculate date range
    const hoje = new Date();
    const dataInicio = new Date(hoje);
    dataInicio.setDate(hoje.getDate() - dias);

    // Filter by date range
    const padrinhosFiltrados = padrinhos?.filter((padrinho) => {
      const dataCadastro = new Date(padrinho.created_at);
      return dataCadastro >= dataInicio;
    }) || [];

    // Group by date
    const statsMap = new Map<string, number>();

    // Initialize all dates with 0
    for (let i = 0; i < dias; i++) {
      const date = new Date(hoje);
      date.setDate(hoje.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      statsMap.set(dateKey, 0);
    }

    // Count padrinhos per day
    padrinhosFiltrados.forEach((padrinho) => {
      const date = new Date(padrinho.created_at);
      const dateKey = date.toISOString().split('T')[0];
      statsMap.set(dateKey, (statsMap.get(dateKey) || 0) + 1);
    });

    // Convert to array and sort
    const stats = Array.from(statsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      stats,
      total: padrinhosFiltrados.length,
      days: dias,
    });
  } catch (error: any) {
    console.error('Error fetching padrinhos stats:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
