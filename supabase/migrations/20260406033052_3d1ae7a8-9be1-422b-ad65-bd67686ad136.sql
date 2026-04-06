CREATE OR REPLACE FUNCTION public.delete_aluno_cascade(p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_aluno_id UUID;
BEGIN
  SELECT id INTO v_aluno_id FROM public.alunos
  WHERE lower(trim(email)) = lower(trim(p_email));

  IF v_aluno_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Aluno não encontrado');
  END IF;

  DELETE FROM public.respostas_aluno WHERE aluno_id = v_aluno_id;
  DELETE FROM public.resultados WHERE aluno_id = v_aluno_id;
  DELETE FROM public.alunos WHERE id = v_aluno_id;

  RETURN json_build_object('success', true, 'message', 'Aluno excluído com sucesso');
END;
$$;