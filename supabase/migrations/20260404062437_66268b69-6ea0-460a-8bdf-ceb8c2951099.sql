-- Add missing columns to the resultados table
ALTER TABLE public.resultados 
ADD COLUMN IF NOT EXISTS total_questoes INTEGER,
ADD COLUMN IF NOT EXISTS data_conclusao TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS nota_corte NUMERIC,
ADD COLUMN IF NOT EXISTS status TEXT;

-- Align columns in the alunos table if needed
ALTER TABLE public.alunos 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Ativo';

-- Update vw_provas_stats to ensure it remains valid
-- (Already handled in previous migrations, but good to keep in mind)
