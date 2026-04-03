-- Adicionar colunas na tabela de provas
ALTER TABLE public.provas 
ADD COLUMN IF NOT EXISTS tentativas_maximas INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS feedback_aprovacao TEXT DEFAULT 'Parabéns! Você foi aprovado.',
ADD COLUMN IF NOT EXISTS feedback_reprovacao TEXT DEFAULT 'Infelizmente você não atingiu a nota mínima.';

-- Adicionar coluna na tabela de resultados
ALTER TABLE public.resultados 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pendente';

-- Criar um índice para o status dos resultados para buscas mais rápidas
CREATE INDEX IF NOT EXISTS idx_resultados_status ON public.resultados(status);

-- Comentários nas colunas para documentação
COMMENT ON COLUMN public.provas.tentativas_maximas IS 'Número máximo de vezes que um aluno pode realizar esta prova';
COMMENT ON COLUMN public.provas.feedback_aprovacao IS 'Mensagem exibida ao aluno em caso de aprovação';
COMMENT ON COLUMN public.provas.feedback_reprovacao IS 'Mensagem exibida ao aluno em caso de reprovação';
COMMENT ON COLUMN public.resultados.status IS 'Status do resultado: Aprovado, Reprovado ou Pendente';