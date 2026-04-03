-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nome TEXT,
  email TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'aluno')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'nome', new.email, COALESCE(new.raw_user_meta_data->>'role', 'admin'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on existing tables
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alternativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Simple policies (allow all for now to avoid breaking existing logic, will refine if needed)
CREATE POLICY "Allow all for authenticated users on provas" ON public.provas FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users on perguntas" ON public.perguntas FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users on alternativas" ON public.alternativas FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users on alunos" ON public.alunos FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users on resultados" ON public.resultados FOR ALL TO authenticated USING (true);

-- Also allow students to read their own results and provas (using email since they don't have auth accounts yet)
CREATE POLICY "Allow read for anyone on provas" ON public.provas FOR SELECT USING (true);
CREATE POLICY "Allow read for anyone on perguntas" ON public.perguntas FOR SELECT USING (true);
CREATE POLICY "Allow read for anyone on alternativas" ON public.alternativas FOR SELECT USING (true);
CREATE POLICY "Allow insert for anyone on alunos" ON public.alunos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select for anyone on alunos" ON public.alunos FOR SELECT USING (true);
CREATE POLICY "Allow insert for anyone on resultados" ON public.resultados FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select for anyone on resultados" ON public.resultados FOR SELECT USING (true);

-- Set up Webhook for welcome-email
-- First, ensure the function exists in Supabase (done via Edge Function deployment)
-- We'll create a trigger that calls the edge function when a new student is inserted into 'alunos'

-- Note: We need the project reference ID for the edge function URL
-- Since we don't have it here easily, we'll use a generic trigger and the user can set up the webhook in the dashboard
-- OR we can try to use net.http_post if the extension is enabled

-- For this specific environment, we can use the 'supabase_functions' schema if available
-- But the standard way is to use the Dashboard Webhooks.
-- However, I can implement it in PL/pgSQL if the 'http' extension is available.

-- Let's check if 'http' extension exists
-- CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

-- For now, let's just make sure the RLS is set up.
