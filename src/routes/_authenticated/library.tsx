import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Dumbbell, X } from "lucide-react";
import { ExercisePicker } from "@/components/ExercisePicker";
import { useActiveWorkout } from "@/lib/active-workout";
import { CATEGORY_META, EXERCISES } from "@/lib/exercises";
import { GlassCard } from "@/components/ui-kit";
import type { ExerciseCategory } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({
    meta: [
      { title: "Exercise Library — ATHLETE OS" },
      {
        name: "description",
        content:
          "Search 300+ exercises across weights, calisthenics, cardio, sport prep and recovery.",
      },
      { property: "og:title", content: "Exercise Library — ATHLETE OS" },
      { property: "og:description", content: "300+ exercises for every sport and training goal." },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { workout, addExercises, start } = useActiveWorkout();
  const [open, setOpen] = useState(false);

  const confirm = (ids: string[]) => {
    if (workout) {
      addExercises(ids);
      toast.success(`Added ${ids.length} exercise${ids.length > 1 ? "s" : ""}`);
    } else {
      start({ name: "Custom session", exercises: [] });
      addExercises(ids);
      toast.success("Session started");
    }
    setOpen(false);
  };

  if (open) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background px-4 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Pick exercises</h2>
          <button
            onClick={() => setOpen(false)}
            className="rounded-xl border border-border p-2 text-muted-foreground"
            aria-label="Close exercise picker"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <ExercisePicker
            confirmLabel={workout ? "Add to session" : "Start session with"}
            onConfirm={confirm}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-32">
      <div>
        <h1 className="font-display text-3xl font-bold">Library</h1>
        <p className="text-xs text-muted-foreground">
          {EXERCISES.length} exercises · weights, bodyweight, cardio, sport prep & recovery
        </p>
      </div>

      <button
        onClick={() => setOpen(true)}
        className="glow-lime flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-5 text-base font-black uppercase tracking-[0.14em] text-primary-foreground"
      >
        <Dumbbell size={20} />
        Browse exercises
      </button>

      <div className="grid gap-2">
        {(Object.keys(CATEGORY_META) as ExerciseCategory[]).map((c) => (
          <GlassCard key={c} className="p-4">
            <p className="font-display text-sm font-bold">{CATEGORY_META[c].label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{CATEGORY_META[c].blurb}</p>
            <p className="mt-2 text-[11px] uppercase tracking-wider text-cyan">
              {EXERCISES.filter((e) => e.category === c).length} exercises
            </p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
