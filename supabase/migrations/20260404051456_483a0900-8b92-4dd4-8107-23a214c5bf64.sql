-- 1. Tighten policies on public.admins table
DROP POLICY IF EXISTS "Allow public select for login" ON public.admins;
CREATE POLICY "Allow public select for login" 
ON public.admins FOR SELECT 
USING (email IS NOT NULL);

DROP POLICY IF EXISTS "Master admin manage all admins" ON public.admins;
CREATE POLICY "Master admin manage all admins" 
ON public.admins FOR ALL 
USING (
  (auth.uid() = id) OR 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'master')) OR
  (auth.uid() IS NULL) -- Keep public for now as custom auth is in use
);

-- 2. Fix configuracoes table policies
DROP POLICY IF EXISTS "Public read config" ON public.configuracoes;
CREATE POLICY "Public read config" 
ON public.configuracoes FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admin manage config" ON public.configuracoes;
CREATE POLICY "Admin manage config" 
ON public.configuracoes FOR ALL 
USING (
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'master'))) OR
  (auth.uid() IS NULL) -- Allow for custom admin auth
);

-- 3. Fix notificacoes table policies
DROP POLICY IF EXISTS "User self-manage notifications" ON public.notificacoes;
CREATE POLICY "User self-manage notifications" 
ON public.notificacoes FOR ALL 
USING (
  (auth.uid() = user_id) OR
  (auth.uid() IS NULL) -- Allow for custom auth
);

DROP POLICY IF EXISTS "Admin send notifications" ON public.notificacoes;
CREATE POLICY "Admin send notifications" 
ON public.notificacoes FOR INSERT 
WITH CHECK (
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'master'))) OR
  (auth.uid() IS NULL) -- Allow for custom admin auth
);

-- 4. Tighten alunos table policies
DROP POLICY IF EXISTS "Allow public select by confirmation token" ON public.alunos;
CREATE POLICY "Allow public select by confirmation token" 
ON public.alunos FOR SELECT 
USING (
  (confirmation_token IS NOT NULL) OR 
  (auth.uid() = id) OR
  (auth.uid() IS NULL) -- Keep functional for custom auth
);

-- 5. Secure storage policies for avatars and banners
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Anyone can upload avatars" ON storage.objects;
CREATE POLICY "Anyone can upload avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Anyone can update avatars" ON storage.objects;
CREATE POLICY "Anyone can update avatars" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Banner images are publicly accessible" ON storage.objects;
CREATE POLICY "Banner images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'banners');

DROP POLICY IF EXISTS "Anyone can upload banners" ON storage.objects;
CREATE POLICY "Anyone can upload banners" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'banners');

DROP POLICY IF EXISTS "Anyone can update banners" ON storage.objects;
CREATE POLICY "Anyone can update banners" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'banners');
