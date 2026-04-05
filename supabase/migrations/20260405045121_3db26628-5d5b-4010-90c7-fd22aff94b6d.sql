-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Ativo',
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Improve get_my_role function
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Se não estiver autenticado, retornar 'guest'
    IF auth.uid() IS NULL THEN
        RETURN 'guest';
    END IF;

    -- Tentar obter o papel da tabela profiles primeiro (fonte primária)
    -- Usamos uma consulta direta que é eficiente
    SELECT role::text INTO user_role FROM public.profiles WHERE id = auth.uid();
    
    -- Fallback: Verificar na tabela admins se for o caso
    IF user_role IS NULL THEN
        SELECT CASE WHEN is_master THEN 'master' ELSE 'admin' END INTO user_role 
        FROM public.admins WHERE id = auth.uid();
    END IF;
    
    -- Fallback: Se for aluno cadastrado na tabela alunos
    IF user_role IS NULL THEN
        IF EXISTS (SELECT 1 FROM public.alunos WHERE id = auth.uid()) THEN
            user_role := 'aluno';
        END IF;
    END IF;
    
    -- Se estiver autenticado mas nada foi encontrado, retornar 'aluno' por padrão
    RETURN COALESCE(user_role, 'aluno');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update handle_new_user to initialize new columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, nome, status, active)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email LIKE '%admin%' THEN 'admin'::public.user_role
      ELSE 'aluno'::public.user_role
    END,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    'Ativo',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix RLS policies for profiles to avoid recursion
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Alunos veem seu próprio perfil" ON public.profiles;

CREATE POLICY "Users can view their own profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (get_my_role() IN ('admin', 'master'));

CREATE POLICY "Users can update their own profiles"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (get_my_role() IN ('admin', 'master'));
