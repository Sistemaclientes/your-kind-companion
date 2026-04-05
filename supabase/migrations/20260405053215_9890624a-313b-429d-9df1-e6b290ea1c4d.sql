-- Fix get_my_role function to be more secure and reliable
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    -- 1. Check profiles (Supabase Auth users)
    IF auth.uid() IS NOT NULL THEN
        SELECT p.role INTO v_role FROM public.profiles p WHERE p.id = auth.uid();
        IF v_role IS NOT NULL THEN
            RETURN v_role;
        END IF;
    END IF;

    -- 2. Check admins table (Legacy/Custom Auth)
    SELECT 
        CASE 
            WHEN adm.is_master THEN 'master'
            ELSE 'admin'
        END INTO v_role 
    FROM public.admins adm
    WHERE (auth.uid() IS NOT NULL AND adm.id = auth.uid()) 
       OR (auth.jwt() IS NOT NULL AND adm.email = (auth.jwt() ->> 'email'));
    
    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    -- 3. Check alunos table
    IF EXISTS (
        SELECT 1 FROM public.alunos al 
        WHERE (auth.uid() IS NOT NULL AND al.id = auth.uid()) 
           OR (auth.jwt() IS NOT NULL AND al.email = (auth.jwt() ->> 'email'))
    ) THEN
        RETURN 'aluno';
    END IF;

    RETURN 'guest';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop redundant unique constraint
ALTER TABLE public.alunos DROP CONSTRAINT IF EXISTS alunos_email_unique;

-- Allow anyone to check if an email is registered (for signup/login flow)
DROP POLICY IF EXISTS "Permitir consulta pública de existência de email" ON public.alunos;
CREATE POLICY "Permitir consulta pública de existência de email" 
ON public.alunos 
FOR SELECT 
USING (true);

-- Update insertion policy to be more robust for auto-registration
DROP POLICY IF EXISTS "Auto-registro público de alunos" ON public.alunos;
CREATE POLICY "Auto-registro público de alunos" 
ON public.alunos 
FOR INSERT 
WITH CHECK (true);

-- Ensure alumnos can see their own full profile
DROP POLICY IF EXISTS "Alunos veem seu próprio perfil" ON public.alunos;
CREATE POLICY "Alunos veem seu próprio perfil" 
ON public.alunos 
FOR SELECT 
USING (
    (auth.uid() = id) 
    OR (get_my_role() = ANY (ARRAY['admin'::text, 'master'::text]))
    OR (confirmation_token IS NOT NULL)
    OR (reset_token IS NOT NULL)
);