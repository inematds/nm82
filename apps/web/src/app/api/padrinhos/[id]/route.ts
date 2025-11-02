import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validação básica
    if (!id) {
      return NextResponse.json(
        { error: 'ID do padrinho é obrigatório' },
        { status: 400 }
      );
    }

    // Campos permitidos para atualização
    const updateData: any = {};

    // Convites
    if (body.convitesEnviados !== undefined) updateData.convites_enviados = body.convitesEnviados;
    if (body.convitesUsados !== undefined) updateData.convites_usados = body.convitesUsados;

    // Dados financeiros
    if (body.tipo_assinatura !== undefined) updateData.tipo_assinatura = body.tipo_assinatura;
    if (body.valor_ultimo_pagamento !== undefined) updateData.valor_ultimo_pagamento = body.valor_ultimo_pagamento;
    if (body.data_ultimo_pagamento !== undefined) updateData.data_ultimo_pagamento = body.data_ultimo_pagamento;
    if (body.data_vencimento !== undefined) updateData.data_vencimento = body.data_vencimento;
    if (body.cartao !== undefined) updateData.cartao = body.cartao;

    // Datas administrativas
    if (body.data_primeiro_contato !== undefined) updateData.data_primeiro_contato = body.data_primeiro_contato;
    if (body.data_ultimo_envio !== undefined) updateData.data_ultimo_envio = body.data_ultimo_envio;

    // Outros dados
    if (body.escolaridade !== undefined) updateData.escolaridade = body.escolaridade;

    // Calcula convites disponíveis automaticamente
    if (body.convitesEnviados !== undefined || body.convitesUsados !== undefined) {
      const enviados = body.convitesEnviados ?? 0;
      const usados = body.convitesUsados ?? 0;
      updateData.convites_disponiveis = enviados - usados;
    }

    // Atualiza no banco
    const { data, error } = await supabaseAdmin
      .from('pessoas_fisicas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Padrinho atualizado com sucesso',
      data,
    });
  } catch (error: any) {
    console.error('Error updating padrinho:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
