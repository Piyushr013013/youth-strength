DROP FUNCTION IF EXISTS public.friends_leaderboard();
CREATE FUNCTION public.friends_leaderboard()
RETURNS TABLE (
  id uuid,
  display_name text,
  sport text,
  school text,
  club_team text,
  grad_year integer,
  workout_count bigint,
  total_volume numeric,
  last_workout timestamptz,
  weekly_sessions bigint,
  streak_days integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (SELECT auth.uid() AS uid),
  circle AS (
    SELECT (SELECT uid FROM me) AS id
    UNION
    SELECT CASE WHEN f.requester_id = (SELECT uid FROM me) THEN f.addressee_id ELSE f.requester_id END
    FROM public.friendships f
    WHERE f.status = 'accepted'
      AND (SELECT uid FROM me) IN (f.requester_id, f.addressee_id)
  ),
  days AS (
    SELECT w.user_id, (w.started_at AT TIME ZONE 'UTC')::date AS d
    FROM public.workouts w
    WHERE w.user_id IN (SELECT id FROM circle)
    GROUP BY w.user_id, (w.started_at AT TIME ZONE 'UTC')::date
  ),
  ranked AS (
    SELECT user_id, d,
           (CURRENT_DATE - d) - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY d DESC))::integer AS grp
    FROM days
  ),
  streaks AS (
    SELECT r.user_id, COUNT(*)::integer AS streak_days
    FROM ranked r
    WHERE r.grp = (
      SELECT r2.grp FROM ranked r2
      WHERE r2.user_id = r.user_id
      ORDER BY r2.d DESC LIMIT 1
    )
    AND (SELECT MAX(d) FROM days dd WHERE dd.user_id = r.user_id) >= CURRENT_DATE - 1
    GROUP BY r.user_id
  )
  SELECT
    p.id,
    p.display_name,
    p.sport,
    p.school,
    p.club_team,
    p.grad_year,
    COUNT(w.id) AS workout_count,
    COALESCE(SUM(w.total_volume), 0) AS total_volume,
    MAX(w.started_at) AS last_workout,
    COUNT(w.id) FILTER (WHERE w.started_at > now() - interval '7 days') AS weekly_sessions,
    COALESCE((SELECT s.streak_days FROM streaks s WHERE s.user_id = p.id), 0) AS streak_days
  FROM public.profiles p
  LEFT JOIN public.workouts w
    ON w.user_id = p.id AND w.started_at > now() - interval '30 days'
  WHERE (SELECT uid FROM me) IS NOT NULL
    AND p.id IN (SELECT id FROM circle)
  GROUP BY p.id, p.display_name, p.sport, p.school, p.club_team, p.grad_year
  ORDER BY total_volume DESC;
$$;

REVOKE ALL ON FUNCTION public.friends_leaderboard() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.friends_leaderboard() FROM anon;
GRANT EXECUTE ON FUNCTION public.friends_leaderboard() TO authenticated;

DROP FUNCTION IF EXISTS public.search_athletes(text);
CREATE FUNCTION public.search_athletes(q text)
RETURNS TABLE (id uuid, display_name text, sport text, school text, club_team text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.display_name, p.sport, p.school, p.club_team
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND length(coalesce(trim(q), '')) >= 2
    AND p.id <> auth.uid()
    AND (
      p.display_name ILIKE '%' || trim(q) || '%'
      OR p.school ILIKE '%' || trim(q) || '%'
      OR p.club_team ILIKE '%' || trim(q) || '%'
      OR p.sport ILIKE '%' || trim(q) || '%'
    )
  ORDER BY p.display_name
  LIMIT 20;
$$;

REVOKE ALL ON FUNCTION public.search_athletes(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_athletes(text) TO authenticated;