-- Function to generate slug from text
CREATE OR REPLACE FUNCTION public.slugify(v_text TEXT)
RETURNS TEXT AS $$
DECLARE
  v_slug TEXT;
BEGIN
  v_slug := lower(v_text);
  v_slug := regexp_replace(v_slug, '[^a-z0-9\s-]', '', 'g');
  v_slug := regexp_replace(v_slug, '\s+', '-', 'g');
  v_slug := trim(both '-' from v_slug);
  RETURN v_slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger function to auto-populate slug
CREATE OR REPLACE FUNCTION public.tr_populate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.slugify(NEW.titulo);
    -- Check for uniqueness and append suffix if needed
    WHILE EXISTS (SELECT 1 FROM public.provas WHERE slug = NEW.slug AND id != NEW.id) LOOP
      NEW.slug := NEW.slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for provas
DROP TRIGGER IF EXISTS tr_provas_slug ON public.provas;
CREATE TRIGGER tr_provas_slug
BEFORE INSERT OR UPDATE OF titulo, slug ON public.provas
FOR EACH ROW EXECUTE FUNCTION public.tr_populate_slug();

-- Trigger for categorias
CREATE OR REPLACE FUNCTION public.tr_populate_slug_categoria()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.slugify(NEW.nome);
    WHILE EXISTS (SELECT 1 FROM public.categorias WHERE slug = NEW.slug AND id != NEW.id) LOOP
      NEW.slug := NEW.slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_categorias_slug ON public.categorias;
CREATE TRIGGER tr_categorias_slug
BEFORE INSERT OR UPDATE OF nome, slug ON public.categorias
FOR EACH ROW EXECUTE FUNCTION public.tr_populate_slug_categoria();

-- Improve resultados table
ALTER TABLE public.resultados 
ADD COLUMN IF NOT EXISTS iniciado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS concluido_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS nota_corte_alvo NUMERIC DEFAULT 7.0,
ADD COLUMN IF NOT EXISTS tentativa_numero INTEGER DEFAULT 1;

-- Update existing results to have concluido_em if it's null
UPDATE public.resultados SET concluido_em = created_at WHERE concluido_em IS NULL;

-- Consolidate configuracoes
ALTER TABLE public.configuracoes 
ADD COLUMN IF NOT EXISTS favicon_url TEXT;

-- Ensure cor_primaria and primary_color are synced (deprecated cor_primaria in favor of primary_color)
UPDATE public.configuracoes SET primary_color = cor_primaria WHERE primary_color IS NULL AND cor_primaria IS NOT NULL;

-- Add updated_at trigger if missing
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_configuracoes_updated_at ON public.configuracoes;
CREATE TRIGGER tr_configuracoes_updated_at
BEFORE UPDATE ON public.configuracoes
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
