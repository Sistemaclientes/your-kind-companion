-- 1. Fix Security Definer View
DROP VIEW IF EXISTS public.vw_provas_stats;
CREATE VIEW public.vw_provas_stats AS
SELECT p.id,
    p.titulo,
    p.descricao,
    p.slug,
    p.categoria_id,
    p.created_at,
    p.status,
    c.nome AS categoria_nome,
    c.cor AS categoria_cor,
    c.icon AS categoria_icon,
    ( SELECT count(*) AS count
           FROM perguntas per
          WHERE (per.prova_id = p.id)) AS qcount,
    ( SELECT count(DISTINCT r.aluno_id) AS count
           FROM resultados r
          WHERE (r.prova_id = p.id)) AS studentcount
   FROM (provas p
     LEFT JOIN categorias c ON ((p.categoria_id = c.id)));

-- 2. Fix Function Search Path (Security best practice)
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.handle_new_student_welcome_email() SET search_path = public;

-- 3. Cleanup redundant column in provas
ALTER TABLE public.provas DROP COLUMN IF EXISTS categoria;

-- 4. Enhance alternativas table
ALTER TABLE public.alternativas 
ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS explicacao TEXT;

-- 5. Add last_login to admins
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- 6. Ensure must_reconfirm exists in alunos (safety check)
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS must_reconfirm BOOLEAN DEFAULT false;

-- 7. Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_perguntas_prova_id ON public.perguntas(prova_id);
CREATE INDEX IF NOT EXISTS idx_alternativas_pergunta_id ON public.alternativas(pergunta_id);
CREATE INDEX IF NOT EXISTS idx_resultados_prova_id ON public.resultados(prova_id);
CREATE INDEX IF NOT EXISTS idx_resultados_aluno_id ON public.resultados(aluno_id);
CREATE INDEX IF NOT EXISTS idx_respostas_aluno_resultado_id ON public.respostas_aluno(resultado_id);
CREATE INDEX IF NOT EXISTS idx_respostas_aluno_prova_id ON public.respostas_aluno(prova_id);
CREATE INDEX IF NOT EXISTS idx_respostas_aluno_aluno_id ON public.respostas_aluno(aluno_id);
CREATE INDEX IF NOT EXISTS idx_provas_categoria_id ON public.provas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON public.notificacoes(user_id);
