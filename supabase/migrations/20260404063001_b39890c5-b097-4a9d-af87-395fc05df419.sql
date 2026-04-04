-- Add CPF column to alunos table
ALTER TABLE public.alunos 
ADD COLUMN IF NOT EXISTS cpf TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_alunos_cpf ON public.alunos(cpf);
