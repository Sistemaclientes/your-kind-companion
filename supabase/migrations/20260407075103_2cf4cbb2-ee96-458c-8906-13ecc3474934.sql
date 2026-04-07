-- Add missing columns to 'provas' table
ALTER TABLE public.provas 
ADD COLUMN IF NOT EXISTS duracao INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS embaralhar_questoes BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mostrar_resultado BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS permitir_revisao BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bloquear_navegacao BOOLEAN DEFAULT false;

-- Add missing columns to 'perguntas' table
ALTER TABLE public.perguntas 
ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'multiple-choice',
ADD COLUMN IF NOT EXISTS pontos INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS explicacao TEXT,
ADD COLUMN IF NOT EXISTS imagem_url TEXT;

-- Update 'provas' table with RLS if not already fully covered
-- (Already enabled, just making sure common patterns are supported)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'provas' AND policyname = 'Admins can manage exams'
    ) THEN
        CREATE POLICY "Admins can manage exams" ON public.provas 
        FOR ALL TO authenticated 
        USING (auth.jwt()->>'role' = 'service_role' OR EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));
    END IF;
END
$$;
