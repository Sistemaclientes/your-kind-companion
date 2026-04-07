
CREATE OR REPLACE FUNCTION public.login_aluno(p_email text, p_senha text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
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

  -- Block login if email is not confirmed (regardless of status)
  IF NOT COALESCE(v_aluno.email_confirmed, false) THEN
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
$function$;
