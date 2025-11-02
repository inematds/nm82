import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // TEMPORARY: Auth disabled for development

    const { searchParams } = new URL(request.url);
    const dias = parseInt(searchParams.get('dias') || '30'); // Default last 30 days

    // Get all used códigos with data_atribuicao
    const { data: codigos, error } = await supabaseAdmin
      .from('codigos_convite')
      .select('data_atribuicao')
      .eq('usado', true)
      .not('data_atribuicao', 'is', null)
      .order('data_atribuicao', { ascending: false });

    if (error) throw error;

    // Group by date
    const statsMap = new Map<string, number>();

    codigos?.forEach((codigo) => {
      if (codigo.data_atribuicao) {
        const date = new Date(codigo.data_atribuicao);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

        statsMap.set(dateKey, (statsMap.get(dateKey) || 0) + 1);
      }
    });

    // Convert to array and sort by date
    const stats = Array.from(statsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Filter to last N days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - dias);
    const cutoffString = cutoffDate.toISOString().split('T')[0];

    const filteredStats = stats.filter((stat) => stat.date >= cutoffString);

    return NextResponse.json({
      stats: filteredStats,
      total: filteredStats.reduce((sum, stat) => sum + stat.count, 0),
      days: dias,
    });
  } catch (error: any) {
    console.error('Error fetching códigos stats:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
