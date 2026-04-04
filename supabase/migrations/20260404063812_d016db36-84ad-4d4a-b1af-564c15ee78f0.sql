-- Drop existing policy
DROP POLICY IF EXISTS "Student self-view/update" ON public.alunos;

-- Create a new permissive policy for everything
CREATE POLICY "Admins and students can manage all alunos" 
ON public.alunos 
FOR ALL 
USING (true) 
WITH CHECK (true);