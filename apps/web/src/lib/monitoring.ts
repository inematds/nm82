import logger from './logger';

/**
 * Sistema de Monitoramento e Métricas de Performance
 *
 * Features:
 * - Coleta de duração de operações
 * - Cálculo de percentis (P50, P95, P99)
 * - Contadores de eventos
 * - SLA tracking
 * - Alertas automáticos
 */

export interface MetricData {
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
  durations: number[]; // Armazena últimas 1000 durações
}

// In-memory storage (em produção, usar Redis ou similar)
const metrics = new Map<string, MetricData>();

// Contadores de eventos
const eventCounters = new Map<string, number>();

/**
 * FlowMetrics - Gerencia métricas de performance de fluxos
 */
export class FlowMetrics {
  /**
   * Registra a duração de uma operação
   */
  static recordDuration(flowName: string, durationMs: number) {
    let metric = metrics.get(flowName);

    if (!metric) {
      metric = {
        count: 0,
        sum: 0,
        avg: 0,
        min: Infinity,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        durations: [],
      };
      metrics.set(flowName, metric);
    }

    // Atualizar contadores
    metric.count++;
    metric.sum += durationMs;
    metric.avg = metric.sum / metric.count;
    metric.min = Math.min(metric.min, durationMs);
    metric.max = Math.max(metric.max, durationMs);

    // Armazenar duração (manter últimas 1000)
    metric.durations.push(durationMs);
    if (metric.durations.length > 1000) {
      metric.durations.shift();
    }

    // Recalcular percentis
    const sorted = [...metric.durations].sort((a, b) => a - b);
    metric.p50 = this.getPercentile(sorted, 50);
    metric.p95 = this.getPercentile(sorted, 95);
    metric.p99 = this.getPercentile(sorted, 99);

    // Verificar SLA e logar warning se necessário
    this.checkSLA(flowName, durationMs, metric);

    logger.debug({
      metric: flowName,
      duration: durationMs,
      avg: Math.round(metric.avg),
      p95: Math.round(metric.p95),
    }, 'Métrica registrada');
  }

  /**
   * Calcula percentil de um array ordenado
   */
  private static getPercentile(sorted: number[], percentile: number): number {
    if (sorted.length === 0) return 0;

    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Verifica SLA e gera alertas
   */
  private static checkSLA(flowName: string, duration: number, metric: MetricData) {
    // SLA: P95 < 2000ms
    const SLA_P95_MS = 2000;
    const CRITICAL_MS = 5000;

    if (duration > CRITICAL_MS) {
      logger.error({
        flow: flowName,
        duration,
        sla: SLA_P95_MS,
        severity: 'CRITICAL',
      }, `Operação muito lenta: ${duration}ms > ${CRITICAL_MS}ms`);
    } else if (metric.p95 > SLA_P95_MS) {
      logger.warn({
        flow: flowName,
        p95: Math.round(metric.p95),
        sla: SLA_P95_MS,
        severity: 'WARNING',
      }, `P95 acima do SLA: ${Math.round(metric.p95)}ms > ${SLA_P95_MS}ms`);
    }
  }

  /**
   * Retorna métricas de um fluxo
   */
  static getMetrics(flowName: string): MetricData | null {
    return metrics.get(flowName) || null;
  }

  /**
   * Retorna todas as métricas
   */
  static getAllMetrics(): Map<string, MetricData> {
    return new Map(metrics);
  }

  /**
   * Reseta métricas de um fluxo
   */
  static reset(flowName: string) {
    metrics.delete(flowName);
  }

  /**
   * Reseta todas as métricas
   */
  static resetAll() {
    metrics.clear();
    eventCounters.clear();
  }
}

/**
 * EventCounter - Gerencia contadores de eventos
 */
export class EventCounter {
  /**
   * Incrementa contador de evento
   */
  static increment(eventName: string, amount: number = 1) {
    const current = eventCounters.get(eventName) || 0;
    eventCounters.set(eventName, current + amount);

    logger.debug({ event: eventName, count: current + amount }, 'Evento contado');
  }

  /**
   * Retorna valor de contador
   */
  static get(eventName: string): number {
    return eventCounters.get(eventName) || 0;
  }

  /**
   * Retorna todos os contadores
   */
  static getAll(): Map<string, number> {
    return new Map(eventCounters);
  }

  /**
   * Reseta contador
   */
  static reset(eventName: string) {
    eventCounters.delete(eventName);
  }
}

/**
 * AlertManager - Gerencia alertas automáticos
 */
export class AlertManager {
  /**
   * Envia alerta crítico
   */
  static async critical(message: string, context?: any) {
    logger.error({ ...context, severity: 'CRITICAL' }, message);

    // TODO: Integrar com webhook n8n para enviar email/Slack
    // await this.sendToWebhook('critical', message, context);
  }

  /**
   * Envia alerta de warning
   */
  static async warning(message: string, context?: any) {
    logger.warn({ ...context, severity: 'WARNING' }, message);

    // TODO: Integrar com webhook n8n
    // await this.sendToWebhook('warning', message, context);
  }

  /**
   * Envia alerta informativo
   */
  static async info(message: string, context?: any) {
    logger.info({ ...context, severity: 'INFO' }, message);
  }

  /**
   * Verifica se códigos estão esgotando
   */
  static async checkCodigosDisponiveis(disponiveis: number) {
    const CRITICAL_THRESHOLD = 10;
    const WARNING_THRESHOLD = 50;

    if (disponiveis <= CRITICAL_THRESHOLD) {
      await this.critical('Códigos de convite esgotando!', {
        disponiveis,
        threshold: CRITICAL_THRESHOLD,
      });
    } else if (disponiveis <= WARNING_THRESHOLD) {
      await this.warning('Poucos códigos de convite disponíveis', {
        disponiveis,
        threshold: WARNING_THRESHOLD,
      });
    }
  }

  /**
   * Envia para webhook n8n (futuro)
   */
  private static async sendToWebhook(
    severity: string,
    message: string,
    context?: any
  ) {
    const webhookUrl = process.env.N8N_ALERT_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          severity,
          message,
          context,
          timestamp: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(5000), // Timeout 5s
      });

      if (!response.ok) {
        logger.warn({ status: response.status }, 'Falha ao enviar alerta para webhook');
      }
    } catch (error) {
      logger.warn({ error }, 'Erro ao enviar alerta para webhook');
    }
  }
}

/**
 * Helper para medir tempo de execução de função
 */
export async function measureExecutionTime<T>(
  flowName: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    FlowMetrics.recordDuration(flowName, duration);

    return { result, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    FlowMetrics.recordDuration(flowName, duration);

    throw error;
  }
}

/**
 * Decorator para medir tempo de execução de método
 */
export function Monitored(flowName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();

      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;

        FlowMetrics.recordDuration(flowName, duration);

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        FlowMetrics.recordDuration(flowName, duration);

        throw error;
      }
    };

    return descriptor;
  };
}

export default FlowMetrics;
