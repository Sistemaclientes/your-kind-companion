-- Add updated_at column to provas table
ALTER TABLE public.provas 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create or update the trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_provas_updated_at ON public.provas;
CREATE TRIGGER update_provas_updated_at
BEFORE UPDATE ON public.provas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
