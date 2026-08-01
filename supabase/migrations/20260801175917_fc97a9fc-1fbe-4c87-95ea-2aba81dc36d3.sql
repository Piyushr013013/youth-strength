-- PERSONAL RECORDS -------------------------------------------------
CREATE TABLE public.personal_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  exercise_id text NOT NULL,
  exercise_name text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('weight','e1rm','volume','reps','time')),
  value numeric NOT NULL,
  weight numeric,
  reps integer,
  achieved_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX personal_records_user_ex_idx ON public.personal_records (user_id, exercise_id, kind);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_records TO authenticated;
GRANT ALL ON public.personal_records TO service_role;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prs" ON public.personal_records FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- BLOCKING ----------------------------------------------------------
CREATE TABLE public.blocked_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id)
);
GRANT SELECT, INSERT, DELETE ON public.blocked_users TO authenticated;
GRANT ALL ON public.blocked_users TO service_role;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own blocks" ON public.blocked_users FOR ALL TO authenticated
  USING (blocker_id = auth.uid()) WITH CHECK (blocker_id = auth.uid());

-- CHATS (DM + GROUP) ------------------------------------------------
CREATE TABLE public.chats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  is_group boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.chat_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id uuid NOT NULL REFERENCES public.chats ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chat_id, user_id)
);
CREATE TABLE public.chat_texts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id uuid NOT NULL REFERENCES public.chats ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chat_texts_chat_idx ON public.chat_texts (chat_id, created_at);
CREATE INDEX chat_members_user_idx ON public.chat_members (user_id);

CREATE OR REPLACE FUNCTION public.is_chat_member(_chat_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.chat_members WHERE chat_id = _chat_id AND user_id = _user_id)
$$;
REVOKE ALL ON FUNCTION public.is_chat_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_chat_member(uuid, uuid) TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chats TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.chat_members TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.chat_texts TO authenticated;
GRANT ALL ON public.chats, public.chat_members, public.chat_texts TO service_role;

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_texts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read chats" ON public.chats FOR SELECT TO authenticated
  USING (public.is_chat_member(id, auth.uid()));
CREATE POLICY "create chats" ON public.chats FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "creator updates chat" ON public.chats FOR UPDATE TO authenticated
  USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "creator deletes chat" ON public.chats FOR DELETE TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "read members of my chats" ON public.chat_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_chat_member(chat_id, auth.uid()));
CREATE POLICY "add members to my chats" ON public.chat_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.chats c WHERE c.id = chat_id AND c.created_by = auth.uid())
    OR public.is_chat_member(chat_id, auth.uid())
  );
CREATE POLICY "leave chat" ON public.chat_members FOR DELETE TO authenticated
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.chats c WHERE c.id = chat_id AND c.created_by = auth.uid()));

CREATE POLICY "members read texts" ON public.chat_texts FOR SELECT TO authenticated
  USING (public.is_chat_member(chat_id, auth.uid()));
CREATE POLICY "members send texts" ON public.chat_texts FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.is_chat_member(chat_id, auth.uid()));
CREATE POLICY "delete own texts" ON public.chat_texts FOR DELETE TO authenticated
  USING (sender_id = auth.uid());

-- helper: get or create a direct chat with another athlete (must be accepted friends)
CREATE OR REPLACE FUNCTION public.get_or_create_dm(_other uuid)
RETURNS uuid LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  me uuid := auth.uid();
  existing uuid;
BEGIN
  IF me IS NULL OR _other IS NULL OR me = _other THEN
    RAISE EXCEPTION 'invalid participants';
  END IF;
  IF EXISTS (SELECT 1 FROM public.blocked_users b
             WHERE (b.blocker_id = me AND b.blocked_id = _other)
                OR (b.blocker_id = _other AND b.blocked_id = me)) THEN
    RAISE EXCEPTION 'blocked';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.friendships f
                 WHERE f.status = 'accepted'
                   AND ((f.requester_id = me AND f.addressee_id = _other)
                     OR (f.requester_id = _other AND f.addressee_id = me))) THEN
    RAISE EXCEPTION 'not friends';
  END IF;

  SELECT c.id INTO existing
  FROM public.chats c
  JOIN public.chat_members m1 ON m1.chat_id = c.id AND m1.user_id = me
  JOIN public.chat_members m2 ON m2.chat_id = c.id AND m2.user_id = _other
  WHERE c.is_group = false
  LIMIT 1;
  IF existing IS NOT NULL THEN RETURN existing; END IF;

  INSERT INTO public.chats (is_group, created_by) VALUES (false, me) RETURNING id INTO existing;
  INSERT INTO public.chat_members (chat_id, user_id) VALUES (existing, me), (existing, _other);
  RETURN existing;
END;
$$;
REVOKE ALL ON FUNCTION public.get_or_create_dm(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_dm(uuid) TO authenticated;

-- helper: names for chat participants (only for chats you belong to)
CREATE OR REPLACE FUNCTION public.chat_participants(_chat_id uuid)
RETURNS TABLE (id uuid, display_name text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.display_name
  FROM public.chat_members m
  JOIN public.profiles p ON p.id = m.user_id
  WHERE m.chat_id = _chat_id
    AND public.is_chat_member(_chat_id, auth.uid())
$$;
REVOKE ALL ON FUNCTION public.chat_participants(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.chat_participants(uuid) TO authenticated;