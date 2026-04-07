-- Add marketing tracking columns to configuracoes table
ALTER TABLE public.configuracoes 
ADD COLUMN IF NOT EXISTS fb_pixel_id TEXT,
ADD COLUMN IF NOT EXISTS fb_api_token TEXT,
ADD COLUMN IF NOT EXISTS google_tag_id TEXT;

-- Add is_active to admins for better management
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create a default settings row if it doesn't exist
INSERT INTO public.configuracoes (id, primary_color, success_color, nota_minima, mensagem_resultado)
SELECT gen_random_uuid(), '#0F8B8D', '#10B981', 7.0, 'Parabéns pelo seu desempenho na avaliação!'
WHERE NOT EXISTS (SELECT 1 FROM public.configuracoes LIMIT 1);
