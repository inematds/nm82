import { NextResponse } from 'next/server';
import AfiliadoService from '@/services/afiliado-service';
import logger from '@/lib/logger';

/**
 * POST /api/afiliados/[id]/aprovar
 *
 * Aprova um afiliado pendente com fluxo completo:
 * - Validações (afiliado, padrinho, códigos)
 * - Transaction ACID (atribuir código, atualizar status, incrementar convites)
 * - Audit log
 * - Envio de email com retry automático
 * - Notificação para padrinho
 *
 * Features:
 * - Logging estruturado com Pino
 * - Métricas de performance
 * - Rastreabilidade completa
 * - Retry de email (3 tentativas: 1s, 3s, 10s)
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();

  try {
    // TEMPORARY: Auth disabled for development
    // TODO: Re-enable + check permissions (ADMIN only) after creating admin user
    // const session = await getServerSession(authOptions);
    // if (!session || !isAdmin(session.user.roles)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id: afiliadoId } = params;

    // Extract IP and User-Agent for audit log
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    logger.info(
      {
        afiliadoId,
        ip: ipAddress,
      },
      'Requisição de aprovação de afiliado recebida'
    );

    // Execute approval flow
    const result = await AfiliadoService.aprovar({
      afiliadoId,
      userId: 'SYSTEM', // TODO: Replace with session.user.id after auth is enabled
      ipAddress,
      userAgent,
    });

    const duration = Date.now() - startTime;

    logger.info(
      {
        afiliadoId,
        codigoId: result.codigo.id,
        emailEnviado: result.emailEnviado,
        warnings: result.warnings.length,
        duration,
      },
      'Afiliado aprovado com sucesso'
    );

    return NextResponse.json({
      success: true,
      message: 'Afiliado aprovado com sucesso',
      data: {
        afiliado: {
          id: result.afiliado.id,
          nome: result.afiliado.nome,
          status: result.afiliado.status,
          data_aprovacao: result.afiliado.data_aprovacao,
        },
        codigo: {
          id: result.codigo.id,
          codigo: result.codigo.codigo,
        },
        emailEnviado: result.emailEnviado,
        warnings: result.warnings,
      },
      meta: {
        duration,
      },
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;

    logger.error(
      {
        error: error.message,
        afiliadoId: params.id,
        duration,
      },
      'Erro ao aprovar afiliado'
    );

    // Map errors to appropriate HTTP status codes
    const errorMap: Record<string, { status: number; message: string }> = {
      AFILIADO_NAO_ENCONTRADO: {
        status: 404,
        message: 'Afiliado não encontrado',
      },
      STATUS_INVALIDO: {
        status: 400,
        message: 'Afiliado já foi processado (não está pendente)',
      },
      PADRINHO_NAO_ENCONTRADO: {
        status: 404,
        message: 'Padrinho não encontrado',
      },
      PADRINHO_INATIVO: {
        status: 400,
        message: 'Padrinho inativo',
      },
      PADRINHO_SEM_CONVITES: {
        status: 400,
        message: 'Padrinho sem convites disponíveis',
      },
      CODIGOS_ESGOTADOS: {
        status: 409,
        message: 'Não há códigos de convite disponíveis no sistema',
      },
      CODIGO_NAO_ENCONTRADO: {
        status: 409,
        message: 'Não foi possível encontrar código disponível',
      },
      CODIGO_JA_ATRIBUIDO: {
        status: 409,
        message: 'Código já foi atribuído (race condition)',
      },
      ERRO_ATUALIZAR_AFILIADO: {
        status: 500,
        message: 'Erro ao atualizar status do afiliado',
      },
    };

    const errorResponse = errorMap[error.message] || {
      status: 500,
      message: 'Erro interno do servidor',
    };

    return NextResponse.json(
      {
        error: errorResponse.message,
        code: error.message,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: errorResponse.status }
    );
  }
}
