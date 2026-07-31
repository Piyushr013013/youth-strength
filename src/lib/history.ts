import { epley1RM } from "./fitness";
import type { SavedWorkout } from "./types";

export interface LastPerformance {
  date: string;
  best: { weight: number | null; reps: number | null; seconds: number | null };
  sets: { weight: number | null; reps: number | null; seconds: number | null }[];
}

/** Most recent completed performance for each exercise. */
export function lastPerformances(workouts: SavedWorkout[]) {
  const map = new Map<string, LastPerformance>();
  const sorted = [...workouts].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
  );
  for (const w of sorted) {
    for (const ex of w.exercises ?? []) {
      if (map.has(ex.exerciseId)) continue;
      const sets = (ex.sets ?? [])
        .filter((s) => s.done)
        .map((s) => ({ weight: s.weight, reps: s.reps, seconds: s.seconds }));
      if (!sets.length) continue;
      const best = sets.reduce((a, b) =>
        epley1RM(b.weight ?? 0, b.reps ?? 0) > epley1RM(a.weight ?? 0, a.reps ?? 0) ? b : a,
      );
      map.set(ex.exerciseId, { date: w.started_at, best, sets });
    }
  }
  return map;
}

export function formatLast(p: LastPerformance | undefined) {
  if (!p) return null;
  const b = p.best;
  if (b.weight && b.reps) return `${b.weight} × ${b.reps}`;
  if (b.reps) return `${b.reps} reps`;
  if (b.seconds) return `${b.seconds}s`;
  return null;
}

/** Estimated 1RM over time for one exercise. */
export function e1rmSeries(workouts: SavedWorkout[], exerciseId: string) {
  const points: { date: string; label: string; e1rm: number; volume: number }[] = [];
  const sorted = [...workouts].sort(
    (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
  );
  for (const w of sorted) {
    let best = 0;
    let volume = 0;
    for (const ex of w.exercises ?? []) {
      if (ex.exerciseId !== exerciseId) continue;
      for (const s of ex.sets ?? []) {
        if (!s.done) continue;
        volume += (s.weight ?? 0) * (s.reps ?? 0);
        best = Math.max(best, epley1RM(s.weight ?? 0, s.reps ?? 0));
      }
    }
    if (best > 0 || volume > 0) {
      points.push({
        date: w.started_at,
        label: new Date(w.started_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        e1rm: best,
        volume,
      });
    }
  }
  return points;
}

/** Exercises with at least one logged set, most trained first. */
export function trainedExercises(workouts: SavedWorkout[]) {
  const map = new Map<string, { id: string; name: string; sessions: number }>();
  for (const w of workouts) {
    for (const ex of w.exercises ?? []) {
      const done = (ex.sets ?? []).some((s) => s.done);
      if (!done) continue;
      const cur = map.get(ex.exerciseId);
      map.set(ex.exerciseId, {
        id: ex.exerciseId,
        name: ex.name,
        sessions: (cur?.sessions ?? 0) + 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.sessions - a.sessions);
}

/** Simple XP / level curve for gamification. */
export function levelFromXp(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 120)) + 1;
  const floor = (level - 1) ** 2 * 120;
  const ceil = level ** 2 * 120;
  return { level, floor, ceil, progress: Math.min(1, (xp - floor) / Math.max(1, ceil - floor)) };
}
