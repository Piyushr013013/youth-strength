import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Plus, Timer, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui-kit";
import { PRCelebration, type PRPayload } from "@/components/PRCelebration";
import { makeSet, useActiveWorkout } from "@/lib/active-workout";
import { formatDuration, formatVolume, workoutSetCount, workoutVolume } from "@/lib/fitness";
import { fetchWorkouts, insertWorkout } from "@/lib/api";
import { formatLast, lastPerformances } from "@/lib/history";
import { detectSetPRs, detectVolumePRs, exerciseBests, savePR } from "@/lib/prs";
import type { WorkoutSet } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/log")({
  head: () => ({
    meta: [
      { title: "Live Workout Logger — ATHLETE OS" },
      { name: "description", content: "Log sets, reps and rest in real time with a live clock." },
      { property: "og:title", content: "Live Workout Logger — ATHLETE OS" },
      { property: "og:description", content: "Log sets, reps and rest in real time." },
    ],
  }),
  component: LogPage,
});

function LogPage() {
  const { user } = Route.useRouteContext();
  const { workout, elapsed, update, discard, startRest, restDefault } = useActiveWorkout();
  const qc = useQueryClient();
  const history = useQuery({ queryKey: ["workouts"], queryFn: fetchWorkouts });
  const [pr, setPr] = useState<PRPayload | null>(null);
  const prQueue = useRef<PRPayload[]>([]);

  const last = useMemo(() => lastPerformances(history.data ?? []), [history.data]);
  const bestsRef = useRef<ReturnType<typeof exerciseBests> | null>(null);
  const bests = useMemo(() => {
    bestsRef.current = exerciseBests(history.data ?? []);
    return bestsRef.current;
  }, [history.data]);

  function queuePR(payload: PRPayload) {
    if (pr) prQueue.current.push(payload);
    else setPr(payload);
  }

  function nextPR() {
    const upcoming = prQueue.current.shift();
    setPr(upcoming ?? null);
  }

  function checkSetPRs(exerciseId: string, name: string, metric: string, set: WorkoutSet) {
    const best = bests.get(exerciseId);
    if (!best) return;
    const hits = detectSetPRs(best, set, metric as never);
    for (const hit of hits) {
      queuePR({ id: `${set.id}-${hit.kind}`, exercise: name, detail: hit.label });
      void savePR(user.id, {
        exercise_id: exerciseId,
        exercise_name: name,
        kind: hit.kind,
        value: hit.value,
        weight: set.weight,
        reps: set.reps,
      });
    }
  }


  const finish = useMutation({
    mutationFn: async () => {
      if (!workout) return;
      const finishedAt = new Date();
      await insertWorkout(user.id, {
        name: workout.name,
        started_at: new Date(workout.startedAt).toISOString(),
        finished_at: finishedAt.toISOString(),
        duration_sec: Math.floor((finishedAt.getTime() - workout.startedAt) / 1000),
        total_volume: workoutVolume(workout.exercises),
        total_sets: workoutSetCount(workout.exercises),
        notes: null,
        exercises: workout.exercises,
      });
      for (const hit of detectVolumePRs(bests, workout.exercises)) {
        await savePR(user.id, {
          exercise_id: hit.exerciseId,
          exercise_name: hit.name,
          kind: "volume",
          value: hit.volume,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workouts"] });
      discard();
      toast.success("Workout saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!workout) {
    return (
      <div className="space-y-5">
        <h1 className="font-display text-3xl font-bold">Live logger</h1>
        <GlassCard className="p-5">
          <p className="text-sm text-muted-foreground">No session running.</p>
          <Link
            to="/library"
            className="mt-4 block w-full rounded-xl bg-primary py-3 text-center text-sm font-bold uppercase tracking-wider text-primary-foreground"
          >
            Pick exercises
          </Link>
          <Link
            to="/routines"
            className="mt-2 block w-full rounded-xl border border-border py-3 text-center text-sm font-semibold"
          >
            Start from a program
          </Link>
        </GlassCard>
      </div>
    );
  }

  const volume = workoutVolume(workout.exercises);

  return (
    <div className="space-y-4 pb-28">
      <PRCelebration pr={pr} onDone={nextPR} />
      <GlassCard className="p-5" glow="lime">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {workout.name}
        </p>
        <p className="font-display mt-1 text-4xl font-bold tabular-nums text-lime">
          {formatDuration(elapsed)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {workoutSetCount(workout.exercises)} sets · {formatVolume(volume)} volume
        </p>
      </GlassCard>

      {workout.exercises.map((ex) => (
        <GlassCard key={ex.id} className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{ex.name}</p>
              <p className="text-[11px] text-muted-foreground">
                Last: {formatLast(last.get(ex.exerciseId))}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                update((w) => ({ ...w, exercises: w.exercises.filter((e) => e.id !== ex.id) }))
              }
              className="shrink-0 text-muted-foreground"
              aria-label={`Remove ${ex.name}`}
            >
              <Trash2 size={15} />
            </button>
          </div>


          <div className="mt-3 space-y-2">
            {ex.sets.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <span className="w-5 text-xs text-muted-foreground">{i + 1}</span>
                {ex.metric === "time" || ex.metric === "distance" ? (
                  <input
                    inputMode="numeric"
                    value={s.seconds ?? ""}
                    placeholder={ex.metric === "time" ? "sec" : "dist"}
                    onChange={(ev) =>
                      update((w) => ({
                        ...w,
                        exercises: w.exercises.map((e) =>
                          e.id !== ex.id
                            ? e
                            : {
                                ...e,
                                sets: e.sets.map((t) =>
                                  t.id === s.id
                                    ? { ...t, seconds: ev.target.value ? Number(ev.target.value) : null }
                                    : t,
                                ),
                              },
                        ),
                      }))
                    }
                    className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2/60 px-2 py-2 text-sm outline-none focus:border-primary/60"
                  />
                ) : (
                  <>
                    {ex.metric === "weight_reps" ? (
                      <input
                        inputMode="decimal"
                        value={s.weight ?? ""}
                        placeholder="kg/lb"
                        onChange={(ev) =>
                          update((w) => ({
                            ...w,
                            exercises: w.exercises.map((e) =>
                              e.id !== ex.id
                                ? e
                                : {
                                    ...e,
                                    sets: e.sets.map((t) =>
                                      t.id === s.id
                                        ? {
                                            ...t,
                                            weight: ev.target.value ? Number(ev.target.value) : null,
                                          }
                                        : t,
                                    ),
                                  },
                            ),
                          }))
                        }
                        className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2/60 px-2 py-2 text-sm outline-none focus:border-primary/60"
                      />
                    ) : null}
                    <input
                      inputMode="numeric"
                      value={s.reps ?? ""}
                      placeholder="reps"
                      onChange={(ev) =>
                        update((w) => ({
                          ...w,
                          exercises: w.exercises.map((e) =>
                            e.id !== ex.id
                              ? e
                              : {
                                  ...e,
                                  sets: e.sets.map((t) =>
                                    t.id === s.id
                                      ? { ...t, reps: ev.target.value ? Number(ev.target.value) : null }
                                      : t,
                                  ),
                                },
                          ),
                        }))
                      }
                      className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2/60 px-2 py-2 text-sm outline-none focus:border-primary/60"
                    />
                  </>
                )}
                <button
                  type="button"
                  aria-label="Complete set"
                  onClick={() => {
                    update((w) => ({
                      ...w,
                      exercises: w.exercises.map((e) =>
                        e.id !== ex.id
                          ? e
                          : {
                              ...e,
                              sets: e.sets.map((t) =>
                                t.id === s.id ? { ...t, done: !t.done } : t,
                              ),
                            },
                      ),
                    }));
                    if (!s.done) {
                      startRest(restDefault);
                      checkSetPRs(ex.exerciseId, ex.name, ex.metric, { ...s, done: true });
                    }
                  }}
                  className={
                    s.done
                      ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                      : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground"
                  }
                >
                  <Check size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() =>
                update((w) => ({
                  ...w,
                  exercises: w.exercises.map((e) =>
                    e.id !== ex.id ? e : { ...e, sets: [...e.sets, makeSet()] },
                  ),
                }))
              }
              className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-2 text-xs font-semibold"
            >
              <Plus size={14} /> Add set
            </button>
            <button
              type="button"
              onClick={() => startRest(restDefault)}
              className="flex items-center justify-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-cyan"
            >
              <Timer size={14} /> Rest
            </button>
          </div>
        </GlassCard>
      ))}

      <Link
        to="/library"
        className="block w-full rounded-xl border border-border py-3 text-center text-sm font-semibold"
      >
        Add exercises
      </Link>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            if (confirm("Discard this workout?")) discard();
          }}
          className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-flare"
        >
          Discard
        </button>
        <button
          type="button"
          disabled={finish.isPending}
          onClick={() => finish.mutate()}
          className="flex-[2] rounded-xl bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-60"
        >
          {finish.isPending ? "Saving…" : "Finish workout"}
        </button>
      </div>
    </div>
  );
}
