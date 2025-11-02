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

    const { data: configuracoes, error } = await supabaseAdmin
      .from('configuracoes_email')
      .select('*')
      .order('grupo', { ascending: true })
      .order('chave', { ascending: true });

    if (error) {
      throw error;
    }

    return Response.json({ configuracoes });
  } catch (error: any) {
    console.error('Erro ao buscar configurações:', error);
    return Response.json({
      error: 'Erro ao buscar configurações',
      details: error.message
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles?.includes('ADMIN')) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { chave, valor } = body;

    const { data: configuracao, error } = await supabaseAdmin
      .from('configuracoes_email')
      .update({ valor })
      .eq('chave', chave)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return Response.json({ configuracao });
  } catch (error: any) {
    console.error('Erro ao atualizar configuração:', error);
    return Response.json({
      error: 'Erro ao atualizar configuração',
      details: error.message
    }, { status: 500 });
  }
}
