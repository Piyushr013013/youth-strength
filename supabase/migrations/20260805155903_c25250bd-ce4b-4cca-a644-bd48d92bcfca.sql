DROP POLICY IF EXISTS "Authenticated athletes can read hypes" ON public.workout_hypes;

CREATE POLICY "Read hypes on own or friends workouts"
ON public.workout_hypes FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workouts w
    WHERE w.id = workout_hypes.workout_id
      AND (
        w.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.friendships f
          WHERE f.status = 'accepted'
            AND ((f.requester_id = auth.uid() AND f.addressee_id = w.user_id)
              OR (f.addressee_id = auth.uid() AND f.requester_id = w.user_id))
        )
      )
  )
);