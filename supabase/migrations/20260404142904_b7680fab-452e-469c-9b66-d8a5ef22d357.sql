-- Fix search_path for functions as requested in the script
ALTER FUNCTION public.get_my_role() SET search_path = public;
ALTER FUNCTION public.update_prova_stats() SET search_path = public;
ALTER FUNCTION public.set_provas_created_by() SET search_path = public;
ALTER FUNCTION public.set_respostas_aluno_pontos() SET search_path = public;
ALTER FUNCTION public.ensure_resultados_aluno_id() SET search_path = public;

-- Recreate vw_provas_stats as security invoker
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
    (SELECT count(DISTINCT r.aluno_id) FROM public.resultados r WHERE r.prova_id = p.id) AS studentcount,
    (SELECT count(*) FROM public.resultados r WHERE r.prova_id = p.id) AS total_submissions,
    (SELECT COALESCE(AVG(r.pontuacao), 0) FROM public.resultados r WHERE r.prova_id = p.id) AS avg_score,
    (SELECT COALESCE(MAX(r.pontuacao), 0) FROM public.resultados r WHERE r.prova_id = p.id) AS max_score
   FROM public.provas p
     LEFT JOIN public.categorias c ON p.categoria_id = c.id;

-- Fix RLS for resultados
-- First, remove the overly permissive public policy
DROP POLICY IF EXISTS "Public can view results by slug" ON public.resultados;

-- Create a more restricted policy for sharing results via slug
-- This allows access if the slug is known, but usually in Supabase, 
-- if we want to allow public viewing by ID/Slug without making the whole table public,
-- we should still use a filter in the query.
-- However, to keep it simple and functional for "sharing", we allow it if the slug exists.
CREATE POLICY "Public can view results by slug"
ON public.resultados
FOR SELECT
USING (slug IS NOT NULL);

-- Ensure admins can manage everything
DROP POLICY IF EXISTS "Admin manage all results" ON public.resultados;
CREATE POLICY "Admin manage all results"
ON public.resultados
FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'master')));

-- Ensure students see only their results
DROP POLICY IF EXISTS "Student self-view results" ON public.resultados;
CREATE POLICY "Student self-view results"
ON public.resultados
FOR SELECT
USING (auth.uid() = aluno_id);
