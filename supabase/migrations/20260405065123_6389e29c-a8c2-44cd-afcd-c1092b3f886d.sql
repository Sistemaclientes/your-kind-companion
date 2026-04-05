-- Ensure pgcrypto is available in extensions schema
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- Add password_hash column to admins table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'password_hash') THEN
        ALTER TABLE public.admins ADD COLUMN password_hash TEXT;
    END IF;
END $$;

-- Migrate existing passwords to hash if they are still plain text
-- For alunos
UPDATE public.alunos 
SET password_hash = extensions.crypt(senha, extensions.gen_salt('bf'))
WHERE senha IS NOT NULL AND password_hash IS NULL;

-- For admins
UPDATE public.admins 
SET password_hash = extensions.crypt(senha, extensions.gen_salt('bf'))
WHERE senha IS NOT NULL AND password_hash IS NULL;

-- Create or replace hash_password function with proper search_path
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT extensions.crypt(password, extensions.gen_salt('bf'));
$$;

-- Secure login function for admins
CREATE OR REPLACE FUNCTION public.login_admin(p_email TEXT, p_password TEXT)
RETURNS TABLE (
  id UUID,
  nome TEXT,
  email TEXT,
  is_master BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.nome, a.email, COALESCE(a.is_master, false)
  FROM public.admins a
  WHERE lower(trim(a.email)) = lower(trim(p_email))
    AND a.password_hash = extensions.crypt(p_password, a.password_hash);
END;
$$;

-- Secure login function for alunos (students)
CREATE OR REPLACE FUNCTION public.login_aluno(p_email TEXT, p_senha TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_aluno RECORD;
BEGIN
  SELECT a.id, a.nome, a.email, a.telefone, a.cpf, a.status, a.password_hash
  INTO v_aluno
  FROM public.alunos a
  WHERE lower(trim(a.email)) = lower(trim(p_email));

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Email não encontrado. Cadastre-se primeiro.';
  END IF;

  IF v_aluno.status = 'Aguardando Confirmação' THEN
    RAISE EXCEPTION 'Confirme seu cadastro no e-mail enviado antes de realizar o login.';
  END IF;

  IF p_senha IS NOT NULL AND (v_aluno.password_hash IS NULL OR v_aluno.password_hash != extensions.crypt(p_senha, v_aluno.password_hash)) THEN
    RAISE EXCEPTION 'Senha incorreta.';
  END IF;

  RETURN json_build_object(
    'id', v_aluno.id,
    'nome', v_aluno.nome,
    'email', v_aluno.email,
    'telefone', COALESCE(v_aluno.telefone, ''),
    'cpf', COALESCE(v_aluno.cpf, '')
  );
END;
$$;

-- Update login_user (generic)
CREATE OR REPLACE FUNCTION public.login_user(email_input TEXT, password_input TEXT)
RETURNS TABLE(id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.email
  FROM public.alunos a
  WHERE lower(trim(a.email)) = lower(trim(email_input))
    AND a.password_hash = extensions.crypt(password_input, a.password_hash);
END;
$$;

-- Fix permissive RLS policies for alunos
-- Instead of WITH CHECK (true), use a basic check for name and email
DROP POLICY IF EXISTS "Auto-registro público de alunos" ON public.alunos;
CREATE POLICY "Auto-registro público de alunos" 
ON public.alunos 
FOR INSERT 
WITH CHECK (nome IS NOT NULL AND email IS NOT NULL);
