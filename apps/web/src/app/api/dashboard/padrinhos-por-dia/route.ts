import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dias = parseInt(searchParams.get('dias') || '30');

    // Get all pessoas_fisicas by data_cadastro (created_at)
    const { data: pessoas, error } = await supabaseAdmin
      .from('pessoas_fisicas')
      .select('created_at')
      .order('created_at', { ascending: true, nullsFirst: false });

    if (error) throw error;

    // Calculate date range
    const hoje = new Date();
    const dataInicio = new Date(hoje);
    dataInicio.setDate(hoje.getDate() - dias);

    // Filter by date range (use created_at)
    const pessoasFiltradas = pessoas?.filter((pessoa) => {
      const dataCadastro = pessoa.created_at
        ? new Date(pessoa.created_at)
        : null;

      return dataCadastro && dataCadastro >= dataInicio;
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

    // Count pessoas per day
    pessoasFiltradas.forEach((pessoa) => {
      const dataCadastro = pessoa.created_at
        ? new Date(pessoa.created_at)
        : null;

      if (dataCadastro) {
        const dateKey = dataCadastro.toISOString().split('T')[0];
        statsMap.set(dateKey, (statsMap.get(dateKey) || 0) + 1);
      }
    });

    // Convert to array and sort
    const stats = Array.from(statsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      stats,
      total: pessoasFiltradas.length,
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
