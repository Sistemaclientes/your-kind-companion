-- Check and add columns to alunos table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'email_confirmed') THEN
        ALTER TABLE public.alunos ADD COLUMN email_confirmed BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'confirmation_token') THEN
        ALTER TABLE public.alunos ADD COLUMN confirmation_token TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'token_expires_at') THEN
        ALTER TABLE public.alunos ADD COLUMN token_expires_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Update existing records to have email_confirmed = true if they are already active, 
-- or false if we want everyone to re-confirm. For safety, let's keep existing active ones as confirmed.
UPDATE public.alunos SET email_confirmed = true WHERE email_confirmed IS NULL AND status = 'Ativo';
UPDATE public.alunos SET email_confirmed = false WHERE email_confirmed IS NULL;
