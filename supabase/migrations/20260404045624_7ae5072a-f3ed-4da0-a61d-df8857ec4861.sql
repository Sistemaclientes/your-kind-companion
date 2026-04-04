-- Remove insecure open policies for avatars
DROP POLICY IF EXISTS "Anyone can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete avatars" ON storage.objects;

-- Remove insecure open policies for banners
DROP POLICY IF EXISTS "Anyone can upload banners" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update banners" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete banners" ON storage.objects;