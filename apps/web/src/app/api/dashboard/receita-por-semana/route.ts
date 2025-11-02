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

    // 3. Get pagamentos from last 12 weeks
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - (12 * 7));

    const { data, error } = await supabaseAdmin
      .from('pagamentos')
      .select('data_pagamento, valor, status')
      .gte('data_pagamento', twelveWeeksAgo.toISOString())
      .eq('status', 'CONFIRMADO')
      .order('data_pagamento', { ascending: true });

    if (error) {
      throw error;
    }

    // Group by week
    const groupedByWeek: Record<string, number> = {};

    data?.forEach((pagamento) => {
      const date = new Date(pagamento.data_pagamento);
      // Get week start (Monday)
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(date.setDate(diff));
      const weekKey = weekStart.toISOString().split('T')[0]; // YYYY-MM-DD

      groupedByWeek[weekKey] = (groupedByWeek[weekKey] || 0) + parseFloat(pagamento.valor as any);
    });

    // Generate array for last 12 weeks
    const chartData = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      // Get week start (Monday)
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(date.setDate(diff));
      const weekKey = weekStart.toISOString().split('T')[0];

      chartData.push({
        week: weekKey,
        receita: groupedByWeek[weekKey] || 0,
        label: weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      });
    }

    return NextResponse.json(chartData);

  } catch (error: any) {
    console.error('Error fetching receita por semana:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
