import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TEMPORARY: Auth disabled for development

    const { id } = params;

    console.log('📝 PUT /api/pessoas-fisicas/[id] - ID:', id);

    const body = await request.json();
    console.log('📦 Body recebido:', body);

    // Extract and validate fields
    const {
      nome,
      email,
      cpf,
      data_nascimento,
      sexo,
      cidade,
      uf,
      nicho_atuacao,
      ativo,
      convites_enviados,
      convites_usados,
      tipo_assinatura,
      valor_ultimo_pagamento,
      data_ultimo_pagamento,
      data_vencimento,
      data_primeiro_contato,
      data_ultimo_envio,
      cartao,
      escolaridade,
    } = body;

    // Validações básicas
    if (!nome || nome.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    if (!email || email.trim().length === 0) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validate convites
    if (convites_enviados !== undefined && convites_usados !== undefined) {
      if (convites_enviados < 0 || convites_usados < 0) {
        return NextResponse.json(
          { error: 'Valores de convites não podem ser negativos' },
          { status: 400 }
        );
      }

      if (convites_usados > convites_enviados) {
        return NextResponse.json(
          { error: 'Convites usados não pode ser maior que enviados' },
          { status: 400 }
        );
      }
    }

    // Check if email is already in use by another person
    const { data: existingPerson } = await supabaseAdmin
      .from('pessoas_fisicas')
      .select('id')
      .eq('email', email)
      .neq('id', id)
      .maybeSingle();

    if (existingPerson) {
      return NextResponse.json(
        { error: 'Este email já está em uso por outra pessoa' },
        { status: 400 }
      );
    }

    // Update pessoa_fisica
    console.log('💾 Atualizando pessoa física no banco...');

    const updateData = {
      nome,
      email,
      cpf: cpf || null,
      data_nascimento: data_nascimento || null,
      sexo: sexo || null,
      cidade: cidade || null,
      uf: uf || null,
      nicho_atuacao: nicho_atuacao || null,
      ativo: ativo !== undefined ? ativo : true,
      convites_enviados: convites_enviados !== undefined ? convites_enviados : 0,
      convites_usados: convites_usados !== undefined ? convites_usados : 0,
      tipo_assinatura: tipo_assinatura || null,
      valor_ultimo_pagamento: valor_ultimo_pagamento !== undefined ? valor_ultimo_pagamento : null,
      data_ultimo_pagamento: data_ultimo_pagamento || null,
      data_vencimento: data_vencimento || null,
      data_primeiro_contato: data_primeiro_contato || null,
      data_ultimo_envio: data_ultimo_envio || null,
      cartao: cartao !== undefined ? cartao : false,
      escolaridade: escolaridade || null,
      updated_at: new Date().toISOString(),
    };

    console.log('📄 Dados para update:', updateData);

    const { error } = await supabaseAdmin
      .from('pessoas_fisicas')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('❌ Erro do Supabase:', error);
      throw error;
    }

    console.log('✅ Pessoa física atualizada com sucesso!');

    return NextResponse.json({
      success: true,
      message: 'Pessoa física atualizada com sucesso',
    });
  } catch (error: any) {
    console.error('Error updating pessoa fisica:', error);
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

    const { data: pessoa, error } = await supabaseAdmin
      .from('pessoas_fisicas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!pessoa) {
      return NextResponse.json(
        { error: 'Pessoa não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(pessoa);
  } catch (error: any) {
    console.error('Error fetching pessoa fisica:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
