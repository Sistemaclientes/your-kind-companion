-- 1. Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_nome TEXT;
BEGIN
  -- Determine role based on email or metadata
  -- If email is in admins table, give admin/master role
  IF EXISTS (SELECT 1 FROM public.admins WHERE email = NEW.email AND is_master = true) THEN
    v_role := 'master';
  ELSIF EXISTS (SELECT 1 FROM public.admins WHERE email = NEW.email) THEN
    v_role := 'admin';
  ELSE
    v_role := 'student';
  END IF;

  -- Get name from metadata if available
  v_nome := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', NEW.email);

  -- Insert into profiles
  INSERT INTO public.profiles (id, email, nome, role)
  VALUES (NEW.id, NEW.email, v_nome, v_role)
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      nome = EXCLUDED.nome,
      role = EXCLUDED.role,
      updated_at = now();

  -- If it's a student, also ensure they are in the alunos table
  IF v_role = 'student' THEN
    INSERT INTO public.alunos (id, email, nome, status)
    VALUES (NEW.id, NEW.email, v_nome, 'Ativo')
    ON CONFLICT (email) DO UPDATE
    SET id = EXCLUDED.id, -- Link to auth.users
        nome = EXCLUDED.nome,
        status = EXCLUDED.status,
        updated_at = now();
  END IF;

  -- If it's an admin, link the admin table to auth.users if needed
  IF v_role IN ('admin', 'master') THEN
    UPDATE public.admins
    SET id = NEW.id,
        updated_at = now()
    WHERE email = NEW.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Update profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.role = 'master')
  )
);

-- 4. Fix Alunos RLS to allow registration via auth.signUp
DROP POLICY IF EXISTS "Public registration" ON public.alunos;
CREATE POLICY "Public registration" 
ON public.alunos FOR INSERT 
WITH CHECK (true);

-- 5. Ensure existing admins and students are in profiles if they sign up
-- This is handled by the trigger above if they sign up via Auth.
