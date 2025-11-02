import pino from 'pino';

/**
 * Logger estruturado com Pino
 *
 * Features:
 * - Logs em JSON estruturado
 * - Redact de dados sensíveis (LGPD compliance)
 * - Níveis: debug, info, warn, error
 * - Context tracking com flowId
 */

const isProd = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: isProd ? 'info' : 'debug',

  // Redact de dados sensíveis (LGPD)
  redact: {
    paths: [
      'email',
      'cpf',
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      '*.email',
      '*.cpf',
      '*.password',
    ],
    censor: '[REDACTED]',
  },

  // Formatação para desenvolvimento
  transport: isProd
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      },

  // Base context
  base: {
    env: process.env.NODE_ENV,
  },

  // Serializers customizados
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },

  // Timestamp
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Cria logger com context específico para um fluxo
 *
 * @example
 * const flowLogger = createFlowLogger('APROVAR_AFILIADO', 'abc123');
 * flowLogger.info('Iniciando aprovação');
 * flowLogger.info({ codigoId: 'xyz' }, 'Código atribuído');
 */
export function createFlowLogger(flow: string, flowId: string) {
  return logger.child({ flow, flowId });
}

/**
 * Gera ID único para rastreamento de fluxo
 */
export function generateFlowId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Tipos de flows disponíveis
 */
export enum FlowType {
  APROVAR_AFILIADO = 'APROVAR_AFILIADO',
  REJEITAR_AFILIADO = 'REJEITAR_AFILIADO',
  APROVAR_BULK = 'APROVAR_BULK',
  ATRIBUIR_CODIGO = 'ATRIBUIR_CODIGO',
  ENVIAR_EMAIL = 'ENVIAR_EMAIL',
  VALIDAR_CONSISTENCIA = 'VALIDAR_CONSISTENCIA',
}

/**
 * Helper para logar início de fluxo
 */
export function logFlowStart(flow: FlowType, data?: any) {
  const flowId = generateFlowId();
  const flowLogger = createFlowLogger(flow, flowId);

  flowLogger.info({ ...data }, `${flow} - INICIADO`);

  return { flowLogger, flowId };
}

/**
 * Helper para logar fim de fluxo com duração
 */
export function logFlowEnd(
  flowLogger: pino.Logger,
  flow: FlowType,
  startTime: number,
  success: boolean,
  data?: any
) {
  const duration = Date.now() - startTime;

  if (success) {
    flowLogger.info({ duration, ...data }, `${flow} - SUCESSO`);
  } else {
    flowLogger.error({ duration, ...data }, `${flow} - FALHA`);
  }

  return duration;
}

export default logger;
