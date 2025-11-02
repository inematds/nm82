import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const templates = await prisma.emailTemplate.findMany({
      orderBy: { nome: 'asc' },
    });

    return Response.json({ templates });
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    return Response.json({ error: 'Erro ao buscar templates' }, { status: 500 });
  }
}
