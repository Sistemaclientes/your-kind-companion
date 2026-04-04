-- 1. Add Foreign Keys to ensure data integrity
-- Provas to Categorias
ALTER TABLE public.provas 
ADD CONSTRAINT fk_provas_categoria 
FOREIGN KEY (categoria_id) 
REFERENCES public.categorias(id) 
ON DELETE SET NULL;

-- Perguntas to Provas
ALTER TABLE public.perguntas 
ADD CONSTRAINT fk_perguntas_prova 
FOREIGN KEY (prova_id) 
REFERENCES public.provas(id) 
ON DELETE CASCADE;

-- Alternativas to Perguntas
ALTER TABLE public.alternativas 
ADD CONSTRAINT fk_alternativas_pergunta 
FOREIGN KEY (pergunta_id) 
REFERENCES public.perguntas(id) 
ON DELETE CASCADE;

-- Resultados to Provas and Alunos
ALTER TABLE public.resultados 
ADD CONSTRAINT fk_resultados_prova 
FOREIGN KEY (prova_id) 
REFERENCES public.provas(id) 
ON DELETE CASCADE;

ALTER TABLE public.resultados 
ADD CONSTRAINT fk_resultados_aluno 
FOREIGN KEY (aluno_id) 
REFERENCES public.alunos(id) 
ON DELETE CASCADE;

-- Respostas_aluno to Resultados, Provas, Alunos, Perguntas and Alternativas
ALTER TABLE public.respostas_aluno 
ADD CONSTRAINT fk_respostas_resultado 
FOREIGN KEY (resultado_id) 
REFERENCES public.resultados(id) 
ON DELETE CASCADE;

ALTER TABLE public.respostas_aluno 
ADD CONSTRAINT fk_respostas_prova 
FOREIGN KEY (prova_id) 
REFERENCES public.provas(id) 
ON DELETE CASCADE;

ALTER TABLE public.respostas_aluno 
ADD CONSTRAINT fk_respostas_aluno 
FOREIGN KEY (aluno_id) 
REFERENCES public.alunos(id) 
ON DELETE CASCADE;

ALTER TABLE public.respostas_aluno 
ADD CONSTRAINT fk_respostas_pergunta 
FOREIGN KEY (pergunta_id) 
REFERENCES public.perguntas(id) 
ON DELETE CASCADE;

ALTER TABLE public.respostas_aluno 
ADD CONSTRAINT fk_respostas_alternativa 
FOREIGN KEY (alternativa_id) 
REFERENCES public.alternativas(id) 
ON DELETE CASCADE;

-- 2. Add scheduling columns to Provas
ALTER TABLE public.provas 
ADD COLUMN IF NOT EXISTS data_inicio TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_fim TIMESTAMP WITH TIME ZONE;

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_provas_categoria_id ON public.provas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_perguntas_prova_id ON public.perguntas(prova_id);
CREATE INDEX IF NOT EXISTS idx_alternativas_pergunta_id ON public.alternativas(pergunta_id);
CREATE INDEX IF NOT EXISTS idx_resultados_prova_id ON public.resultados(prova_id);
CREATE INDEX IF NOT EXISTS idx_resultados_aluno_id ON public.resultados(aluno_id);
CREATE INDEX IF NOT EXISTS idx_respostas_resultado_id ON public.respostas_aluno(resultado_id);

-- 4. Enable RLS on all tables (if not already enabled)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alternativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas_aluno ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- 5. Policies for public access (adjust as needed)
-- Provas: Anyone can view active ones
DROP POLICY IF EXISTS "Provas are viewable by everyone" ON public.provas;
CREATE POLICY "Provas are viewable by everyone" 
ON public.provas FOR SELECT 
USING (true);

-- Categorias: Anyone can view
DROP POLICY IF EXISTS "Categorias are viewable by everyone" ON public.categorias;
CREATE POLICY "Categorias are viewable by everyone" 
ON public.categorias FOR SELECT 
USING (true);

-- Alunos: Only admins can view all, or student their own (simplified to everyone for now)
DROP POLICY IF EXISTS "Alunos are viewable by everyone" ON public.alunos;
CREATE POLICY "Alunos are viewable by everyone" 
ON public.alunos FOR SELECT 
USING (true);

-- Resultados: Only owner or admin (simplified)
DROP POLICY IF EXISTS "Resultados are viewable by everyone" ON public.resultados;
CREATE POLICY "Resultados are viewable by everyone" 
ON public.resultados FOR SELECT 
USING (true);

-- Perguntas and Alternativas: Anyone can view
DROP POLICY IF EXISTS "Perguntas are viewable by everyone" ON public.perguntas;
CREATE POLICY "Perguntas are viewable by everyone" 
ON public.perguntas FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Alternativas are viewable by everyone" ON public.alternativas;
CREATE POLICY "Alternativas are viewable by everyone" 
ON public.alternativas FOR SELECT 
USING (true);
