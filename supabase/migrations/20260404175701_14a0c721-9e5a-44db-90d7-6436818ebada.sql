-- Adicionar colunas created_at onde estão faltando
ALTER TABLE public.perguntas ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.resultados ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Garantir que a função update_updated_at_column exista
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar gatilho updated_at em todas as tabelas que possuem a coluna
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
        AND table_name NOT LIKE 'vw_%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS tr_update_updated_at ON public.%I', t);
        EXECUTE format('CREATE TRIGGER tr_update_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t);
    END LOOP;
END;
$$;

-- Configurar gatilhos para geração automática de slugs
-- Alunos
DROP TRIGGER IF EXISTS tr_set_student_slug ON public.alunos;
CREATE TRIGGER tr_set_student_slug
BEFORE INSERT OR UPDATE OF nome ON public.alunos
FOR EACH ROW
EXECUTE FUNCTION public.set_student_slug();

-- Admins
DROP TRIGGER IF EXISTS tr_set_admin_slug ON public.admins;
CREATE TRIGGER tr_set_admin_slug
BEFORE INSERT OR UPDATE OF nome ON public.admins
FOR EACH ROW
EXECUTE FUNCTION public.set_admin_slug();

-- Resultados
DROP TRIGGER IF EXISTS tr_set_resultado_slug ON public.resultados;
CREATE TRIGGER tr_set_resultado_slug
BEFORE INSERT ON public.resultados
FOR EACH ROW
EXECUTE FUNCTION public.set_resultado_slug();

-- Provas (Slug e Created By)
DROP TRIGGER IF EXISTS tr_set_provas_created_by ON public.provas;
CREATE TRIGGER tr_set_provas_created_by
BEFORE INSERT ON public.provas
FOR EACH ROW
EXECUTE FUNCTION public.set_provas_created_by();

-- Configurar gatilhos de sincronização e estatísticas
-- Sincronizar info do aluno nos resultados
DROP TRIGGER IF EXISTS tr_sync_resultado_aluno_info ON public.resultados;
CREATE TRIGGER tr_sync_resultado_aluno_info
BEFORE INSERT ON public.resultados
FOR EACH ROW
EXECUTE FUNCTION public.sync_resultado_aluno_info();

-- Atualizar estatísticas do resultado quando uma resposta é dada
DROP TRIGGER IF EXISTS tr_update_resultado_stats ON public.respostas_aluno;
CREATE TRIGGER tr_update_resultado_stats
AFTER INSERT OR UPDATE OR DELETE ON public.respostas_aluno
FOR EACH ROW
EXECUTE FUNCTION public.update_resultado_stats();

-- Atualizar estatísticas da prova quando perguntas são modificadas
DROP TRIGGER IF EXISTS tr_update_prova_stats ON public.perguntas;
CREATE TRIGGER tr_update_prova_stats
AFTER INSERT OR UPDATE OR DELETE ON public.perguntas
FOR EACH ROW
EXECUTE FUNCTION public.update_prova_stats();

-- Configurar gatilho para preencher pontos_pergunta e corretude em respostas_aluno
DROP TRIGGER IF EXISTS tr_set_respostas_aluno_pontos ON public.respostas_aluno;
CREATE TRIGGER tr_set_respostas_aluno_pontos
BEFORE INSERT ON public.respostas_aluno
FOR EACH ROW
EXECUTE FUNCTION public.set_respostas_aluno_pontos();