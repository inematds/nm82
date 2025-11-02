-- Fix schema adjustments for CSV import

-- 1. Increase codigo length to accommodate MD5 hashes (32 chars)
ALTER TABLE codigos_convite
ALTER COLUMN codigo TYPE VARCHAR(32);

-- 2. Make afiliado_id nullable temporarily for import
ALTER TABLE afiliados
ALTER COLUMN afiliado_id DROP NOT NULL;

-- 3. Add index for email lookups (will help with matching)
CREATE INDEX IF NOT EXISTS idx_pessoas_fisicas_email ON pessoas_fisicas(email);
