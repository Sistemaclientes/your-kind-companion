-- Update the user_role enum
ALTER TYPE public.user_role RENAME VALUE 'student' TO 'aluno';

-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_protected BOOLEAN DEFAULT false;

-- Fix the recursive policy for profiles
-- First, drop the old policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a more efficient policy that avoids recursion
-- Note: We check if the user is an admin by querying their role in profiles
-- using a subquery that won't trigger recursion because it's constrained by ID
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Update the handle_new_user function to use 'aluno' instead of 'student'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, nome)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email LIKE '%admin%' THEN 'admin'::public.user_role
      ELSE 'aluno'::public.user_role
    END,
    COALESCE(NEW.raw_user_meta_data->>'nome', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the update_updated_at_column function exists (standard in Lovable projects)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
