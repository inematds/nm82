import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles?.includes('ADMIN')) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const configuracoes = await prisma.configuracaoEmail.findMany({
      orderBy: [
        { grupo: 'asc' },
        { chave: 'asc' },
      ],
    });

    return Response.json({ configuracoes });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return Response.json({ error: 'Erro ao buscar configurações' }, { status: 500 });
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

    const configuracao = await prisma.configuracaoEmail.update({
      where: { chave },
      data: { valor },
    });

    return Response.json({ configuracao });
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    return Response.json({ error: 'Erro ao atualizar configuração' }, { status: 500 });
  }
}
