-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at column to all tables if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'updated_at') THEN
        ALTER TABLE public.admins ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'updated_at') THEN
        ALTER TABLE public.alunos ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'provas' AND column_name = 'updated_at') THEN
        ALTER TABLE public.provas ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perguntas' AND column_name = 'updated_at') THEN
        ALTER TABLE public.perguntas ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'respostas' AND column_name = 'updated_at') THEN
        ALTER TABLE public.respostas ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categorias' AND column_name = 'updated_at') THEN
        ALTER TABLE public.categorias ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes' AND column_name = 'updated_at') THEN
        ALTER TABLE public.configuracoes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_admins_updated_at ON public.admins;
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON public.admins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_alunos_updated_at ON public.alunos;
CREATE TRIGGER update_alunos_updated_at BEFORE UPDATE ON public.alunos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_provas_updated_at ON public.provas;
CREATE TRIGGER update_provas_updated_at BEFORE UPDATE ON public.provas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_perguntas_updated_at ON public.perguntas;
CREATE TRIGGER update_perguntas_updated_at BEFORE UPDATE ON public.perguntas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_respostas_updated_at ON public.respostas;
CREATE TRIGGER update_respostas_updated_at BEFORE UPDATE ON public.respostas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_categorias_updated_at ON public.categorias;
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON public.categorias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_configuracoes_updated_at ON public.configuracoes;
CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON public.configuracoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add missing columns and indexes
ALTER TABLE public.resultados 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'finalizado',
ADD COLUMN IF NOT EXISTS duracao_total INTEGER;

CREATE INDEX IF NOT EXISTS idx_resultados_aluno_id ON public.resultados(aluno_id);
CREATE INDEX IF NOT EXISTS idx_resultados_prova_id ON public.resultados(prova_id);
CREATE INDEX IF NOT EXISTS idx_perguntas_prova_id ON public.perguntas(prova_id);
CREATE INDEX IF NOT EXISTS idx_respostas_pergunta_id ON public.respostas(pergunta_id);
CREATE INDEX IF NOT EXISTS idx_provas_categoria_id ON public.provas(categoria_id);

-- Fix RLS for admins and alumnos (self-read/write)
DROP POLICY IF EXISTS "Admins can view their own profile" ON public.admins;
CREATE POLICY "Admins can view their own profile" ON public.admins FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update their own profile" ON public.admins;
CREATE POLICY "Admins can update their own profile" ON public.admins FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Alunos can view their own profile" ON public.alunos;
CREATE POLICY "Alunos can view their own profile" ON public.alunos FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Alunos can update their own profile" ON public.alunos;
CREATE POLICY "Alunos can update their own profile" ON public.alunos FOR UPDATE USING (auth.uid() = id);
