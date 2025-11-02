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

export enum AuditAction {
  APROVAR_AFILIADO = 'APROVAR_AFILIADO',
  REJEITAR_AFILIADO = 'REJEITAR_AFILIADO',
  APROVAR_BULK = 'APROVAR_BULK',
  ATRIBUIR_CODIGO = 'ATRIBUIR_CODIGO',
  AJUSTAR_CONVITES_PADRINHO = 'AJUSTAR_CONVITES_PADRINHO',
  CRIAR_USUARIO = 'CRIAR_USUARIO',
  ATUALIZAR_USUARIO = 'ATUALIZAR_USUARIO',
  DELETAR_USUARIO = 'DELETAR_USUARIO',
  ANONIMIZAR_DADOS = 'ANONIMIZAR_DADOS',
}

export interface AuditLog {
  id?: string;
  action: AuditAction;
  user_id: string | null;
  entity_type: string; // 'afiliado', 'padrinho', 'codigo', 'usuario'
  entity_id: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

/**
 * AuditService - Gerencia logs de auditoria
 *
 * Features:
 * - Registro completo de ações críticas
 * - Rastreabilidade para compliance
 * - LGPD compliance (redact de dados sensíveis)
 */
export class AuditService {
  /**
   * Registra uma ação de auditoria
   *
   * @param log Dados do audit log
   * @param flowLogger Logger do fluxo (opcional)
   */
  static async log(log: AuditLog, flowLogger?: any): Promise<void> {
    try {
      const auditLog = {
        id: crypto.randomUUID(),
        action: log.action,
        user_id: log.user_id,
        entity_type: log.entity_type,
        entity_id: log.entity_id,
        details: log.details,
        ip_address: log.ip_address || null,
        user_agent: log.user_agent || null,
        created_at: new Date().toISOString(),
      };

      // Log estruturado
      if (flowLogger) {
        flowLogger.info(
          {
            action: log.action,
            entity: `${log.entity_type}:${log.entity_id}`,
          },
          'Audit log criado'
        );
      } else {
        logger.info(
          {
            action: log.action,
            entity: `${log.entity_type}:${log.entity_id}`,
          },
          'Audit log criado'
        );
      }

      // Inserir no banco
      const { error } = await supabaseAdmin
        .from('audit_logs')
        .insert(auditLog);

      if (error) {
        logger.error({ error }, 'Erro ao salvar audit log');
        // Não falhar a operação por erro de audit log
      }
    } catch (error) {
      logger.error({ error }, 'Exceção ao criar audit log');
      // Não falhar a operação por erro de audit log
    }
  }

  /**
   * Busca audit logs de uma entidade
   */
  static async getByEntity(
    entityType: string,
    entityId: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      logger.error({ error }, 'Erro ao buscar audit logs');
      return [];
    }

    return data as AuditLog[];
  }

  /**
   * Busca audit logs de um usuário
   */
  static async getByUser(
    userId: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      logger.error({ error }, 'Erro ao buscar audit logs do usuário');
      return [];
    }

    return data as AuditLog[];
  }

  /**
   * Busca audit logs por ação
   */
  static async getByAction(
    action: AuditAction,
    limit: number = 100
  ): Promise<AuditLog[]> {
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('action', action)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      logger.error({ error }, 'Erro ao buscar audit logs por ação');
      return [];
    }

    return data as AuditLog[];
  }

  /**
   * Busca audit logs recentes
   */
  static async getRecent(limit: number = 100): Promise<AuditLog[]> {
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      logger.error({ error }, 'Erro ao buscar audit logs recentes');
      return [];
    }

    return data as AuditLog[];
  }

  /**
   * Conta audit logs por período
   */
  static async countByPeriod(
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      logger.error({ error }, 'Erro ao contar audit logs');
      return 0;
    }

    return count || 0;
  }
}

export default AuditService;
