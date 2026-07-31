CREATE TABLE public.coach_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New chat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_threads TO authenticated;
GRANT ALL ON public.coach_threads TO service_role;
ALTER TABLE public.coach_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own coach threads" ON public.coach_threads FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.coach_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.coach_threads ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role TEXT NOT NULL,
  message JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX coach_messages_thread_idx ON public.coach_messages (thread_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_messages TO authenticated;
GRANT ALL ON public.coach_messages TO service_role;
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own coach messages" ON public.coach_messages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.scheduled_workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  scheduled_for DATE NOT NULL,
  name TEXT NOT NULL,
  program_id TEXT,
  day_label TEXT,
  focus TEXT,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX scheduled_workouts_user_date_idx ON public.scheduled_workouts (user_id, scheduled_for);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_workouts TO authenticated;
GRANT ALL ON public.scheduled_workouts TO service_role;
ALTER TABLE public.scheduled_workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own scheduled workouts" ON public.scheduled_workouts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.form_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  exercise_id TEXT,
  exercise_name TEXT NOT NULL,
  video_path TEXT,
  score INT,
  verdict TEXT,
  cues JSONB NOT NULL DEFAULT '[]'::jsonb,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_checks TO authenticated;
GRANT ALL ON public.form_checks TO service_role;
ALTER TABLE public.form_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own form checks" ON public.form_checks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own form videos read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'form-videos' AND owner = auth.uid());
CREATE POLICY "own form videos insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'form-videos' AND owner = auth.uid());
CREATE POLICY "own form videos delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'form-videos' AND owner = auth.uid());