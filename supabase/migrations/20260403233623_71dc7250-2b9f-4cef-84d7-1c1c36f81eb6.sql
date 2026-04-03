-- Drop current restricted policy
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categorias;

-- Create more permissive policies (consistent with rest of app)
CREATE POLICY "Anyone can create categories" ON public.categorias FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update categories" ON public.categorias FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete categories" ON public.categorias FOR DELETE USING (true);

-- Update foreign key to SET NULL on delete
ALTER TABLE public.provas 
DROP CONSTRAINT IF EXISTS provas_categoria_id_fkey,
ADD CONSTRAINT provas_categoria_id_fkey 
FOREIGN KEY (categoria_id) 
REFERENCES public.categorias(id) 
ON DELETE SET NULL;
