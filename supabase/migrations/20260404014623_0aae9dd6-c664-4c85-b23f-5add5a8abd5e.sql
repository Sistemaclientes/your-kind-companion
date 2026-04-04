ALTER TABLE public.perguntas DROP CONSTRAINT IF EXISTS fk_perguntas_prova;
ALTER TABLE public.alternativas DROP CONSTRAINT IF EXISTS fk_alternativas_pergunta;
ALTER TABLE public.respostas_aluno DROP CONSTRAINT IF EXISTS fk_respostas_pergunta;
ALTER TABLE public.respostas_aluno DROP CONSTRAINT IF EXISTS fk_respostas_alternativa;