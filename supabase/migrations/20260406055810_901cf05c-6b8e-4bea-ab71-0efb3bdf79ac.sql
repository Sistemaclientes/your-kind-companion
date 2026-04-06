-- Update visual identity with default colors if not present
UPDATE public.configuracoes 
SET valor = valor || '{"primary_color": "#0F8B8D", "success_color": "#10B981"}'::jsonb
WHERE chave = 'visual_identity';

-- Add colors if visual_identity row doesn't exist (ensure it exists)
INSERT INTO public.configuracoes (chave, valor)
VALUES ('visual_identity', '{"logo_url": "", "primary_color": "#0F8B8D", "success_color": "#10B981"}'::jsonb)
ON CONFLICT (chave) DO NOTHING;

-- Cleanup overlapping policies on configuracoes
DROP POLICY IF EXISTS "Leitura pública de configurações" ON public.configuracoes;
DROP POLICY IF EXISTS "Admins gerenciam configurações" ON public.configuracoes;
DROP POLICY IF EXISTS "Anyone can read configuration" ON public.configuracoes;
DROP POLICY IF EXISTS "Admins can manage configuracoes" ON public.configuracoes;
DROP POLICY IF EXISTS "Configuracoes are viewable by everyone" ON public.configuracoes;

-- Create clean consolidated policies
CREATE POLICY "configuracoes_read_all" 
ON public.configuracoes 
FOR SELECT 
USING (true);

CREATE POLICY "configuracoes_admin_all" 
ON public.configuracoes 
FOR ALL 
TO authenticated
USING (get_my_role() IN ('admin', 'master'))
WITH CHECK (get_my_role() IN ('admin', 'master'));
