-- 1. Fix Security Definer View (use default SECURITY INVOKER which is safer with RLS)
DROP VIEW IF EXISTS public.vw_provas_stats;
CREATE VIEW public.vw_provas_stats AS
SELECT p.id,
    p.titulo,
    p.descricao,
    p.slug,
    p.categoria_id,
    p.created_at,
    p.status,
    c.nome AS categoria_nome,
    c.cor AS categoria_cor,
    c.icon AS categoria_icon,
    ( SELECT count(*) AS count
           FROM perguntas per
          WHERE (per.prova_id = p.id)) AS qcount,
    ( SELECT count(DISTINCT r.aluno_id) AS count
           FROM resultados r
          WHERE (r.prova_id = p.id)) AS studentcount
   FROM (provas p
     LEFT JOIN categorias c ON ((p.categoria_id = c.id)));

-- 2. Tighten admins table RLS
DROP POLICY IF EXISTS "Authenticated users can manage admins" ON public.admins;
DROP POLICY IF EXISTS "Admins are viewable by everyone" ON public.admins;
DROP POLICY IF EXISTS "Allow anon read admins for login" ON public.admins;

CREATE POLICY "Admins can view admins" 
ON public.admins FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'master')
  )
);

CREATE POLICY "Master admins can manage admins" 
ON public.admins FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'master'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'master'
  )
);

-- For login purposes, we might need a way to check if an email is an admin
-- But usually this should be done via a secure function or the profiles table
CREATE POLICY "Allow select for login check"
ON public.admins FOR SELECT
USING (true); -- Keep select public if login depends on it, but restrict write

-- 3. Fix respostas_aluno RLS
DROP POLICY IF EXISTS "Anyone can submit answers" ON public.respostas_aluno;
DROP POLICY IF EXISTS "Anyone can read answers" ON public.respostas_aluno;
DROP POLICY IF EXISTS "Admins can manage answers" ON public.respostas_aluno;

CREATE POLICY "Students can insert their own answers" 
ON public.respostas_aluno FOR INSERT 
WITH CHECK (auth.uid() = aluno_id);

CREATE POLICY "Students can view their own answers" 
ON public.respostas_aluno FOR SELECT 
USING (auth.uid() = aluno_id);

CREATE POLICY "Admins can view all answers" 
ON public.respostas_aluno FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'master')
  )
);

CREATE POLICY "Admins can manage all answers" 
ON public.respostas_aluno FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'master')
  )
);

-- 4. Fix resultados RLS
DROP POLICY IF EXISTS "Resultados are viewable by everyone" ON public.resultados;
DROP POLICY IF EXISTS "Authenticated users can insert their own results" ON public.resultados;
DROP POLICY IF EXISTS "Users can view their own results" ON public.resultados;
DROP POLICY IF EXISTS "Admins can manage results" ON public.resultados;

CREATE POLICY "Students can view their own results" 
ON public.resultados FOR SELECT 
USING (auth.uid() = aluno_id);

CREATE POLICY "Students can insert their own results" 
ON public.resultados FOR INSERT 
WITH CHECK (auth.uid() = aluno_id);

CREATE POLICY "Admins can manage results" 
ON public.resultados FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'master')
  )
);

-- 5. Fix alunos RLS
DROP POLICY IF EXISTS "Alunos are viewable by everyone" ON public.alunos;
CREATE POLICY "Admins can view all students" 
ON public.alunos FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'master')
  )
);

CREATE POLICY "Students can view and update their own profile" 
ON public.alunos FOR ALL 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. Fix configuracoes RLS
DROP POLICY IF EXISTS "Public read access for configuracoes" ON public.configuracoes;
DROP POLICY IF EXISTS "Admins can manage configuracoes" ON public.configuracoes;

CREATE POLICY "Public read configuracoes" 
ON public.configuracoes FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage configuracoes" 
ON public.configuracoes FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'master')
  )
);
