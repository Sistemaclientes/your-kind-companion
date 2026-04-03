-- Create a function to call the welcome-email Edge Function
CREATE OR REPLACE FUNCTION public.handle_new_student_welcome_email()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
BEGIN
  -- Build the payload with the new record
  payload := jsonb_build_object('record', row_to_json(NEW));

  -- Call the Edge Function
  -- Note: We use net.http_post if available, but a more robust way is via a webhook or just a direct call if configured.
  -- For Lovable/Supabase, we can use the following approach if we have the service role key, 
  -- but usually we set up a Webhook in the Supabase Dashboard.
  -- However, we can use pg_net if it's enabled.
  
  PERFORM
    net.http_post(
      url := 'https://' || (SELECT setting FROM pg_settings WHERE name = 'request.headers'::text)::jsonb->>'host' || '/functions/v1/welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('request.jwt.claim.role', true) -- Use appropriate token
      ),
      body := payload
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
-- Note: Check if the trigger already exists to avoid errors
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_student_created_welcome_email') THEN
    CREATE TRIGGER on_student_created_welcome_email
    AFTER INSERT ON public.alunos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_student_welcome_email();
  END IF;
END $$;
