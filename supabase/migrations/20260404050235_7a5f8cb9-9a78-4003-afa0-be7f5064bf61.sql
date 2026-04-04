-- Add total_pontos to provas table
ALTER TABLE public.provas ADD COLUMN IF NOT EXISTS total_pontos NUMERIC DEFAULT 0;

-- Add scoring columns to resultados table
ALTER TABLE public.resultados ADD COLUMN IF NOT EXISTS pontos_total NUMERIC DEFAULT 0;
ALTER TABLE public.resultados ADD COLUMN IF NOT EXISTS pontos_obtidos NUMERIC DEFAULT 0;

-- Add pontos_pergunta to respostas_aluno
ALTER TABLE public.respostas_aluno ADD COLUMN IF NOT EXISTS pontos_pergunta NUMERIC DEFAULT 1;

-- Function to update total_questoes and total_pontos in provas table
CREATE OR REPLACE FUNCTION public.update_prova_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        UPDATE public.provas
        SET 
            total_questoes = (SELECT count(*) FROM public.perguntas WHERE prova_id = OLD.prova_id),
            total_pontos = (SELECT COALESCE(sum(pontos), 0) FROM public.perguntas WHERE prova_id = OLD.prova_id)
        WHERE id = OLD.prova_id;
    ELSE
        UPDATE public.provas
        SET 
            total_questoes = (SELECT count(*) FROM public.perguntas WHERE prova_id = NEW.prova_id),
            total_pontos = (SELECT COALESCE(sum(pontos), 0) FROM public.perguntas WHERE prova_id = NEW.prova_id)
        WHERE id = NEW.prova_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for perguntas table to keep provas stats in sync
DROP TRIGGER IF EXISTS tr_update_prova_stats ON public.perguntas;
CREATE TRIGGER tr_update_prova_stats
AFTER INSERT OR UPDATE OR DELETE ON public.perguntas
FOR EACH ROW
EXECUTE FUNCTION public.update_prova_stats();

-- Update existing provas stats
UPDATE public.provas p
SET 
    total_questoes = (SELECT count(*) FROM public.perguntas WHERE prova_id = p.id),
    total_pontos = (SELECT COALESCE(sum(pontos), 0) FROM public.perguntas WHERE prova_id = p.id);

-- Recreate view to include total_pontos
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
    c.nome AS categoria_nome,
    c.cor AS categoria_cor,
    c.icon AS categoria_icon,
    ( SELECT count(DISTINCT r.aluno_id) AS count
           FROM resultados r
          WHERE (r.prova_id = p.id)) AS studentcount
   FROM (provas p
     LEFT JOIN categorias c ON ((p.categoria_id = c.id)));
