import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles?.includes('ADMIN')) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { nome, assunto, corpo, ativo } = body;

    const template = await prisma.emailTemplate.update({
      where: { id: params.id },
      data: {
        nome,
        assunto,
        corpo,
        ativo,
      },
    });

    return Response.json({ template });
  } catch (error) {
    console.error('Erro ao atualizar template:', error);
    return Response.json({ error: 'Erro ao atualizar template' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles?.includes('ADMIN')) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const template = await prisma.emailTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return Response.json({ error: 'Template não encontrado' }, { status: 404 });
    }

    return Response.json({ template });
  } catch (error) {
    console.error('Erro ao buscar template:', error);
    return Response.json({ error: 'Erro ao buscar template' }, { status: 500 });
  }
}
