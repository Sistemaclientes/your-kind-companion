-- Fix search_path for functions to address security linter warnings
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.set_student_slug() SET search_path = public;
ALTER FUNCTION public.set_admin_slug() SET search_path = public;
ALTER FUNCTION public.set_resultado_slug() SET search_path = public;
ALTER FUNCTION public.set_provas_created_by() SET search_path = public;
ALTER FUNCTION public.sync_resultado_aluno_info() SET search_path = public;
ALTER FUNCTION public.update_resultado_stats() SET search_path = public;
ALTER FUNCTION public.update_prova_stats() SET search_path = public;
ALTER FUNCTION public.set_respostas_aluno_pontos() SET search_path = public;

-- Ensure configuracoes table exists and has a unique constraint on chave
CREATE TABLE IF NOT EXISTS public.configuracoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    chave TEXT NOT NULL UNIQUE,
    valor JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on configuracoes
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Policies for configuracoes
CREATE POLICY "Configuracoes are viewable by everyone" 
ON public.configuracoes FOR SELECT USING (true);

CREATE POLICY "Admins can manage configuracoes" 
ON public.configuracoes FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND (is_master = true OR is_protected = true)));

-- Insert default settings if not exists
INSERT INTO public.configuracoes (chave, valor)
VALUES ('academicas', '{"nota_corte": 7.0, "mensagem_sucesso": "Parabéns pelo seu desempenho!", "mensagem_falha": "Infelizmente você não atingiu a pontuação mínima."}')
ON CONFLICT (chave) DO NOTHING;

INSERT INTO public.configuracoes (chave, valor)
VALUES ('experiencia', '{"exibir_resultado": true, "permitir_refazer": false, "liberar_revisao": true}')
ON CONFLICT (chave) DO NOTHING;

-- Add updated_at trigger to configuracoes
DROP TRIGGER IF EXISTS tr_update_updated_at ON public.configuracoes;
CREATE TRIGGER tr_update_updated_at BEFORE UPDATE ON public.configuracoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add missing columns to provas for better feature support
ALTER TABLE public.provas ADD COLUMN IF NOT EXISTS embaralhar_alternativas BOOLEAN DEFAULT true;
ALTER TABLE public.provas ADD COLUMN IF NOT EXISTS permite_retroceder BOOLEAN DEFAULT true;
ALTER TABLE public.provas ADD COLUMN IF NOT EXISTS mostrar_gabarito_pos_prova BOOLEAN DEFAULT true;

-- Add missing columns to resultados for detailed history
ALTER TABLE public.resultados ADD COLUMN IF NOT EXISTS duracao_segundos INTEGER;
ALTER TABLE public.resultados ADD COLUMN IF NOT EXISTS navegador_info TEXT;

-- Create a view for easy analytics that is SECURE
DROP VIEW IF EXISTS public.vw_dashboard_stats;
CREATE VIEW public.vw_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM public.provas) as total_provas,
    (SELECT COUNT(*) FROM public.alunos) as total_alunos,
    (SELECT COUNT(*) FROM public.resultados) as total_resultados,
    (SELECT COALESCE(AVG(pontuacao), 0) FROM public.resultados) as media_geral;

-- Grant access to the view
GRANT SELECT ON public.vw_dashboard_stats TO authenticated, anon;
