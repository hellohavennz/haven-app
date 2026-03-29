-- ================================================================
-- Haven App — Engagement Features
-- Migration: 20260329000024
-- ================================================================

-- ----------------------------------------------------------------
-- RE-ENGAGEMENT TRACKING
-- ----------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS re_engagement_last_sent TIMESTAMPTZ;

-- ----------------------------------------------------------------
-- ALLOW USERS TO READ THEIR OWN LOGIN EVENTS (for streak calc)
-- ----------------------------------------------------------------
CREATE POLICY "login_events_select_own" ON public.login_events
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ----------------------------------------------------------------
-- CHURN RISK RPC
-- Paid users with an upcoming exam who haven't logged in for 14+ days.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_churn_risk()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN (
    SELECT coalesce(jsonb_agg(r ORDER BY r.exam_date ASC), '[]'::jsonb)
    FROM (
      SELECT
        p.id,
        u.email,
        p.subscription_tier,
        p.exam_date,
        MAX(le.date)                        AS last_login,
        (current_date - MAX(le.date))::int  AS days_inactive
      FROM public.profiles p
      JOIN auth.users u ON u.id = p.id
      LEFT JOIN public.login_events le ON le.user_id = p.id
      WHERE p.subscription_tier IN ('plus', 'premium')
        AND p.exam_date IS NOT NULL
        AND p.exam_date BETWEEN current_date AND current_date + 60
      GROUP BY p.id, u.email, p.subscription_tier, p.exam_date
      HAVING MAX(le.date) < current_date - 14 OR MAX(le.date) IS NULL
    ) r
  );
END;
$$;

-- ----------------------------------------------------------------
-- ACTIVATION STATS RPC
-- % of free users who have read at least one lesson.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_activation_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_free_total    bigint;
  v_activated     bigint;
  v_rate          numeric;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT count(*) INTO v_free_total
  FROM public.profiles
  WHERE subscription_tier = 'free';

  SELECT count(DISTINCT up.user_id) INTO v_activated
  FROM public.user_progress up
  JOIN public.profiles p ON p.id = up.user_id
  WHERE p.subscription_tier = 'free'
    AND up.lesson_read = true;

  v_rate := CASE WHEN v_free_total > 0
    THEN round((v_activated::numeric / v_free_total) * 100)
    ELSE 0
  END;

  RETURN jsonb_build_object(
    'free_total',  v_free_total,
    'activated',   v_activated,
    'rate',        v_rate
  );
END;
$$;
