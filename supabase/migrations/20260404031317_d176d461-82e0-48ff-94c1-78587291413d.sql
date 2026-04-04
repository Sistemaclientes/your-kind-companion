ALTER TABLE public.alunos ADD COLUMN confirmation_token TEXT;

-- Index for faster lookup
CREATE INDEX idx_alunos_confirmation_token ON public.alunos(confirmation_token);

-- We need to allow an unauthenticated user to update their status IF they have a valid token
-- This is a bit tricky with RLS if we don't want to expose too much.
-- However, for the confirmation page to work client-side, we need to allow selection and update based on the token.

CREATE POLICY "Allow public select by confirmation token" 
ON public.alunos 
FOR SELECT 
USING (confirmation_token IS NOT NULL);

CREATE POLICY "Allow public update by confirmation token" 
ON public.alunos 
FOR UPDATE 
USING (confirmation_token IS NOT NULL)
WITH CHECK (confirmation_token IS NULL AND status = 'Cadastrado');
