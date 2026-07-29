import { createFileRoute } from "@tanstack/react-router";
import { ExercisePicker } from "@/components/ExercisePicker";
import { useActiveWorkout } from "@/lib/active-workout";
import { EXERCISES } from "@/lib/exercises";
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

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      <div>
        <h1 className="font-display text-3xl font-bold">Library</h1>
        <p className="text-xs text-muted-foreground">
          {EXERCISES.length} exercises · filter by category, muscle or equipment
        </p>
      </div>
      <ExercisePicker
        confirmLabel={workout ? "Add to session" : "Start session with"}
        onConfirm={(ids) => {
          if (workout) {
            addExercises(ids);
            toast.success(`Added ${ids.length} exercise${ids.length > 1 ? "s" : ""}`);
          } else {
            start({ name: "Custom session", exercises: [] });
            addExercises(ids);
            toast.success("Session started");
          }
        }}
      />
    </div>
  );
}
