-- Add foreign key for provas to categorias
ALTER TABLE public.provas 
ADD CONSTRAINT fk_provas_categoria 
FOREIGN KEY (categoria_id) 
REFERENCES public.categorias(id) 
ON DELETE SET NULL;

-- Add foreign key for perguntas to provas
ALTER TABLE public.perguntas 
ADD CONSTRAINT fk_perguntas_prova 
FOREIGN KEY (prova_id) 
REFERENCES public.provas(id) 
ON DELETE CASCADE;

-- Add foreign key for alternativas to perguntas
ALTER TABLE public.alternativas 
ADD CONSTRAINT fk_alternativas_pergunta 
FOREIGN KEY (pergunta_id) 
REFERENCES public.perguntas(id) 
ON DELETE CASCADE;

-- Add foreign keys for respostas_aluno
ALTER TABLE public.respostas_aluno 
ADD CONSTRAINT fk_respostas_aluno_prova 
FOREIGN KEY (prova_id) 
REFERENCES public.provas(id) 
ON DELETE CASCADE;

ALTER TABLE public.respostas_aluno 
ADD CONSTRAINT fk_respostas_aluno_pergunta 
FOREIGN KEY (pergunta_id) 
REFERENCES public.perguntas(id) 
ON DELETE CASCADE;

ALTER TABLE public.respostas_aluno 
ADD CONSTRAINT fk_respostas_aluno_alternativa 
FOREIGN KEY (alternativa_id) 
REFERENCES public.alternativas(id) 
ON DELETE CASCADE;

ALTER TABLE public.respostas_aluno 
ADD CONSTRAINT fk_respostas_aluno_resultado 
FOREIGN KEY (resultado_id) 
REFERENCES public.resultados(id) 
ON DELETE CASCADE;

ALTER TABLE public.respostas_aluno 
ADD CONSTRAINT fk_respostas_aluno_aluno 
FOREIGN KEY (aluno_id) 
REFERENCES public.alunos(id) 
ON DELETE CASCADE;

-- Add foreign keys for resultados
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

-- Add updated_at columns if missing
ALTER TABLE public.perguntas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.alternativas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.resultados ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.respostas_aluno ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.notificacoes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to all tables with updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name = 'updated_at'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);
    END LOOP;
END;
$$;