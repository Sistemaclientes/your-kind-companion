-- Add visual identity configuration
INSERT INTO public.configuracoes (chave, valor)
VALUES ('visual_identity', '{"logo_url": ""}'::jsonb)
ON CONFLICT (chave) DO NOTHING;

-- Ensure RLS allows everyone to read the logo
DROP POLICY IF EXISTS "Anyone can read configuration" ON public.configuracoes;
CREATE POLICY "Anyone can read configuration" ON public.configuracoes
FOR SELECT USING (true);
