import { epley1RM } from "./fitness";
import type { SavedWorkout } from "./types";

export interface ExerciseSessionSummary {
  date: string;
  topWeight: number;
  topReps: number;
  totalReps: number;
  volume: number;
  e1rm: number;
}

/** Per-session top-set summary for one exercise, oldest first. */
export function exerciseSessions(workouts: SavedWorkout[], exerciseId: string) {
  const out: ExerciseSessionSummary[] = [];
  const sorted = [...workouts].sort(
    (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
  );
  for (const w of sorted) {
    let topWeight = 0;
    let topReps = 0;
    let totalReps = 0;
    let volume = 0;
    let e1rm = 0;
    let found = false;
    for (const ex of w.exercises ?? []) {
      if (ex.exerciseId !== exerciseId) continue;
      for (const s of ex.sets ?? []) {
        if (!s.done) continue;
        found = true;
        const weight = s.weight ?? 0;
        const reps = s.reps ?? 0;
        totalReps += reps;
        volume += weight * reps;
        if (weight > topWeight || (weight === topWeight && reps > topReps)) {
          topWeight = weight;
          topReps = reps;
        }
        e1rm = Math.max(e1rm, epley1RM(weight, reps));
      }
    }
    if (found) out.push({ date: w.started_at, topWeight, topReps, totalReps, volume, e1rm });
  }
  return out;
}

export type OverloadStatus = "progressing" | "stalled" | "regressing" | "new";

export interface OverloadFlag {
  exerciseId: string;
  name: string;
  sessions: number;
  status: OverloadStatus;
  daysSinceGain: number | null;
  message: string;
}

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

/**
 * Progressive-overload audit. An exercise is "stalled" when the last two or more
 * sessions failed to add weight, reps or total volume.
 */
export function overloadReport(workouts: SavedWorkout[]): OverloadFlag[] {
  const ids = new Map<string, string>();
  for (const w of workouts) for (const ex of w.exercises ?? []) ids.set(ex.exerciseId, ex.name);

  const flags: OverloadFlag[] = [];
  const today = new Date().toISOString();

  for (const [id, name] of ids) {
    const sessions = exerciseSessions(workouts, id);
    if (sessions.length < 2) {
      flags.push({
        exerciseId: id,
        name,
        sessions: sessions.length,
        status: "new",
        daysSinceGain: null,
        message: `Only ${sessions.length} logged session — need one more to judge progress.`,
      });
      continue;
    }

    // last session that improved on everything before it
    let lastGainIndex = 0;
    for (let i = 1; i < sessions.length; i++) {
      const prev = sessions.slice(0, i);
      const bestWeight = Math.max(...prev.map((s) => s.topWeight));
      const bestVolume = Math.max(...prev.map((s) => s.volume));
      const bestReps = Math.max(...prev.map((s) => s.totalReps));
      const cur = sessions[i];
      if (cur.topWeight > bestWeight || cur.volume > bestVolume || cur.totalReps > bestReps) {
        lastGainIndex = i;
      }
    }

    const stalledSessions = sessions.length - 1 - lastGainIndex;
    const daysSinceGain = daysBetween(sessions[lastGainIndex].date, today);
    const last = sessions[sessions.length - 1];
    const prev = sessions[sessions.length - 2];

    let status: OverloadStatus = "progressing";
    let message = `Moving up — last session ${last.topWeight || last.totalReps} ${
      last.topWeight ? `× ${last.topReps}` : "reps"
    }.`;

    if (last.volume < prev.volume * 0.9 && last.topWeight <= prev.topWeight) {
      status = "regressing";
      message = `Volume dropped ${Math.round((1 - last.volume / Math.max(1, prev.volume)) * 100)}% vs last session and weight didn't go up.`;
    } else if (stalledSessions >= 2) {
      status = "stalled";
      message = `No added weight, reps or volume for ${stalledSessions} sessions (${daysSinceGain} days). Add 2.5kg/5lb or one rep per set next time.`;
    } else if (daysSinceGain > 21) {
      status = "stalled";
      message = `Last real gain was ${daysSinceGain} days ago. Time to change the loading or the rep target.`;
    }

    flags.push({ exerciseId: id, name, sessions: sessions.length, status, daysSinceGain, message });
  }

  const order: Record<OverloadStatus, number> = { regressing: 0, stalled: 1, progressing: 2, new: 3 };
  return flags.sort(
    (a, b) => order[a.status] - order[b.status] || b.sessions - a.sessions,
  );
}

export function overloadSummary(flags: OverloadFlag[]) {
  const stalled = flags.filter((f) => f.status === "stalled" || f.status === "regressing");
  const progressing = flags.filter((f) => f.status === "progressing");
  return { stalled, progressing };
}
