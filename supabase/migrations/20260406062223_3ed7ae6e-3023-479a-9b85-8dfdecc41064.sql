-- Add bio column to profiles and alunos
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add codigo_acesso to turmas for easy student registration
ALTER TABLE public.turmas ADD COLUMN IF NOT EXISTS codigo_acesso TEXT UNIQUE;

-- Create an index for the access code to speed up lookups
CREATE INDEX IF NOT EXISTS idx_turmas_codigo_acesso ON public.turmas(codigo_acesso);

-- Add social_links column to profiles for extended profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Ensure pupils can see their own bio and update it
-- (RLS policies should already cover this but let's be sure if they were specific)
-- Profiles update policy exists, let's check it if needed later.

-- Add a function to generate a random access code if none is provided
CREATE OR REPLACE FUNCTION public.generate_turma_access_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo_acesso IS NULL THEN
    NEW.codigo_acesso := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically generate access code for new classes
DROP TRIGGER IF EXISTS tr_generate_turma_access_code ON public.turmas;
CREATE TRIGGER tr_generate_turma_access_code
BEFORE INSERT ON public.turmas
FOR EACH ROW
EXECUTE FUNCTION public.generate_turma_access_code();

-- Update existing turmas with a code if they don't have one
UPDATE public.turmas SET codigo_acesso = upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6)) WHERE codigo_acesso IS NULL;
