import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // TEMPORARY: Auth disabled for development

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'usado' or 'disponivel'
    const limit = searchParams.get('limit') || '100';

    let query = supabaseAdmin
      .from('codigos_convite')
      .select('*');

    // Apply status filter
    if (status === 'usado') {
      query = query.eq('usado', true).order('data_atribuicao', { ascending: false, nullsFirst: false });
    } else if (status === 'disponivel') {
      query = query.eq('usado', false).order('created_at', { ascending: false });
    } else {
      // For "TODOS", order by usado DESC (used first), then by appropriate date
      query = query.order('usado', { ascending: false }).order('data_atribuicao', { ascending: false, nullsFirst: false });
    }

    const { data: codigos, error } = await query.limit(parseInt(limit));

    if (error) throw error;

    return NextResponse.json(codigos || []);
  } catch (error: any) {
    console.error('Error fetching códigos:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
