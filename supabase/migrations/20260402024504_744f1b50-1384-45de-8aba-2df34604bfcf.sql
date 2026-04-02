
-- Admins table
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  is_master BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Provas (exams) table
CREATE TABLE public.provas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  slug TEXT UNIQUE,
  created_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Perguntas (questions) table
CREATE TABLE public.perguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prova_id UUID REFERENCES public.provas(id) ON DELETE CASCADE NOT NULL,
  enunciado TEXT NOT NULL,
  ordem INT DEFAULT 0
);

-- Alternativas (options) table
CREATE TABLE public.alternativas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta_id UUID REFERENCES public.perguntas(id) ON DELETE CASCADE NOT NULL,
  texto TEXT NOT NULL,
  is_correta BOOLEAN DEFAULT false
);

-- Alunos (students) table
CREATE TABLE public.alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Resultados (results) table
CREATE TABLE public.resultados (
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

-- RLS Policies: admins table (only admins can read via service role, anon can read for login)
CREATE POLICY "Allow anon read admins for login" ON public.admins FOR SELECT TO anon USING (true);

-- Provas: anyone can read, only authenticated can modify
CREATE POLICY "Anyone can read provas" ON public.provas FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can insert provas" ON public.provas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anyone can update provas" ON public.provas FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete provas" ON public.provas FOR DELETE TO anon USING (true);

-- Perguntas: anyone can read, insert, update, delete
CREATE POLICY "Anyone can read perguntas" ON public.perguntas FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can insert perguntas" ON public.perguntas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anyone can delete perguntas" ON public.perguntas FOR DELETE TO anon USING (true);

-- Alternativas: anyone can read, insert, delete
CREATE POLICY "Anyone can read alternativas" ON public.alternativas FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can insert alternativas" ON public.alternativas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anyone can delete alternativas" ON public.alternativas FOR DELETE TO anon USING (true);

-- Alunos: anyone can read and insert
CREATE POLICY "Anyone can read alunos" ON public.alunos FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can insert alunos" ON public.alunos FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anyone can update alunos" ON public.alunos FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Resultados: anyone can read and insert
CREATE POLICY "Anyone can read resultados" ON public.resultados FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can insert resultados" ON public.resultados FOR INSERT TO anon WITH CHECK (true);

-- Insert default admin
INSERT INTO public.admins (nome, email, senha, is_master) 
VALUES ('Admin Master', 'suprememidias.ok@gmail.com', 'Baudasorte', true);
