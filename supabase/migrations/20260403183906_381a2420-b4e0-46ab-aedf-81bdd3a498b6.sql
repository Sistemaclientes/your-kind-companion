-- Add senha to alunos
ALTER TABLE public.alunos 
ADD COLUMN IF NOT EXISTS senha TEXT;

-- Add resultado_id to respostas_aluno
ALTER TABLE public.respostas_aluno 
ADD COLUMN IF NOT EXISTS resultado_id UUID REFERENCES public.resultados(id) ON DELETE CASCADE;

-- Update RLS policies for respostas_aluno if needed (already mostly open)
CREATE INDEX IF NOT EXISTS idx_respostas_aluno_resultado_id ON public.respostas_aluno(resultado_id);