
CREATE OR REPLACE FUNCTION public.login_aluno(p_email text, p_senha text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_aluno record;
BEGIN
  SELECT id, nome, email, telefone, cpf, senha, status
  INTO v_aluno
  FROM public.alunos
  WHERE email = lower(trim(p_email));

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Email não encontrado. Cadastre-se primeiro.';
  END IF;

  IF v_aluno.status = 'Aguardando Confirmação' THEN
    RAISE EXCEPTION 'Confirme seu cadastro no e-mail enviado antes de realizar o login.';
  END IF;

  IF p_senha IS NOT NULL AND v_aluno.senha IS DISTINCT FROM p_senha THEN
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
