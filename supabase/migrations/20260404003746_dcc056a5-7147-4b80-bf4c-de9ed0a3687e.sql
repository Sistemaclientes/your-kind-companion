-- Remove duplicate foreign keys to resolve PostgREST ambiguity and build errors

-- Table: perguntas
ALTER TABLE public.perguntas DROP CONSTRAINT IF EXISTS fk_perguntas_prova;

-- Table: alternativas
ALTER TABLE public.alternativas DROP CONSTRAINT IF EXISTS fk_alternativas_pergunta;

-- Table: provas
ALTER TABLE public.provas DROP CONSTRAINT IF EXISTS fk_provas_categoria;

-- Table: respostas_aluno
ALTER TABLE public.respostas_aluno DROP CONSTRAINT IF EXISTS fk_respostas_aluno_aluno;
ALTER TABLE public.respostas_aluno DROP CONSTRAINT IF EXISTS fk_respostas_aluno_pergunta;
ALTER TABLE public.respostas_aluno DROP CONSTRAINT IF EXISTS fk_respostas_aluno_prova;
ALTER TABLE public.respostas_aluno DROP CONSTRAINT IF EXISTS fk_respostas_aluno_resultado;
ALTER TABLE public.respostas_aluno DROP CONSTRAINT IF EXISTS fk_respostas_aluno_alternativa;

-- Table: resultados
ALTER TABLE public.resultados DROP CONSTRAINT IF EXISTS fk_resultados_aluno;
ALTER TABLE public.resultados DROP CONSTRAINT IF EXISTS fk_resultados_prova;