-- Create the extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move specific extensions to the extensions schema (safely)
DO $$ 
BEGIN 
  -- uuid-ossp
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
    BEGIN
      ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not move uuid-ossp to extensions schema';
    END;
  END IF;
  
  -- pgcrypto
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    BEGIN
      ALTER EXTENSION "pgcrypto" SET SCHEMA extensions;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not move pgcrypto to extensions schema';
    END;
  END IF;
END $$;

-- Update function search_path to public
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Update view security to use security_invoker
CREATE OR REPLACE VIEW public.vw_ranking_alunos 
WITH (security_invoker=true)
AS
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

-- Fix overly permissive RLS policy on logs_atividade
DROP POLICY IF EXISTS "System can insert logs" ON public.logs_atividade;
CREATE POLICY "System can insert logs" 
ON public.logs_atividade 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Add SELECT policy for logs_atividade so admins can view them
CREATE POLICY "Admins can view logs"
ON public.logs_atividade
FOR SELECT
USING (public.get_my_role() IN ('admin', 'master'));