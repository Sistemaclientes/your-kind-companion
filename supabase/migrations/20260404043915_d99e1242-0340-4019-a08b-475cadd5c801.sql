-- Recreate the view without SECURITY DEFINER to respect RLS
DROP VIEW IF EXISTS public.vw_provas_stats;
CREATE VIEW public.vw_provas_stats AS
 SELECT p.id,
    p.titulo,
    p.descricao,
    p.slug,
    p.categoria_id,
    p.created_at,
    p.status,
    c.nome AS categoria_nome,
    c.cor AS categoria_cor,
    c.icon AS categoria_icon,
    ( SELECT count(*) AS count
           FROM perguntas per
          WHERE (per.prova_id = p.id)) AS qcount,
    ( SELECT count(DISTINCT r.aluno_id) AS count
           FROM resultados r
          WHERE (r.prova_id = p.id)) AS studentcount
   FROM (provas p
     LEFT JOIN categorias c ON ((p.categoria_id = c.id)));

-- Ensure get_my_role is secure
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Harden the public registration policy for alunos
-- Instead of WITH CHECK (true), we check if the user is not already logged in
DROP POLICY IF EXISTS "Public registration" ON public.alunos;
CREATE POLICY "Public registration" 
ON public.alunos FOR INSERT 
WITH CHECK (auth.uid() IS NULL OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master'))));

-- Add an index to speed up result lookups by exam
CREATE INDEX IF NOT EXISTS idx_resultados_prova_id ON public.resultados(prova_id);
CREATE INDEX IF NOT EXISTS idx_resultados_aluno_id ON public.resultados(aluno_id);
