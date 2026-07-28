import { createFileRoute } from "@tanstack/react-router";
import { GlassCard } from "@/components/ui-kit";
import { useActiveWorkout } from "@/lib/active-workout";

export const Route = createFileRoute("/_authenticated/log")({
  validateSearch: (s: Record<string, unknown>) => ({
    routine: typeof s.routine === "string" ? s.routine : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Live Workout Logger — ATHLETE OS" },
      { name: "description", content: "Log sets, reps and rest in real time." },
      { property: "og:title", content: "Live Workout Logger — ATHLETE OS" },
      { property: "og:description", content: "Log sets, reps and rest in real time." },
    ],
  }),
  component: LogPage,
});

function LogPage() {
  const { workout, startWorkout } = useActiveWorkout();
  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-bold">Live logger</h1>
      {workout ? (
        <GlassCard className="p-5" glow="lime">
          <p className="text-sm font-semibold">{workout.name}</p>
          <p className="text-xs text-muted-foreground">
            {workout.exercises.length} exercises in progress
          </p>
        </GlassCard>
      ) : (
        <GlassCard className="p-5">
          <p className="text-sm text-muted-foreground">No session running.</p>
          <button
            onClick={() => startWorkout("Empty session")}
            className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground"
          >
            Start empty workout
          </button>
        </GlassCard>
      )}
    </div>
  );
}
