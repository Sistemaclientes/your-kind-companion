
-- Tabela de tentativas de prova
CREATE TABLE public.exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exam_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'in_progress',
  violations integer NOT NULL DEFAULT 0,
  device_info jsonb DEFAULT '{}',
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_exam_attempts_user ON public.exam_attempts(user_id);
CREATE INDEX idx_exam_attempts_exam ON public.exam_attempts(exam_id);
CREATE UNIQUE INDEX idx_exam_attempts_active ON public.exam_attempts(user_id, exam_id) WHERE status = 'in_progress';

-- RLS for exam_attempts
CREATE POLICY "Students can view own attempts" ON public.exam_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can insert own attempts" ON public.exam_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students can update own attempts" ON public.exam_attempts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all attempts" ON public.exam_attempts FOR ALL USING (check_is_admin());

-- Tabela de log de violações
CREATE TABLE public.violations_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  type text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

ALTER TABLE public.violations_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_violations_attempt ON public.violations_log(attempt_id);

-- RLS for violations_log
CREATE POLICY "Students can insert violations for own attempts" ON public.violations_log FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.exam_attempts WHERE id = attempt_id AND user_id = auth.uid()));
CREATE POLICY "Students can view own violations" ON public.violations_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.exam_attempts WHERE id = attempt_id AND user_id = auth.uid()));
CREATE POLICY "Admins manage all violations" ON public.violations_log FOR ALL USING (check_is_admin());

-- Tabela de logs de proctoring
CREATE TABLE public.proctoring_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  image_url text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  ai_flag text DEFAULT 'pending',
  ai_score numeric DEFAULT 0,
  ai_details jsonb DEFAULT '{}'
);

ALTER TABLE public.proctoring_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_proctoring_attempt ON public.proctoring_logs(attempt_id);

-- RLS for proctoring_logs
CREATE POLICY "Students can insert proctoring for own attempts" ON public.proctoring_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.exam_attempts WHERE id = attempt_id AND user_id = auth.uid()));
CREATE POLICY "Students can view own proctoring" ON public.proctoring_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.exam_attempts WHERE id = attempt_id AND user_id = auth.uid()));
CREATE POLICY "Admins manage all proctoring" ON public.proctoring_logs FOR ALL USING (check_is_admin());

-- Bucket de storage para proctoring
INSERT INTO storage.buckets (id, name, public) VALUES ('proctoring', 'proctoring', false);

-- Storage policies
CREATE POLICY "Students can upload proctoring images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'proctoring' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Students can view own proctoring images" ON storage.objects FOR SELECT
  USING (bucket_id = 'proctoring' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can view all proctoring images" ON storage.objects FOR SELECT
  USING (bucket_id = 'proctoring' AND check_is_admin());

-- Trigger updated_at
CREATE TRIGGER update_exam_attempts_updated_at BEFORE UPDATE ON public.exam_attempts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
