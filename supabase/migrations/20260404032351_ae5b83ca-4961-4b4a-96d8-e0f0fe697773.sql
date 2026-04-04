-- Drop the mistakenly created table
DROP TABLE IF EXISTS public.table_name;

-- Add UNIQUE constraints to email columns
ALTER TABLE public.admins ADD CONSTRAINT admins_email_unique UNIQUE (email);
ALTER TABLE public.alunos ADD CONSTRAINT alunos_email_unique UNIQUE (email);

-- Add missing columns to alunos table
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT false;
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE;

-- Update Master Admin password with a secure hash
-- Password is 'Baudasorte'
UPDATE public.admins 
SET senha = '$2b$10$XGQFeu2JwteLsdkL0J6tKucdnCfqbWex9zCH/CBTFWj2bGYRP1FES', 
    is_master = true, 
    is_protected = true 
WHERE email = 'suprememidias.ok@gmail.com';

-- Seed initial settings if they don't exist
INSERT INTO public.configuracoes (chave, valor)
VALUES 
  ('academic_rules', '{"min_score": 7.0, "result_message": "Parabéns pelo seu desempenho na avaliação!"}'::jsonb),
  ('student_experience', '{"show_result_immediately": true, "allow_retake": false, "allow_review": true}'::jsonb),
  ('marketing_tracking', '{"facebook_pixel_id": "", "facebook_api_token": "", "google_tag_id": ""}'::jsonb)
ON CONFLICT (chave) DO NOTHING;
