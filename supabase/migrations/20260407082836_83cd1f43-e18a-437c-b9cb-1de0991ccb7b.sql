-- Add missing columns to turmas table
ALTER TABLE public.turmas ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.turmas ADD COLUMN IF NOT EXISTS professor_id UUID REFERENCES public.admins(id);
ALTER TABLE public.turmas ADD COLUMN IF NOT EXISTS total_alunos INTEGER DEFAULT 0;
ALTER TABLE public.turmas ADD COLUMN IF NOT EXISTS codigo_acesso TEXT UNIQUE;

-- Create function to update student count in turmas
CREATE OR REPLACE FUNCTION public.update_turma_student_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.turma_id IS NOT NULL) THEN
            UPDATE public.turmas SET total_alunos = total_alunos + 1 WHERE id = NEW.turma_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.turma_id IS NOT NULL) THEN
            UPDATE public.turmas SET total_alunos = total_alunos - 1 WHERE id = OLD.turma_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.turma_id IS DISTINCT FROM NEW.turma_id) THEN
            IF (OLD.turma_id IS NOT NULL) THEN
                UPDATE public.turmas SET total_alunos = total_alunos - 1 WHERE id = OLD.turma_id;
            END IF;
            IF (NEW.turma_id IS NOT NULL) THEN
                UPDATE public.turmas SET total_alunos = total_alunos + 1 WHERE id = NEW.turma_id;
            END IF;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for student count
DROP TRIGGER IF EXISTS tr_update_turma_student_count ON public.alunos;
CREATE TRIGGER tr_update_turma_student_count
AFTER INSERT OR UPDATE OR DELETE ON public.alunos
FOR EACH ROW EXECUTE FUNCTION public.update_turma_student_count();

-- Create function to generate access code
CREATE OR REPLACE FUNCTION public.generate_turma_access_code()
RETURNS TRIGGER AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    IF NEW.codigo_acesso IS NULL THEN
        LOOP
            -- Generate a random 6-character uppercase code
            new_code := upper(substring(md5(random()::text) from 1 for 6));
            
            -- Check if it exists
            SELECT EXISTS (SELECT 1 FROM public.turmas WHERE codigo_acesso = new_code) INTO code_exists;
            
            IF NOT code_exists THEN
                NEW.codigo_acesso := new_code;
                EXIT;
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for access code
DROP TRIGGER IF EXISTS tr_generate_turma_access_code ON public.turmas;
CREATE TRIGGER tr_generate_turma_access_code
BEFORE INSERT ON public.turmas
FOR EACH ROW EXECUTE FUNCTION public.generate_turma_access_code();

-- Create function to generate slug from name
CREATE OR REPLACE FUNCTION public.generate_turma_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL THEN
        NEW.slug := public.slugify(NEW.nome) || '-' || lower(substring(md5(random()::text) from 1 for 4));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for slug
DROP TRIGGER IF EXISTS tr_generate_turma_slug ON public.turmas;
CREATE TRIGGER tr_generate_turma_slug
BEFORE INSERT ON public.turmas
FOR EACH ROW EXECUTE FUNCTION public.generate_turma_slug();

-- Update existing turmas with codes and slugs if they are missing
DO $$ 
DECLARE 
    t_record RECORD;
BEGIN
    FOR t_record IN SELECT id, nome FROM public.turmas WHERE slug IS NULL OR codigo_acesso IS NULL LOOP
        UPDATE public.turmas 
        SET 
            slug = COALESCE(slug, public.slugify(nome) || '-' || lower(substring(md5(random()::text) from 1 for 4))),
            codigo_acesso = COALESCE(codigo_acesso, upper(substring(md5(random()::text) from 1 for 6)))
        WHERE id = t_record.id;
    END LOOP;
END $$;
