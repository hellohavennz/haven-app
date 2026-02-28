-- ── Update admin_overview to include daily new-account signups ───────────

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
    'daily_signups',   (
      SELECT COALESCE(json_agg(json_build_object('date', date, 'count', cnt) ORDER BY date), '[]')
      FROM (
        SELECT created_at::date AS date, count(*) AS cnt
        FROM public.profiles
        WHERE created_at >= current_date - 29
        GROUP BY created_at::date
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


-- ── Update admin_get_users to include banned_until ───────────────────────

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
        au.banned_until,
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
