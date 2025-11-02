import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to generate random alphanumeric code
function generateCodigo(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 8; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

export async function POST(request: Request) {
  try {
    // TEMPORARY: Auth disabled for development
    // TODO: Re-enable + check admin permission

    const body = await request.json();
    const { quantidade } = body;

    if (!quantidade || quantidade < 1 || quantidade > 1000) {
      return NextResponse.json(
        { error: 'Quantidade deve estar entre 1 e 1000' },
        { status: 400 }
      );
    }

    // Generate códigos
    const codigos = [];
    const codigosSet = new Set<string>();

    // Generate unique códigos
    while (codigosSet.size < quantidade) {
      const codigo = generateCodigo();

      // Check if código already exists in database
      const { data: existing } = await supabaseAdmin
        .from('codigos_convite')
        .select('id')
        .eq('codigo', codigo)
        .maybeSingle();

      if (!existing && !codigosSet.has(codigo)) {
        codigosSet.add(codigo);
      }
    }

    // Convert Set to array of objects matching the schema
    Array.from(codigosSet).forEach((codigo) => {
      codigos.push({
        id: crypto.randomUUID(),
        codigo,
        email: null,
        data: null, // null means available/not used
      });
    });

    // Insert in batches
    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < codigos.length; i += batchSize) {
      const batch = codigos.slice(i, i + batchSize);

      const { error } = await supabaseAdmin
        .from('codigos_convite')
        .insert(batch);

      if (error) {
        console.error('Error inserting batch:', error);
        throw error;
      }

      inserted += batch.length;
    }

    return NextResponse.json({
      success: true,
      message: `${inserted} códigos gerados com sucesso`,
      quantidade: inserted,
    });
  } catch (error: any) {
    console.error('Error generating códigos:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
