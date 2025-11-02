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

    // Apply status filter - "usado" means data IS NOT NULL, "disponivel" means data IS NULL
    if (status === 'usado') {
      query = query.not('data', 'is', null).order('data', { ascending: false });
    } else if (status === 'disponivel') {
      query = query.is('data', null).order('atualizado_em', { ascending: false });
    } else {
      // For "TODOS", order by data DESC (used first with most recent), then unused
      query = query.order('data', { ascending: false, nullsFirst: false });
    }

    const { data: codigos, error } = await query.limit(parseInt(limit));

    if (error) throw error;

    // Transform data to match frontend expectations
    const transformedCodigos = codigos?.map(codigo => ({
      id: codigo.id,
      codigo: codigo.codigo,
      email: codigo.email,
      usado: codigo.data !== null,
      data_atribuicao: codigo.data,
      created_at: codigo.atualizado_em,
    })) || [];

    return NextResponse.json(transformedCodigos);
  } catch (error: any) {
    console.error('Error fetching códigos:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
