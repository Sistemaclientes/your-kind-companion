-- Add missing foreign keys and constraints

-- Categories relationships
ALTER TABLE public.provas
ADD CONSTRAINT fk_provas_categoria
FOREIGN KEY (categoria_id)
REFERENCES public.categorias(id)
ON DELETE SET NULL;

-- Questions to Exams
ALTER TABLE public.perguntas
ADD CONSTRAINT fk_perguntas_prova
FOREIGN KEY (prova_id)
REFERENCES public.provas(id)
ON DELETE CASCADE;

-- Options to Questions
ALTER TABLE public.alternativas
ADD CONSTRAINT fk_alternativas_pergunta
FOREIGN KEY (pergunta_id)
REFERENCES public.perguntas(id)
ON DELETE CASCADE;

-- Results to Exams and Students
ALTER TABLE public.resultados
ADD CONSTRAINT fk_resultados_prova
FOREIGN KEY (prova_id)
REFERENCES public.provas(id)
ON DELETE CASCADE;

ALTER TABLE public.resultados
ADD CONSTRAINT fk_resultados_aluno
FOREIGN KEY (aluno_id)
REFERENCES public.alunos(id)
ON DELETE CASCADE;

-- Student Answers relationships
ALTER TABLE public.respostas_aluno
ADD CONSTRAINT fk_respostas_aluno_prova
FOREIGN KEY (prova_id)
REFERENCES public.provas(id)
ON DELETE CASCADE;

ALTER TABLE public.respostas_aluno
ADD CONSTRAINT fk_respostas_aluno_pergunta
FOREIGN KEY (pergunta_id)
REFERENCES public.perguntas(id)
ON DELETE CASCADE;

ALTER TABLE public.respostas_aluno
ADD CONSTRAINT fk_respostas_aluno_alternativa
FOREIGN KEY (alternativa_id)
REFERENCES public.alternativas(id)
ON DELETE CASCADE;

ALTER TABLE public.respostas_aluno
ADD CONSTRAINT fk_respostas_aluno_aluno
FOREIGN KEY (aluno_id)
REFERENCES public.alunos(id)
ON DELETE CASCADE;

ALTER TABLE public.respostas_aluno
ADD CONSTRAINT fk_respostas_aluno_resultado
FOREIGN KEY (resultado_id)
REFERENCES public.resultados(id)
ON DELETE CASCADE;

-- Notifications to Profiles (assuming user_id refers to profiles/auth.users)
ALTER TABLE public.notificacoes
ADD CONSTRAINT fk_notificacoes_user
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Unique constraints
ALTER TABLE public.provas
ADD CONSTRAINT unique_provas_slug UNIQUE (slug);

-- Ensure there are no duplicates in categories slug
ALTER TABLE public.categorias
ADD CONSTRAINT unique_categorias_slug UNIQUE (slug);

-- Ensure RLS policies are using correct checks
DROP POLICY IF EXISTS "Anyone can view active exams" ON public.provas;
CREATE POLICY "Anyone can view active exams" 
ON public.provas FOR SELECT 
USING (status IN ('Ativa', 'Ativo') OR (SELECT get_my_role()) IN ('admin', 'master'));

DROP POLICY IF EXISTS "Admins can manage exams" ON public.provas;
CREATE POLICY "Admins can manage exams" 
ON public.provas FOR ALL 
USING ((SELECT get_my_role()) IN ('admin', 'master'));

DROP POLICY IF EXISTS "Anyone can view questions of active exams" ON public.perguntas;
CREATE POLICY "Anyone can view questions of active exams" 
ON public.perguntas FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.provas 
  WHERE provas.id = perguntas.prova_id AND (provas.status IN ('Ativa', 'Ativo') OR (SELECT get_my_role()) IN ('admin', 'master'))
));

DROP POLICY IF EXISTS "Admins can manage questions" ON public.perguntas;
CREATE POLICY "Admins can manage questions" 
ON public.perguntas FOR ALL 
USING ((SELECT get_my_role()) IN ('admin', 'master'));

DROP POLICY IF EXISTS "Anyone can view options of active exams" ON public.alternativas;
CREATE POLICY "Anyone can view options of active exams" 
ON public.alternativas FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.perguntas p 
  JOIN public.provas ex ON p.prova_id = ex.id 
  WHERE p.id = alternativas.pergunta_id AND (ex.status IN ('Ativa', 'Ativo') OR (SELECT get_my_role()) IN ('admin', 'master'))
));

DROP POLICY IF EXISTS "Admins can manage alternatives" ON public.alternativas;
CREATE POLICY "Admins can manage alternatives" 
ON public.alternativas FOR ALL 
USING ((SELECT get_my_role()) IN ('admin', 'master'));
