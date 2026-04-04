-- 1. Fix 'alunos' RLS
DROP POLICY IF EXISTS "Anyone can register as a student" ON public.alunos;
DROP POLICY IF EXISTS "Students can register themselves" ON public.alunos;
DROP POLICY IF EXISTS "Admins can manage students" ON public.alunos;
DROP POLICY IF EXISTS "Admins can manage alunos" ON public.alunos;
DROP POLICY IF EXISTS "Anyone can read students basic info" ON public.alunos;
DROP POLICY IF EXISTS "Allow public select by confirmation token" ON public.alunos;
DROP POLICY IF EXISTS "Allow public update by confirmation token" ON public.alunos;
DROP POLICY IF EXISTS "Admins can view all students" ON public.alunos;
DROP POLICY IF EXISTS "Students can view and update their own profile" ON public.alunos;

-- Re-create secure policies for 'alunos'
CREATE POLICY "Public registration" 
ON public.alunos FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Student self-view/update" 
ON public.alunos FOR ALL 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin manage all students" 
ON public.alunos FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'master')
  )
);

CREATE POLICY "Allow public select by confirmation token" 
ON public.alunos FOR SELECT 
USING (confirmation_token IS NOT NULL);

CREATE POLICY "Allow public update by confirmation token" 
ON public.alunos FOR UPDATE 
USING (confirmation_token IS NOT NULL)
WITH CHECK (confirmation_token IS NULL AND status = 'Cadastrado');

-- 2. Fix 'resultados' RLS
DROP POLICY IF EXISTS "Users can see their own results" ON public.resultados;
DROP POLICY IF EXISTS "Students can view their own results" ON public.resultados;
DROP POLICY IF EXISTS "Students can insert their own results" ON public.resultados;
DROP POLICY IF EXISTS "Admins can manage results" ON public.resultados;
DROP POLICY IF EXISTS "Admins can manage all results" ON public.resultados;

-- Re-create secure policies for 'resultados'
CREATE POLICY "Student self-view results" 
ON public.resultados FOR SELECT 
USING (auth.uid() = aluno_id);

CREATE POLICY "Student self-insert results" 
ON public.resultados FOR INSERT 
WITH CHECK (auth.uid() = aluno_id);

CREATE POLICY "Admin manage all results" 
ON public.resultados FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'master')
  )
);

-- 3. Fix 'respostas_aluno' RLS
DROP POLICY IF EXISTS "Students can insert their own answers" ON public.respostas_aluno;
DROP POLICY IF EXISTS "Students can view their own answers" ON public.respostas_aluno;
DROP POLICY IF EXISTS "Admins can view all answers" ON public.respostas_aluno;
DROP POLICY IF EXISTS "Admins can manage all answers" ON public.respostas_aluno;

-- Re-create secure policies for 'respostas_aluno'
CREATE POLICY "Student self-view/insert answers" 
ON public.respostas_aluno FOR ALL 
USING (auth.uid() = aluno_id)
WITH CHECK (auth.uid() = aluno_id);

CREATE POLICY "Admin manage all answers" 
ON public.respostas_aluno FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'master')
  )
);

-- 4. Fix 'admins' RLS
DROP POLICY IF EXISTS "Admins can view admins" ON public.admins;
DROP POLICY IF EXISTS "Master admins can manage admins" ON public.admins;
DROP POLICY IF EXISTS "Allow select for login check" ON public.admins;

-- Re-create secure policies for 'admins'
CREATE POLICY "Admin self-view/update" 
ON public.admins FOR ALL 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Master admin manage all admins" 
ON public.admins FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'master'
  )
);

CREATE POLICY "Allow public select for login"
ON public.admins FOR SELECT
USING (true);

-- 5. Fix 'notificacoes' RLS
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notificacoes;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notificacoes;

-- Re-create secure policies for 'notificacoes'
CREATE POLICY "User self-manage notifications" 
ON public.notificacoes FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin send notifications" 
ON public.notificacoes FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'master')
  )
);

-- 6. Fix 'configuracoes' RLS
DROP POLICY IF EXISTS "Public read configuracoes" ON public.configuracoes;
DROP POLICY IF EXISTS "Admins can manage configuracoes" ON public.configuracoes;

-- Re-create secure policies for 'configuracoes'
CREATE POLICY "Public read config" 
ON public.configuracoes FOR SELECT 
USING (true);

CREATE POLICY "Admin manage config" 
ON public.configuracoes FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'master')
  )
);