import { supabase } from "@/integrations/supabase/client";
import { epley1RM } from "./fitness";
import type { SavedWorkout, WorkoutExercise, WorkoutSet } from "./types";

export type PRKind = "weight" | "e1rm" | "volume" | "reps" | "time";

export interface PersonalRecord {
  id: string;
  exercise_id: string;
  exercise_name: string;
  kind: PRKind;
  value: number;
  weight: number | null;
  reps: number | null;
  achieved_at: string;
}

export interface ExerciseBest {
  weight: number;
  e1rm: number;
  reps: number;
  volume: number;
  seconds: number;
}

const empty = (): ExerciseBest => ({ weight: 0, e1rm: 0, reps: 0, volume: 0, seconds: 0 });

/** All-time bests per exercise from saved history. */
export function exerciseBests(workouts: SavedWorkout[]) {
  const map = new Map<string, ExerciseBest>();
  for (const w of workouts) {
    for (const ex of w.exercises ?? []) {
      const best = map.get(ex.exerciseId) ?? empty();
      let sessionVolume = 0;
      for (const s of ex.sets ?? []) {
        if (!s.done) continue;
        const weight = s.weight ?? 0;
        const reps = s.reps ?? 0;
        sessionVolume += weight * reps;
        best.weight = Math.max(best.weight, weight);
        best.reps = Math.max(best.reps, reps);
        best.seconds = Math.max(best.seconds, s.seconds ?? 0);
        best.e1rm = Math.max(best.e1rm, epley1RM(weight, reps));
      }
      best.volume = Math.max(best.volume, sessionVolume);
      map.set(ex.exerciseId, best);
    }
  }
  return map;
}

export interface DetectedPR {
  kind: PRKind;
  value: number;
  label: string;
}

/** Which records a freshly-completed set beats. Mutates `best` so one session can't double-count. */
export function detectSetPRs(
  best: ExerciseBest,
  set: WorkoutSet,
  metric: WorkoutExercise["metric"],
): DetectedPR[] {
  const out: DetectedPR[] = [];
  const weight = set.weight ?? 0;
  const reps = set.reps ?? 0;
  const seconds = set.seconds ?? 0;

  if (metric === "weight_reps" && weight > 0) {
    if (weight > best.weight) {
      out.push({ kind: "weight", value: weight, label: `Heaviest ever — ${weight} × ${reps || 1}` });
      best.weight = weight;
    }
    const e1rm = epley1RM(weight, reps);
    if (e1rm > best.e1rm + 0.4) {
      out.push({ kind: "e1rm", value: e1rm, label: `Estimated 1RM ${Math.round(e1rm)}` });
      best.e1rm = e1rm;
    }
  }
  if ((metric === "reps" || (metric === "weight_reps" && weight === 0)) && reps > best.reps) {
    out.push({ kind: "reps", value: reps, label: `${reps} reps — most ever` });
    best.reps = reps;
  }
  if ((metric === "time" || metric === "distance") && seconds > best.seconds) {
    out.push({ kind: "time", value: seconds, label: `${seconds} best ever` });
    best.seconds = seconds;
  }
  return out;
}

/** Volume PRs for a whole exercise once the session is finished. */
export function detectVolumePRs(bests: Map<string, ExerciseBest>, exercises: WorkoutExercise[]) {
  const out: { exerciseId: string; name: string; volume: number }[] = [];
  for (const ex of exercises) {
    const volume = (ex.sets ?? []).reduce(
      (sum, s) => sum + (s.done ? (s.weight ?? 0) * (s.reps ?? 0) : 0),
      0,
    );
    if (volume <= 0) continue;
    const best = bests.get(ex.exerciseId);
    if (!best || volume > best.volume) out.push({ exerciseId: ex.exerciseId, name: ex.name, volume });
  }
  return out;
}

export async function savePR(
  userId: string,
  row: {
    exercise_id: string;
    exercise_name: string;
    kind: PRKind;
    value: number;
    weight?: number | null;
    reps?: number | null;
  },
) {
  const { error } = await supabase.from("personal_records").insert({
    user_id: userId,
    exercise_id: row.exercise_id,
    exercise_name: row.exercise_name,
    kind: row.kind,
    value: Math.round(row.value * 10) / 10,
    weight: row.weight ?? null,
    reps: row.reps ?? null,
  });
  if (error) console.error("[pr] save failed", error.message);
}

export async function fetchPRs(): Promise<PersonalRecord[]> {
  const { data, error } = await supabase
    .from("personal_records")
    .select("id,exercise_id,exercise_name,kind,value,weight,reps,achieved_at")
    .order("achieved_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    ...r,
    kind: r.kind as PRKind,
    value: Number(r.value),
    weight: r.weight === null ? null : Number(r.weight),
  }));
}

export const PR_LABELS: Record<PRKind, string> = {
  weight: "Heaviest weight",
  e1rm: "Estimated 1RM",
  volume: "Most volume",
  reps: "Most reps",
  time: "Best time",
};
