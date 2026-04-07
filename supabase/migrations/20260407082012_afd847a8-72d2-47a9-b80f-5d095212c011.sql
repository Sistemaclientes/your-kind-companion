-- Add grading columns to student responses
ALTER TABLE public.respostas_aluno 
ADD COLUMN IF NOT EXISTS comentario_professor TEXT,
ADD COLUMN IF NOT EXISTS pontuacao_atribuida NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'corrigido';

-- Update existing responses to 'corrigido' since they were likely multiple choice
UPDATE public.respostas_aluno SET status = 'corrigido' WHERE status IS NULL;

-- Add support and legal fields to configuration
ALTER TABLE public.configuracoes
ADD COLUMN IF NOT EXISTS suporte_email TEXT,
ADD COLUMN IF NOT EXISTS suporte_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS termos_uso_url TEXT,
ADD COLUMN IF NOT EXISTS privacidade_url TEXT;

-- Standardize timestamps if needed (idempotent)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'provas' AND column_name = 'created_at' AND data_type = 'timestamp without time zone') THEN
        ALTER TABLE public.provas ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
    END IF;
END $$;
