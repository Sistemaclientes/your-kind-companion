-- 1. Helper function for RLS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- 2. Categorias RLS
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone can view categories" ON public.categorias;
DROP POLICY IF EXISTS "Public select on categorias" ON public.categorias;
DROP POLICY IF EXISTS "Categorias are viewable by everyone" ON public.categorias;
DROP POLICY IF EXISTS "Anyone can create categories" ON public.categorias;
DROP POLICY IF EXISTS "Anyone can update categories" ON public.categorias;
DROP POLICY IF EXISTS "Anyone can delete categories" ON public.categorias;

CREATE POLICY "Public select on categorias" 
ON public.categorias FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage categories" 
ON public.categorias FOR ALL 
USING (public.get_my_role() IN ('admin', 'master'));

-- 3. Provas RLS
ALTER TABLE public.provas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Provas are viewable by everyone" ON public.provas;
DROP POLICY IF EXISTS "Public select on provas" ON public.provas;
DROP POLICY IF EXISTS "Public read access for active exams" ON public.provas;
DROP POLICY IF EXISTS "Admins can manage exams" ON public.provas;

CREATE POLICY "Public select on active exams" 
ON public.provas FOR SELECT 
USING (status IN ('Ativa', 'Ativo') OR public.get_my_role() IN ('admin', 'master'));

CREATE POLICY "Admins can manage exams" 
ON public.provas FOR ALL 
USING (public.get_my_role() IN ('admin', 'master'));

-- 4. Perguntas RLS
ALTER TABLE public.perguntas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Perguntas are viewable by everyone" ON public.perguntas;
DROP POLICY IF EXISTS "Public select on perguntas" ON public.perguntas;
DROP POLICY IF EXISTS "Public read access for questions" ON public.perguntas;
DROP POLICY IF EXISTS "Admins can manage questions" ON public.perguntas;

CREATE POLICY "Public select on active exam questions" 
ON public.perguntas FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.provas 
    WHERE provas.id = perguntas.prova_id 
    AND (provas.status IN ('Ativa', 'Ativo') OR public.get_my_role() IN ('admin', 'master'))
  )
);

CREATE POLICY "Admins can manage questions" 
ON public.perguntas FOR ALL 
USING (public.get_my_role() IN ('admin', 'master'));

-- 5. Alternativas RLS
ALTER TABLE public.alternativas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Alternativas are viewable by everyone" ON public.alternativas;
DROP POLICY IF EXISTS "Public select on alternativas" ON public.alternativas;
DROP POLICY IF EXISTS "Public read access for options" ON public.alternativas;
DROP POLICY IF EXISTS "Admins can manage alternatives" ON public.alternativas;

CREATE POLICY "Public select on active exam options" 
ON public.alternativas FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.perguntas p
    JOIN public.provas ex ON p.prova_id = ex.id
    WHERE p.id = alternativas.pergunta_id
    AND (ex.status IN ('Ativa', 'Ativo') OR public.get_my_role() IN ('admin', 'master'))
  )
);

CREATE POLICY "Admins can manage alternatives" 
ON public.alternativas FOR ALL 
USING (public.get_my_role() IN ('admin', 'master'));

-- 6. Resultados RLS
ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students can view own results" ON public.resultados;
DROP POLICY IF EXISTS "Student self-insert results" ON public.resultados;

CREATE POLICY "Students can view own results"
ON public.resultados FOR SELECT
USING (aluno_id = auth.uid() OR public.get_my_role() IN ('admin', 'master'));

CREATE POLICY "Student self-insert results"
ON public.resultados FOR INSERT
WITH CHECK (aluno_id = auth.uid() OR auth.uid() IS NULL); -- Allow anonymous if not using auth.users yet

-- 7. Respostas Aluno RLS
ALTER TABLE public.respostas_aluno ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Student self-view/insert answers" ON public.respostas_aluno;
DROP POLICY IF EXISTS "Admin manage all answers" ON public.respostas_aluno;

CREATE POLICY "Student self-manage answers"
ON public.respostas_aluno FOR ALL
USING (aluno_id = auth.uid() OR public.get_my_role() IN ('admin', 'master') OR auth.uid() IS NULL)
WITH CHECK (aluno_id = auth.uid() OR public.get_my_role() IN ('admin', 'master') OR auth.uid() IS NULL);
