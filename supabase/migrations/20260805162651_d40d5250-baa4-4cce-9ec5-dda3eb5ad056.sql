CREATE OR REPLACE FUNCTION public.is_chat_member(_chat_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_members
    WHERE chat_id = _chat_id AND user_id = _user_id
  ) AND (
    _user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.chat_members m
      WHERE m.chat_id = _chat_id AND m.user_id = auth.uid()
    )
  )
$function$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.is_chat_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.chat_participants(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.friend_activity_feed(integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.friend_profiles(uuid[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.friends_leaderboard() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_or_create_dm(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.search_athletes(text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_chat_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.chat_participants(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.friend_activity_feed(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.friend_profiles(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.friends_leaderboard() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_dm(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_athletes(text) TO authenticated;