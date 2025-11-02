-- ====================================
-- AJUSTE DE SCHEMA - Permitir NULL
-- Execute este SQL no Supabase SQL Editor
-- ====================================

-- Permitir nome NULL em pessoas_fisicas
ALTER TABLE pessoas_fisicas ALTER COLUMN nome DROP NOT NULL;

-- Permitir email NULL em pessoas_fisicas
ALTER TABLE pessoas_fisicas ALTER COLUMN email DROP NOT NULL;

-- Verificar alterações
SELECT
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns
WHERE table_name = 'pessoas_fisicas'
    AND column_name IN ('nome', 'email')
ORDER BY column_name;
