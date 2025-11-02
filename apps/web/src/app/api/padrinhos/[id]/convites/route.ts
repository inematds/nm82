import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TEMPORARY: Auth disabled for development

    const { id } = params;
    const body = await request.json();
    const { convitesEnviados, convitesUsados } = body;

    // Validação
    if (convitesEnviados === undefined || convitesUsados === undefined) {
      return NextResponse.json(
        { error: 'Campos convitesEnviados e convitesUsados são obrigatórios' },
        { status: 400 }
      );
    }

    if (convitesEnviados < 0 || convitesUsados < 0) {
      return NextResponse.json(
        { error: 'Valores não podem ser negativos' },
        { status: 400 }
      );
    }

    if (convitesUsados > convitesEnviados) {
      return NextResponse.json(
        { error: 'Convites usados não pode ser maior que enviados' },
        { status: 400 }
      );
    }

    // Atualizar pessoa_fisica
    const { error } = await supabaseAdmin
      .from('pessoas_fisicas')
      .update({
        convites_enviados: convitesEnviados,
        convites_usados: convitesUsados,
      })
      .eq('id', id);

    if (error) throw error;

    const convitesDisponiveis = convitesEnviados - convitesUsados;

    return NextResponse.json({
      success: true,
      message: 'Convites atualizados com sucesso',
      convitesEnviados,
      convitesUsados,
      convitesDisponiveis,
    });
  } catch (error: any) {
    console.error('Error updating convites:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
