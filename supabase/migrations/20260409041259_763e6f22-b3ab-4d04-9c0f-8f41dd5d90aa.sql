-- Allow anonymous users to view published exams
CREATE POLICY "Anon can view published exams"
ON public.provas
FOR SELECT
TO anon
USING (status = 'Ativa');

-- Allow anonymous users to view questions of published exams
CREATE POLICY "Anon can view questions"
ON public.perguntas
FOR SELECT
TO anon
USING (EXISTS (
  SELECT 1 FROM public.provas
  WHERE provas.id = perguntas.prova_id AND provas.status = 'Ativa'
));

-- Allow anonymous users to view answers of published exams
CREATE POLICY "Anon can view answers"
ON public.respostas
FOR SELECT
TO anon
USING (EXISTS (
  SELECT 1 FROM public.perguntas
  JOIN public.provas ON provas.id = perguntas.prova_id
  WHERE perguntas.id = respostas.pergunta_id AND provas.status = 'Ativa'
));