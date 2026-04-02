
-- Allow anon to update admins (for password reset)
CREATE POLICY "Anyone can update admins" ON public.admins FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Allow anon to insert admins
CREATE POLICY "Anyone can insert admins" ON public.admins FOR INSERT TO anon WITH CHECK (true);

-- Allow anon to delete admins
CREATE POLICY "Anyone can delete admins" ON public.admins FOR DELETE TO anon USING (true);

-- Allow updating perguntas
CREATE POLICY "Anyone can update perguntas" ON public.perguntas FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Allow updating alternativas
CREATE POLICY "Anyone can update alternativas" ON public.alternativas FOR UPDATE TO anon USING (true) WITH CHECK (true);
