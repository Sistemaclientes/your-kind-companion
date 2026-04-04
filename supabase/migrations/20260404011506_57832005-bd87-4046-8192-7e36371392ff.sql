-- 1. Normalizar valores da coluna 'status' na tabela 'provas'
UPDATE public.provas SET status = 'Ativa' WHERE status = 'publicada';

-- 2. Adicionar restrições de unicidade para e-mails
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'alunos_email_key') THEN
        ALTER TABLE public.alunos ADD CONSTRAINT alunos_email_key UNIQUE (email);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admins_email_key') THEN
        ALTER TABLE public.admins ADD CONSTRAINT admins_email_key UNIQUE (email);
    END IF;
END $$;

-- 3. Adicionar chaves estrangeiras com cascata de exclusão
-- Perguntas
ALTER TABLE public.perguntas 
DROP CONSTRAINT IF EXISTS perguntas_prova_id_fkey,
ADD CONSTRAINT perguntas_prova_id_fkey FOREIGN KEY (prova_id) REFERENCES public.provas(id) ON DELETE CASCADE;

-- Alternativas
ALTER TABLE public.alternativas 
DROP CONSTRAINT IF EXISTS alternativas_pergunta_id_fkey,
ADD CONSTRAINT alternativas_pergunta_id_fkey FOREIGN KEY (pergunta_id) REFERENCES public.perguntas(id) ON DELETE CASCADE;

-- Respostas Aluno
ALTER TABLE public.respostas_aluno 
DROP CONSTRAINT IF EXISTS respostas_aluno_prova_id_fkey,
ADD CONSTRAINT respostas_aluno_prova_id_fkey FOREIGN KEY (prova_id) REFERENCES public.provas(id) ON DELETE CASCADE;

ALTER TABLE public.respostas_aluno 
DROP CONSTRAINT IF EXISTS respostas_aluno_pergunta_id_fkey,
ADD CONSTRAINT respostas_aluno_pergunta_id_fkey FOREIGN KEY (pergunta_id) REFERENCES public.perguntas(id) ON DELETE CASCADE;

ALTER TABLE public.respostas_aluno 
DROP CONSTRAINT IF EXISTS respostas_aluno_alternativa_id_fkey,
ADD CONSTRAINT respostas_aluno_alternativa_id_fkey FOREIGN KEY (alternativa_id) REFERENCES public.alternativas(id) ON DELETE CASCADE;

ALTER TABLE public.respostas_aluno 
DROP CONSTRAINT IF EXISTS respostas_aluno_resultado_id_fkey,
ADD CONSTRAINT respostas_aluno_resultado_id_fkey FOREIGN KEY (resultado_id) REFERENCES public.resultados(id) ON DELETE CASCADE;

-- Resultados
ALTER TABLE public.resultados 
DROP CONSTRAINT IF EXISTS resultados_prova_id_fkey,
ADD CONSTRAINT resultados_prova_id_fkey FOREIGN KEY (prova_id) REFERENCES public.provas(id) ON DELETE CASCADE;

ALTER TABLE public.resultados 
DROP CONSTRAINT IF EXISTS resultados_aluno_id_fkey,
ADD CONSTRAINT resultados_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- 4. Limpar e atualizar as políticas de RLS
-- Provas
DROP POLICY IF EXISTS "Public read access for active exams" ON public.provas;
DROP POLICY IF EXISTS "Anyone can view active exams" ON public.provas;
CREATE POLICY "Public read access for active exams" 
ON public.provas FOR SELECT 
USING (status = 'Ativa' OR status = 'Ativo');

-- Perguntas
DROP POLICY IF EXISTS "Public read access for questions" ON public.perguntas;
DROP POLICY IF EXISTS "Anyone can view questions of active exams" ON public.perguntas;
CREATE POLICY "Public read access for questions" 
ON public.perguntas FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.provas 
    WHERE provas.id = perguntas.prova_id AND (status = 'Ativa' OR status = 'Ativo')
  )
);

-- Alternativas
DROP POLICY IF EXISTS "Public read access for options" ON public.alternativas;
DROP POLICY IF EXISTS "Anyone can view options of active exams" ON public.alternativas;
CREATE POLICY "Public read access for options" 
ON public.alternativas FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.perguntas p 
    JOIN public.provas ex ON p.prova_id = ex.id 
    WHERE p.id = alternativas.pergunta_id AND (ex.status = 'Ativa' OR ex.status = 'Ativo')
  )
);

-- 5. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_provas_status ON public.provas(status);
CREATE INDEX IF NOT EXISTS idx_perguntas_prova_id ON public.perguntas(prova_id);
CREATE INDEX IF NOT EXISTS idx_alternativas_pergunta_id ON public.alternativas(pergunta_id);
CREATE INDEX IF NOT EXISTS idx_resultados_aluno_id ON public.resultados(aluno_id);
CREATE INDEX IF NOT EXISTS idx_resultados_prova_id ON public.resultados(prova_id);
CREATE INDEX IF NOT EXISTS idx_respostas_aluno_resultado_id ON public.respostas_aluno(resultado_id);