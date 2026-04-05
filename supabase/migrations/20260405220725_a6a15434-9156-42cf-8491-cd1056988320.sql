
-- Allow admins to delete respostas_aluno
CREATE POLICY "Admins can delete respostas_aluno"
ON public.respostas_aluno
FOR DELETE
TO public
USING (get_my_role() IN ('admin', 'master'));

-- Allow admins to delete resultados
CREATE POLICY "Admins can delete resultados"
ON public.resultados
FOR DELETE
TO public
USING (get_my_role() IN ('admin', 'master'));

-- Allow admins to delete alunos
CREATE POLICY "Admins can delete alunos"
ON public.alunos
FOR DELETE
TO public
USING (get_my_role() IN ('admin', 'master'));
