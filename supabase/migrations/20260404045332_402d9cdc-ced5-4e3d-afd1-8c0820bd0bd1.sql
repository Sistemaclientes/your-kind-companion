-- 1. Fix linter issues: Set search_path for common functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.get_my_role() SET search_path = public;

-- 2. Secure storage buckets
-- Avatars bucket
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('avatars', 'avatars', true)
    ON CONFLICT (id) DO UPDATE SET public = true;
END $$;

-- Reset and re-create secure storage policies for avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'avatars' 
    AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'avatars' 
    AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'avatars' 
    AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Banners bucket
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('banners', 'banners', true)
    ON CONFLICT (id) DO UPDATE SET public = true;
END $$;

DROP POLICY IF EXISTS "Banner images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage banners" ON storage.objects;

CREATE POLICY "Banner images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'banners');

CREATE POLICY "Admins can manage banners" 
ON storage.objects FOR ALL 
USING (
    bucket_id = 'banners' 
    AND (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'master')
        )
    )
);

-- 3. Ensure RLS is enabled for all core tables
ALTER TABLE IF EXISTS public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.provas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.alternativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.respostas_aluno ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notificacoes ENABLE ROW LEVEL SECURITY;

-- 4. Clean up redundant indices or add missing ones
CREATE INDEX IF NOT EXISTS idx_resultados_aluno_id ON public.resultados(aluno_id);
CREATE INDEX IF NOT EXISTS idx_resultados_prova_id ON public.resultados(prova_id);
CREATE INDEX IF NOT EXISTS idx_perguntas_prova_id ON public.perguntas(prova_id);
CREATE INDEX IF NOT EXISTS idx_alternativas_pergunta_id ON public.alternativas(pergunta_id);
CREATE INDEX IF NOT EXISTS idx_respostas_aluno_resultado_id ON public.respostas_aluno(resultado_id);
