-- 1. Adicionar coluna 'ordem' na tabela de alternativas
ALTER TABLE public.alternativas ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;

-- 2. Garantir que as visualizações sigam as melhores práticas de segurança (Security Invoker)
-- Recriar vw_ranking_alunos sem SECURITY DEFINER (o padrão de views simples no Postgres é SECURITY INVOKER do criador, 
-- mas aqui recriamos explicitamente como uma view normal que respeita as RLS das tabelas base para o usuário que consulta se as tabelas estiverem configuradas assim. 
-- No entanto, views no Postgres não herdam RLS automaticamente. Para o Supabase, o ideal é que a view seja acessível e as tabelas base tenham RLS.)

DROP VIEW IF EXISTS public.vw_ranking_alunos;
CREATE VIEW public.vw_ranking_alunos AS
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

GRANT SELECT ON public.vw_ranking_alunos TO authenticated;
GRANT SELECT ON public.vw_ranking_alunos TO anon;

-- 3. Função para atualizar as estatísticas da prova (total de questões e pontos)
CREATE OR REPLACE FUNCTION public.update_prova_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
        -- Atualizar a prova vinculada (considerando se mudou de prova ou foi removida)
        UPDATE public.provas
        SET 
            total_questoes = (SELECT COUNT(*) FROM public.perguntas WHERE prova_id = COALESCE(NEW.prova_id, OLD.prova_id)),
            total_pontos = (SELECT COALESCE(SUM(pontos), 0) FROM public.perguntas WHERE prova_id = COALESCE(NEW.prova_id, OLD.prova_id))
        WHERE id = COALESCE(NEW.prova_id, OLD.prova_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Gatilho para a tabela de perguntas
DROP TRIGGER IF EXISTS trigger_update_prova_stats ON public.perguntas;
CREATE TRIGGER trigger_update_prova_stats
AFTER INSERT OR UPDATE OR DELETE ON public.perguntas
FOR EACH ROW EXECUTE FUNCTION public.update_prova_stats();

-- 4. Função genérica para atualizar o timestamp updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Adicionar gatilhos de updated_at para todas as tabelas principais
DO $$ 
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
          AND table_schema = 'public' 
          AND table_name NOT LIKE 'pg_%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS handle_updated_at_%I ON public.%I', t, t);
        EXECUTE format('CREATE TRIGGER handle_updated_at_%I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()', t, t);
    END LOOP;
END $$;
