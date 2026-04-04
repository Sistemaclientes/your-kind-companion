-- 1. Fix tr_update_prova_stats trigger to include INSERT
DROP TRIGGER IF EXISTS tr_update_prova_stats ON public.perguntas;
CREATE TRIGGER tr_update_prova_stats
AFTER INSERT OR UPDATE OR DELETE ON public.perguntas
FOR EACH ROW EXECUTE FUNCTION public.update_prova_stats();

-- 2. Trigger to set created_by on provas table automatically
CREATE OR REPLACE FUNCTION public.set_provas_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS tr_set_provas_created_by ON public.provas;
CREATE TRIGGER tr_set_provas_created_by
BEFORE INSERT ON public.provas
FOR EACH ROW EXECUTE FUNCTION public.set_provas_created_by();

-- 3. Trigger to fill pontos_pergunta in respostas_aluno automatically
CREATE OR REPLACE FUNCTION public.set_respostas_aluno_pontos()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pontos_pergunta IS NULL THEN
    NEW.pontos_pergunta := (SELECT pontos FROM public.perguntas WHERE id = NEW.pergunta_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS tr_set_respostas_aluno_pontos ON public.respostas_aluno;
CREATE TRIGGER tr_set_respostas_aluno_pontos
BEFORE INSERT ON public.respostas_aluno
FOR EACH ROW EXECUTE FUNCTION public.set_respostas_aluno_pontos();

-- 4. Trigger to ensure aluno_id is set in resultados based on email_aluno
CREATE OR REPLACE FUNCTION public.ensure_resultados_aluno_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.aluno_id IS NULL AND NEW.email_aluno IS NOT NULL THEN
    SELECT id INTO NEW.aluno_id FROM public.alunos WHERE email = NEW.email_aluno;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS tr_ensure_resultados_aluno_id ON public.resultados;
CREATE TRIGGER tr_ensure_resultados_aluno_id
BEFORE INSERT ON public.resultados
FOR EACH ROW EXECUTE FUNCTION public.ensure_resultados_aluno_id();

-- 5. Enhance the statistics view with analytics
DROP VIEW IF EXISTS public.vw_provas_stats;
CREATE VIEW public.vw_provas_stats AS
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
    (SELECT count(DISTINCT r.aluno_id) FROM public.resultados r WHERE r.prova_id = p.id) AS studentcount,
    (SELECT count(*) FROM public.resultados r WHERE r.prova_id = p.id) AS total_submissions,
    (SELECT COALESCE(AVG(r.pontuacao), 0) FROM public.resultados r WHERE r.prova_id = p.id) AS avg_score,
    (SELECT COALESCE(MAX(r.pontuacao), 0) FROM public.resultados r WHERE r.prova_id = p.id) AS max_score
   FROM public.provas p
     LEFT JOIN public.categorias c ON p.categoria_id = c.id;