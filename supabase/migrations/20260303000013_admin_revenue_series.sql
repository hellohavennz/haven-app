-- Add revenue_by_day series to admin_overview (new paid subscribers per day, last 180 days)

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
    ),
    'revenue_by_day',  (
      SELECT COALESCE(json_agg(json_build_object('date', date::text, 'revenue', revenue) ORDER BY date), '[]')
      FROM (
        SELECT
          created_at::date AS date,
          ROUND(SUM(
            CASE
              WHEN subscription_tier = 'plus'    THEN 4.99
              WHEN subscription_tier = 'premium' THEN ROUND(24.99 / 6.0, 2)
              ELSE 0
            END
          )::numeric, 2) AS revenue
        FROM public.profiles
        WHERE created_at >= current_date - 179
          AND subscription_tier IN ('plus', 'premium')
        GROUP BY created_at::date
      ) t
    )
  );
END;
$$;
