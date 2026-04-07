-- Add missing columns to configuracoes table
ALTER TABLE public.configuracoes 
ADD COLUMN IF NOT EXISTS nota_minima NUMERIC DEFAULT 7.0,
ADD COLUMN IF NOT EXISTS mensagem_resultado TEXT DEFAULT 'Parabéns pelo seu desempenho na avaliação!',
ADD COLUMN IF NOT EXISTS exibir_resultado_imediatamente BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS permitir_refazer BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS liberar_revisao BOOLEAN DEFAULT TRUE;

-- Update the default settings row with the new defaults if they are NULL
UPDATE public.configuracoes 
SET 
  nota_minima = COALESCE(nota_minima, 7.0),
  mensagem_resultado = COALESCE(mensagem_resultado, 'Parabéns pelo seu desempenho na avaliação!'),
  exibir_resultado_imediatamente = COALESCE(exibir_resultado_imediatamente, TRUE),
  permitir_refazer = COALESCE(permitir_refazer, FALSE),
  liberar_revisao = COALESCE(liberar_revisao, TRUE)
WHERE chave = 'default';