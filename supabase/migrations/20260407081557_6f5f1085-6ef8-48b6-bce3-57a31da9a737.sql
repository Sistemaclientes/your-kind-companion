-- Create student answers table
CREATE TABLE IF NOT EXISTS public.respostas_aluno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resultado_id UUID REFERENCES public.resultados(id) ON DELETE CASCADE,
    pergunta_id UUID REFERENCES public.perguntas(id) ON DELETE CASCADE,
    resposta_id UUID REFERENCES public.respostas(id) ON DELETE CASCADE,
    texto_resposta TEXT,
    is_correta BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.respostas_aluno ENABLE ROW LEVEL SECURITY;

-- Policies for student answers
CREATE POLICY "Users can view their own answers"
    ON public.respostas_aluno
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.resultados r
            WHERE r.id = resultado_id
            AND r.aluno_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all answers"
    ON public.respostas_aluno
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Students can insert their own answers"
    ON public.respostas_aluno
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.resultados r
            WHERE r.id = resultado_id
            AND r.aluno_id = auth.uid()
        )
    );

-- Add updated_at trigger
CREATE TRIGGER tr_respostas_aluno_updated_at
    BEFORE UPDATE ON public.respostas_aluno
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();