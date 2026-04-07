-- Add missing columns to admins table
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS nome TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT FALSE;

-- Update existing admins to set is_master based on role
UPDATE public.admins 
SET is_master = TRUE 
WHERE role = 'master';

-- Ensure the configuracoes table has all necessary columns (already checked but reinforcing)
ALTER TABLE public.configuracoes 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#0F8B8D',
ADD COLUMN IF NOT EXISTS success_color TEXT DEFAULT '#10B981',
ADD COLUMN IF NOT EXISTS nota_minima NUMERIC DEFAULT 7.0,
ADD COLUMN IF NOT EXISTS mensagem_resultado TEXT DEFAULT 'Parabéns pelo seu desempenho na avaliação!',
ADD COLUMN IF NOT EXISTS exibir_resultado_imediatamente BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS permitir_refazer BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS liberar_revisao BOOLEAN DEFAULT TRUE;

-- Add RLS policy for admins to manage configuracoes if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'configuracoes' AND policyname = 'Admins can manage settings'
    ) THEN
        CREATE POLICY "Admins can manage settings" 
        ON public.configuracoes 
        FOR ALL 
        USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));
    END IF;
END $$;

-- Also allow public (including students) to read settings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'configuracoes' AND policyname = 'Anyone can view settings'
    ) THEN
        CREATE POLICY "Anyone can view settings" 
        ON public.configuracoes 
        FOR SELECT 
        USING (TRUE);
    END IF;
END $$;
