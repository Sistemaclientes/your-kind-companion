-- Make aluno_id in resultados NOT NULL
ALTER TABLE public.resultados ALTER COLUMN aluno_id SET NOT NULL;

-- Add MEI specific fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS razao_social TEXT,
ADD COLUMN IF NOT EXISTS nome_fantasia TEXT,
ADD COLUMN IF NOT EXISTS data_abertura DATE,
ADD COLUMN IF NOT EXISTS situacao_cadastral TEXT DEFAULT 'Ativa',
ADD COLUMN IF NOT EXISTS endereco_comercial TEXT,
ADD COLUMN IF NOT EXISTS email_comercial TEXT,
ADD COLUMN IF NOT EXISTS telefone_comercial TEXT;
