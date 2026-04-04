-- Add slug column to resultados table
ALTER TABLE public.resultados ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add slug column to admins table
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Ensure generate_slug function is robust (already exists in some form but let's make it standard)
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        unaccent(title),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Function to set slug for resultados
CREATE OR REPLACE FUNCTION public.set_resultado_slug()
RETURNS TRIGGER AS $$
DECLARE
    prova_titulo TEXT;
BEGIN
  IF NEW.slug IS NULL THEN
    SELECT titulo INTO prova_titulo FROM public.provas WHERE id = NEW.prova_id;
    NEW.slug := lower(regexp_replace(COALESCE(prova_titulo, 'resultado'), '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for resultados
DROP TRIGGER IF EXISTS tr_set_resultado_slug ON public.resultados;
CREATE TRIGGER tr_set_resultado_slug
BEFORE INSERT ON public.resultados
FOR EACH ROW
EXECUTE FUNCTION public.set_resultado_slug();

-- Function to set slug for admins
CREATE OR REPLACE FUNCTION public.set_admin_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := lower(regexp_replace(NEW.nome, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for admins
DROP TRIGGER IF EXISTS tr_set_admin_slug ON public.admins;
CREATE TRIGGER tr_set_admin_slug
BEFORE INSERT ON public.admins
FOR EACH ROW
EXECUTE FUNCTION public.set_admin_slug();

-- Update existing records
UPDATE public.resultados 
SET slug = lower(regexp_replace((SELECT titulo FROM public.provas WHERE id = prova_id), '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL;

UPDATE public.admins 
SET slug = lower(regexp_replace(nome, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL;
