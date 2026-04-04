-- Create a security-definer function to check if the user is an admin without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR role = 'master')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop the recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete all profiles" ON public.profiles;

-- Create fixed policies using the new function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.check_is_admin());

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.check_is_admin());

CREATE POLICY "Admins can delete all profiles" 
ON public.profiles 
FOR DELETE 
USING (public.check_is_admin());

-- Fix security-definer view linter warning
DROP VIEW IF EXISTS public.vw_provas_stats;
CREATE VIEW public.vw_provas_stats 
WITH (security_invoker = true)
AS
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

-- Set search_path for existing functions to fix linter warnings
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
