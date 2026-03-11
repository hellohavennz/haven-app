-- Add access_expires_at column for one-off access model
-- null = old recurring subscriber (access controlled by Stripe subscription status)
-- timestamp = new model user (access expires at this date)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMPTZ;
