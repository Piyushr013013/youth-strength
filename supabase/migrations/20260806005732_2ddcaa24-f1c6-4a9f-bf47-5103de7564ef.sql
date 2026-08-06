CREATE TABLE public.athlete_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.athlete_reports TO authenticated;
GRANT ALL ON public.athlete_reports TO service_role;

ALTER TABLE public.athlete_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "file own reports" ON public.athlete_reports
  FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "read own reports" ON public.athlete_reports
  FOR SELECT TO authenticated USING (reporter_id = auth.uid());

CREATE OR REPLACE FUNCTION public.athlete_public_profile(_id uuid)
RETURNS TABLE(
  id uuid, display_name text, sport text, school text, club_team text,
  grad_year integer, workout_count bigint, total_volume numeric,
  last_workout timestamptz, weekly_sessions bigint, streak_days integer,
  is_friend boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH allowed AS (
    SELECT auth.uid() IS NOT NULL AND (
      _id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.friendships f
        WHERE f.status = 'accepted'
          AND ((f.requester_id = auth.uid() AND f.addressee_id = _id)
            OR (f.addressee_id = auth.uid() AND f.requester_id = _id))
      )
    ) AS ok
  ),
  days AS (
    SELECT (w.started_at AT TIME ZONE 'UTC')::date AS d
    FROM public.workouts w
    WHERE w.user_id = _id
    GROUP BY 1
  ),
  ranked AS (
    SELECT d, (CURRENT_DATE - d) - (ROW_NUMBER() OVER (ORDER BY d DESC))::integer AS grp
    FROM days
  ),
  streak AS (
    SELECT COUNT(*)::integer AS streak_days
    FROM ranked r
    WHERE r.grp = (SELECT r2.grp FROM ranked r2 ORDER BY r2.d DESC LIMIT 1)
      AND (SELECT MAX(d) FROM days) >= CURRENT_DATE - 1
  )
  SELECT
    p.id, p.display_name, p.sport, p.school, p.club_team, p.grad_year,
    COUNT(w.id) AS workout_count,
    COALESCE(SUM(w.total_volume), 0) AS total_volume,
    MAX(w.started_at) AS last_workout,
    COUNT(w.id) FILTER (WHERE w.started_at > now() - interval '7 days') AS weekly_sessions,
    COALESCE((SELECT streak_days FROM streak), 0) AS streak_days,
    (_id <> auth.uid()) AS is_friend
  FROM public.profiles p
  LEFT JOIN public.workouts w ON w.user_id = p.id AND w.started_at > now() - interval '30 days'
  WHERE p.id = _id AND (SELECT ok FROM allowed)
  GROUP BY p.id, p.display_name, p.sport, p.school, p.club_team, p.grad_year;
$$;

REVOKE ALL ON FUNCTION public.athlete_public_profile(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.athlete_public_profile(uuid) TO authenticated;