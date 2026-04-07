-- Enable RLS on all tables
ALTER TABLE public.provas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- CATEGORIAS
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categorias;
CREATE POLICY "Anyone can view categories" ON public.categorias FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categorias;
CREATE POLICY "Admins can manage categories" ON public.categorias FOR ALL TO authenticated USING (check_is_admin());

-- CONFIGURACOES
DROP POLICY IF EXISTS "Anyone can view configurations" ON public.configuracoes;
CREATE POLICY "Anyone can view configurations" ON public.configuracoes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage configurations" ON public.configuracoes;
CREATE POLICY "Admins can manage configurations" ON public.configuracoes FOR ALL TO authenticated USING (check_is_admin());

-- PROVAS (EXAMS)
DROP POLICY IF EXISTS "Users can view exams" ON public.provas;
CREATE POLICY "Users can view exams" ON public.provas FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage exams" ON public.provas;
CREATE POLICY "Admins can manage exams" ON public.provas FOR ALL TO authenticated USING (check_is_admin());

-- PERGUNTAS (QUESTIONS)
DROP POLICY IF EXISTS "Users can view questions" ON public.perguntas;
CREATE POLICY "Users can view questions" ON public.perguntas FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage questions" ON public.perguntas;
CREATE POLICY "Admins can manage questions" ON public.perguntas FOR ALL TO authenticated USING (check_is_admin());

-- RESPOSTAS (ANSWERS)
DROP POLICY IF EXISTS "Users can view answers" ON public.respostas;
CREATE POLICY "Users can view answers" ON public.respostas FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage answers" ON public.respostas;
CREATE POLICY "Admins can manage answers" ON public.respostas FOR ALL TO authenticated USING (check_is_admin());

-- RESULTADOS (RESULTS)
DROP POLICY IF EXISTS "Students can view their own results" ON public.resultados;
CREATE POLICY "Students can view their own results" ON public.resultados FOR SELECT TO authenticated USING (auth.uid() = aluno_id);

DROP POLICY IF EXISTS "Students can insert their own results" ON public.resultados;
CREATE POLICY "Students can insert their own results" ON public.resultados FOR INSERT TO authenticated WITH CHECK (auth.uid() = aluno_id);

DROP POLICY IF EXISTS "Admins can view all results" ON public.resultados;
CREATE POLICY "Admins can view all results" ON public.resultados FOR SELECT TO authenticated USING (check_is_admin());

DROP POLICY IF EXISTS "Admins can manage all results" ON public.resultados;
CREATE POLICY "Admins can manage all results" ON public.resultados FOR ALL TO authenticated USING (check_is_admin());