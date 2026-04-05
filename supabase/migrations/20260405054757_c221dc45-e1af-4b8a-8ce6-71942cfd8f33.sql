-- Add cnpj to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cnpj TEXT;

-- Create DAS reports table
CREATE TABLE IF NOT EXISTS public.das_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
    amount DECIMAL(10, 2),
    due_date DATE,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Declarations table
CREATE TABLE IF NOT EXISTS public.declarations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    year INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'submitted'
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.das_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for das_reports
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own das_reports') THEN
        CREATE POLICY "Users can view their own das_reports" ON public.das_reports FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all das_reports') THEN
        CREATE POLICY "Admins can view all das_reports" ON public.das_reports FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;
END $$;

-- Policies for declarations
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own declarations') THEN
        CREATE POLICY "Users can view their own declarations" ON public.declarations FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all declarations') THEN
        CREATE POLICY "Admins can view all declarations" ON public.declarations FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;
END $$;

-- Policies for notifications
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own notifications') THEN
        CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own notifications (mark as read)') THEN
        CREATE POLICY "Users can update their own notifications (mark as read)" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Triggers for updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_das_reports_updated_at') THEN
        CREATE TRIGGER trigger_das_reports_updated_at BEFORE UPDATE ON public.das_reports FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_declarations_updated_at') THEN
        CREATE TRIGGER trigger_declarations_updated_at BEFORE UPDATE ON public.declarations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;
