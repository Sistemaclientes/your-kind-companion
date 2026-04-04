-- Add display_name to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update existing profiles to set display_name from nome if it exists
UPDATE public.profiles SET display_name = nome WHERE display_name IS NULL AND nome IS NOT NULL;

-- Fix search_path for functions to improve security and fix linter warnings
ALTER FUNCTION public.get_my_role() SET search_path = public;
ALTER FUNCTION public.update_prova_stats() SET search_path = public;
ALTER FUNCTION public.set_provas_created_by() SET search_path = public;
ALTER FUNCTION public.set_respostas_aluno_pontos() SET search_path = public;
ALTER FUNCTION public.ensure_resultados_aluno_id() SET search_path = public;

-- Recreate vw_provas_stats as security invoker
DROP VIEW IF EXISTS public.vw_provas_stats;
CREATE VIEW public.vw_provas_stats WITH (security_invoker = on) AS
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
    (SELECT count(DISTINCT r.aluno_id) FROM public.resultados r WHERE r.prova_id = p.id) AS studentcount,
    (SELECT count(*) FROM public.resultados r WHERE r.prova_id = p.id) AS total_submissions,
    (SELECT COALESCE(AVG(r.pontuacao), 0) FROM public.resultados r WHERE r.prova_id = p.id) AS avg_score,
    (SELECT COALESCE(MAX(r.pontuacao), 0) FROM public.resultados r WHERE r.prova_id = p.id) AS max_score
   FROM public.provas p
     LEFT JOIN public.categorias c ON p.categoria_id = c.id;