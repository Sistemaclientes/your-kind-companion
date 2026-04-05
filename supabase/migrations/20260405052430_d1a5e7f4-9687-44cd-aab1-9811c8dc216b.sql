-- 1. Fix Linter: Move pg_net extension to extensions schema
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    BEGIN
      ALTER EXTENSION "pg_net" SET SCHEMA extensions;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not move pg_net to extensions schema';
    END;
  END IF;
END $$;

-- 2. Security: Refine resultados policy
-- Instead of just checking if slug is not null, let's make it clearer that this is for public/authenticated access to a specific result
DROP POLICY IF EXISTS "Public can view results by slug" ON public.resultados;
CREATE POLICY "Public can view results by slug" 
ON public.resultados 
FOR SELECT 
USING (slug IS NOT NULL AND status = 'Finalizado');

-- 3. Performance: Add optimized index for ranking and dashboard
CREATE INDEX IF NOT EXISTS idx_resultados_pontuacao_data_desc ON public.resultados(pontuacao DESC, data DESC);
CREATE INDEX IF NOT EXISTS idx_resultados_aluno_id_status ON public.resultados(aluno_id, status);

-- 4. Audit: Ensure all views have security_invoker = true
-- This is already done for most, but let's be exhaustive
ALTER VIEW IF EXISTS public.vw_dashboard_stats SET (security_invoker = true);
ALTER VIEW IF EXISTS public.vw_provas_stats SET (security_invoker = true);
ALTER VIEW IF EXISTS public.vw_ranking_alunos SET (security_invoker = true);
ALTER VIEW IF EXISTS public.vw_alunos_stats SET (security_invoker = true);
ALTER VIEW IF EXISTS public.vw_turmas_performance SET (security_invoker = true);

-- 5. Data Integrity: Ensure updated_at triggers exist for all core tables
-- Many already have them, but let's ensure consistency
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name IN ('provas', 'perguntas', 'alternativas', 'alunos', 'resultados', 'categorias', 'admins', 'notificacoes', 'configuracoes', 'turmas', 'profiles')
    LOOP
        EXECUTE format('
            DO $inner$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = %L) THEN
                    CREATE TRIGGER %I
                    BEFORE UPDATE ON public.%I
                    FOR EACH ROW
                    EXECUTE FUNCTION public.update_updated_at_column();
                END IF;
            END $inner$;', 
            'tr_update_updated_at_' || t, 
            'tr_update_updated_at_' || t, 
            t);
    END LOOP;
END $$;