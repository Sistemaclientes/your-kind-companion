-- 1. Create a function to generate a unique 6-character slug for resultados
CREATE OR REPLACE FUNCTION public.generate_unique_result_slug()
RETURNS TRIGGER AS $$
DECLARE
    new_slug TEXT;
    done BOOLEAN := FALSE;
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        WHILE NOT done LOOP
            -- Generate a random 6-character string (uppercase letters and numbers)
            new_slug := upper(substring(md5(random()::text) from 1 for 6));
            
            -- Check if it already exists
            IF NOT EXISTS (SELECT 1 FROM public.resultados WHERE slug = new_slug) THEN
                NEW.slug := new_slug;
                done := TRUE;
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create the trigger for the resultados table
DROP TRIGGER IF EXISTS trigger_generate_result_slug ON public.resultados;
CREATE TRIGGER trigger_generate_result_slug
BEFORE INSERT ON public.resultados
FOR EACH ROW EXECUTE FUNCTION public.generate_unique_result_slug();

-- 3. Update existing results that don't have a slug (if any)
DO $$
DECLARE
    r RECORD;
    new_slug TEXT;
    done BOOLEAN;
BEGIN
    FOR r IN SELECT id FROM public.resultados WHERE slug IS NULL OR slug = '' LOOP
        done := FALSE;
        WHILE NOT done LOOP
            new_slug := upper(substring(md5(random()::text) from 1 for 6));
            IF NOT EXISTS (SELECT 1 FROM public.resultados WHERE slug = new_slug) THEN
                UPDATE public.resultados SET slug = new_slug WHERE id = r.id;
                done := TRUE;
            END IF;
        END LOOP;
    END LOOP;
END $$;