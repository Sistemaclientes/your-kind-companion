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

-- Fix overly permissive search_path on public schema
ALTER DATABASE postgres SET search_path TO public, extensions;

-- Robust get_my_role function
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    -- 1. Check if it's an admin (priority)
    SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    -- 2. Fallback to admins table
    SELECT 
        CASE 
            WHEN is_master THEN 'master'
            ELSE 'admin'
        END INTO v_role 
    FROM public.admins 
    WHERE id = auth.uid() OR email = (auth.jwt() ->> 'email');
    
    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    -- 3. Check if it's an aluno
    IF EXISTS (SELECT 1 FROM public.alunos WHERE id = auth.uid() OR email = (auth.jwt() ->> 'email')) THEN
        RETURN 'aluno';
    END IF;

    RETURN 'guest';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Standard check_is_admin function
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN public.get_my_role() IN ('admin', 'master');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure view uses security_invoker=true for RLS compliance
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

-- Optimized view for dashboard stats
CREATE OR REPLACE VIEW public.vw_dashboard_stats 
WITH (security_invoker=true)
AS
SELECT 
    (SELECT count(*) FROM public.provas) AS total_provas,
    (SELECT count(*) FROM public.alunos) AS total_alunos,
    (SELECT count(*) FROM public.resultados WHERE status = 'Finalizado') AS total_resultados,
    (SELECT COALESCE(avg(pontuacao), 0) FROM public.resultados WHERE status = 'Finalizado') AS media_geral;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resultados_aluno_id ON public.resultados(aluno_id);
CREATE INDEX IF NOT EXISTS idx_resultados_prova_id ON public.resultados(prova_id);
CREATE INDEX IF NOT EXISTS idx_resultados_status ON public.resultados(status);
CREATE INDEX IF NOT EXISTS idx_perguntas_prova_id ON public.perguntas(prova_id);
CREATE INDEX IF NOT EXISTS idx_alternativas_pergunta_id ON public.alternativas(pergunta_id);
