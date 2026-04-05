-- Add new configuration columns to the provas table
ALTER TABLE public.provas 
ADD COLUMN IF NOT EXISTS allow_guest BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_progress BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_timer BOOLEAN DEFAULT true;

-- Update RLS policies (optional, but good for completeness)
-- No changes needed to existing policies if they use auth.uid() or are public for select.
