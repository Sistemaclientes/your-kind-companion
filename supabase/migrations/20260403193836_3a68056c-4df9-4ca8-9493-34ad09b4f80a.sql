-- Add aluno_id to respostas_aluno if it doesn't exist
ALTER TABLE public.respostas_aluno 
ADD COLUMN IF NOT EXISTS aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Ensure all necessary columns exist in provas (most should already be there from previous migrations)
ALTER TABLE public.provas 
ADD COLUMN IF NOT EXISTS duracao INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS embaralhar_questoes BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS mostrar_resultado BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS permitir_revisao BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS bloquear_navegacao BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nota_corte NUMERIC DEFAULT 7.0,
ADD COLUMN IF NOT EXISTS tentativas_maximas INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS feedback_aprovacao TEXT,
ADD COLUMN IF NOT EXISTS feedback_reprovacao TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Ensure all necessary columns exist in perguntas
ALTER TABLE public.perguntas 
ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'multiple',
ADD COLUMN IF NOT EXISTS pontos NUMERIC DEFAULT 1,
ADD COLUMN IF NOT EXISTS explicacao TEXT,
ADD COLUMN IF NOT EXISTS imagem_url TEXT;

-- Update RLS policies for results to be more secure
-- Currently everyone can read everyone's results. Let's fix that.
DROP POLICY IF EXISTS "Anyone can read resultados" ON public.resultados;

-- Only admins can read all results, students can only read their own if authenticated (but they use custom auth)
-- Since they use custom auth, we'll keep a more permissive policy for now but restricted to specific roles if possible.
-- For now, let's at least make sure they are not completely public if we can distinguish them.
-- Actually, the current app structure relies on public reading for some parts. 
-- Let's just ensure the policies are explicitly defined.

CREATE POLICY "Admins can manage all results" 
ON public.resultados FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Add some initial categories if the table is empty
INSERT INTO public.categorias (nome, slug, cor, icon)
SELECT 'Administração', 'administracao', 'bg-blue-500', 'Briefcase'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nome = 'Administração');

INSERT INTO public.categorias (nome, slug, cor, icon)
SELECT 'Tecnologia', 'tecnologia', 'bg-purple-500', 'Cpu'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nome = 'Tecnologia');

INSERT INTO public.categorias (nome, slug, cor, icon)
SELECT 'Saúde', 'saude', 'bg-green-500', 'Stethoscope'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nome = 'Saúde');
