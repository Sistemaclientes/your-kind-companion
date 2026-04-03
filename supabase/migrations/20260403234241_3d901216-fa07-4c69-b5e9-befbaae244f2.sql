-- Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Update the welcome email trigger function to use pg_net correctly
CREATE OR REPLACE FUNCTION public.handle_new_student_welcome_email()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  function_url TEXT;
BEGIN
  -- Build the payload with the new record
  payload := jsonb_build_object('record', row_to_json(NEW));

  -- Get the function URL dynamically or use a placeholder if not in a request context
  -- In Supabase, the host is usually available in the request headers
  BEGIN
    function_url := 'https://' || (SELECT setting FROM pg_settings WHERE name = 'request.headers'::text)::jsonb->>'host' || '/functions/v1/welcome-email';
  EXCEPTION WHEN OTHERS THEN
    -- Fallback for non-request contexts (like manual inserts)
    -- This should be replaced with the actual project URL if known, 
    -- but using the header is standard for Supabase migrations.
    function_url := null;
  END;

  IF function_url IS NOT NULL THEN
    PERFORM
      net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('request.jwt.claim.role', true)
        ),
        body := payload
      );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger to ensure it's using the updated function
DROP TRIGGER IF EXISTS on_student_created_welcome_email ON public.alunos;
CREATE TRIGGER on_student_created_welcome_email
AFTER INSERT ON public.alunos
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_student_welcome_email();
