-- Add Stripe customer and subscription IDs to profiles
-- Updated by the webhook using the service role key (bypasses RLS)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
