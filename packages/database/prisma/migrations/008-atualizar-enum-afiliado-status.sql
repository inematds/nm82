-- Migration 008: Atualizar enum AfiliadoStatus
-- Data: 2025-11-02
-- Descrição: Adicionar novos status baseados no fluxo automático

-- Adicionar novos valores ao enum
ALTER TYPE "AfiliadoStatus" ADD VALUE IF NOT EXISTS 'ENVIADO';
ALTER TYPE "AfiliadoStatus" ADD VALUE IF NOT EXISTS 'JA_CADASTRADO';
ALTER TYPE "AfiliadoStatus" ADD VALUE IF NOT EXISTS 'SEM_PADRINHO';

-- Comentários sobre o uso dos status
COMMENT ON TYPE "AfiliadoStatus" IS '
Status do afiliado no fluxo automático:
- PENDENTE: Aguardando processamento automático
- ENVIADO: Aprovado automaticamente e email com código enviado
- JA_CADASTRADO: Email já existe na base ou padrinho sem convites
- SEM_PADRINHO: Padrinho não encontrado ou link inválido
- APROVADO: (Deprecated) Manter por compatibilidade
- REJEITADO: (Deprecated) Manter por compatibilidade
';

DO $$
BEGIN
  RAISE NOTICE '✅ Enum AfiliadoStatus atualizado com sucesso!';
  RAISE NOTICE 'Novos status: ENVIADO, JA_CADASTRADO, SEM_PADRINHO';
END $$;
