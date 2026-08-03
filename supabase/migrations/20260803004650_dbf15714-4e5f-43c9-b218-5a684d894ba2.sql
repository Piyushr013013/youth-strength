ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS school TEXT,
  ADD COLUMN IF NOT EXISTS club_team TEXT,
  ADD COLUMN IF NOT EXISTS grad_year INTEGER;

CREATE TABLE IF NOT EXISTS public.workout_hypes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workout_id, user_id, emoji)
);

GRANT SELECT, INSERT, DELETE ON public.workout_hypes TO authenticated;
GRANT ALL ON public.workout_hypes TO service_role;

ALTER TABLE public.workout_hypes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated athletes can read hypes" ON public.workout_hypes;
CREATE POLICY "Authenticated athletes can read hypes"
  ON public.workout_hypes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Athletes add their own hypes" ON public.workout_hypes;
CREATE POLICY "Athletes add their own hypes"
  ON public.workout_hypes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Athletes remove their own hypes" ON public.workout_hypes;
CREATE POLICY "Athletes remove their own hypes"
  ON public.workout_hypes FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP FUNCTION IF EXISTS public.friend_activity_feed(integer);
CREATE FUNCTION public.friend_activity_feed(limit_count integer DEFAULT 40)
RETURNS TABLE (
  workout_id uuid,
  athlete_id uuid,
  display_name text,
  sport text,
  school text,
  name text,
  started_at timestamptz,
  duration_sec integer,
  total_sets integer,
  total_volume numeric,
  hypes jsonb
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
  )
  SELECT
    w.id,
    w.user_id,
    p.display_name,
    p.sport,
    p.school,
    w.name,
    w.started_at,
    w.duration_sec,
    w.total_sets,
    w.total_volume,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('emoji', h.emoji, 'user_id', h.user_id))
       FROM public.workout_hypes h WHERE h.workout_id = w.id),
      '[]'::jsonb
    )
  FROM public.workouts w
  JOIN public.profiles p ON p.id = w.user_id
  WHERE (SELECT uid FROM me) IS NOT NULL
    AND w.user_id IN (SELECT id FROM circle)
  ORDER BY w.started_at DESC
  LIMIT LEAST(GREATEST(limit_count, 1), 100);
$$;

REVOKE ALL ON FUNCTION public.friend_activity_feed(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.friend_activity_feed(integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.friend_activity_feed(integer) TO authenticated;

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
  last_workout timestamptz
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
    MAX(w.started_at) AS last_workout
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