/**
 * Afiliado Worker - Processamento Automático
 *
 * Worker que processa afiliados pendentes automaticamente
 * Baseado nos workflows nm81-3 e nm81-4 do n8n
 *
 * Executa a cada X minutos (configurável)
 */

import { prisma } from '@/lib/prisma';
import { enviarEmailPorTemplate, buscarConfiguracao } from './template-email-service';

interface ResultadoProcessamento {
  afiliadoId: string;
  status: 'ENVIADO' | 'JA_CADASTRADO' | 'SEM_PADRINHO';
  mensagem: string;
  emailsEnviados: number;
}

/**
 * ETAPA 1: Buscar próximo afiliado pendente
 */
async function buscarProximoAfiliado() {
  return await prisma.afiliado.findFirst({
    where: {
      status: 'PENDENTE',
    },
    include: {
      afiliado: true,  // Dados da pessoa afiliada
      padrinho: true,  // Dados do padrinho
    },
    orderBy: {
      dataCadastro: 'asc', // Processar mais antigos primeiro
    },
  });
}

/**
 * ETAPA 2: Validar se padrinho existe
 */
async function validarPadrinho(padrinhoId: string) {
  const padrinho = await prisma.pessoaFisica.findUnique({
    where: { id: padrinhoId },
  });

  return padrinho !== null;
}

/**
 * ETAPA 3: Verificar se padrinho tem convites disponíveis
 */
async function verificarConvitesDisponiveis(padrinhoId: string): Promise<boolean> {
  const padrinho = await prisma.pessoaFisica.findUnique({
    where: { id: padrinhoId },
    select: {
      convitesUsados: true,
      convitesEnviados: true,
    },
  });

  if (!padrinho) return false;

  // Tem convites se: usados < enviados
  return padrinho.convitesUsados < padrinho.convitesEnviados;
}

/**
 * ETAPA 4: Verificar se afiliado já é membro (email já existe em pessoas_fisicas)
 */
async function verificarSeJaEMembro(email: string): Promise<boolean> {
  const pessoa = await prisma.pessoaFisica.findUnique({
    where: { email },
  });

  return pessoa !== null;
}

/**
 * ETAPA 5: Pegar código de convite disponível
 */
async function pegarCodigoDisponivel(): Promise<string | null> {
  const codigo = await prisma.codigoConvite.findFirst({
    where: {
      usado: false,
      email: null,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return codigo?.codigo || null;
}

/**
 * ETAPA 6: Atribuir código ao afiliado
 */
async function atribuirCodigo(codigoId: string, email: string) {
  return await prisma.codigoConvite.update({
    where: { id: codigoId },
    data: {
      email,
      usado: true,
      dataAtribuicao: new Date(),
    },
  });
}

/**
 * ETAPA 7: Incrementar contador de convites usados do padrinho
 */
async function incrementarConvitesUsados(padrinhoId: string) {
  return await prisma.pessoaFisica.update({
    where: { id: padrinhoId },
    data: {
      convitesUsados: {
        increment: 1,
      },
    },
  });
}

/**
 * CENÁRIO A: Padrinho não existe
 */
async function processarPadrinhoInexistente(afiliado: any): Promise<ResultadoProcessamento> {
  console.log(`⚠️ Padrinho inexistente para afiliado: ${afiliado.afiliado.email}`);

  // 1. Enviar email para o afiliado
  await enviarEmailPorTemplate({
    templateCodigo: 'padrinho_inexistente',
    destinatario: {
      email: afiliado.afiliado.email,
      nome: afiliado.afiliado.nome,
    },
    variaveis: {
      nome: afiliado.afiliado.nome,
    },
    afiliadoId: afiliado.id,
  });

  // 2. Atualizar status do afiliado
  await prisma.afiliado.update({
    where: { id: afiliado.id },
    data: {
      status: 'SEM_PADRINHO',
      emailEnviado: true,
    },
  });

  return {
    afiliadoId: afiliado.id,
    status: 'SEM_PADRINHO',
    mensagem: 'Padrinho não encontrado',
    emailsEnviados: 1,
  };
}

/**
 * CENÁRIO B: Padrinho sem convites disponíveis
 */
async function processarSemConvites(afiliado: any): Promise<ResultadoProcessamento> {
  console.log(`⚠️ Padrinho sem convites: ${afiliado.padrinho.email}`);

  // 1. Enviar email para o afiliado
  await enviarEmailPorTemplate({
    templateCodigo: 'sem_convites_afiliado',
    destinatario: {
      email: afiliado.afiliado.email,
      nome: afiliado.afiliado.nome,
    },
    variaveis: {
      nome: afiliado.afiliado.nome,
    },
    afiliadoId: afiliado.id,
  });

  // 2. Enviar email para o padrinho
  await enviarEmailPorTemplate({
    templateCodigo: 'sem_convites_padrinho',
    destinatario: {
      email: afiliado.padrinho.email,
      nome: afiliado.padrinho.nome,
    },
    variaveis: {
      nome: afiliado.padrinho.nome,
      padrinho_nome: afiliado.padrinho.nome,
    },
    padrinhoId: afiliado.padrinhoId,
  });

  // 3. Atualizar status do afiliado
  await prisma.afiliado.update({
    where: { id: afiliado.id },
    data: {
      status: 'JA_CADASTRADO',
      emailEnviado: true,
    },
  });

  return {
    afiliadoId: afiliado.id,
    status: 'JA_CADASTRADO',
    mensagem: 'Padrinho sem convites',
    emailsEnviados: 2,
  };
}

/**
 * CENÁRIO C: Afiliado já é membro
 */
async function processarJaMembro(afiliado: any): Promise<ResultadoProcessamento> {
  console.log(`⚠️ Afiliado já é membro: ${afiliado.afiliado.email}`);

  const padrinhoIgualAfiliado = afiliado.padrinho.email === afiliado.afiliado.email;

  if (padrinhoIgualAfiliado) {
    // Padrinho tentou se auto-convidar
    await enviarEmailPorTemplate({
      templateCodigo: 'afiliado_ja_membro',
      destinatario: {
        email: afiliado.afiliado.email,
        nome: afiliado.afiliado.nome,
      },
      variaveis: {
        nome: afiliado.afiliado.nome,
      },
      afiliadoId: afiliado.id,
    });

    await prisma.afiliado.update({
      where: { id: afiliado.id },
      data: {
        status: 'JA_CADASTRADO',
        emailEnviado: true,
      },
    });

    return {
      afiliadoId: afiliado.id,
      status: 'JA_CADASTRADO',
      mensagem: 'Afiliado já é membro (auto-convite)',
      emailsEnviados: 1,
    };
  }

  // Casos normais: afiliado diferente do padrinho
  // 1. Email para afiliado
  await enviarEmailPorTemplate({
    templateCodigo: 'afiliado_ja_membro',
    destinatario: {
      email: afiliado.afiliado.email,
      nome: afiliado.afiliado.nome,
    },
    variaveis: {
      nome: afiliado.afiliado.nome,
    },
    afiliadoId: afiliado.id,
  });

  // 2. Email para padrinho
  await enviarEmailPorTemplate({
    templateCodigo: 'padrinho_convidado_ja_membro',
    destinatario: {
      email: afiliado.padrinho.email,
      nome: afiliado.padrinho.nome,
    },
    variaveis: {
      nome: afiliado.padrinho.nome,
      afiliado_nome: afiliado.afiliado.nome,
      afiliado_email: afiliado.afiliado.email,
    },
    padrinhoId: afiliado.padrinhoId,
  });

  // 3. Atualizar status
  await prisma.afiliado.update({
    where: { id: afiliado.id },
    data: {
      status: 'JA_CADASTRADO',
      emailEnviado: true,
    },
  });

  return {
    afiliadoId: afiliado.id,
    status: 'JA_CADASTRADO',
    mensagem: 'Afiliado já é membro',
    emailsEnviados: 2,
  };
}

/**
 * CENÁRIO D: APROVAÇÃO AUTOMÁTICA
 */
async function processarAprovacao(afiliado: any): Promise<ResultadoProcessamento> {
  console.log(`✅ Aprovando afiliado: ${afiliado.afiliado.email}`);

  // 1. Pegar código disponível
  const codigoObj = await prisma.codigoConvite.findFirst({
    where: {
      usado: false,
      email: null,
    },
  });

  if (!codigoObj) {
    throw new Error('Nenhum código disponível!');
  }

  // 2. Atribuir código
  await atribuirCodigo(codigoObj.id, afiliado.afiliado.email);

  // 3. Incrementar convites usados do padrinho
  await incrementarConvitesUsados(afiliado.padrinhoId);

  // 4. Buscar link do telegram
  const telegramLink = await buscarConfiguracao('telegram_bot_link') || 'https://t.me/INEMAMembroBot?start=';

  // 5. Enviar email para afiliado
  await enviarEmailPorTemplate({
    templateCodigo: 'aprovado_afiliado',
    destinatario: {
      email: afiliado.afiliado.email,
      nome: afiliado.afiliado.nome,
    },
    variaveis: {
      nome: afiliado.afiliado.nome,
      codigo: codigoObj.codigo,
      padrinho_nome: afiliado.padrinho.nome,
    },
    afiliadoId: afiliado.id,
  });

  // 6. Enviar email para padrinho
  await enviarEmailPorTemplate({
    templateCodigo: 'aprovado_padrinho',
    destinatario: {
      email: afiliado.padrinho.email,
      nome: afiliado.padrinho.nome,
    },
    variaveis: {
      nome: afiliado.padrinho.nome,
      afiliado_nome: afiliado.afiliado.nome,
      afiliado_email: afiliado.afiliado.email,
    },
    padrinhoId: afiliado.padrinhoId,
  });

  // 7. Atualizar status do afiliado
  await prisma.afiliado.update({
    where: { id: afiliado.id },
    data: {
      status: 'ENVIADO',
      emailEnviado: true,
      dataAprovacao: new Date(),
      codigoConviteId: codigoObj.id,
    },
  });

  return {
    afiliadoId: afiliado.id,
    status: 'ENVIADO',
    mensagem: `Aprovado! Código: ${codigoObj.codigo}`,
    emailsEnviados: 2,
  };
}

/**
 * FUNÇÃO PRINCIPAL: Processar um afiliado pendente
 */
export async function processarAfiliadoPendente(): Promise<ResultadoProcessamento | null> {
  console.log('🤖 Iniciando processamento de afiliado pendente...');

  // 1. Buscar próximo afiliado
  const afiliado = await buscarProximoAfiliado();

  if (!afiliado) {
    console.log('✅ Nenhum afiliado pendente encontrado');
    return null;
  }

  console.log(`📋 Processando afiliado: ${afiliado.afiliado.nome} (${afiliado.afiliado.email})`);

  try {
    // 2. Validar padrinho
    const padrinhoExiste = await validarPadrinho(afiliado.padrinhoId);

    if (!padrinhoExiste) {
      return await processarPadrinhoInexistente(afiliado);
    }

    // 3. Verificar convites disponíveis
    const temConvites = await verificarConvitesDisponiveis(afiliado.padrinhoId);

    if (!temConvites) {
      return await processarSemConvites(afiliado);
    }

    // 4. Verificar se afiliado já é membro
    const jaEMembro = await verificarSeJaEMembro(afiliado.afiliado.email);

    if (jaEMembro) {
      return await processarJaMembro(afiliado);
    }

    // 5. APROVAR AUTOMATICAMENTE
    return await processarAprovacao(afiliado);

  } catch (error) {
    console.error('❌ Erro ao processar afiliado:', error);
    throw error;
  }
}

/**
 * Worker que roda em loop
 */
export async function iniciarWorker() {
  console.log('🚀 Worker de processamento iniciado!');

  // Buscar intervalo configurado (em minutos)
  const intervaloMin = parseInt(await buscarConfiguracao('worker_intervalo') || '10');
  const intervaloMs = intervaloMin * 60 * 1000;

  console.log(`⏰ Intervalo configurado: ${intervaloMin} minutos`);

  // Função de processamento
  const processar = async () => {
    try {
      const resultado = await processarAfiliadoPendente();

      if (resultado) {
        console.log(`✅ Processamento concluído:`, resultado);
      }
    } catch (error) {
      console.error('❌ Erro no worker:', error);
    }
  };

  // Executar imediatamente
  await processar();

  // Agendar execuções periódicas
  setInterval(processar, intervaloMs);
}
