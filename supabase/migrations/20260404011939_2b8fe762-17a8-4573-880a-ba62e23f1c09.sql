-- 1. Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true) ON CONFLICT (id) DO NOTHING;

-- 2. Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Anyone can update avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can delete avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars');

-- 3. Storage policies for banners
CREATE POLICY "Banner images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Anyone can upload banners" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banners');
CREATE POLICY "Anyone can update banners" ON storage.objects FOR UPDATE USING (bucket_id = 'banners');
CREATE POLICY "Anyone can delete banners" ON storage.objects FOR DELETE USING (bucket_id = 'banners');

-- 4. Normalize status in provas
UPDATE public.provas SET status = 'Ativa' WHERE status = 'publicada';

-- 5. Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Add updated_at triggers to all tables
-- Provas
DROP TRIGGER IF EXISTS update_provas_updated_at ON public.provas;
CREATE TRIGGER update_provas_updated_at BEFORE UPDATE ON public.provas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Perguntas
DROP TRIGGER IF EXISTS update_perguntas_updated_at ON public.perguntas;
CREATE TRIGGER update_perguntas_updated_at BEFORE UPDATE ON public.perguntas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Alternativas
DROP TRIGGER IF EXISTS update_alternativas_updated_at ON public.alternativas;
CREATE TRIGGER update_alternativas_updated_at BEFORE UPDATE ON public.alternativas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Alunos
DROP TRIGGER IF EXISTS update_alunos_updated_at ON public.alunos;
CREATE TRIGGER update_alunos_updated_at BEFORE UPDATE ON public.alunos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Admins
DROP TRIGGER IF EXISTS update_admins_updated_at ON public.admins;
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON public.admins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Resultados
DROP TRIGGER IF EXISTS update_resultados_updated_at ON public.resultados;
CREATE TRIGGER update_resultados_updated_at BEFORE UPDATE ON public.resultados FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Categorias
DROP TRIGGER IF EXISTS update_categorias_updated_at ON public.categorias;
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON public.categorias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
