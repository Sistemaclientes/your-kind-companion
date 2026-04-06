-- Create a table for email logs
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    to_email TEXT NOT NULL,
    template TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT,
    resend_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view all email logs" 
ON public.email_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role::text = 'admin' OR role::text = 'master')
  )
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs (status);

-- Add comments for documentation
COMMENT ON TABLE public.email_logs IS 'Logs for all emails sent through the system via Resend';
COMMENT ON COLUMN public.email_logs.to_email IS 'Recipient email address';
COMMENT ON COLUMN public.email_logs.template IS 'Name of the email template used';
COMMENT ON COLUMN public.email_logs.status IS 'Current status of the email (pending, sent, error)';