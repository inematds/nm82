import { createClient } from '@supabase/supabase-js';
import logger from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  data?: Record<string, any>;
}

export interface AfiliadoAprovado {
  nome: string;
  email: string;
  codigo: string;
  linkTelegram: string;
  padrinho: {
    nome: string;
    email: string;
  };
}

/**
 * EmailService - Gerencia envio de emails com retry automático
 *
 * Features:
 * - Retry com exponential backoff (1s, 3s, 10s)
 * - Timeout de 5 segundos por tentativa
 * - Notificação de falhas
 * - Integração com n8n webhook
 */
export class EmailService {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAYS = [1000, 3000, 10000]; // 1s, 3s, 10s
  private static readonly TIMEOUT_MS = 5000;

  /**
   * Envia email de aprovação de afiliado com retry automático
   */
  static async sendApprovalEmail(
    afiliado: AfiliadoAprovado,
    flowLogger: any
  ): Promise<{ success: boolean; error?: string }> {
    const webhookUrl = process.env.N8N_APPROVAL_EMAIL_WEBHOOK_URL;

    if (!webhookUrl) {
      flowLogger.warn('N8N_APPROVAL_EMAIL_WEBHOOK_URL não configurado');
      return { success: false, error: 'WEBHOOK_NOT_CONFIGURED' };
    }

    flowLogger.info(
      { email: '[REDACTED]', codigo: afiliado.codigo },
      'Iniciando envio de email de aprovação'
    );

    // Tentar enviar com retry
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        flowLogger.info({ attempt: attempt + 1 }, 'Tentando enviar email');

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'AFILIADO_APROVADO',
            afiliado: {
              nome: afiliado.nome,
              email: afiliado.email,
              codigo: afiliado.codigo,
              linkTelegram: afiliado.linkTelegram,
            },
            padrinho: afiliado.padrinho,
            timestamp: new Date().toISOString(),
          }),
          signal: AbortSignal.timeout(this.TIMEOUT_MS),
        });

        if (response.ok) {
          flowLogger.info(
            { attempt: attempt + 1, status: response.status },
            'Email enviado com sucesso'
          );
          return { success: true };
        }

        flowLogger.warn(
          { attempt: attempt + 1, status: response.status },
          'Falha no envio de email - status não OK'
        );
      } catch (error: any) {
        flowLogger.warn(
          { attempt: attempt + 1, error: error.message },
          'Erro ao enviar email'
        );

        // Se não for a última tentativa, aguardar antes de retry
        if (attempt < this.MAX_RETRIES - 1) {
          const delay = this.RETRY_DELAYS[attempt];
          flowLogger.info(
            { delay, nextAttempt: attempt + 2 },
            'Aguardando antes de retry'
          );
          await this.sleep(delay);
        }
      }
    }

    // Todas as tentativas falharam
    flowLogger.error(
      { maxRetries: this.MAX_RETRIES },
      'Falha ao enviar email após todas as tentativas'
    );

    // Criar notificação de falha
    await this.createFailureNotification(afiliado, flowLogger);

    return { success: false, error: 'MAX_RETRIES_EXCEEDED' };
  }

  /**
   * Envia email de rejeição de afiliado
   */
  static async sendRejectionEmail(
    afiliado: { nome: string; email: string },
    motivo: string,
    flowLogger: any
  ): Promise<{ success: boolean; error?: string }> {
    const webhookUrl = process.env.N8N_REJECTION_EMAIL_WEBHOOK_URL;

    if (!webhookUrl) {
      flowLogger.warn('N8N_REJECTION_EMAIL_WEBHOOK_URL não configurado');
      return { success: false, error: 'WEBHOOK_NOT_CONFIGURED' };
    }

    flowLogger.info(
      { email: '[REDACTED]' },
      'Enviando email de rejeição'
    );

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'AFILIADO_REJEITADO',
          afiliado: {
            nome: afiliado.nome,
            email: afiliado.email,
          },
          motivo,
          timestamp: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(this.TIMEOUT_MS),
      });

      if (response.ok) {
        flowLogger.info('Email de rejeição enviado com sucesso');
        return { success: true };
      }

      flowLogger.warn({ status: response.status }, 'Falha no envio de email de rejeição');
      return { success: false, error: 'REQUEST_FAILED' };
    } catch (error: any) {
      flowLogger.error({ error: error.message }, 'Erro ao enviar email de rejeição');
      return { success: false, error: error.message };
    }
  }

  /**
   * Notifica padrinho sobre novo afiliado aprovado
   */
  static async notifyPadrinho(
    padrinho: { id: string; nome: string; email: string },
    afiliado: { nome: string },
    flowLogger: any
  ): Promise<void> {
    flowLogger.info(
      { padrinhoId: padrinho.id },
      'Criando notificação para padrinho'
    );

    try {
      await supabaseAdmin.from('notifications').insert({
        id: crypto.randomUUID(),
        user_id: padrinho.id,
        type: 'AFILIADO_APROVADO',
        title: 'Novo afiliado aprovado',
        message: `${afiliado.nome} foi aprovado e adicionado à sua rede!`,
        read: false,
        created_at: new Date().toISOString(),
      });

      flowLogger.info('Notificação criada com sucesso');
    } catch (error) {
      flowLogger.error({ error }, 'Erro ao criar notificação para padrinho');
    }
  }

  /**
   * Cria notificação de falha no envio de email
   */
  private static async createFailureNotification(
    afiliado: AfiliadoAprovado,
    flowLogger: any
  ): Promise<void> {
    try {
      await supabaseAdmin.from('notifications').insert({
        id: crypto.randomUUID(),
        user_id: null, // Notificação para admin
        type: 'EMAIL_FALHOU',
        title: 'Falha no envio de email',
        message: `Não foi possível enviar email de aprovação para ${afiliado.nome} (${afiliado.codigo})`,
        read: false,
        data: {
          afiliadoNome: afiliado.nome,
          afiliadoEmail: afiliado.email,
          codigo: afiliado.codigo,
        },
        created_at: new Date().toISOString(),
      });

      flowLogger.info('Notificação de falha criada');
    } catch (error) {
      flowLogger.error({ error }, 'Erro ao criar notificação de falha');
    }
  }

  /**
   * Sleep helper para retry
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default EmailService;
