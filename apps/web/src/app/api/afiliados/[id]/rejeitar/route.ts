import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TEMPORARY: Auth disabled for development
    // TODO: Re-enable + check permissions after creating admin user

    const { id } = params;
    const body = await request.json();
    const { motivo } = body;

    if (!motivo) {
      return NextResponse.json(
        { error: 'Motivo da rejeição é obrigatório' },
        { status: 400 }
      );
    }

    // Update afiliado status to REJEITADO
    const { error: updateError } = await supabaseAdmin
      .from('afiliados')
      .update({
        status: 'REJEITADO',
        motivo_rejeicao: motivo,
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // TODO: Send notification/email via n8n webhook
    // const webhookUrl = process.env.N8N_REJECTION_EMAIL_WEBHOOK;
    // if (webhookUrl) {
    //   await fetch(webhookUrl, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ afiliadoId: id, motivo }),
    //   });
    // }

    return NextResponse.json({
      success: true,
      message: 'Afiliado rejeitado',
    });
  } catch (error: any) {
    console.error('Error rejecting afiliado:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
