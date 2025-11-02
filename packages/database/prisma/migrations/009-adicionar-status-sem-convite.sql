-- Migration 009: Adicionar status SEM_CONVITE
-- Data: 2025-11-02
-- Descrição: Adicionar status específico para quando padrinho não tem convites

-- Adicionar novo valor ao enum
ALTER TYPE "AfiliadoStatus" ADD VALUE IF NOT EXISTS 'SEM_CONVITE';

-- Comentário atualizado
COMMENT ON TYPE "AfiliadoStatus" IS '
Status do afiliado no fluxo automático:
- PENDENTE: Aguardando processamento automático
- ENVIADO: Aprovado automaticamente e email com código enviado
- JA_CADASTRADO: Email já existe na base de pessoas_fisicas
- SEM_PADRINHO: Padrinho não encontrado ou link inválido
- SEM_CONVITE: Padrinho sem convites disponíveis
- APROVADO: (Deprecated) Manter por compatibilidade
- REJEITADO: (Deprecated) Manter por compatibilidade
';

DO $$
BEGIN
  RAISE NOTICE '✅ Status SEM_CONVITE adicionado com sucesso!';
  RAISE NOTICE 'Agora temos distinção clara entre sem padrinho e sem convites';
END $$;
