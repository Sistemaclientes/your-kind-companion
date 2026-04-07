-- Add turma_id to provas table
ALTER TABLE public.provas 
ADD COLUMN IF NOT EXISTS turma_id UUID REFERENCES public.turmas(id);

-- Add turma_id to resultados table
ALTER TABLE public.resultados 
ADD COLUMN IF NOT EXISTS turma_id UUID REFERENCES public.turmas(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_provas_turma_id ON public.provas(turma_id);
CREATE INDEX IF NOT EXISTS idx_resultados_turma_id ON public.resultados(turma_id);