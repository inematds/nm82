import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

// Mapping from original CSV status to database status
const statusMapping: Record<string, string> = {
  'Enviado': 'APROVADO',
  'Já Cadastrado': 'REJEITADO',
  'pendente': 'PENDENTE',
  'Sem Padrinho': 'REJEITADO',
};

export async function POST(request: Request) {
  try {
    console.log('🔄 Iniciando correção de status dos afiliados...');

    // Read CSV file (go up 2 levels from apps/web to project root)
    const csvPath = path.join(process.cwd(), '..', '..', 'reais', 'afiliados_rows.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n').map(line => line.replace(/\r$/, ''));
    const headers = lines[0].split(',').map((h: string) => h.trim());

    const idIndex = headers.indexOf('id');
    const statusIndex = headers.indexOf('status');

    if (idIndex === -1 || statusIndex === -1) {
      throw new Error('Colunas id ou status não encontradas no CSV');
    }

    let updated = 0;
    let errors = 0;

    const statusCounts = {
      'PENDENTE': 0,
      'APROVADO': 0,
      'REJEITADO': 0,
    };

    // Process each line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const values = line.split(',').map((v: string) => v.trim());
      const id = values[idIndex];
      const originalStatus = values[statusIndex];

      if (!id) continue;

      // Map status
      const newStatus = statusMapping[originalStatus] || 'PENDENTE';
      statusCounts[newStatus as keyof typeof statusCounts]++;

      try {
        // Update status in database
        const { error } = await supabaseAdmin
          .from('afiliados')
          .update({ status: newStatus })
          .eq('id', id);

        if (error) {
          console.error(`❌ Erro ao atualizar ${id}: ${error.message}`);
          errors++;
        } else {
          updated++;
        }
      } catch (err: any) {
        console.error(`❌ Erro ao processar ${id}:`, err.message);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      errors,
      statusCounts,
      message: `Correção concluída! ${updated} afiliados atualizados, ${errors} erros.`,
    });
  } catch (error: any) {
    console.error('Error fixing status:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
