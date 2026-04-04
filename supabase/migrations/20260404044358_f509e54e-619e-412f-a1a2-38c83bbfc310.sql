-- Add password reset columns to alunos table
ALTER TABLE public.alunos 
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP WITH TIME ZONE;

-- Add an index for faster lookups during student password reset
CREATE INDEX IF NOT EXISTS idx_alunos_reset_token ON public.alunos(reset_token);

-- Add email confirmation columns to admins table for consistency
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS must_reconfirm BOOLEAN DEFAULT false;

-- Recreate the view with explicit SECURITY INVOKER (default but good for clarity)
DROP VIEW IF EXISTS public.vw_provas_stats;
CREATE VIEW public.vw_provas_stats WITH (security_invoker = true) AS
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

-- Set search_path for functions to fix linter warnings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- RLS Policies for student password reset
DROP POLICY IF EXISTS "Allow public student reset token lookup" ON public.alunos;
CREATE POLICY "Allow public student reset token lookup" 
ON public.alunos FOR SELECT 
USING (reset_token IS NOT NULL);

DROP POLICY IF EXISTS "Allow public student reset password update" ON public.alunos;
CREATE POLICY "Allow public student reset password update" 
ON public.alunos FOR UPDATE 
USING (reset_token IS NOT NULL)
WITH CHECK (reset_token IS NOT NULL);
