-- Create categories table
CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE,
    cor TEXT DEFAULT '#3b82f6',
    icon TEXT DEFAULT 'Tag',
    descricao TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for categories
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Anyone can read categories" ON public.categorias FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage categories" ON public.categorias FOR ALL TO authenticated USING (public.check_is_admin());

-- Create settings table
CREATE TABLE IF NOT EXISTS public.configuracoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    chave TEXT UNIQUE NOT NULL,
    valor JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for settings
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Create policies for settings
CREATE POLICY "Anyone can read settings" ON public.configuracoes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage settings" ON public.configuracoes FOR ALL TO authenticated USING (public.check_is_admin());

-- Add missing columns to provas
ALTER TABLE public.provas 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.admins(id) ON DELETE SET NULL;

-- Add missing columns to resultados
ALTER TABLE public.resultados
ADD COLUMN IF NOT EXISTS acertos INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS respostas JSONB DEFAULT '{}';

-- Create trigger for updated_at in categories and settings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_categorias_updated_at ON public.categorias;
CREATE TRIGGER tr_update_categorias_updated_at
BEFORE UPDATE ON public.categorias
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_update_configuracoes_updated_at ON public.configuracoes;
CREATE TRIGGER tr_update_configuracoes_updated_at
BEFORE UPDATE ON public.configuracoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();