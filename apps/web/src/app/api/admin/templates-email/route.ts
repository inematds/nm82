import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles?.includes('ADMIN')) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: templates, error } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      throw error;
    }

    return Response.json({ templates });
  } catch (error: any) {
    console.error('Erro ao buscar templates:', error);
    return Response.json({
      error: 'Erro ao buscar templates',
      details: error.message
    }, { status: 500 });
  }
}
