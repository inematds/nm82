import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { enviarEmailPorTemplate } from '@/services/template-email-service';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles?.includes('ADMIN')) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return Response.json({ error: 'Email não fornecido' }, { status: 400 });
    }

    // Verificar se tem template de teste ou criar email manual
    const templateTeste = await prisma.emailTemplate.findFirst({
      where: { codigo: 'teste_sistema' },
    });

    if (templateTeste) {
      // Usar template se existir
      await enviarEmailPorTemplate({
        templateCodigo: 'teste_sistema',
        destinatario: {
          email,
          nome: 'Administrador',
        },
        variaveis: {
          nome: 'Administrador',
        },
      });
    } else {
      // Enviar email de teste simples
      const nodemailer = require('nodemailer');
      const configs = await prisma.configuracaoEmail.findMany({
        where: {
          chave: {
            in: ['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_password', 'remetente_nome', 'remetente_email'],
          },
        },
      });

      const configMap = configs.reduce((acc, config) => {
        acc[config.chave] = config.valor;
        return acc;
      }, {} as Record<string, string>);

      const transporter = nodemailer.createTransport({
        host: configMap.smtp_host,
        port: parseInt(configMap.smtp_port || '587'),
        secure: configMap.smtp_secure === 'true',
        auth: {
          user: configMap.smtp_user,
          pass: configMap.smtp_password,
        },
      });

      await transporter.sendMail({
        from: `"${configMap.remetente_nome || 'INEMA.VIP'}" <${configMap.remetente_email || configMap.smtp_user}>`,
        to: email,
        subject: '✅ Teste de Configuração SMTP - INEMA.VIP',
        text: `Olá!\n\nEste é um email de teste para verificar se as configurações SMTP estão funcionando corretamente.\n\nSe você recebeu este email, significa que:\n✅ Servidor SMTP está configurado corretamente\n✅ Credenciais de autenticação estão válidas\n✅ O sistema pode enviar emails\n\nData/Hora: ${new Date().toLocaleString('pt-BR')}\n\nINEMA.VIP - Sistema de Gestão`,
        html: `
          <h2>✅ Teste de Configuração SMTP</h2>
          <p>Olá!</p>
          <p>Este é um email de teste para verificar se as configurações SMTP estão funcionando corretamente.</p>
          <p>Se você recebeu este email, significa que:</p>
          <ul>
            <li>✅ Servidor SMTP está configurado corretamente</li>
            <li>✅ Credenciais de autenticação estão válidas</li>
            <li>✅ O sistema pode enviar emails</li>
          </ul>
          <p><small>Data/Hora: ${new Date().toLocaleString('pt-BR')}</small></p>
          <hr>
          <p><strong>INEMA.VIP</strong> - Sistema de Gestão</p>
        `,
      });
    }

    return Response.json({
      success: true,
      message: 'Email de teste enviado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao enviar email de teste:', error);
    return Response.json({
      error: error.message || 'Erro ao enviar email de teste',
    }, { status: 500 });
  }
}
