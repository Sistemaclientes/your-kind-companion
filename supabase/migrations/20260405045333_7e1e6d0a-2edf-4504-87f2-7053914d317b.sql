-- Function for bulk resending confirmation (resetting must_reconfirm)
CREATE OR REPLACE FUNCTION public.bulk_resend_confirmation()
RETURNS JSON AS $$
DECLARE
    count_updated INTEGER;
BEGIN
    UPDATE public.alunos 
    SET must_reconfirm = true,
        email_confirmed = false,
        confirmation_token = encode(gen_random_bytes(32), 'hex'),
        token_expires_at = now() + interval '24 hours'
    WHERE email_confirmed = false OR status = 'Aguardando Confirmação';
    
    GET DIAGNOSTICS count_updated = ROW_COUNT;
    
    RETURN json_build_object(
        'success', true, 
        'message', count_updated || ' alunos marcados para confirmação.',
        'count', count_updated
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update the ranking view to be more comprehensive
CREATE OR REPLACE VIEW public.vw_ranking_alunos AS
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
        -- Pega o melhor resultado de cada aluno para cada prova
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
    DENSE_RANK() OVER (PARTITION BY prova_id ORDER BY pontuacao DESC, data_conclusao ASC) as posicao
FROM ranked_results
WHERE attempt_rank = 1;

-- Add a column to track last activity on the profiles table for real-time monitoring
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Trigger to update last_activity on common operations
CREATE OR REPLACE FUNCTION public.update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET last_activity = now() WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for results submission (counts as activity)
DROP TRIGGER IF EXISTS tr_update_activity_on_result ON public.resultados;
CREATE TRIGGER tr_update_activity_on_result
AFTER INSERT ON public.resultados
FOR EACH ROW EXECUTE FUNCTION public.update_last_activity();
