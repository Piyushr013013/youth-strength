import { EXERCISE_MAP } from "./exercises";
import type { Pattern, SavedWorkout, WorkoutExercise } from "./types";

export function epley1RM(weight: number, reps: number) {
  if (!weight || !reps) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export function setVolume(weight: number | null, reps: number | null) {
  return (weight ?? 0) * (reps ?? 0);
}

export function workoutVolume(exercises: WorkoutExercise[]) {
  return exercises.reduce(
    (sum, ex) =>
      sum +
      ex.sets
        .filter((s) => s.done && s.type !== "warmup")
        .reduce((a, s) => a + setVolume(s.weight, s.reps), 0),
    0,
  );
}

export function workoutSetCount(exercises: WorkoutExercise[]) {
  return exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.done).length, 0);
}

export function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function formatVolume(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return Math.round(v).toString();
}

/** Best e1RM per exercise across history */
export function bestE1RMs(workouts: SavedWorkout[]) {
  const map = new Map<string, { name: string; value: number }>();
  for (const w of workouts) {
    for (const ex of w.exercises ?? []) {
      for (const s of ex.sets ?? []) {
        if (!s.done || !s.weight || !s.reps) continue;
        const est = epley1RM(s.weight, s.reps);
        const prev = map.get(ex.exerciseId);
        if (!prev || est > prev.value) map.set(ex.exerciseId, { name: ex.name, value: est });
      }
    }
  }
  return map;
}

export interface VolumeBreakdown {
  byMuscle: { name: string; volume: number }[];
  byPattern: Record<Pattern, number>;
  upper: number;
  lower: number;
  strengthSets: number;
  cardioSets: number;
}

export function analyzeVolume(workouts: SavedWorkout[]): VolumeBreakdown {
  const byMuscle = new Map<string, number>();
  const byPattern: Record<Pattern, number> = {
    push: 0,
    pull: 0,
    legs: 0,
    core: 0,
    cardio: 0,
    mobility: 0,
  };
  let upper = 0;
  let lower = 0;
  let strengthSets = 0;
  let cardioSets = 0;

  const UPPER = ["chest", "back", "shoulders", "biceps", "triceps"];
  const LOWER = ["quads", "hamstrings", "glutes", "calves"];

  for (const w of workouts) {
    for (const ex of w.exercises ?? []) {
      const meta = EXERCISE_MAP.get(ex.exerciseId);
      const workSets = (ex.sets ?? []).filter((s) => s.done && s.type !== "warmup");
      if (!workSets.length) continue;
      const vol = workSets.reduce(
        (a, s) => a + (setVolume(s.weight, s.reps) || (s.reps ?? 0) * 10 || (s.seconds ?? 0) * 0.5),
        0,
      );
      const pattern = meta?.pattern ?? "core";
      byPattern[pattern] += vol;
      if (pattern === "cardio" || pattern === "mobility") cardioSets += workSets.length;
      else strengthSets += workSets.length;

      for (const m of meta?.muscles ?? []) {
        byMuscle.set(m, (byMuscle.get(m) ?? 0) + vol / (meta?.muscles.length ?? 1));
        if (UPPER.includes(m)) upper += vol / (meta?.muscles.length ?? 1);
        if (LOWER.includes(m)) lower += vol / (meta?.muscles.length ?? 1);
      }
    }
  }

  return {
    byMuscle: Array.from(byMuscle, ([name, volume]) => ({ name, volume })).sort(
      (a, b) => b.volume - a.volume,
    ),
    byPattern,
    upper,
    lower,
    strengthSets,
    cardioSets,
  };
}

export interface GapAlert {
  id: string;
  severity: "critical" | "warn" | "good";
  title: string;
  detail: string;
  fixes: string[];
}

export function buildGapAlerts(b: VolumeBreakdown): GapAlert[] {
  const alerts: GapAlert[] = [];
  const { push, pull, cardio } = b.byPattern;
  const strengthVol = b.byPattern.push + b.byPattern.pull + b.byPattern.legs;

  if (push > 0 && pull >= 0) {
    const ratio = pull === 0 ? Infinity : push / pull;
    if (ratio >= 1.5) {
      alerts.push({
        id: "push-pull",
        severity: "critical",
        title: `Push volume is ${ratio === Infinity ? "far" : `${ratio.toFixed(1)}x`} above pull`,
        detail:
          "Pressing far more than you pull pulls the shoulders forward and raises impingement risk. Balance it out this week.",
        fixes: ["Cable Face Pull", "Band Pull-Apart", "Inverted Row"],
      });
    } else if (ratio < 0.6 && pull > 0) {
      alerts.push({
        id: "pull-push",
        severity: "warn",
        title: "Pull volume far exceeds push",
        detail: "Your pressing is lagging behind your pulling — add horizontal press work.",
        fixes: ["Dumbbell Bench Press", "Pike Push-Up", "Standing Overhead Press"],
      });
    } else {
      alerts.push({
        id: "push-pull-ok",
        severity: "good",
        title: "Push / pull balance looks solid",
        detail: `Ratio is ${ratio.toFixed(2)} — right inside the 0.8–1.3 sweet spot.`,
        fixes: [],
      });
    }
  }

  if (b.upper > 0 || b.lower > 0) {
    const ratio = b.lower === 0 ? Infinity : b.upper / b.lower;
    if (ratio >= 1.6) {
      alerts.push({
        id: "upper-lower",
        severity: "warn",
        title: "Upper body is outpacing lower body",
        detail: "Athletic power comes from the hips. Add a lower-body day or hinge work.",
        fixes: ["Romanian Deadlift", "Bulgarian Split Squat", "Barbell Hip Thrust"],
      });
    } else if (ratio <= 0.5 && b.upper > 0) {
      alerts.push({
        id: "lower-upper",
        severity: "warn",
        title: "Lower body is outpacing upper body",
        detail: "Add upper-body pressing and pulling to keep total-body strength even.",
        fixes: ["Pull-Up", "Barbell Bench Press", "One-Arm Dumbbell Row"],
      });
    }
  }

  const totalSets = b.strengthSets + b.cardioSets;
  if (totalSets >= 5) {
    const cardioShare = b.cardioSets / totalSets;
    if (cardioShare < 0.12) {
      alerts.push({
        id: "cardio-low",
        severity: "warn",
        title: "Conditioning is under 12% of your work",
        detail: "Student athletes need an engine. Add one interval or Zone 2 session per week.",
        fixes: ["Zone 2 Run", "300-Yard Shuttle", "Rowing Erg"],
      });
    } else if (cardioShare > 0.6 && strengthVol > 0) {
      alerts.push({
        id: "cardio-high",
        severity: "warn",
        title: "Almost everything you log is conditioning",
        detail: "Strength protects against injury and builds speed. Add two lifting days.",
        fixes: ["Barbell Back Squat", "Pull-Up", "Romanian Deadlift"],
      });
    }
  }

  const coreVol = b.byPattern.core;
  if (strengthVol > 0 && coreVol / Math.max(strengthVol, 1) < 0.05) {
    alerts.push({
      id: "core-low",
      severity: "warn",
      title: "Core / anti-rotation work is thin",
      detail: "Trunk stiffness transfers force from hips to hands. Add 2 core sets per session.",
      fixes: ["Pallof Press", "Hanging Leg Raise", "Copenhagen Plank"],
    });
  }

  if (cardio === 0 && strengthVol === 0) {
    return [
      {
        id: "empty",
        severity: "good",
        title: "No data yet",
        detail: "Log a couple of workouts and your gap analysis will populate automatically.",
        fixes: [],
      },
    ];
  }

  return alerts;
}

export function computeStreak(dates: string[]) {
  if (!dates.length) return 0;
  const days = new Set(dates.map((d) => new Date(d).toDateString()));
  let streak = 0;
  const cursor = new Date();
  // allow today to be missing without breaking the streak
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export interface Badge {
  id: string;
  name: string;
  detail: string;
  earned: boolean;
  progress: number;
}

export function buildBadges(stats: {
  workouts: number;
  tonnage: number;
  streak: number;
  cardioSets: number;
  prCount: number;
}): Badge[] {
  const mk = (id: string, name: string, detail: string, value: number, goal: number): Badge => ({
    id,
    name,
    detail,
    earned: value >= goal,
    progress: Math.min(1, value / goal),
  });
  return [
    mk("first-rep", "First Rep", "Log your first workout", stats.workouts, 1),
    mk("ten-sessions", "Consistent 10", "Complete 10 workouts", stats.workouts, 10),
    mk("fifty-sessions", "Half Century", "Complete 50 workouts", stats.workouts, 50),
    mk("week-streak", "Week Warrior", "7-day training streak", stats.streak, 7),
    mk("month-streak", "Iron Month", "30-day training streak", stats.streak, 30),
    mk("ton-100k", "100k Club", "Lift 100,000 lb lifetime", stats.tonnage, 100_000),
    mk("ton-1m", "Million Mover", "Lift 1,000,000 lb lifetime", stats.tonnage, 1_000_000),
    mk("engine", "Engine Built", "Log 50 conditioning sets", stats.cardioSets, 50),
    mk("pr-hunter", "PR Hunter", "Set 10 personal records", stats.prCount, 10),
  ];
}
