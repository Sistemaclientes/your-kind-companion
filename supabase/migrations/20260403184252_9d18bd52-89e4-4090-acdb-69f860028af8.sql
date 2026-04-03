-- Add status to provas
ALTER TABLE public.provas 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Ativa';

-- Add status and last_login to alunos
ALTER TABLE public.alunos 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Ativo',
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Add active to admins
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Add total_time to resultados (to track duration in seconds)
ALTER TABLE public.resultados 
ADD COLUMN IF NOT EXISTS total_time INTEGER;

-- Create an index for status in provas for faster filtering
CREATE INDEX IF NOT EXISTS idx_provas_status ON public.provas(status);

-- Create an index for status in alunos for faster filtering
CREATE INDEX IF NOT EXISTS idx_alunos_status ON public.alunos(status);