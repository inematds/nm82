import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check if user is admin
    const userRoles = (session.user as any).roles || [];
    if (!userRoles.includes('ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Get afiliados from last 30 days, grouped by day
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabaseAdmin
      .from('afiliados')
      .select('data_cadastro')
      .gte('data_cadastro', thirtyDaysAgo.toISOString())
      .order('data_cadastro', { ascending: true });

    if (error) {
      throw error;
    }

    // Group by day
    const groupedByDay: Record<string, number> = {};

    data?.forEach((afiliado) => {
      const date = new Date(afiliado.data_cadastro);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      groupedByDay[dayKey] = (groupedByDay[dayKey] || 0) + 1;
    });

    // Generate array for last 30 days (fill missing days with 0)
    const chartData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];

      chartData.push({
        date: dayKey,
        count: groupedByDay[dayKey] || 0,
        label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      });
    }

    return NextResponse.json(chartData);

  } catch (error: any) {
    console.error('Error fetching afiliados por dia:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
