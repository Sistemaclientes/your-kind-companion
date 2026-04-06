-- Adiciona colunas de assinatura à tabela de perfis
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_plan TEXT;

-- Cria um índice para o stripe_customer_id para buscas rápidas em webhooks
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);

-- Comentários nas colunas para documentação
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'ID do cliente no Stripe para faturamento';
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'ID da assinatura ativa no Stripe';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Status da assinatura do usuário (active, trailing, past_due, canceled, inactive)';
COMMENT ON COLUMN public.profiles.subscription_plan IS 'Nome ou slug do plano assinado pelo usuário';