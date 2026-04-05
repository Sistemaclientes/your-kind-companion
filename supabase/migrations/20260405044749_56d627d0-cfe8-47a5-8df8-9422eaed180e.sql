-- 1. Add 'master' to the user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'master';

-- 2. Update the handle_new_user function to support the 'master' role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.user_role;
  v_nome TEXT;
  v_is_master BOOLEAN;
BEGIN
  -- Check if the user is in the admins table and get their info
  SELECT nome, is_master INTO v_nome, v_is_master 
  FROM public.admins 
  WHERE email = NEW.email;

  -- Determine the role
  IF v_is_master THEN
    v_role := 'master'::public.user_role;
  ELSIF v_nome IS NOT NULL THEN
    v_role := 'admin'::public.user_role;
  ELSE
    -- If not an admin, check if it's a student (aluno)
    SELECT nome INTO v_nome FROM public.alunos WHERE email = NEW.email;
    v_role := 'aluno'::public.user_role;
  END IF;

  -- Create the profile
  INSERT INTO public.profiles (id, email, role, nome, is_master)
  VALUES (
    NEW.id,
    NEW.email,
    v_role,
    COALESCE(v_nome, NEW.raw_user_meta_data->>'nome', ''),
    COALESCE(v_is_master, false)
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    nome = EXCLUDED.nome,
    is_master = EXCLUDED.is_master;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Synchronize existing admins to profiles (for those who already have auth users)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT au.id, a.email, a.nome, a.is_master FROM auth.users au JOIN public.admins a ON au.email = a.email) LOOP
    INSERT INTO public.profiles (id, email, role, nome, is_master)
    VALUES (
      r.id,
      r.email,
      CASE WHEN r.is_master THEN 'master'::public.user_role ELSE 'admin'::public.user_role END,
      r.nome,
      r.is_master
    )
    ON CONFLICT (id) DO UPDATE SET
      role = EXCLUDED.role,
      nome = EXCLUDED.nome,
      is_master = EXCLUDED.is_master;
  END LOOP;
END;
$$;
