-- Add status and subtitulo columns to 'provas' table
ALTER TABLE public.provas 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Rascunho',
ADD COLUMN IF NOT EXISTS subtitulo TEXT;

-- Update RLS policies if necessary (usually 'SELECT' is already open for authenticated users)
-- No changes needed to policies as they typically use ALL or SELECT on the whole table.