-- 1. Fix Function Search Path Mutable for existing functions
ALTER FUNCTION public.generate_unique_result_slug() SET search_path = public;
ALTER FUNCTION public.sync_resultado_aluno_info() SET search_path = public;
ALTER FUNCTION public.update_resultado_stats() SET search_path = public;
ALTER FUNCTION public.set_respostas_aluno_pontos() SET search_path = public;
ALTER FUNCTION public.update_turma_student_count() SET search_path = public;
ALTER FUNCTION public.get_my_role() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_new_student_welcome_email() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.generate_slug(TEXT) SET search_path = public;
ALTER FUNCTION public.set_student_slug() SET search_path = public;
ALTER FUNCTION public.set_admin_slug() SET search_path = public;
ALTER FUNCTION public.ensure_resultados_aluno_id() SET search_path = public;
ALTER FUNCTION public.set_resultado_slug() SET search_path = public;
ALTER FUNCTION public.set_provas_created_by() SET search_path = public;
ALTER FUNCTION public.update_prova_stats() SET search_path = public;
ALTER FUNCTION public.check_is_admin() SET search_path = public;
ALTER FUNCTION public.handle_updated_at() SET search_path = public;

-- 2. Add turma_id to provas table
ALTER TABLE public.provas ADD COLUMN IF NOT EXISTS turma_id UUID REFERENCES public.turmas(id);

-- 3. Create view for student stats (vw_alunos_stats)
-- This replaces the manual calculation in src/lib/api.ts for /dashboard/students
DROP VIEW IF EXISTS public.vw_alunos_stats;
CREATE OR REPLACE VIEW public.vw_alunos_stats WITH (security_invoker = true) AS
SELECT 
    a.id as aluno_id,
    a.nome,
    a.email,
    a.cpf,
    a.telefone,
    a.status,
    a.slug,
    a.turma_id,
    t.nome as turma_nome,
    COUNT(r.id) as provas_contagem,
    COALESCE(AVG(r.pontuacao), 0) as media_pontuacao,
    MAX(r.data) as ultimo_acesso,
    MIN(r.data) as primeiro_acesso,
    a.created_at
FROM public.alunos a
LEFT JOIN public.turmas t ON a.turma_id = t.id
LEFT JOIN public.resultados r ON a.id = r.aluno_id AND r.status = 'Finalizado'
GROUP BY a.id, a.nome, a.email, a.cpf, a.telefone, a.status, a.slug, a.turma_id, t.nome;

-- 4. Improve Ranking View (vw_ranking_alunos)
-- Now shows only the best attempt of each student per exam
DROP VIEW IF EXISTS public.vw_ranking_alunos;
CREATE OR REPLACE VIEW public.vw_ranking_alunos WITH (security_invoker = true) AS
WITH ranked_results AS (
    SELECT 
        r.id AS resultado_id,
        r.slug AS resultado_slug,
        r.prova_id,
        p.titulo AS prova_titulo,
        r.aluno_id,
        a.nome AS aluno_nome,
        a.email AS aluno_email,
        a.avatar_url AS aluno_avatar,
        r.pontuacao,
        r.acertos,
        r.total,
        r.data AS data_conclusao,
        ROW_NUMBER() OVER (PARTITION BY r.prova_id, r.aluno_id ORDER BY r.pontuacao DESC, r.data ASC) as attempt_rank
    FROM public.resultados r
    JOIN public.provas p ON r.prova_id = p.id
    JOIN public.alunos a ON r.aluno_id = a.id
    WHERE r.status = 'Finalizado'
)
SELECT 
    resultado_id,
    resultado_slug,
    prova_id,
    prova_titulo,
    aluno_id,
    aluno_nome,
    aluno_email,
    aluno_avatar,
    pontuacao,
    acertos,
    total,
    data_conclusao,
    DENSE_RANK() OVER (PARTITION BY prova_id ORDER BY pontuacao DESC, data_conclusao ASC) AS posicao
FROM ranked_results
WHERE attempt_rank = 1;

-- 5. Update dashboard stats view to be more reliable
DROP VIEW IF EXISTS public.vw_dashboard_stats;
CREATE OR REPLACE VIEW public.vw_dashboard_stats WITH (security_invoker = true) AS
SELECT 
    (SELECT COUNT(*) FROM public.provas) as total_provas,
    (SELECT COUNT(*) FROM public.alunos) as total_alunos,
    (SELECT COUNT(*) FROM public.resultados WHERE status = 'Finalizado') as total_resultados,
    (SELECT COALESCE(AVG(pontuacao), 0) FROM public.resultados WHERE status = 'Finalizado') as media_geral;

-- Grant permissions
GRANT SELECT ON public.vw_alunos_stats TO authenticated;
GRANT SELECT ON public.vw_ranking_alunos TO authenticated;
GRANT SELECT ON public.vw_dashboard_stats TO authenticated;
GRANT SELECT ON public.vw_provas_stats TO authenticated;
GRANT SELECT ON public.vw_turmas_performance TO authenticated;