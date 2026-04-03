-- Add missing columns to resultados
ALTER TABLE public.resultados 
ADD COLUMN IF NOT EXISTS nome_aluno TEXT,
ADD COLUMN IF NOT EXISTS email_aluno TEXT;

-- Create respostas_aluno table
CREATE TABLE IF NOT EXISTS public.respostas_aluno (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prova_id UUID NOT NULL REFERENCES public.provas(id) ON DELETE CASCADE,
  pergunta_id UUID NOT NULL REFERENCES public.perguntas(id) ON DELETE CASCADE,
  alternativa_id UUID NOT NULL REFERENCES public.alternativas(id) ON DELETE CASCADE,
  correto BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on respostas_aluno
ALTER TABLE public.respostas_aluno ENABLE ROW LEVEL SECURITY;

-- Allow all for authenticated users on respostas_aluno
CREATE POLICY "Allow all for authenticated users on respostas_aluno" ON public.respostas_aluno FOR ALL TO authenticated USING (true);

-- Allow insert for anyone on respostas_aluno
CREATE POLICY "Allow insert for anyone on respostas_aluno" ON public.respostas_aluno FOR INSERT WITH CHECK (true);

-- Allow select for anyone on respostas_aluno
CREATE POLICY "Allow select for anyone on respostas_aluno" ON public.respostas_aluno FOR SELECT USING (true);

-- Add is_protected to admins
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS is_protected BOOLEAN DEFAULT false;
