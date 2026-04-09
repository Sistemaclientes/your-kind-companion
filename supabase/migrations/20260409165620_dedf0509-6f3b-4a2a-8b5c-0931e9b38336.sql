
-- Add curso column to alunos
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS curso text;

-- Add curso column to provas
ALTER TABLE public.provas ADD COLUMN IF NOT EXISTS curso text;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_provas_curso ON public.provas (curso);
CREATE INDEX IF NOT EXISTS idx_alunos_curso ON public.alunos (curso);

-- Prevent students from updating their own curso field
CREATE POLICY "Prevent students from updating curso"
ON public.alunos
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  -- Allow update only if curso is not being changed (or was null)
  (curso IS NOT DISTINCT FROM (SELECT curso FROM public.alunos WHERE id = auth.uid()))
  OR check_is_admin()
);
