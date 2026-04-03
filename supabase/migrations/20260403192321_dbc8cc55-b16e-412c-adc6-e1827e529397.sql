-- Create categories table
CREATE TABLE public.categorias (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    descricao TEXT,
    cor TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Everyone can view categories" 
ON public.categorias FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" 
ON public.categorias FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Add imagem_url to perguntas
ALTER TABLE public.perguntas ADD COLUMN IF NOT EXISTS imagem_url TEXT;

-- Add categoria_id to provas if not exists and link it
ALTER TABLE public.provas ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES public.categorias(id);

-- Create trigger for categories updated_at
CREATE TRIGGER update_categorias_updated_at
BEFORE UPDATE ON public.categorias
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();