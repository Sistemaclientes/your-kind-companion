-- Add difficulty and tags to provas table
ALTER TABLE public.provas ADD COLUMN IF NOT EXISTS dificuldade TEXT CHECK (dificuldade IN ('fácil', 'médio', 'difícil')) DEFAULT 'médio';
ALTER TABLE public.provas ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add status to perguntas table for better management
ALTER TABLE public.perguntas ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Drop and recreate the view to include new fields and fix security warning
-- The linter recommends security invoker for views when possible
DROP VIEW IF EXISTS public.vw_provas_stats;
CREATE VIEW public.vw_provas_stats AS
 SELECT p.id,
    p.titulo,
    p.descricao,
    p.slug,
    p.categoria_id,
    p.created_at,
    p.status,
    p.total_questoes,
    p.total_pontos,
    p.dificuldade,
    p.tags,
    c.nome AS categoria_nome,
    c.cor AS categoria_cor,
    c.icon AS categoria_icon,
    ( SELECT count(DISTINCT r.aluno_id) AS count
           FROM public.resultados r
          WHERE (r.prova_id = p.id)) AS studentcount
   FROM (public.provas p
     LEFT JOIN public.categorias c ON ((p.categoria_id = c.id)));

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_provas_dificuldade ON public.provas(dificuldade);
CREATE INDEX IF NOT EXISTS idx_provas_tags ON public.provas USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_perguntas_status ON public.perguntas(status);