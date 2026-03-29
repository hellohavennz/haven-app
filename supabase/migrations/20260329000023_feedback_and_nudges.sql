-- ================================================================
-- Haven App — Feedback + Upgrade Nudge Tracking
-- Migration: 20260329000023
-- ================================================================

-- ----------------------------------------------------------------
-- FEEDBACK
-- One row per submission. No unique constraint — a user on a new
-- device can submit again, which is fine.
-- ----------------------------------------------------------------
CREATE TABLE public.feedback (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE INDEX feedback_user_id_idx  ON public.feedback (user_id);
CREATE INDEX feedback_created_idx  ON public.feedback (created_at DESC);

-- Users can insert their own feedback
CREATE POLICY "users_insert_own_feedback" ON public.feedback
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ----------------------------------------------------------------
-- NUDGE FLAGS on profiles
-- ----------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS upgrade_nudge_7d_sent  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS upgrade_nudge_14d_sent BOOLEAN NOT NULL DEFAULT false;

-- ----------------------------------------------------------------
-- ADMIN FEEDBACK RPC
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_get_feedback()
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
    'total',          (SELECT count(*) FROM public.feedback),
    'avg_rating',     (SELECT round(avg(rating)::numeric, 1) FROM public.feedback),
    'by_stars',       (
      SELECT jsonb_object_agg(star, cnt)
      FROM (
        SELECT generate_series(1,5) AS star,
               count(f.id) AS cnt
        FROM generate_series(1,5) g
        LEFT JOIN public.feedback f ON f.rating = g
        GROUP BY star
        ORDER BY star
      ) t
    ),
    'entries',        (
      SELECT jsonb_agg(r ORDER BY r.created_at DESC)
      FROM (
        SELECT
          fb.id,
          fb.rating,
          fb.comment,
          fb.created_at,
          u.email,
          p.subscription_tier
        FROM public.feedback fb
        JOIN auth.users u ON u.id = fb.user_id
        LEFT JOIN public.profiles p ON p.id = fb.user_id
        LIMIT 200
      ) r
    )
  );
END;
$$;
