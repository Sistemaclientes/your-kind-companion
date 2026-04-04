-- Update vw_ranking_alunos to include slug and set security_invoker = true
DROP VIEW IF EXISTS public.vw_ranking_alunos;
CREATE VIEW public.vw_ranking_alunos 
WITH (security_invoker = true) AS
 SELECT r.id AS resultado_id,
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
    dense_rank() OVER (PARTITION BY r.prova_id ORDER BY r.pontuacao DESC, r.data) AS posicao
   FROM resultados r
     JOIN provas p ON r.prova_id = p.id
     JOIN alunos a ON r.aluno_id = a.id
  WHERE r.status = 'Finalizado'::text;

-- Add policy to allow public viewing of results by slug
-- This is necessary because students aren't using Supabase Auth, but we want them to see their results
CREATE POLICY "Public can view results by slug" 
ON public.resultados 
FOR SELECT 
USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;