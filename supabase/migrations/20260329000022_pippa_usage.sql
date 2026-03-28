-- ================================================================
-- Haven App — Pippa Usage Tracking
-- Migration: 20260329000022
-- ================================================================

-- ----------------------------------------------------------------
-- PIPPA USAGE
-- One row per Pippa API call — tracks token consumption per user.
-- Written server-side via service role key (bypasses RLS).
-- ----------------------------------------------------------------
CREATE TABLE public.pippa_usage (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  input_tokens  INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL
);

ALTER TABLE public.pippa_usage ENABLE ROW LEVEL SECURITY;

CREATE INDEX pippa_usage_user_id_idx  ON public.pippa_usage (user_id);
CREATE INDEX pippa_usage_created_idx  ON public.pippa_usage (created_at DESC);

-- ----------------------------------------------------------------
-- ADMIN STATS RPC
-- Returns aggregated Pippa usage for the admin overview panel.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_pippa_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN jsonb_build_object(
    'conversations_7d',    (SELECT count(*)                          FROM public.pippa_usage WHERE created_at >= now() - interval '7 days'),
    'conversations_30d',   (SELECT count(*)                          FROM public.pippa_usage WHERE created_at >= now() - interval '30 days'),
    'input_tokens_30d',    (SELECT coalesce(sum(input_tokens),  0)   FROM public.pippa_usage WHERE created_at >= now() - interval '30 days'),
    'output_tokens_30d',   (SELECT coalesce(sum(output_tokens), 0)   FROM public.pippa_usage WHERE created_at >= now() - interval '30 days'),
    'total_conversations', (SELECT count(*)                          FROM public.pippa_usage)
  );
END;
$$;
