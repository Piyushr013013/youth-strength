CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT friendships_not_self CHECK (requester_id <> addressee_id),
  CONSTRAINT friendships_unique_pair UNIQUE (requester_id, addressee_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships"
  ON public.friendships FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can send friend requests"
  ON public.friendships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Addressee can accept a friend request"
  ON public.friendships FOR UPDATE TO authenticated
  USING (auth.uid() = addressee_id)
  WITH CHECK (auth.uid() = addressee_id);

CREATE POLICY "Either side can remove a friendship"
  ON public.friendships FOR DELETE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $fn$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$fn$;

CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX friendships_addressee_idx ON public.friendships (addressee_id, status);
CREATE INDEX friendships_requester_idx ON public.friendships (requester_id, status);

CREATE OR REPLACE FUNCTION public.search_athletes(q text)
RETURNS TABLE (id uuid, display_name text, sport text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.display_name, p.sport
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND length(coalesce(trim(q), '')) >= 2
    AND p.id <> auth.uid()
    AND p.display_name ILIKE '%' || trim(q) || '%'
  ORDER BY p.display_name
  LIMIT 20;
$$;

REVOKE ALL ON FUNCTION public.search_athletes(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_athletes(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.friends_leaderboard()
RETURNS TABLE (
  id uuid,
  display_name text,
  sport text,
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
  friend_ids AS (
    SELECT CASE WHEN f.requester_id = (SELECT uid FROM me) THEN f.addressee_id ELSE f.requester_id END AS fid
    FROM public.friendships f
    WHERE f.status = 'accepted'
      AND (SELECT uid FROM me) IN (f.requester_id, f.addressee_id)
    UNION
    SELECT (SELECT uid FROM me)
  )
  SELECT p.id,
         p.display_name,
         p.sport,
         count(w.id) AS workout_count,
         coalesce(sum(w.total_volume), 0)::numeric AS total_volume,
         max(w.started_at) AS last_workout
  FROM friend_ids fi
  JOIN public.profiles p ON p.id = fi.fid
  LEFT JOIN public.workouts w
    ON w.user_id = p.id AND w.started_at > now() - interval '30 days'
  WHERE (SELECT uid FROM me) IS NOT NULL
  GROUP BY p.id, p.display_name, p.sport
  ORDER BY total_volume DESC;
$$;

REVOKE ALL ON FUNCTION public.friends_leaderboard() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.friends_leaderboard() TO authenticated;

CREATE OR REPLACE FUNCTION public.friend_profiles(ids uuid[])
RETURNS TABLE (id uuid, display_name text, sport text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.display_name, p.sport
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL AND p.id = ANY(ids);
$$;

REVOKE ALL ON FUNCTION public.friend_profiles(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.friend_profiles(uuid[]) TO authenticated;