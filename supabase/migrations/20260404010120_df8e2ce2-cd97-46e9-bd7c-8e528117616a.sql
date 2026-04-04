-- Fix insecure RLS policies for Provas
DROP POLICY IF EXISTS "Admins can manage all exams" ON public.provas;
DROP POLICY IF EXISTS "Public read access for active exams" ON public.provas;

CREATE POLICY "Anyone can view active exams" 
ON public.provas FOR SELECT 
USING (status = 'Ativa' OR status = 'Ativo');

CREATE POLICY "Admins can manage exams" 
ON public.provas FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'master')
  )
);

-- Fix insecure RLS policies for Perguntas
DROP POLICY IF EXISTS "Admins can manage all questions" ON public.perguntas;
DROP POLICY IF EXISTS "Public read access for questions" ON public.perguntas;

CREATE POLICY "Anyone can view questions of active exams" 
ON public.perguntas FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.provas 
    WHERE provas.id = perguntas.prova_id AND (status = 'Ativa' OR status = 'Ativo')
  )
);

CREATE POLICY "Admins can manage questions" 
ON public.perguntas FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'master')
  )
);

-- Fix insecure RLS policies for Alternativas
DROP POLICY IF EXISTS "Admins can manage all options" ON public.alternativas;
DROP POLICY IF EXISTS "Public read access for options" ON public.alternativas;

CREATE POLICY "Anyone can view options of active exams" 
ON public.alternativas FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.perguntas p 
    JOIN public.provas ex ON p.prova_id = ex.id 
    WHERE p.id = alternativas.pergunta_id AND (ex.status = 'Ativa' OR ex.status = 'Ativo')
  )
);

CREATE POLICY "Admins can manage alternatives" 
ON public.alternativas FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'master')
  )
);

-- Fix insecure RLS policies for Resultados
DROP POLICY IF EXISTS "Admins can view all results" ON public.resultados;
DROP POLICY IF EXISTS "Anyone can submit results" ON public.resultados;

CREATE POLICY "Users can view their own results" 
ON public.resultados FOR SELECT 
USING (auth.uid() = aluno_id OR EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'master')
));

CREATE POLICY "Authenticated users can insert their own results" 
ON public.resultados FOR INSERT 
WITH CHECK (auth.uid() = aluno_id);

CREATE POLICY "Admins can manage results" 
ON public.resultados FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'master')
  )
);

-- Profiles trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'nome', 'aluno');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add missing columns to help with migration and features
ALTER TABLE public.provas ADD COLUMN IF NOT EXISTS total_questoes INTEGER DEFAULT 0;
ALTER TABLE public.resultados ADD COLUMN IF NOT EXISTS finalizado_em TIMESTAMP WITH TIME ZONE DEFAULT now();
