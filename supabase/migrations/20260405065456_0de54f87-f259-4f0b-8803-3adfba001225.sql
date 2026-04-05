-- Ensure pgcrypto is available
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- 1. Create a function to automatically hash the senha column into password_hash
CREATE OR REPLACE FUNCTION public.handle_password_hashing()
RETURNS TRIGGER AS $$
BEGIN
  -- Only hash if senha is not null and (it's a new record OR senha has changed)
  IF (TG_OP = 'INSERT' AND NEW.senha IS NOT NULL) OR 
     (TG_OP = 'UPDATE' AND NEW.senha IS NOT NULL AND (OLD.senha IS NULL OR NEW.senha <> OLD.senha)) THEN
    NEW.password_hash := extensions.crypt(NEW.senha, extensions.gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- 2. Add triggers to admins table
DROP TRIGGER IF EXISTS tr_hash_admin_password ON public.admins;
CREATE TRIGGER tr_hash_admin_password
BEFORE INSERT OR UPDATE OF senha ON public.admins
FOR EACH ROW
EXECUTE FUNCTION public.handle_password_hashing();

-- 3. Add triggers to alunos table
DROP TRIGGER IF EXISTS tr_hash_aluno_password ON public.alunos;
CREATE TRIGGER tr_hash_aluno_password
BEFORE INSERT OR UPDATE OF senha ON public.alunos
FOR EACH ROW
EXECUTE FUNCTION public.handle_password_hashing();

-- 4. Migrate any remaining plain text passwords to hashes
-- This handles existing records that might have been missed
UPDATE public.admins 
SET password_hash = extensions.crypt(senha, extensions.gen_salt('bf'))
WHERE senha IS NOT NULL AND (password_hash IS NULL OR password_hash = '');

UPDATE public.alunos 
SET password_hash = extensions.crypt(senha, extensions.gen_salt('bf'))
WHERE senha IS NOT NULL AND (password_hash IS NULL OR password_hash = '');

-- 5. Update login_admin to be more robust
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
    AND (
      -- Primary: check against hash
      (a.password_hash IS NOT NULL AND a.password_hash = extensions.crypt(p_password, a.password_hash))
      OR
      -- Fallback: legacy plain text comparison (temporary)
      (a.password_hash IS NULL AND a.senha = p_password)
    );
END;
$$;

-- 6. Update login_aluno to be more robust
CREATE OR REPLACE FUNCTION public.login_aluno(p_email TEXT, p_senha TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_aluno RECORD;
BEGIN
  SELECT a.id, a.nome, a.email, a.telefone, a.cpf, a.status, a.password_hash, a.senha
  INTO v_aluno
  FROM public.alunos a
  WHERE lower(trim(a.email)) = lower(trim(p_email));

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Email não encontrado. Cadastre-se primeiro.';
  END IF;

  IF v_aluno.status = 'Aguardando Confirmação' THEN
    RAISE EXCEPTION 'Confirme seu cadastro no e-mail enviado antes de realizar o login.';
  END IF;

  -- Check password
  IF p_senha IS NOT NULL AND NOT (
    (v_aluno.password_hash IS NOT NULL AND v_aluno.password_hash = extensions.crypt(p_senha, v_aluno.password_hash))
    OR
    (v_aluno.password_hash IS NULL AND v_aluno.senha = p_senha)
  ) THEN
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
