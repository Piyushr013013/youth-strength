-- Trigger-only functions must not be callable from the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Restrict definer RPCs to signed-in users only
REVOKE ALL ON FUNCTION public.search_athletes(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.friends_leaderboard() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.friend_profiles(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_athletes(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.friends_leaderboard() TO authenticated;
GRANT EXECUTE ON FUNCTION public.friend_profiles(uuid[]) TO authenticated;

-- friend_profiles previously let any signed-in user read any profile by id.
-- Limit it to accepted friends (or self).
CREATE OR REPLACE FUNCTION public.friend_profiles(ids uuid[])
RETURNS TABLE(id uuid, display_name text, sport text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT p.id, p.display_name, p.sport
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.id = ANY(ids)
    AND (
      p.id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.friendships f
        WHERE f.status = 'accepted'
          AND ((f.requester_id = auth.uid() AND f.addressee_id = p.id)
            OR (f.addressee_id = auth.uid() AND f.requester_id = p.id))
      )
    );
$function$;

REVOKE ALL ON FUNCTION public.friend_profiles(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.friend_profiles(uuid[]) TO authenticated;