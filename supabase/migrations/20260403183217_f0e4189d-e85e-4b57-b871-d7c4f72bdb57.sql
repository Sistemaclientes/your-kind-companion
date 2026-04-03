-- Admins table
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  is_master BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Provas (exams) table
CREATE TABLE IF NOT EXISTS public.provas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  slug TEXT UNIQUE,
  created_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Perguntas (questions) table
CREATE TABLE IF NOT EXISTS public.perguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prova_id UUID REFERENCES public.provas(id) ON DELETE CASCADE NOT NULL,
  enunciado TEXT NOT NULL,
  ordem INT DEFAULT 0
);

-- Alternativas (options) table
CREATE TABLE IF NOT EXISTS public.alternativas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta_id UUID REFERENCES public.perguntas(id) ON DELETE CASCADE NOT NULL,
  texto TEXT NOT NULL,
  is_correta BOOLEAN DEFAULT false
);

-- Alunos (students) table
CREATE TABLE IF NOT EXISTS public.alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Resultados (results) table
CREATE TABLE IF NOT EXISTS public.resultados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prova_id UUID REFERENCES public.provas(id) ON DELETE CASCADE NOT NULL,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  pontuacao INT DEFAULT 0,
  acertos INT DEFAULT 0,
  total INT DEFAULT 0,
  respostas JSONB DEFAULT '{}',
  data TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alternativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins: anyone can read for login, anyone can insert/update/delete (based on the previous migrations allowing anon access)
DO $$ BEGIN
  CREATE POLICY "Allow anon read admins for login" ON public.admins FOR SELECT TO anon USING (true);
  CREATE POLICY "Anyone can update admins" ON public.admins FOR UPDATE TO anon USING (true) WITH CHECK (true);
  CREATE POLICY "Anyone can insert admins" ON public.admins FOR INSERT TO anon WITH CHECK (true);
  CREATE POLICY "Anyone can delete admins" ON public.admins FOR DELETE TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Provas: anyone can read, insert, update, delete
DO $$ BEGIN
  CREATE POLICY "Anyone can read provas" ON public.provas FOR SELECT TO anon USING (true);
  CREATE POLICY "Anyone can insert provas" ON public.provas FOR INSERT TO anon WITH CHECK (true);
  CREATE POLICY "Anyone can update provas" ON public.provas FOR UPDATE TO anon USING (true) WITH CHECK (true);
  CREATE POLICY "Anyone can delete provas" ON public.provas FOR DELETE TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Perguntas: anyone can read, insert, update, delete
DO $$ BEGIN
  CREATE POLICY "Anyone can read perguntas" ON public.perguntas FOR SELECT TO anon USING (true);
  CREATE POLICY "Anyone can insert perguntas" ON public.perguntas FOR INSERT TO anon WITH CHECK (true);
  CREATE POLICY "Anyone can update perguntas" ON public.perguntas FOR UPDATE TO anon USING (true) WITH CHECK (true);
  CREATE POLICY "Anyone can delete perguntas" ON public.perguntas FOR DELETE TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Alternativas: anyone can read, insert, update, delete
DO $$ BEGIN
  CREATE POLICY "Anyone can read alternativas" ON public.alternativas FOR SELECT TO anon USING (true);
  CREATE POLICY "Anyone can insert alternativas" ON public.alternativas FOR INSERT TO anon WITH CHECK (true);
  CREATE POLICY "Anyone can update alternativas" ON public.alternativas FOR UPDATE TO anon USING (true) WITH CHECK (true);
  CREATE POLICY "Anyone can delete alternativas" ON public.alternativas FOR DELETE TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Alunos: anyone can read, insert, update
DO $$ BEGIN
  CREATE POLICY "Anyone can read alunos" ON public.alunos FOR SELECT TO anon USING (true);
  CREATE POLICY "Anyone can insert alunos" ON public.alunos FOR INSERT TO anon WITH CHECK (true);
  CREATE POLICY "Anyone can update alunos" ON public.alunos FOR UPDATE TO anon USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Resultados: anyone can read and insert
DO $$ BEGIN
  CREATE POLICY "Anyone can read resultados" ON public.resultados FOR SELECT TO anon USING (true);
  CREATE POLICY "Anyone can insert resultados" ON public.resultados FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Insert default admin if it doesn't exist
INSERT INTO public.admins (nome, email, senha, is_master) 
SELECT 'Admin Master', 'suprememidias.ok@gmail.com', 'Baudasorte', true
WHERE NOT EXISTS (SELECT 1 FROM public.admins WHERE email = 'suprememidias.ok@gmail.com');

-- Welcome email function and trigger
CREATE OR REPLACE FUNCTION public.handle_new_student_welcome_email()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
BEGIN
  payload := jsonb_build_object('record', row_to_json(NEW));
  
  -- This requires pg_net extension to be enabled in Supabase
  -- Usually triggered via Dashboard Webhooks, but kept here as requested by project structure
  PERFORM
    net.http_post(
      url := 'https://' || (SELECT setting FROM pg_settings WHERE name = 'request.headers'::text)::jsonb->>'host' || '/functions/v1/welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('request.jwt.claim.role', true)
      ),
      body := payload
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_student_created_welcome_email') THEN
    CREATE TRIGGER on_student_created_welcome_email
    AFTER INSERT ON public.alunos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_student_welcome_email();
  END IF;
END $$;