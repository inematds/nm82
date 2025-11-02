/**
 * Template Email Service
 *
 * Serviço para envio de emails usando templates configuráveis do banco de dados
 * Substitui variáveis no formato {{ variavel }} pelos valores fornecidos
 */

import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EnviarEmailParams {
  templateCodigo: string;
  destinatario: {
    email: string;
    nome?: string;
  };
  variaveis: Record<string, any>;
  afiliadoId?: string;
  padrinhoId?: string;
}

interface ConfiguracaoSMTP {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
}

/**
 * Buscar template do banco de dados
 */
async function buscarTemplate(codigo: string) {
  const template = await prisma.emailTemplate.findFirst({
    where: {
      codigo,
      ativo: true,
    },
  });

  if (!template) {
    throw new Error(`Template "${codigo}" não encontrado ou inativo`);
  }

  return template;
}

/**
 * Buscar configurações SMTP do banco
 */
async function buscarConfiguracoesSMTP(): Promise<ConfiguracaoSMTP> {
  const configs = await prisma.configuracaoEmail.findMany({
    where: {
      chave: {
        in: [
          'smtp_host',
          'smtp_port',
          'smtp_secure',
          'smtp_user',
          'smtp_password',
          'remetente_nome',
          'remetente_email',
        ],
      },
    },
  });

  const configMap = configs.reduce((acc, config) => {
    acc[config.chave] = config.valor;
    return acc;
  }, {} as Record<string, string>);

  // Validar configurações obrigatórias
  if (!configMap.smtp_host || !configMap.smtp_user || !configMap.smtp_password) {
    throw new Error('Configurações SMTP incompletas. Configure no admin.');
  }

  return {
    host: configMap.smtp_host,
    port: parseInt(configMap.smtp_port || '587'),
    secure: configMap.smtp_secure === 'true',
    user: configMap.smtp_user,
    password: configMap.smtp_password,
    fromName: configMap.remetente_nome || 'INEMA.VIP',
    fromEmail: configMap.remetente_email || configMap.smtp_user,
  };
}

/**
 * Substituir variáveis no template
 * Formato: {{ variavel }}
 */
function substituirVariaveis(texto: string, variaveis: Record<string, any>): string {
  return texto.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    if (key in variaveis) {
      return String(variaveis[key]);
    }
    console.warn(`Variável "${key}" não fornecida para o template`);
    return match; // Manter o placeholder se não houver valor
  });
}

/**
 * Criar transporter do Nodemailer
 */
function criarTransporter(config: ConfiguracaoSMTP): Transporter {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });
}

/**
 * Registrar log de email no banco
 */
async function registrarLog(params: {
  templateCodigo: string;
  destinatarioEmail: string;
  destinatarioNome?: string;
  assunto: string;
  corpo: string;
  variaveis: Record<string, any>;
  status: 'PENDENTE' | 'ENVIADO' | 'FALHA';
  erro?: string;
  afiliadoId?: string;
  padrinhoId?: string;
  tentativas?: number;
}) {
  return await prisma.logEmail.create({
    data: {
      templateCodigo: params.templateCodigo,
      destinatarioEmail: params.destinatarioEmail,
      destinatarioNome: params.destinatarioNome,
      assunto: params.assunto,
      corpo: params.corpo,
      variaveis: params.variaveis as any,
      status: params.status,
      erro: params.erro,
      afiliadoId: params.afiliadoId,
      padrinhoId: params.padrinhoId,
      tentativas: params.tentativas || 0,
      enviadoEm: params.status === 'ENVIADO' ? new Date() : null,
    },
  });
}

/**
 * FUNÇÃO PRINCIPAL: Enviar email usando template
 */
export async function enviarEmailPorTemplate(params: EnviarEmailParams): Promise<boolean> {
  const { templateCodigo, destinatario, variaveis, afiliadoId, padrinhoId } = params;

  try {
    // 1. Buscar template
    console.log(`📧 Buscando template: ${templateCodigo}`);
    const template = await buscarTemplate(templateCodigo);

    // 2. Substituir variáveis
    const assunto = substituirVariaveis(template.assunto, variaveis);
    const corpo = substituirVariaveis(template.corpo, variaveis);

    // 3. Buscar configurações SMTP
    console.log('⚙️ Carregando configurações SMTP...');
    const smtpConfig = await buscarConfiguracoesSMTP();

    // 4. Criar log PENDENTE
    const log = await registrarLog({
      templateCodigo,
      destinatarioEmail: destinatario.email,
      destinatarioNome: destinatario.nome,
      assunto,
      corpo,
      variaveis,
      status: 'PENDENTE',
      afiliadoId,
      padrinhoId,
      tentativas: 1,
    });

    // 5. Enviar email
    console.log(`📤 Enviando email para: ${destinatario.email}`);
    const transporter = criarTransporter(smtpConfig);

    await transporter.sendMail({
      from: `"${template.remetentNome || smtpConfig.fromName}" <${template.remetenteEmail || smtpConfig.fromEmail}>`,
      to: destinatario.email,
      subject: assunto,
      text: corpo, // Texto puro
      html: corpo.replace(/\n/g, '<br>'), // HTML simples (quebras de linha)
    });

    // 6. Atualizar log como ENVIADO
    await prisma.logEmail.update({
      where: { id: log.id },
      data: {
        status: 'ENVIADO',
        enviadoEm: new Date(),
      },
    });

    console.log(`✅ Email enviado com sucesso: ${destinatario.email}`);
    return true;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`❌ Erro ao enviar email:`, errorMessage);

    // Registrar falha
    try {
      await prisma.logEmail.create({
        data: {
          templateCodigo,
          destinatarioEmail: destinatario.email,
          destinatarioNome: destinatario.nome,
          assunto: `[FALHA] ${templateCodigo}`,
          corpo: '',
          variaveis: variaveis as any,
          status: 'FALHA',
          erro: errorMessage,
          afiliadoId,
          padrinhoId,
          tentativas: 1,
        },
      });
    } catch (logError) {
      console.error('Erro ao registrar log de falha:', logError);
    }

    return false;
  }
}

/**
 * Buscar configuração específica
 */
export async function buscarConfiguracao(chave: string): Promise<string | null> {
  const config = await prisma.configuracaoEmail.findUnique({
    where: { chave },
  });
  return config?.valor || null;
}

/**
 * Atualizar configuração
 */
export async function atualizarConfiguracao(chave: string, valor: string): Promise<void> {
  await prisma.configuracaoEmail.update({
    where: { chave },
    data: { valor },
  });
}

/**
 * Buscar todos os templates ativos
 */
export async function listarTemplates() {
  return await prisma.emailTemplate.findMany({
    where: { ativo: true },
    orderBy: { nome: 'asc' },
  });
}

/**
 * Buscar template por código
 */
export async function buscarTemplatePorCodigo(codigo: string) {
  return await prisma.emailTemplate.findFirst({
    where: { codigo },
  });
}

/**
 * Atualizar template
 */
export async function atualizarTemplate(id: string, data: {
  nome?: string;
  assunto?: string;
  corpo?: string;
  ativo?: boolean;
}) {
  return await prisma.emailTemplate.update({
    where: { id },
    data,
  });
}
