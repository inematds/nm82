import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '100';
    const search = searchParams.get('search') || '';

    let query = supabaseAdmin
      .from('pessoas_fisicas')
      .select('*')
      .order('data_ultimo_pagamento', { ascending: false, nullsFirst: false })
      .limit(parseInt(limit));

    // Apply search filter
    if (search) {
      query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
    }

    const { data: pessoas, error } = await query;

    if (error) throw error;

    return NextResponse.json(pessoas || []);
  } catch (error: any) {
    console.error('Error fetching pessoas fisicas:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
