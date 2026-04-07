-- 1. Add missing columns to alumnos
ALTER TABLE public.alunos 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS confirmation_token TEXT,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;

-- 2. Add missing columns to admins
ALTER TABLE public.admins
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 3. Create helper functions for roles
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN 'guest';
    END IF;

    -- Check admins table first
    SELECT role INTO user_role FROM public.admins WHERE id = auth.uid();
    
    -- Fallback: Check if student
    IF user_role IS NULL THEN
        IF EXISTS (SELECT 1 FROM public.alunos WHERE id = auth.uid()) THEN
            user_role := 'aluno';
        END IF;
    END IF;
    
    RETURN COALESCE(user_role, 'student');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN public.get_my_role() IN ('admin', 'master');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Update RLS policies for alumnos
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "aluno_select_own" ON public.alunos;
DROP POLICY IF EXISTS "aluno_insert_own" ON public.alunos;
DROP POLICY IF EXISTS "aluno_update_own" ON public.alunos;
DROP POLICY IF EXISTS "Admins can manage all students" ON public.alunos;

CREATE POLICY "Students can view their own record"
ON public.alunos FOR SELECT
USING (auth.uid() = id OR public.check_is_admin());

CREATE POLICY "Public registration and admin insert"
ON public.alunos FOR INSERT
WITH CHECK (auth.uid() IS NULL OR auth.uid() = id OR public.check_is_admin());

CREATE POLICY "Students and admins can update records"
ON public.alunos FOR UPDATE
USING (auth.uid() = id OR public.check_is_admin());

CREATE POLICY "Admins can delete students"
ON public.alunos FOR DELETE
USING (public.check_is_admin());

-- 5. Update RLS policies for admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admins" ON public.admins;
DROP POLICY IF EXISTS "Master manages admins" ON public.admins;

CREATE POLICY "Admins can view other admins"
ON public.admins FOR SELECT
USING (public.check_is_admin());

CREATE POLICY "Master manages all admins"
ON public.admins FOR ALL
USING (public.get_my_role() = 'master');

CREATE POLICY "Admins can update their own profile"
ON public.admins FOR UPDATE
USING (auth.uid() = id);
