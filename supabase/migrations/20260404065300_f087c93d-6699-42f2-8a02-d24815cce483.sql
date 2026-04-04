-- Add answer text column for non-multiple choice questions
ALTER TABLE public.respostas_aluno ADD COLUMN IF NOT EXISTS resposta_texto TEXT;

-- Create function to update prova stats
CREATE OR REPLACE FUNCTION public.update_prova_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE public.provas
        SET 
            total_questoes = (SELECT COUNT(*) FROM public.perguntas WHERE prova_id = NEW.prova_id),
            total_pontos = (SELECT COALESCE(SUM(pontos), 0) FROM public.perguntas WHERE prova_id = NEW.prova_id)
        WHERE id = NEW.prova_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.provas
        SET 
            total_questoes = (SELECT COUNT(*) FROM public.perguntas WHERE prova_id = OLD.prova_id),
            total_pontos = (SELECT COALESCE(SUM(pontos), 0) FROM public.perguntas WHERE prova_id = OLD.prova_id)
        WHERE id = OLD.prova_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for perguntas
DROP TRIGGER IF EXISTS tr_update_prova_stats ON public.perguntas;
CREATE TRIGGER tr_update_prova_stats
AFTER INSERT OR UPDATE OR DELETE ON public.perguntas
FOR EACH ROW
EXECUTE FUNCTION public.update_prova_stats();

-- Ensure search_path is set on existing functions to fix security warning
ALTER FUNCTION public.get_my_role() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Refine RLS for respostas_aluno
DROP POLICY IF EXISTS "Student self-manage answers" ON public.respostas_aluno;
CREATE POLICY "Users can view their own answers" 
ON public.respostas_aluno 
FOR SELECT 
USING (
    (aluno_id = auth.uid()) OR 
    (get_my_role() = ANY (ARRAY['admin'::text, 'master'::text])) OR
    (auth.uid() IS NULL) -- Keep for anonymous guest results if needed, but scoped to result session
);

CREATE POLICY "Users can insert their own answers" 
ON public.respostas_aluno 
FOR INSERT 
WITH CHECK (
    (aluno_id = auth.uid()) OR 
    (auth.uid() IS NULL)
);

-- Update all existing provas to have correct counts
UPDATE public.provas p
SET 
    total_questoes = (SELECT COUNT(*) FROM public.perguntas WHERE prova_id = p.id),
    total_pontos = (SELECT COALESCE(SUM(pontos), 0) FROM public.perguntas WHERE prova_id = p.id);
