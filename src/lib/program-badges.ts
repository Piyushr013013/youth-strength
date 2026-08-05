import type { Program } from "./programs";

export interface ProgramBadge {
  emoji: string;
  label: string;
  tone: "lime" | "cyan" | "flare";
}

const LEVEL_BADGE: Record<Program["level"], ProgramBadge> = {
  Beginner: { emoji: "🟢", label: "Beginner", tone: "lime" },
  Intermediate: { emoji: "🟡", label: "Intermediate", tone: "cyan" },
  Advanced: { emoji: "🔴", label: "Advanced", tone: "flare" },
};

/** Rough session length from set volume — purely for display. */
function estimateMinutes(p: Program) {
  const day = p.days[0];
  if (!day) return 45;
  const sets = day.exercises.reduce((a, e) => a + (e.sets || 3), 0);
  const mins = Math.round((sets * 2.6 + 8) / 5) * 5;
  return Math.min(90, Math.max(20, mins));
}

/** Gear guess from exercise id prefixes. */
function gearBadge(p: Program): ProgramBadge {
  const ids = p.days.flatMap((d) => d.exercises.map((e) => e.exerciseId));
  const has = (pre: string) => ids.some((i) => i.startsWith(pre));
  const machines = has("mac-") || has("cab-") || has("mach-");
  const barbell = has("bb-") || has("pl-") || has("oly-");
  const dumbbell = has("db-") || has("kb-");
  if (machines || barbell) return { emoji: "🏋️", label: "Full Gym", tone: "flare" };
  if (dumbbell) return { emoji: "💪", label: "Dumbbells", tone: "cyan" };
  return { emoji: "🤸", label: "Bodyweight", tone: "lime" };
}

export function programBadges(p: Program): ProgramBadge[] {
  return [
    LEVEL_BADGE[p.level],
    { emoji: "⏱️", label: `${estimateMinutes(p)} Min`, tone: "cyan" },
    gearBadge(p),
    { emoji: "📅", label: `${p.weeks}w · ${p.daysPerWeek}x/wk`, tone: "lime" },
  ];
}
