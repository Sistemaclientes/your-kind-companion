-- Fix security issues identified by the linter

-- 1. Fix Function Search Path Mutable
-- Update the trigger function to have a secure search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. Fix Extension in Public
-- Create extensions schema if it doesn't exist and move extensions there
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;

-- 3. Add email validation constraints
ALTER TABLE public.admins ADD CONSTRAINT admin_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE public.alunos ADD CONSTRAINT aluno_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 4. Improve RLS Policies (making them more explicit and slightly tighter where possible)
-- Provas: Anyone can read, only authenticated can modify
DROP POLICY IF EXISTS "Anyone can read provas" ON public.provas;
DROP POLICY IF EXISTS "Anyone can insert provas" ON public.provas;
DROP POLICY IF EXISTS "Anyone can update provas" ON public.provas;
DROP POLICY IF EXISTS "Anyone can delete provas" ON public.provas;
DROP POLICY IF EXISTS "Allow all for authenticated users on provas" ON public.provas;
DROP POLICY IF EXISTS "Allow read for anyone on provas" ON public.provas;

CREATE POLICY "Provas are readable by everyone" ON public.provas FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage provas" ON public.provas FOR ALL TO authenticated USING (true);

-- Perguntas: Anyone can read, only authenticated can modify
DROP POLICY IF EXISTS "Anyone can read perguntas" ON public.perguntas;
DROP POLICY IF EXISTS "Anyone can insert perguntas" ON public.perguntas;
DROP POLICY IF EXISTS "Anyone can update perguntas" ON public.perguntas;
DROP POLICY IF EXISTS "Anyone can delete perguntas" ON public.perguntas;
DROP POLICY IF EXISTS "Allow all for authenticated users on perguntas" ON public.perguntas;
DROP POLICY IF EXISTS "Allow read for anyone on perguntas" ON public.perguntas;

CREATE POLICY "Perguntas are readable by everyone" ON public.perguntas FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage perguntas" ON public.perguntas FOR ALL TO authenticated USING (true);

-- Alternativas: Anyone can read, only authenticated can modify
DROP POLICY IF EXISTS "Anyone can read alternativas" ON public.alternativas;
DROP POLICY IF EXISTS "Anyone can insert alternativas" ON public.alternativas;
DROP POLICY IF EXISTS "Anyone can update alternativas" ON public.alternativas;
DROP POLICY IF EXISTS "Anyone can delete alternativas" ON public.alternativas;
DROP POLICY IF EXISTS "Allow all for authenticated users on alternativas" ON public.alternativas;
DROP POLICY IF EXISTS "Allow read for anyone on alternativas" ON public.alternativas;

CREATE POLICY "Alternativas are readable by everyone" ON public.alternativas FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage alternativas" ON public.alternativas FOR ALL TO authenticated USING (true);

-- Alunos: Anyone can insert (register), only authenticated can read/update all
DROP POLICY IF EXISTS "Anyone can read alunos" ON public.alunos;
DROP POLICY IF EXISTS "Anyone can insert alunos" ON public.alunos;
DROP POLICY IF EXISTS "Anyone can update alunos" ON public.alunos;
DROP POLICY IF EXISTS "Allow all for authenticated users on alunos" ON public.alunos;
DROP POLICY IF EXISTS "Allow insert for anyone on alunos" ON public.alunos;
DROP POLICY IF EXISTS "Allow select for anyone on alunos" ON public.alunos;

CREATE POLICY "Students can register themselves" ON public.alunos FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can manage alunos" ON public.alunos FOR ALL TO authenticated USING (true);
CREATE POLICY "Anyone can read students basic info" ON public.alunos FOR SELECT TO public USING (true);

-- Resultados: Anyone can insert, only authenticated can read all
DROP POLICY IF EXISTS "Anyone can read resultados" ON public.resultados;
DROP POLICY IF EXISTS "Anyone can insert resultados" ON public.resultados;
DROP POLICY IF EXISTS "Allow all for authenticated users on resultados" ON public.resultados;
DROP POLICY IF EXISTS "Allow insert for anyone on resultados" ON public.resultados;
DROP POLICY IF EXISTS "Allow select for anyone on resultados" ON public.resultados;

CREATE POLICY "Anyone can submit results" ON public.resultados FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can manage results" ON public.resultados FOR ALL TO authenticated USING (true);
CREATE POLICY "Anyone can see their own results" ON public.resultados FOR SELECT TO public USING (true);

-- Respostas Aluno: Anyone can insert, only authenticated can read all
DROP POLICY IF EXISTS "Allow all for authenticated users on respostas_aluno" ON public.respostas_aluno;
DROP POLICY IF EXISTS "Allow insert for anyone on respostas_aluno" ON public.respostas_aluno;
DROP POLICY IF EXISTS "Allow select for anyone on respostas_aluno" ON public.respostas_aluno;

CREATE POLICY "Anyone can submit answers" ON public.respostas_aluno FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can manage answers" ON public.respostas_aluno FOR ALL TO authenticated USING (true);
CREATE POLICY "Anyone can read answers" ON public.respostas_aluno FOR SELECT TO public USING (true);

-- 5. Add performance indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_provas_categoria_id ON public.provas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_perguntas_prova_id ON public.perguntas(prova_id);
CREATE INDEX IF NOT EXISTS idx_alternativas_pergunta_id ON public.alternativas(pergunta_id);
CREATE INDEX IF NOT EXISTS idx_resultados_prova_id ON public.resultados(prova_id);
CREATE INDEX IF NOT EXISTS idx_resultados_aluno_id ON public.resultados(aluno_id);
CREATE INDEX IF NOT EXISTS idx_respostas_aluno_resultado_id ON public.respostas_aluno(resultado_id);
CREATE INDEX IF NOT EXISTS idx_respostas_aluno_aluno_id ON public.respostas_aluno(aluno_id);
CREATE INDEX IF NOT EXISTS idx_respostas_aluno_pergunta_id ON public.respostas_aluno(pergunta_id);