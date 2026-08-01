import { tool } from "ai";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { EXERCISES, findExercise } from "./exercises";
import { overloadReport } from "./overload";
import { epley1RM } from "./fitness";
import type { SavedWorkout } from "./types";

type Client = SupabaseClient<never, never, never>;

function matchExercise(query: string) {
  const q = query.trim().toLowerCase();
  const direct = findExercise(q);
  if (direct) return direct;
  const exact = EXERCISES.find((e) => e.name.toLowerCase() === q);
  if (exact) return exact;
  const starts = EXERCISES.find((e) => e.name.toLowerCase().startsWith(q));
  if (starts) return starts;
  const includes = EXERCISES.find((e) => e.name.toLowerCase().includes(q));
  if (includes) return includes;
  const words = q.split(/\s+/).filter((w) => w.length > 2);
  let best: { score: number; ex: (typeof EXERCISES)[number] } | null = null;
  for (const ex of EXERCISES) {
    const hay = ex.name.toLowerCase();
    const score = words.reduce((s, w) => s + (hay.includes(w) ? 1 : 0), 0);
    if (score && (!best || score > best.score)) best = { score, ex };
  }
  return best?.ex ?? null;
}

/** Tools the coach can call to actually do things inside the app. */
export function coachTools(supabase: Client, userId: string) {
  return {
    search_exercises: tool({
      description:
        "Search the app's exercise library. Use this before creating a routine so every exercise you pick really exists.",
      inputSchema: z.object({ query: z.string().min(2).describe("Name or muscle to search for") }),
      execute: async ({ query }) => {
        const q = query.toLowerCase();
        const hits = EXERCISES.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.muscles.some((m) => m.includes(q)) ||
            e.equipment.toLowerCase().includes(q),
        ).slice(0, 15);
        return { count: hits.length, exercises: hits.map((e) => ({ id: e.id, name: e.name })) };
      },
    }),

    create_routine: tool({
      description:
        "Create a saved workout routine in the athlete's account. Use this whenever they ask for a workout, plan or routine — build it here instead of only describing it. Create one routine per training day.",
      inputSchema: z.object({
        name: z.string().min(2).max(80).describe("Routine name, e.g. 'Upper Power — Day 1'"),
        description: z.string().max(300).optional(),
        exercises: z
          .array(
            z.object({
              exercise: z.string().describe("Exercise name or library id"),
              sets: z.number().int().min(1).max(12),
              reps: z.string().describe("Rep target, e.g. '8', '3-5', 'AMRAP', '30s'"),
            }),
          )
          .min(1)
          .max(14),
      }),
      execute: async ({ name, description, exercises }) => {
        const resolved: { exerciseId: string; name: string; sets: number; reps: string }[] = [];
        const unmatched: string[] = [];
        for (const item of exercises) {
          const found = matchExercise(item.exercise);
          if (!found) {
            unmatched.push(item.exercise);
            continue;
          }
          resolved.push({
            exerciseId: found.id,
            name: found.name,
            sets: item.sets,
            reps: item.reps,
          });
        }
        if (!resolved.length) {
          return { ok: false, error: "None of those exercises exist in the library", unmatched };
        }
        const { data, error } = await supabase
          .from("routines")
          .insert({
            user_id: userId,
            name,
            description: description ?? null,
            source: "coach",
            program_id: null,
            exercises: resolved as never,
          })
          .select("id")
          .single();
        if (error) return { ok: false, error: error.message };
        return {
          ok: true,
          routineId: (data as { id: string }).id,
          name,
          exercises: resolved.map((r) => `${r.name} — ${r.sets} × ${r.reps}`),
          unmatched,
        };
      },
    }),

    get_training_report: tool({
      description:
        "Read the athlete's recent training history: sessions, volume, best lifts and a progressive-overload audit. Call this before giving programming advice, and whenever they ask about progress or whether they are overloading.",
      inputSchema: z.object({
        exercise: z.string().optional().describe("Optional exercise name to zoom in on"),
      }),
      execute: async ({ exercise }) => {
        const { data, error } = await supabase
          .from("workouts")
          .select("id,name,started_at,duration_sec,total_volume,total_sets,exercises")
          .order("started_at", { ascending: false })
          .limit(60);
        if (error) return { ok: false, error: error.message };
        const workouts = (data ?? []) as unknown as SavedWorkout[];
        if (!workouts.length) return { ok: true, sessions: 0, note: "No workouts logged yet." };

        const flags = overloadReport(workouts);
        const focus = exercise ? matchExercise(exercise) : null;

        const bestLifts = new Map<string, { name: string; e1rm: number }>();
        for (const w of workouts) {
          for (const ex of w.exercises ?? []) {
            for (const s of ex.sets ?? []) {
              if (!s.done) continue;
              const e1rm = epley1RM(s.weight ?? 0, s.reps ?? 0);
              const cur = bestLifts.get(ex.exerciseId);
              if (!cur || e1rm > cur.e1rm) bestLifts.set(ex.exerciseId, { name: ex.name, e1rm });
            }
          }
        }

        return {
          ok: true,
          sessions: workouts.length,
          lastSession: workouts[0]?.started_at ?? null,
          last7Days: workouts.filter(
            (w) => Date.now() - new Date(w.started_at).getTime() < 7 * 86_400_000,
          ).length,
          recentSessions: workouts.slice(0, 8).map((w) => ({
            name: w.name,
            date: w.started_at.slice(0, 10),
            sets: w.total_sets,
            volume: Math.round(w.total_volume),
          })),
          topLifts: [...bestLifts.values()]
            .sort((a, b) => b.e1rm - a.e1rm)
            .slice(0, 8)
            .map((l) => ({ name: l.name, estimated1RM: Math.round(l.e1rm) })),
          stalledLifts: flags
            .filter((f) => f.status === "stalled" || f.status === "regressing")
            .slice(0, 8)
            .map((f) => ({ name: f.name, status: f.status, detail: f.message })),
          progressingLifts: flags
            .filter((f) => f.status === "progressing")
            .slice(0, 8)
            .map((f) => f.name),
          focus: focus
            ? flags.find((f) => f.exerciseId === focus.id) ?? { name: focus.name, status: "new" }
            : null,
        };
      },
    }),
  };
}
