-- Drop redundant foreign key constraints to resolve PostgREST ambiguity
ALTER TABLE public.perguntas DROP CONSTRAINT IF EXISTS fk_perguntas_prova;
ALTER TABLE public.alternativas DROP CONSTRAINT IF EXISTS fk_alternativas_pergunta;
ALTER TABLE public.respostas_aluno DROP CONSTRAINT IF EXISTS fk_respostas_aluno_pergunta;
ALTER TABLE public.respostas_aluno DROP CONSTRAINT IF EXISTS fk_respostas_aluno_aluno;
ALTER TABLE public.respostas_aluno DROP CONSTRAINT IF EXISTS fk_respostas_aluno_prova;
ALTER TABLE public.respostas_aluno DROP CONSTRAINT IF EXISTS fk_respostas_aluno_resultado;
ALTER TABLE public.respostas_aluno DROP CONSTRAINT IF EXISTS fk_respostas_aluno_alternativa;
ALTER TABLE public.resultados DROP CONSTRAINT IF EXISTS fk_resultados_aluno;
ALTER TABLE public.resultados DROP CONSTRAINT IF EXISTS fk_resultados_prova;
ALTER TABLE public.provas DROP CONSTRAINT IF EXISTS fk_provas_categoria;
ALTER TABLE public.notificacoes DROP CONSTRAINT IF EXISTS fk_notificacoes_user;