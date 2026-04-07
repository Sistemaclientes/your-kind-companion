
-- Tabela de convites admin
CREATE TABLE public.convites_admin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'master')),
  usado boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.convites_admin ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem criar e ver convites
CREATE POLICY "admins_manage_convites"
ON public.convites_admin
FOR ALL
USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Função para gerar convite (SECURITY DEFINER para bypass RLS)
CREATE OR REPLACE FUNCTION public.gerar_convite_admin(p_email text, p_role text DEFAULT 'admin')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token text;
  v_convite_id uuid;
BEGIN
  -- Verificar se quem chama é admin
  IF NOT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Validar role
  IF p_role NOT IN ('admin', 'master') THEN
    RAISE EXCEPTION 'Role inválido';
  END IF;

  -- Gerar token único
  v_token := encode(gen_random_bytes(32), 'hex');

  -- Inserir convite
  INSERT INTO convites_admin (email, token, role, created_by)
  VALUES (lower(trim(p_email)), v_token, p_role, auth.uid())
  RETURNING id INTO v_convite_id;

  RETURN json_build_object(
    'id', v_convite_id,
    'token', v_token,
    'email', lower(trim(p_email))
  );
END;
$$;

-- Função para validar convite (acessível publicamente, sem auth)
CREATE OR REPLACE FUNCTION public.validar_convite_admin(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_convite record;
BEGIN
  SELECT * INTO v_convite
  FROM convites_admin
  WHERE token = p_token;

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'error', 'Convite não encontrado');
  END IF;

  IF v_convite.usado THEN
    RETURN json_build_object('valid', false, 'error', 'Convite já utilizado');
  END IF;

  -- Verificar expiração (24h)
  IF v_convite.created_at < now() - interval '24 hours' THEN
    RETURN json_build_object('valid', false, 'error', 'Convite expirado');
  END IF;

  RETURN json_build_object(
    'valid', true,
    'email', v_convite.email,
    'role', v_convite.role
  );
END;
$$;

-- Função para aceitar convite (requer autenticação)
CREATE OR REPLACE FUNCTION public.aceitar_convite_admin(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_convite record;
  v_user_id uuid;
  v_user_email text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Autenticação necessária';
  END IF;

  -- Buscar e validar convite
  SELECT * INTO v_convite
  FROM convites_admin
  WHERE token = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite não encontrado';
  END IF;

  IF v_convite.usado THEN
    RAISE EXCEPTION 'Convite já utilizado';
  END IF;

  IF v_convite.created_at < now() - interval '24 hours' THEN
    RAISE EXCEPTION 'Convite expirado';
  END IF;

  -- Buscar email do usuário autenticado
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

  -- Verificar se o email corresponde ao convite
  IF lower(trim(v_user_email)) != lower(trim(v_convite.email)) THEN
    RAISE EXCEPTION 'Este convite não pertence a este e-mail';
  END IF;

  -- Inserir como admin (se já não existir)
  INSERT INTO admins (id, email, role)
  VALUES (v_user_id, v_user_email, v_convite.role)
  ON CONFLICT (id) DO UPDATE SET role = v_convite.role;

  -- Marcar convite como usado
  UPDATE convites_admin SET usado = true WHERE id = v_convite.id;

  RETURN json_build_object(
    'success', true,
    'role', v_convite.role
  );
END;
$$;
