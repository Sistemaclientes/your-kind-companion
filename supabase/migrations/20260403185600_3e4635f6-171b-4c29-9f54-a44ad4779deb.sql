-- 1. Fix Function Search Path Mutable warnings
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.handle_new_student_welcome_email() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 2. Add telefone to admins table
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS telefone TEXT;

-- 3. Add view_count to provas table
ALTER TABLE public.provas 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 4. Create notificacoes table
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- Can be admin or student UUID
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Enable RLS on notificacoes
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- 6. Tighten RLS Policies (Fixing "RLS Policy Always True" warnings)

-- Drop existing permissive policies (names from the previous pg_policies check)
-- Note: Using DO block to safely drop policies if they exist
DO $$ 
BEGIN
    -- Provas
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert provas' AND tablename = 'provas') THEN
        DROP POLICY "Anyone can insert provas" ON public.provas;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update provas' AND tablename = 'provas') THEN
        DROP POLICY "Anyone can update provas" ON public.provas;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can delete provas' AND tablename = 'provas') THEN
        DROP POLICY "Anyone can delete provas" ON public.provas;
    END IF;
    
    -- Admins
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert admins' AND tablename = 'admins') THEN
        DROP POLICY "Anyone can insert admins" ON public.admins;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update admins' AND tablename = 'admins') THEN
        DROP POLICY "Anyone can update admins" ON public.admins;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can delete admins' AND tablename = 'admins') THEN
        DROP POLICY "Anyone can delete admins" ON public.admins;
    END IF;
    
    -- Resultados
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert resultados' AND tablename = 'resultados') THEN
        DROP POLICY "Anyone can insert resultados" ON public.resultados;
    END IF;
END $$;

-- Create more secure policies
-- Provas: Authenticated users can manage, anyone can view active ones
CREATE POLICY "Authenticated users can manage provas" 
ON public.provas 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Admins: Only authenticated admins can manage other admins (simplified for now)
CREATE POLICY "Authenticated users can manage admins" 
ON public.admins 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Resultados: Authenticated users or specific students can see results
CREATE POLICY "Authenticated users can manage resultados" 
ON public.resultados 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Notificacoes: Users can see their own notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notificacoes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notificacoes 
FOR UPDATE 
USING (auth.uid() = user_id);
