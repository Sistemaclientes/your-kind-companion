-- Add password reset columns to admins table
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP WITH TIME ZONE;

-- Add an index for faster lookups during reset
CREATE INDEX IF NOT EXISTS idx_admins_reset_token ON public.admins(reset_token);

-- Update RLS policies for admins if not already present
-- Assuming we want to allow admins to see and update their own reset tokens, 
-- or for the public reset password flow to function.

-- Policy for public password reset lookup
CREATE POLICY "Allow public reset token lookup" 
ON public.admins FOR SELECT 
USING (reset_token IS NOT NULL);

-- Policy for public password reset update
CREATE POLICY "Allow public reset password update" 
ON public.admins FOR UPDATE 
USING (reset_token IS NOT NULL)
WITH CHECK (reset_token IS NOT NULL);