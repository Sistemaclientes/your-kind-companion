-- Criar tabela de turmas (Classes/Groups)
CREATE TABLE IF NOT EXISTS public.turmas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    descricao TEXT,
    professor_id UUID REFERENCES public.admins(id),
    total_alunos INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS em turmas
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;

-- Políticas para turmas
CREATE POLICY "Turmas are viewable by everyone authenticated" 
ON public.turmas FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage turmas" 
ON public.turmas FOR ALL USING (get_my_role() IN ('admin', 'master'));

-- Adicionar turma_id na tabela alunos
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS turma_id UUID REFERENCES public.turmas(id);

-- Criar tabela de logs de atividades (Activity Log)
CREATE TABLE IF NOT EXISTS public.logs_atividade (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- Pode ser admin ou aluno
    user_role TEXT,
    acao TEXT NOT NULL, -- Ex: 'CREATE_EXAM', 'SUBMIT_ANSWERS', 'UPDATE_SETTINGS'
    entidade_tipo TEXT, -- Ex: 'PROVA', 'ALUNO', 'CONFIG'
    entidade_id TEXT,
    detalhes JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS em logs_atividade
ALTER TABLE public.logs_atividade ENABLE ROW LEVEL SECURITY;

-- Políticas para logs_atividade
CREATE POLICY "Admins view all logs" 
ON public.logs_atividade FOR SELECT USING (get_my_role() IN ('admin', 'master'));

CREATE POLICY "System can insert logs" 
ON public.logs_atividade FOR INSERT WITH CHECK (true);

-- Criar tabela de dicas do sistema (Avaliador Tips)
CREATE TABLE IF NOT EXISTS public.dicas_sistema (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    tipo TEXT DEFAULT 'Dica do Avaliador',
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS em dicas_sistema
ALTER TABLE public.dicas_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas para dicas_sistema
CREATE POLICY "Dicas are viewable by admins" 
ON public.dicas_sistema FOR SELECT USING (get_my_role() IN ('admin', 'master'));

CREATE POLICY "Admins manage dicas" 
ON public.dicas_sistema FOR ALL USING (get_my_role() IN ('admin', 'master'));

-- Inserir dicas iniciais
INSERT INTO public.dicas_sistema (titulo, conteudo)
VALUES 
    ('Dica do Avaliador', 'Provas com menos de 10 questões têm 30% mais engajamento.'),
    ('Aumento de Performance', 'Estudantes que revisam o gabarito costumam ter notas 15% maiores na prova seguinte.'),
    ('Engajamento', 'Enviar lembretes por e-mail aumenta a taxa de conclusão em até 40%.')
ON CONFLICT DO NOTHING;

-- Refatorar views para usar SECURITY INVOKER (Linter warning fix)
-- 1. vw_dashboard_stats
DROP VIEW IF EXISTS public.vw_dashboard_stats;
CREATE OR REPLACE VIEW public.vw_dashboard_stats WITH (security_invoker = true) AS
SELECT 
    (SELECT COUNT(*) FROM public.provas) as total_provas,
    (SELECT COUNT(*) FROM public.alunos) as total_alunos,
    (SELECT COUNT(*) FROM public.resultados) as total_resultados,
    (SELECT COALESCE(AVG(pontuacao), 0) FROM public.resultados) as media_geral;

-- 2. vw_provas_stats
DROP VIEW IF EXISTS public.vw_provas_stats;
CREATE OR REPLACE VIEW public.vw_provas_stats WITH (security_invoker = true) AS
SELECT 
    p.id as prova_id,
    p.titulo,
    p.status,
    COUNT(DISTINCT r.id) as total_conclusoes,
    COUNT(DISTINCT r.aluno_id) as alunos_unicos,
    COALESCE(AVG(r.pontuacao), 0) as media_pontuacao,
    MIN(r.pontuacao) as nota_minima,
    MAX(r.pontuacao) as nota_maxima
FROM public.provas p
LEFT JOIN public.resultados r ON p.id = r.prova_id AND r.status = 'Finalizado'
GROUP BY p.id, p.titulo, p.status;

-- Criar view de performance por turma
CREATE OR REPLACE VIEW public.vw_turmas_performance WITH (security_invoker = true) AS
SELECT 
    t.id as turma_id,
    t.nome as turma_nome,
    COUNT(DISTINCT a.id) as total_alunos,
    COUNT(DISTINCT r.id) as total_provas_concluidas,
    COALESCE(AVG(r.pontuacao), 0) as media_turma
FROM public.turmas t
LEFT JOIN public.alunos a ON t.id = a.turma_id
LEFT JOIN public.resultados r ON a.id = r.aluno_id AND r.status = 'Finalizado'
GROUP BY t.id, t.nome;

-- Adicionar gatilho para atualizar total_alunos em turmas
CREATE OR REPLACE FUNCTION public.update_turma_student_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.turmas SET total_alunos = total_alunos + 1 WHERE id = NEW.turma_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.turmas SET total_alunos = total_alunos - 1 WHERE id = OLD.turma_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.turma_id IS DISTINCT FROM NEW.turma_id) THEN
            IF (OLD.turma_id IS NOT NULL) THEN
                UPDATE public.turmas SET total_alunos = total_alunos - 1 WHERE id = OLD.turma_id;
            END IF;
            IF (NEW.turma_id IS NOT NULL) THEN
                UPDATE public.turmas SET total_alunos = total_alunos + 1 WHERE id = NEW.turma_id;
            END IF;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_turma_student_count ON public.alunos;
CREATE TRIGGER tr_update_turma_student_count
AFTER INSERT OR UPDATE OR DELETE ON public.alunos
FOR EACH ROW EXECUTE FUNCTION public.update_turma_student_count();

-- Grant permissions to authenticated users for the views
GRANT SELECT ON public.vw_dashboard_stats TO authenticated;
GRANT SELECT ON public.vw_provas_stats TO authenticated;
GRANT SELECT ON public.vw_ranking_alunos TO authenticated;
GRANT SELECT ON public.vw_turmas_performance TO authenticated;
