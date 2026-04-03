-- Add columns to provas
ALTER TABLE public.provas 
ADD COLUMN IF NOT EXISTS duracao INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'Geral',
ADD COLUMN IF NOT EXISTS embaralhar_questoes BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS mostrar_resultado BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS permitir_revisao BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS bloquear_navegacao BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS nota_corte NUMERIC DEFAULT 7.0;

-- Add columns to perguntas
ALTER TABLE public.perguntas 
ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'multiple',
ADD COLUMN IF NOT EXISTS pontos NUMERIC DEFAULT 1,
ADD COLUMN IF NOT EXISTS explicacao TEXT;

-- Add avatar_url to alunos and admins
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add aluno_id to respostas_aluno
ALTER TABLE public.respostas_aluno 
ADD COLUMN IF NOT EXISTS aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Create configuracoes table
CREATE TABLE IF NOT EXISTS public.configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave TEXT UNIQUE NOT NULL,
    valor JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for configuracoes
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Policies for configuracoes
CREATE POLICY "Public read access for configuracoes" 
ON public.configuracoes FOR SELECT USING (true);

CREATE POLICY "Admins can manage configuracoes" 
ON public.configuracoes FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));

-- Create or update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_configuracoes_updated_at
    BEFORE UPDATE ON public.configuracoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
