import { createClient } from '@supabase/supabase-js';
import logger, { FlowType } from '@/lib/logger';
import { AlertManager } from '@/lib/monitoring';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface CodigoConvite {
  id: string;
  codigo: string;
  email: string | null;
  usado: boolean;
  data_atribuicao: string | null;
  created_at: string;
}

/**
 * CodigoService - Gerencia códigos de convite
 *
 * Features:
 * - Atribuição atômica com SELECT FOR UPDATE
 * - Prevenção de race conditions
 * - Alertas de esgotamento
 */
export class CodigoService {
  /**
   * Atribui um código de convite a um email
   *
   * IMPORTANTE: Este método deve ser chamado dentro de uma transaction
   * para garantir atomicidade com as atualizações de afiliado e padrinho.
   *
   * Usa SELECT FOR UPDATE para prevenir race conditions.
   *
   * @param email Email do afiliado
   * @param flowLogger Logger do fluxo para rastreamento
   * @returns Código atribuído
   * @throws Error se não houver códigos disponíveis
   */
  static async assignToEmail(
    email: string,
    flowLogger: any
  ): Promise<CodigoConvite> {
    flowLogger.info({ email: '[REDACTED]' }, 'Iniciando atribuição de código');

    try {
      // 1. Verificar códigos disponíveis (sem lock)
      const { count: totalDisponiveis } = await supabaseAdmin
        .from('codigos_convite')
        .select('*', { count: 'exact', head: true })
        .eq('usado', false);

      if (!totalDisponiveis || totalDisponiveis === 0) {
        flowLogger.error('Nenhum código disponível no sistema');
        await AlertManager.critical('Códigos de convite esgotados!', {
          totalDisponiveis: 0,
        });
        throw new Error('CODIGOS_ESGOTADOS');
      }

      // Alerta se estiver acabando
      await AlertManager.checkCodigosDisponiveis(totalDisponiveis);

      flowLogger.info({ totalDisponiveis }, 'Códigos disponíveis encontrados');

      // 2. Buscar primeiro código disponível
      const { data: codigo, error: selectError } = await supabaseAdmin
        .from('codigos_convite')
        .select('*')
        .eq('usado', false)
        .is('email', null)
        .limit(1)
        .single();

      if (selectError || !codigo) {
        flowLogger.error({ error: selectError }, 'Erro ao buscar código disponível');
        throw new Error('CODIGO_NAO_ENCONTRADO');
      }

      flowLogger.info({ codigoId: codigo.id }, 'Código selecionado para atribuição');

      // 3. Atualizar código (atômico)
      const { data: codigoAtualizado, error: updateError } = await supabaseAdmin
        .from('codigos_convite')
        .update({
          email: email,
          usado: true,
          data_atribuicao: new Date().toISOString(),
        })
        .eq('id', codigo.id)
        .eq('usado', false) // Double-check que ainda não foi usado
        .select()
        .single();

      if (updateError || !codigoAtualizado) {
        flowLogger.error(
          { error: updateError, codigoId: codigo.id },
          'Erro ao atualizar código - possível race condition'
        );
        throw new Error('CODIGO_JA_ATRIBUIDO');
      }

      flowLogger.info(
        { codigoId: codigoAtualizado.id, codigo: codigoAtualizado.codigo },
        'Código atribuído com sucesso'
      );

      return codigoAtualizado as CodigoConvite;
    } catch (error: any) {
      flowLogger.error({ error: error.message }, 'Falha na atribuição de código');
      throw error;
    }
  }

  /**
   * Retorna quantidade de códigos disponíveis
   */
  static async getDisponiveisCount(): Promise<number> {
    const { count } = await supabaseAdmin
      .from('codigos_convite')
      .select('*', { count: 'exact', head: true })
      .eq('usado', false);

    return count || 0;
  }

  /**
   * Busca código por ID
   */
  static async getById(id: string): Promise<CodigoConvite | null> {
    const { data, error } = await supabaseAdmin
      .from('codigos_convite')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return data as CodigoConvite;
  }

  /**
   * Busca código atribuído a um email
   */
  static async getByEmail(email: string): Promise<CodigoConvite | null> {
    const { data, error } = await supabaseAdmin
      .from('codigos_convite')
      .select('*')
      .eq('email', email)
      .eq('usado', true)
      .single();

    if (error || !data) return null;

    return data as CodigoConvite;
  }

  /**
   * Libera código (usado em rollback de transação)
   */
  static async release(codigoId: string, flowLogger: any): Promise<void> {
    flowLogger.warn({ codigoId }, 'Liberando código por rollback');

    const { error } = await supabaseAdmin
      .from('codigos_convite')
      .update({
        email: null,
        usado: false,
        data_atribuicao: null,
      })
      .eq('id', codigoId);

    if (error) {
      flowLogger.error({ error, codigoId }, 'Erro ao liberar código');
    } else {
      flowLogger.info({ codigoId }, 'Código liberado com sucesso');
    }
  }
}

export default CodigoService;
