-- Add difficulty and tags to perguntas table
ALTER TABLE public.perguntas ADD COLUMN IF NOT EXISTS dificuldade TEXT CHECK (dificuldade IN ('fácil', 'médio', 'difícil')) DEFAULT 'médio';
ALTER TABLE public.perguntas ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add category_id to perguntas table for question banking
ALTER TABLE public.perguntas ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL;

-- Create index for faster filtering by category and difficulty
CREATE INDEX IF NOT EXISTS idx_perguntas_categoria_id ON public.perguntas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_perguntas_dificuldade ON public.perguntas(dificuldade);
CREATE INDEX IF NOT EXISTS idx_perguntas_tags ON public.perguntas USING GIN(tags);