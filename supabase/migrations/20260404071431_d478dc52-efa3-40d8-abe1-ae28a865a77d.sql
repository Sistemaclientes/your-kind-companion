-- Criar uma visualização para o ranking de alunos por prova
CREATE OR REPLACE VIEW public.vw_ranking_alunos AS
SELECT 
    r.id AS resultado_id,
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
    DENSE_RANK() OVER (PARTITION BY r.prova_id ORDER BY r.pontuacao DESC, r.data ASC) AS posicao
FROM public.resultados r
JOIN public.provas p ON r.prova_id = p.id
JOIN public.alunos a ON r.aluno_id = a.id
WHERE r.status = 'Finalizado';

-- Adicionar permissões para a view
GRANT SELECT ON public.vw_ranking_alunos TO authenticated;
GRANT SELECT ON public.vw_ranking_alunos TO anon;