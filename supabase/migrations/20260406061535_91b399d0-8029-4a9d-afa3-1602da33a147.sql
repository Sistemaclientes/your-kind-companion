-- Update login_aluno to use email_confirmed column
CREATE OR REPLACE FUNCTION public.login_aluno(p_email TEXT, p_senha TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_aluno RECORD;
BEGIN
  SELECT a.id, a.nome, a.email, a.telefone, a.cpf, a.status, a.password_hash, a.senha, a.email_confirmed
  INTO v_aluno
  FROM public.alunos a
  WHERE lower(trim(a.email)) = lower(trim(p_email));

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Email não encontrado. Cadastre-se primeiro.';
  END IF;

  -- Prefer email_confirmed flag but keep status check for compatibility
  IF NOT COALESCE(v_aluno.email_confirmed, false) AND v_aluno.status = 'Aguardando Confirmação' THEN
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

-- Function to confirm student email via token
CREATE OR REPLACE FUNCTION public.confirmar_aluno(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_aluno_id UUID;
BEGIN
  SELECT id INTO v_aluno_id
  FROM public.alunos
  WHERE confirmation_token = p_token
    AND (token_expires_at IS NULL OR token_expires_at > now());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Token inválido ou expirado.';
  END IF;

  UPDATE public.alunos
  SET email_confirmed = true,
      status = 'Ativo',
      confirmation_token = NULL,
      token_expires_at = NULL
  WHERE id = v_aluno_id;

  RETURN json_build_object(
    'success', true,
    'message', 'E-mail confirmado com sucesso!'
  );
END;
$$;