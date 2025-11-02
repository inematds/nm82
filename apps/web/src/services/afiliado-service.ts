import { createClient } from '@supabase/supabase-js';
import logger, { FlowType, logFlowStart, logFlowEnd } from '@/lib/logger';
import FlowMetrics from '@/lib/monitoring';
import CodigoService, { CodigoConvite } from './codigo-service';
import EmailService from './email-service';
import AuditService, { AuditAction } from './audit-service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface Afiliado {
  id: string;
  nome: string | null;
  email: string | null;
  status: string; // "Enviado", "Pendente", etc
  padrinho_id: string;
  afiliado_id: string | null;
  data_cadastro: string;
  data_email: string | null;
  email_enviado: boolean;
  cpf: string | null;
  data_nascimento: string | null;
  sexo: string | null;
  cidade: string | null;
  uf: string | null;
  nicho_atuacao: string | null;
  telefone: string | null;
}

export interface Padrinho {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  convites_enviados: number;
  convites_usados: number;
}

export interface AprovarParams {
  afiliadoId: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface AprovarResult {
  success: boolean;
  afiliado: Afiliado;
  codigo: CodigoConvite;
  emailEnviado: boolean;
  warnings: string[];
}

export class AfiliadoService {
  static async aprovar(params: AprovarParams): Promise<AprovarResult> {
    const { flowLogger, flowId } = logFlowStart(FlowType.APROVAR_AFILIADO, {
      afiliadoId: params.afiliadoId,
      userId: params.userId,
    });

    const startTime = Date.now();
    const warnings: string[] = [];

    try {
      flowLogger.info('FASE 1: Iniciando validações');

      const { data: afiliado, error: afiliadoError } = await supabaseAdmin
        .from('afiliados')
        .select('*')
        .eq('id', params.afiliadoId)
        .single();

      if (afiliadoError || !afiliado) {
        flowLogger.error({ error: afiliadoError }, 'Afiliado não encontrado');
        throw new Error('AFILIADO_NAO_ENCONTRADO');
      }

      if (afiliado.status !== 'Pendente' && afiliado.status !== 'PENDENTE') {
        flowLogger.error({ status: afiliado.status }, 'Status inválido');
        throw new Error('STATUS_INVALIDO');
      }

      const { data: padrinho, error: padrinhoError } = await supabaseAdmin
        .from('pessoas_fisicas')
        .select('id, nome, email, ativo, convites_enviados, convites_usados')
        .eq('id', afiliado.padrinho_id)
        .single();

      if (padrinhoError || !padrinho) {
        throw new Error('PADRINHO_NAO_ENCONTRADO');
      }

      if (!padrinho.ativo) {
        throw new Error('PADRINHO_INATIVO');
      }

      const convitesDisponiveis = padrinho.convites_enviados - padrinho.convites_usados;
      if (convitesDisponiveis <= 0) {
        throw new Error('PADRINHO_SEM_CONVITES');
      }

      flowLogger.info('FASE 2: Iniciando transaction');

      let codigo: CodigoConvite;

      try {
        codigo = await CodigoService.assignToEmail(afiliado.email, flowLogger);

        const { error: updateAfiliadoError } = await supabaseAdmin
          .from('afiliados')
          .update({
            status: 'Enviado',
            email_enviado: true,
            data_email: new Date().toISOString(),
          })
          .eq('id', afiliado.id)
          .eq('status', afiliado.status);

        if (updateAfiliadoError) {
          await CodigoService.release(codigo.id, flowLogger);
          throw new Error('ERRO_ATUALIZAR_AFILIADO');
        }

        const { error: updatePadrinhoError } = await supabaseAdmin
          .from('pessoas_fisicas')
          .update({
            convites_usados: padrinho.convites_usados + 1,
          })
          .eq('id', padrinho.id);

        if (updatePadrinhoError) {
          warnings.push('Falha ao incrementar convites_usados do padrinho');
        }

        await AuditService.log(
          {
            action: AuditAction.APROVAR_AFILIADO,
            user_id: params.userId,
            entity_type: 'afiliado',
            entity_id: afiliado.id,
            details: {
              codigo_id: codigo.id,
              codigo: codigo.codigo,
              padrinho_id: padrinho.id,
            },
            ip_address: params.ipAddress,
            user_agent: params.userAgent,
          },
          flowLogger
        );
      } catch (error: any) {
        logFlowEnd(flowLogger, FlowType.APROVAR_AFILIADO, startTime, false);
        throw error;
      }

      flowLogger.info('FASE 3: Enviando notificações');

      const emailResult = await EmailService.sendApprovalEmail(
        {
          nome: afiliado.nome,
          email: afiliado.email,
          codigo: codigo.codigo,
          linkTelegram: process.env.TELEGRAM_GROUP_LINK || 'https://t.me/grupo',
          padrinho: {
            nome: padrinho.nome,
            email: padrinho.email,
          },
        },
        flowLogger
      );

      if (!emailResult.success) {
        warnings.push();
      }

      await EmailService.notifyPadrinho(padrinho, { nome: afiliado.nome }, flowLogger);

      logFlowEnd(flowLogger, FlowType.APROVAR_AFILIADO, startTime, true);

      return {
        success: true,
        afiliado: {
          ...afiliado,
          status: 'Enviado',
          email_enviado: true,
          data_email: new Date().toISOString(),
        } as Afiliado,
        codigo,
        emailEnviado: emailResult.success,
        warnings,
      };
    } catch (error: any) {
      logFlowEnd(flowLogger, FlowType.APROVAR_AFILIADO, startTime, false);
      throw error;
    }
  }

  static async rejeitar(params: {
    afiliadoId: string;
    motivo: string;
    userId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ success: boolean; afiliado: Afiliado }> {
    const { flowLogger } = logFlowStart(FlowType.REJEITAR_AFILIADO, {
      afiliadoId: params.afiliadoId,
    });

    const startTime = Date.now();

    try {
      const { data: afiliado } = await supabaseAdmin
        .from('afiliados')
        .select('*')
        .eq('id', params.afiliadoId)
        .single();

      if (!afiliado || (afiliado.status !== 'Pendente' && afiliado.status !== 'PENDENTE')) {
        throw new Error('AFILIADO_INVALIDO');
      }

      // Nota: Campos data_rejeicao e motivo_rejeicao não existem no banco real
      // O motivo será registrado apenas no audit log
      await supabaseAdmin
        .from('afiliados')
        .update({
          status: 'Rejeitado',
        })
        .eq('id', afiliado.id);

      await AuditService.log({
        action: AuditAction.REJEITAR_AFILIADO,
        user_id: params.userId,
        entity_type: 'afiliado',
        entity_id: afiliado.id,
        details: { motivo: params.motivo },
      }, flowLogger);

      logFlowEnd(flowLogger, FlowType.REJEITAR_AFILIADO, startTime, true);

      return {
        success: true,
        afiliado: { ...afiliado, status: 'Rejeitado' } as Afiliado,
      };
    } catch (error: any) {
      logFlowEnd(flowLogger, FlowType.REJEITAR_AFILIADO, startTime, false);
      throw error;
    }
  }
}

export default AfiliadoService;
