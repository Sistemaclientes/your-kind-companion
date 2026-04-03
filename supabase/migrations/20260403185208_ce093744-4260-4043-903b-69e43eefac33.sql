-- Add avatar_url to admins table
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add banner_url to provas table
ALTER TABLE public.provas 
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Enhance configuracoes table
ALTER TABLE public.configuracoes 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Ensure RLS is enabled for all tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Create basic policies if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins are viewable by everyone' AND tablename = 'admins') THEN
        CREATE POLICY "Admins are viewable by everyone" ON public.admins FOR SELECT USING (true);
    END IF;
END $$;
