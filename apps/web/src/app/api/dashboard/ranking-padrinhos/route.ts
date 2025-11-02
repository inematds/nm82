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

    // 3. Get top 10 padrinhos by convites_usados
    const { data, error } = await supabaseAdmin
      .from('pessoas_fisicas')
      .select('id, nome, email, convites_usados, convites_disponiveis')
      .gt('convites_usados', 0) // Only padrinhos who have used invites
      .order('convites_usados', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    // Format response
    const ranking = data?.map((padrinho, index) => ({
      rank: index + 1,
      id: padrinho.id,
      nome: padrinho.nome,
      email: padrinho.email,
      convitesUsados: padrinho.convites_usados,
      convitesDisponiveis: padrinho.convites_disponiveis,
    })) || [];

    return NextResponse.json(ranking);

  } catch (error: any) {
    console.error('Error fetching ranking padrinhos:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
