-- 1. Add slug column to alunos table
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2. Create a function to generate slugs (if not already existing)
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        unaccent(title),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- 3. Update existing students with slugs
UPDATE public.alunos 
SET slug = lower(regexp_replace(nome, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL;

-- 4. Create trigger to automatically generate slugs for new students
CREATE OR REPLACE FUNCTION public.set_student_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := lower(regexp_replace(NEW.nome, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS tr_set_student_slug ON public.alunos;
CREATE TRIGGER tr_set_student_slug
BEFORE INSERT ON public.alunos
FOR EACH ROW
EXECUTE FUNCTION public.set_student_slug();

-- 5. Fix RLS policies to remove auth.uid() IS NULL vulnerabilities
-- Admins table
DROP POLICY IF EXISTS "Master admin manage all admins" ON public.admins;
CREATE POLICY "Master admin manage all admins" 
ON public.admins 
FOR ALL 
USING (
  (auth.uid() = id) OR 
  (get_my_role() = 'master')
);

-- Alunos table
DROP POLICY IF EXISTS "Allow public select by confirmation token" ON public.alunos;
CREATE POLICY "Allow public select by confirmation token" 
ON public.alunos 
FOR SELECT 
USING (
  (confirmation_token IS NOT NULL) OR 
  (auth.uid() = id) OR
  (get_my_role() = ANY (ARRAY['admin'::text, 'master'::text]))
);

DROP POLICY IF EXISTS "Public registration" ON public.alunos;
CREATE POLICY "Public registration" 
ON public.alunos 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NULL) OR -- Allow public registration
  (get_my_role() = ANY (ARRAY['admin'::text, 'master'::text]))
);

-- Resultados table
DROP POLICY IF EXISTS "Student self-insert results" ON public.resultados;
CREATE POLICY "Student self-insert results" 
ON public.resultados 
FOR INSERT 
WITH CHECK (
  (aluno_id = auth.uid()) OR
  (get_my_role() = ANY (ARRAY['admin'::text, 'master'::text]))
);

-- Respostas Aluno table
DROP POLICY IF EXISTS "Users can view their own answers" ON public.respostas_aluno;
CREATE POLICY "Users can view their own answers" 
ON public.respostas_aluno 
FOR SELECT 
USING (
  (aluno_id = auth.uid()) OR 
  (get_my_role() = ANY (ARRAY['admin'::text, 'master'::text]))
);

DROP POLICY IF EXISTS "Users can insert their own answers" ON public.respostas_aluno;
CREATE POLICY "Users can insert their own answers" 
ON public.respostas_aluno 
FOR INSERT 
WITH CHECK (
  (aluno_id = auth.uid()) OR
  (get_my_role() = ANY (ARRAY['admin'::text, 'master'::text]))
);

-- 6. Ensure search_path is set for all functions
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.get_my_role() SET search_path = public;
ALTER FUNCTION public.check_is_admin() SET search_path = public;
ALTER FUNCTION public.ensure_resultados_aluno_id() SET search_path = public;
ALTER FUNCTION public.set_respostas_aluno_pontos() SET search_path = public;
ALTER FUNCTION public.update_prova_stats() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
