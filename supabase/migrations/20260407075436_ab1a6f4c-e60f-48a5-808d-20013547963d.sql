-- Add new columns to 'provas' table
ALTER TABLE public.provas 
ADD COLUMN IF NOT EXISTS nota_corte INTEGER DEFAULT 70,
ADD COLUMN IF NOT EXISTS tentativas_permitidas INTEGER DEFAULT 1;

-- Add 'ordem' column to 'perguntas' and 'respostas' for manual sorting
ALTER TABLE public.perguntas 
ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;

ALTER TABLE public.respostas 
ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;

-- Enhance 'configuracoes' table for branding
ALTER TABLE public.configuracoes
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS cor_primaria TEXT DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS nome_empresa TEXT DEFAULT 'Portal de Provas';

-- Ensure RLS is enabled on all relevant tables (standard practice)
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Policies for configuracoes
DROP POLICY IF EXISTS "Public can view configuration" ON public.configuracoes;
CREATE POLICY "Public can view configuration" 
ON public.configuracoes FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can update configuration" ON public.configuracoes;
CREATE POLICY "Admins can update configuration" 
ON public.configuracoes FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid()
  )
);
