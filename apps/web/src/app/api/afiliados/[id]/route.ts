import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    console.log('📝 PUT /api/afiliados/[id] - ID:', id);
    console.log('📦 Body recebido:', body);

    // Validação básica
    if (!id) {
      return NextResponse.json(
        { error: 'ID do afiliado é obrigatório' },
        { status: 400 }
      );
    }

    // Campos permitidos para atualização
    const updateData: any = {};

    // Informações básicas
    if (body.nome !== undefined) updateData.nome = body.nome;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.cpf !== undefined) updateData.cpf = body.cpf || null;
    if (body.dataNascimento !== undefined) updateData.data_nascimento = body.dataNascimento || null;
    if (body.sexo !== undefined) updateData.sexo = body.sexo || null;
    if (body.telefone !== undefined) updateData.telefone = body.telefone || null;

    // Localização
    if (body.cidade !== undefined) updateData.cidade = body.cidade || null;
    if (body.uf !== undefined) updateData.uf = body.uf || null;

    // Informações adicionais
    if (body.nichoAtuacao !== undefined) updateData.nicho_atuacao = body.nichoAtuacao || null;
    if (body.status !== undefined) updateData.status = body.status;

    console.log('📄 Dados para update:', updateData);

    // Atualiza no banco
    const { data, error } = await supabaseAdmin
      .from('afiliados')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro do Supabase:', error);
      throw error;
    }

    console.log('✅ Afiliado atualizado com sucesso!');

    return NextResponse.json({
      success: true,
      message: 'Afiliado atualizado com sucesso',
      data,
    });
  } catch (error: any) {
    console.error('Error updating afiliado:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: afiliado, error } = await supabaseAdmin
      .from('afiliados')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!afiliado) {
      return NextResponse.json(
        { error: 'Afiliado não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(afiliado);
  } catch (error: any) {
    console.error('Error fetching afiliado:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
