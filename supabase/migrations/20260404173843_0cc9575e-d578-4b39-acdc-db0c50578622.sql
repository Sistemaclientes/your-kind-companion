-- 1. Adicionar coluna subtitulo à tabela provas
ALTER TABLE public.provas ADD COLUMN IF NOT EXISTS subtitulo TEXT;

-- 2. Corrigir a função set_respostas_aluno_pontos
-- Agora ela verifica se a resposta está correta antes de atribuir os pontos da pergunta.
CREATE OR REPLACE FUNCTION public.set_respostas_aluno_pontos()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_pontos NUMERIC;
    v_correto BOOLEAN;
BEGIN
    -- Se pontos_pergunta não foi fornecido, buscar da pergunta
    IF NEW.pontos_pergunta IS NULL THEN
        SELECT pontos INTO v_pontos FROM public.perguntas WHERE id = NEW.pergunta_id;
        
        -- Verificar se a alternativa escolhida é a correta (se já não estiver marcado no NEW.correto)
        IF NEW.correto IS NULL AND NEW.alternativa_id IS NOT NULL THEN
            SELECT is_correta INTO v_correto FROM public.alternativas WHERE id = NEW.alternativa_id;
            NEW.correto := COALESCE(v_correto, false);
        END IF;

        -- Atribuir pontos apenas se estiver correto
        IF NEW.correto = true THEN
            NEW.pontos_pergunta := COALESCE(v_pontos, 0);
        ELSE
            NEW.pontos_pergunta := 0;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 3. Criar função para atualizar estatísticas do resultado automaticamente
CREATE OR REPLACE FUNCTION public.update_resultado_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_resultado_id UUID;
    v_total_questoes INTEGER;
    v_acertos INTEGER;
    v_pontos_obtidos NUMERIC;
    v_pontos_total NUMERIC;
BEGIN
    v_resultado_id := COALESCE(NEW.resultado_id, OLD.resultado_id);
    
    IF v_resultado_id IS NOT NULL THEN
        -- Calcular totais do resultado a partir das respostas
        SELECT 
            COUNT(*), 
            COUNT(*) FILTER (WHERE correto = true),
            SUM(pontos_pergunta)
        INTO 
            v_total_questoes, 
            v_acertos, 
            v_pontos_obtidos
        FROM public.respostas_aluno 
        WHERE resultado_id = v_resultado_id;

        -- Buscar o total de pontos possível da prova vinculada ao resultado
        SELECT total_pontos INTO v_pontos_total 
        FROM public.provas p
        JOIN public.resultados r ON r.prova_id = p.id
        WHERE r.id = v_resultado_id;

        -- Atualizar a tabela resultados
        UPDATE public.resultados
        SET 
            total_questoes = v_total_questoes,
            acertos = v_acertos,
            pontos_obtidos = COALESCE(v_pontos_obtidos, 0),
            pontos_total = COALESCE(v_pontos_total, 0),
            -- Calcular pontuação (0-100) baseada nos acertos ou pontos (usando acertos por padrão)
            pontuacao = CASE 
                WHEN v_total_questoes > 0 THEN ROUND((v_acertos::NUMERIC / v_total_questoes::NUMERIC) * 100)
                ELSE 0
            END,
            finalizado_em = CASE WHEN finalizado_em IS NULL THEN NOW() ELSE finalizado_em END,
            updated_at = NOW()
        WHERE id = v_resultado_id;
    END IF;
    
    RETURN NULL;
END;
$function$;

-- 4. Criar gatilho na tabela respostas_aluno para atualizar resultados
DROP TRIGGER IF EXISTS tr_update_resultado_stats ON public.respostas_aluno;
CREATE TRIGGER tr_update_resultado_stats
AFTER INSERT OR UPDATE OR DELETE ON public.respostas_aluno
FOR EACH ROW
EXECUTE FUNCTION public.update_resultado_stats();

-- 5. Função para preencher automaticamente dados do aluno nos resultados
CREATE OR REPLACE FUNCTION public.sync_resultado_aluno_info()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.aluno_id IS NOT NULL THEN
        -- Buscar nome e email se estiverem vazios
        IF NEW.nome_aluno IS NULL OR NEW.email_aluno IS NULL THEN
            SELECT nome, email INTO NEW.nome_aluno, NEW.email_aluno 
            FROM public.alunos 
            WHERE id = NEW.aluno_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;

-- 6. Gatilho para sincronizar info do aluno
DROP TRIGGER IF EXISTS tr_sync_resultado_aluno_info ON public.resultados;
CREATE TRIGGER tr_sync_resultado_aluno_info
BEFORE INSERT ON public.resultados
FOR EACH ROW
EXECUTE FUNCTION public.sync_resultado_aluno_info();

-- 7. Consolidar gatilhos de atualização de estatísticas de provas
-- Remover gatilhos duplicados se existirem e garantir o tr_update_prova_stats
DROP TRIGGER IF EXISTS trigger_update_prova_stats ON public.perguntas;
DROP TRIGGER IF EXISTS tr_update_prova_stats ON public.perguntas;

CREATE TRIGGER tr_update_prova_stats
AFTER INSERT OR UPDATE OR DELETE ON public.perguntas
FOR EACH ROW
EXECUTE FUNCTION public.update_prova_stats();

-- 8. Garantir que a view vw_provas_stats reflita os campos atualizados
DROP VIEW IF EXISTS public.vw_provas_stats;
CREATE VIEW public.vw_provas_stats AS
 SELECT p.id,
    p.titulo,
    p.subtitulo,
    p.descricao,
    p.slug,
    p.categoria_id,
    p.created_at,
    p.status,
    p.total_questoes,
    p.total_pontos,
    p.dificuldade,
    p.tags,
    c.nome AS categoria_nome,
    c.cor AS categoria_cor,
    c.icon AS categoria_icon,
    (SELECT count(DISTINCT r.aluno_id) FROM public.resultados r WHERE r.prova_id = p.id) AS studentcount,
    (SELECT count(*) FROM public.resultados r WHERE r.prova_id = p.id) AS total_submissions,
    (SELECT COALESCE(AVG(r.pontuacao), 0) FROM public.resultados r WHERE r.prova_id = p.id) AS avg_score,
    (SELECT COALESCE(MAX(r.pontuacao), 0) FROM public.resultados r WHERE r.prova_id = p.id) AS max_score
   FROM public.provas p
     LEFT JOIN public.categorias c ON p.categoria_id = c.id;
