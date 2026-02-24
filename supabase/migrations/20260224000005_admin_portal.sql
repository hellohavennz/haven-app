-- ================================================================
-- Haven App — Admin Portal
-- Migration: 20260224000005
-- ================================================================


-- ----------------------------------------------------------------
-- LOGIN EVENTS
-- One row per user per day — enables DAU/WAU/MAU tracking.
-- ----------------------------------------------------------------
CREATE TABLE public.login_events (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date    DATE NOT NULL DEFAULT current_date,
  PRIMARY KEY (user_id, date)
);

ALTER TABLE public.login_events ENABLE ROW LEVEL SECURITY;

-- Authenticated users can record their own login event
CREATE POLICY "users can insert own login" ON public.login_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);


-- ----------------------------------------------------------------
-- ADMIN HELPER
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (auth.jwt() ->> 'email') = 'hello.haven.nz@gmail.com';
$$;


-- ----------------------------------------------------------------
-- ADMIN OVERVIEW
-- Returns headline numbers: users, tiers, signups, DAU/WAU/MAU,
-- daily login chart (last 30 days), exam stats, open reports.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_overview()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN json_build_object(
    'total_users',     (SELECT count(*) FROM public.profiles),
    'by_tier',         (
      SELECT json_object_agg(subscription_tier, cnt)
      FROM (
        SELECT subscription_tier, count(*) AS cnt
        FROM public.profiles
        GROUP BY subscription_tier
      ) t
    ),
    'new_7d',          (SELECT count(*) FROM public.profiles WHERE created_at >= now() - interval '7 days'),
    'new_30d',         (SELECT count(*) FROM public.profiles WHERE created_at >= now() - interval '30 days'),
    'dau',             (SELECT count(DISTINCT user_id) FROM public.login_events WHERE date = current_date),
    'wau',             (SELECT count(DISTINCT user_id) FROM public.login_events WHERE date >= current_date - 6),
    'mau',             (SELECT count(DISTINCT user_id) FROM public.login_events WHERE date >= current_date - 29),
    'daily_logins',    (
      SELECT COALESCE(json_agg(json_build_object('date', date, 'count', cnt) ORDER BY date), '[]')
      FROM (
        SELECT date, count(DISTINCT user_id) AS cnt
        FROM public.login_events
        WHERE date >= current_date - 29
        GROUP BY date
      ) t
    ),
    'open_reports',    (SELECT count(*) FROM public.content_reports WHERE status = 'open'),
    'exam_attempts',   (SELECT count(*) FROM public.exam_attempts),
    'exam_pass_rate',  (
      SELECT round(100.0 * count(*) FILTER (WHERE passed) / NULLIF(count(*), 0), 1)
      FROM public.exam_attempts
    ),
    'upcoming_7d',     (
      SELECT count(*) FROM public.profiles
      WHERE exam_date BETWEEN current_date AND current_date + 7
    ),
    'upcoming_30d',    (
      SELECT count(*) FROM public.profiles
      WHERE exam_date BETWEEN current_date AND current_date + 30
    )
  );
END;
$$;


-- ----------------------------------------------------------------
-- ADMIN GET REPORTS
-- Returns content_reports with the submitting user's email.
-- p_status: 'open' | 'reviewed' | 'resolved' | 'all'
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_get_reports(p_status text DEFAULT 'open')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN (
    SELECT COALESCE(json_agg(row_to_json(r) ORDER BY r.created_at DESC), '[]')
    FROM (
      SELECT
        cr.id,
        cr.lesson_id,
        cr.content_type,
        cr.content_ref,
        cr.message,
        cr.status,
        cr.created_at,
        au.email AS user_email
      FROM public.content_reports cr
      LEFT JOIN auth.users au ON au.id = cr.user_id
      WHERE p_status = 'all' OR cr.status = p_status
      ORDER BY cr.created_at DESC
      LIMIT 500
    ) r
  );
END;
$$;


-- ----------------------------------------------------------------
-- ADMIN UPDATE REPORT STATUS
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_update_report(p_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  UPDATE public.content_reports SET status = p_status WHERE id = p_id;
END;
$$;


-- ----------------------------------------------------------------
-- ADMIN GET USERS
-- Returns all users with tier, progress summary, exam summary.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_get_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN (
    SELECT COALESCE(json_agg(row_to_json(u) ORDER BY u.created_at DESC), '[]')
    FROM (
      SELECT
        p.id,
        p.display_name,
        p.subscription_tier,
        p.exam_date,
        p.created_at,
        au.email,
        au.last_sign_in_at,
        (SELECT count(*) FROM public.user_progress up WHERE up.user_id = p.id AND up.completed = true)  AS lessons_completed,
        (SELECT count(*) FROM public.exam_attempts ea WHERE ea.user_id = p.id)                           AS total_exams,
        (SELECT count(*) FROM public.exam_attempts ea WHERE ea.user_id = p.id AND ea.passed = true)      AS exams_passed,
        (SELECT round(avg(correct::numeric / total), 1) * 100 FROM public.exam_attempts ea WHERE ea.user_id = p.id) AS avg_exam_score
      FROM public.profiles p
      JOIN auth.users au ON au.id = p.id
      ORDER BY p.created_at DESC
    ) u
  );
END;
$$;


-- ----------------------------------------------------------------
-- ADMIN GET EXAM STATS
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_get_exam_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN json_build_object(
    'total_attempts',       (SELECT count(*) FROM public.exam_attempts),
    'pass_rate',            (
      SELECT round(100.0 * count(*) FILTER (WHERE passed) / NULLIF(count(*), 0), 1)
      FROM public.exam_attempts
    ),
    'avg_score_pct',        (
      SELECT round((100.0 * avg(correct::numeric / total))::numeric, 1)
      FROM public.exam_attempts
    ),
    'avg_duration_seconds', (
      SELECT round(avg(duration_seconds)::numeric)
      FROM public.exam_attempts
    ),
    'recent',               (
      SELECT COALESCE(json_agg(row_to_json(r) ORDER BY r.completed_at DESC), '[]')
      FROM (
        SELECT
          ea.id,
          ea.completed_at,
          ea.correct,
          ea.total,
          ea.passed,
          ea.duration_seconds,
          au.email AS user_email
        FROM public.exam_attempts ea
        JOIN auth.users au ON au.id = ea.user_id
        ORDER BY ea.completed_at DESC
        LIMIT 50
      ) r
    )
  );
END;
$$;
