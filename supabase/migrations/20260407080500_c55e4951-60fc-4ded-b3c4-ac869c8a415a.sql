-- Add columns to alunos table
ALTER TABLE public.alunos 
ADD COLUMN IF NOT EXISTS biografia TEXT,
ADD COLUMN IF NOT EXISTS data_nascimento DATE;

-- Ensure configuracoes table has the expected columns
ALTER TABLE public.configuracoes 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#0F8B8D',
ADD COLUMN IF NOT EXISTS success_color TEXT DEFAULT '#10B981';

-- Insert a default settings row if none exists
INSERT INTO public.configuracoes (chave, logo_url, primary_color, success_color)
SELECT 'default', '', '#0F8B8D', '#10B981'
WHERE NOT EXISTS (SELECT 1 FROM public.configuracoes WHERE chave = 'default');

-- Ensure RLS is enabled and policies are correct for configuracoes
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view configurations" ON public.configuracoes;
CREATE POLICY "Anyone can view configurations" ON public.configuracoes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage configurations" ON public.configuracoes;
CREATE POLICY "Admins can manage configurations" ON public.configuracoes FOR ALL TO authenticated USING (check_is_admin());