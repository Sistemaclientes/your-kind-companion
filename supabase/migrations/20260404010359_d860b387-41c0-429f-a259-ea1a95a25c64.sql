-- Add status column to provas table
ALTER TABLE public.provas 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Ativa';

-- Update RLS policies for Provas
DROP POLICY IF EXISTS "Public read access for active exams" ON public.provas;
CREATE POLICY "Public read access for active exams" 
ON public.provas FOR SELECT 
USING (status = 'Ativa');

-- Update RLS policies for Perguntas
DROP POLICY IF EXISTS "Public read access for questions" ON public.perguntas;
CREATE POLICY "Public read access for questions" 
ON public.perguntas FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.provas 
    WHERE provas.id = perguntas.prova_id AND status = 'Ativa'
  )
);

-- Update RLS policies for Alternativas
DROP POLICY IF EXISTS "Public read access for options" ON public.alternativas;
CREATE POLICY "Public read access for options" 
ON public.alternativas FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.perguntas p 
    JOIN public.provas ex ON p.prova_id = ex.id 
    WHERE p.id = alternativas.pergunta_id AND ex.status = 'Ativa'
  )
);