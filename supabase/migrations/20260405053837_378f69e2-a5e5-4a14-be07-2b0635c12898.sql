-- Make aluno_id nullable in resultados table to allow anonymous/guest results
ALTER TABLE public.resultados ALTER COLUMN aluno_id DROP NOT NULL;

-- Ensure respostas_aluno also allows null aluno_id (already is, but for safety)
ALTER TABLE public.respostas_aluno ALTER COLUMN aluno_id DROP NOT NULL;
