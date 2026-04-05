-- Allow anonymous/custom-auth inserts for resultados
DROP POLICY IF EXISTS "Student self-insert results" ON public.resultados;
CREATE POLICY "Permitir inserção de resultados (público/custom)" 
ON public.resultados 
FOR INSERT 
WITH CHECK (true);

-- Allow anonymous/custom-auth inserts for respostas_aluno
DROP POLICY IF EXISTS "Aluno cria respostas" ON public.respostas_aluno;
CREATE POLICY "Permitir inserção de respostas (público/custom)" 
ON public.respostas_aluno 
FOR INSERT 
WITH CHECK (true);

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_resultados_slug ON public.resultados(slug);
CREATE INDEX IF NOT EXISTS idx_resultados_aluno_id ON public.resultados(aluno_id);
CREATE INDEX IF NOT EXISTS idx_respostas_aluno_resultado_id ON public.respostas_aluno(resultado_id);

-- Ensure the slug trigger is robust
CREATE OR REPLACE FUNCTION public.set_resultado_slug()
RETURNS TRIGGER AS $$
DECLARE
    prova_titulo TEXT;
    base_slug TEXT;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    SELECT titulo INTO prova_titulo FROM public.provas WHERE id = NEW.prova_id;
    base_slug := lower(regexp_replace(COALESCE(prova_titulo, 'resultado'), '[^a-zA-Z0-9]', '-', 'g'));
    NEW.slug := base_slug || '-' || substr(md5(random()::text), 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_set_resultado_slug ON public.resultados;
CREATE TRIGGER tr_set_resultado_slug
BEFORE INSERT ON public.resultados
FOR EACH ROW
EXECUTE FUNCTION public.set_resultado_slug();
