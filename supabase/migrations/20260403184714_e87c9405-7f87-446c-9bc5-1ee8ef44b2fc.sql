-- Adicionar coluna tentativa_numero na tabela de resultados
ALTER TABLE public.resultados 
ADD COLUMN IF NOT EXISTS tentativa_numero INTEGER DEFAULT 1;

-- Comentário na coluna para documentação
COMMENT ON COLUMN public.resultados.tentativa_numero IS 'Número da tentativa do aluno para esta prova específica';