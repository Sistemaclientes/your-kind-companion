-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';

-- Update get_my_role function to be more robust
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE plpgsql STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Try to get role from profiles
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    
    -- Fallback: Check if user exists in admins table
    IF user_role IS NULL THEN
        IF EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()) THEN
            -- Default to master for admins for now, or check is_master
            SELECT CASE WHEN is_master THEN 'master' ELSE 'admin' END INTO user_role 
            FROM public.admins WHERE id = auth.uid();
        END IF;
    END IF;
    
    -- Default to student if still null
    RETURN COALESCE(user_role, 'student');
END;
$$;
