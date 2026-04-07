-- Create Turmas table to group students
CREATE TABLE IF NOT EXISTS public.turmas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;

-- Create policies for turmas
CREATE POLICY "Admins can manage turmas" 
ON public.turmas 
FOR ALL 
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

CREATE POLICY "Alunos can view their own turma" 
ON public.turmas 
FOR SELECT 
TO authenticated
USING (true);

-- Add turma_id to alunos table
ALTER TABLE public.alunos 
ADD COLUMN IF NOT EXISTS turma_id UUID REFERENCES public.turmas(id);

-- Create trigger for updated_at if function exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE TRIGGER update_turmas_updated_at
        BEFORE UPDATE ON public.turmas
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;