import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Minus, Play, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { GlassCard, SectionTitle } from "@/components/ui-kit";
import { ExercisePicker } from "@/components/ExercisePicker";
import { deleteRoutine, fetchRoutines, saveRoutine } from "@/lib/api";
import { findExercise } from "@/lib/exercises";
import { useActiveWorkout } from "@/lib/active-workout";
import type { RoutineExercise } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/builder")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Routine Builder — ATHLETE OS" },
      {
        name: "description",
        content: "Build your own routine: name it, add exercises, set targets, reorder and save.",
      },
      { property: "og:title", content: "Routine Builder — ATHLETE OS" },
      { property: "og:description", content: "Build and edit your own custom routines." },
    ],
  }),
  component: BuilderPage,
});

function BuilderPage() {
  const { user } = Route.useRouteContext();
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { start, update } = useActiveWorkout();

  const routines = useQuery({ queryKey: ["routines"], queryFn: fetchRoutines });
  const editing = routines.data?.find((r) => r.id === id) ?? null;

  const [name, setName] = useState("My routine");
  const [items, setItems] = useState<RoutineExercise[]>([]);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (editing) {
      setName(editing.name);
      setItems(editing.exercises ?? []);
    }
  }, [id, editing]);

  const save = useMutation({
    mutationFn: () =>
      saveRoutine(user.id, {
        id,
        name: name.trim() || "My routine",
        description: null,
        source: "custom",
        program_id: null,
        exercises: items,
      }),
    onSuccess: (savedId) => {
      qc.invalidateQueries({ queryKey: ["routines"] });
      toast.success("Routine saved");
      navigate({ to: "/builder", search: { id: savedId } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: () => deleteRoutine(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["routines"] });
      toast.success("Routine deleted");
      reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function reset() {
    setName("My routine");
    setItems([]);
    navigate({ to: "/builder", search: {} });
  }

  function addExercises(ids: string[]) {
    setItems((prev) => [
      ...prev,
      ...ids.map((exerciseId) => ({
        exerciseId,
        name: findExercise(exerciseId)?.name ?? exerciseId,
        sets: 3,
        reps: "8-12",
        supersetGroup: null,
      })),
    ]);
    setPicking(false);
  }

  function patch(index: number, next: Partial<RoutineExercise>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...next } : it)));
  }

  function move(index: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const to = index + dir;
      if (to < 0 || to >= next.length) return prev;
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  }

  function startNow() {
    if (!items.length) return toast.error("Add exercises first");
    start({ name: name.trim() || "My routine", exercises: [] });
    update((w) => ({
      ...w,
      exercises: items.map((it) => {
        const meta = findExercise(it.exerciseId);
        return {
          id: `${it.exerciseId}-${Math.random().toString(36).slice(2, 8)}`,
          exerciseId: it.exerciseId,
          name: it.name,
          metric: meta?.metric ?? "weight_reps",
          supersetGroup: it.supersetGroup ?? null,
          sets: Array.from({ length: Math.max(1, it.sets) }, (_, i) => ({
            id: `${it.exerciseId}-s${i}-${Math.random().toString(36).slice(2, 6)}`,
            type: "normal" as const,
            weight: null,
            reps: null,
            seconds: null,
            rpe: null,
            done: false,
          })),
        };
      }),
    }));
    toast.success("Session started");
    navigate({ to: "/log" });
  }

  if (picking) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background px-4 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Add exercises</h2>
          <button
            onClick={() => setPicking(false)}
            aria-label="Close picker"
            className="rounded-xl border border-border p-2 text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <ExercisePicker confirmLabel="Add" onConfirm={addExercises} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-32">
      <div>
        <h1 className="font-display text-3xl font-bold">Routine builder</h1>
        <p className="text-xs text-muted-foreground">
          Name it, add whatever you want, tune sets and reps.
        </p>
      </div>

      <GlassCard className="space-y-3 p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Routine name"
          className="w-full rounded-xl border border-border bg-surface-2/70 px-3 py-3 text-base font-semibold outline-none focus:border-primary/60"
        />

        {items.map((it, i) => (
          <div key={`${it.exerciseId}-${i}`} className="rounded-xl border border-border/70 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 flex-1 truncate text-sm font-semibold">{it.name}</p>
              <div className="flex shrink-0 gap-1 text-muted-foreground">
                <button onClick={() => move(i, -1)} aria-label="Move up">
                  <ArrowUp size={15} />
                </button>
                <button onClick={() => move(i, 1)} aria-label="Move down">
                  <ArrowDown size={15} />
                </button>
                <button
                  onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                  aria-label={`Remove ${it.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => patch(i, { sets: Math.max(1, it.sets - 1) })}
                  aria-label="Fewer sets"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border"
                >
                  <Minus size={14} />
                </button>
                <span className="w-14 text-center text-xs tabular-nums">{it.sets} sets</span>
                <button
                  onClick={() => patch(i, { sets: it.sets + 1 })}
                  aria-label="More sets"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border"
                >
                  <Plus size={14} />
                </button>
              </div>
              <input
                value={it.reps}
                onChange={(e) => patch(i, { reps: e.target.value })}
                placeholder="reps / time"
                className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2/60 px-2 py-2 text-xs outline-none focus:border-primary/60"
              />
            </div>
          </div>
        ))}

        <button
          onClick={() => setPicking(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/50 py-3 text-sm font-bold uppercase tracking-wider text-lime"
        >
          <Plus size={16} /> Add exercise
        </button>
      </GlassCard>

      <div className="flex gap-2">
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="flex-[2] rounded-xl bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-60"
        >
          {save.isPending ? "Saving…" : "Save routine"}
        </button>
        <button
          onClick={startNow}
          className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-border py-3 text-sm font-semibold text-cyan"
        >
          <Play size={14} /> Start
        </button>
      </div>
      {id ? (
        <button
          onClick={() => remove.mutate()}
          className="w-full rounded-xl border border-border py-3 text-sm font-semibold text-flare"
        >
          Delete routine
        </button>
      ) : null}

      <section>
        <SectionTitle
          action={
            <button onClick={reset} className="text-xs font-semibold uppercase text-lime">
              New
            </button>
          }
        >
          Your routines
        </SectionTitle>
        <div className="space-y-2">
          {(routines.data ?? []).map((r) => (
            <button
              key={r.id}
              onClick={() => navigate({ to: "/builder", search: { id: r.id } })}
              className="block w-full text-left"
            >
              <GlassCard className="p-4">
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(r.exercises ?? []).length} exercises
                </p>
              </GlassCard>
            </button>
          ))}
          {routines.data && !routines.data.length ? (
            <p className="text-sm text-muted-foreground">No custom routines yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
