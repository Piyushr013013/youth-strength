import { supabase } from "@/integrations/supabase/client";
import type { Program } from "./programs";
import type { RoutineExercise } from "./types";

export interface ScheduledWorkout {
  id: string;
  scheduled_for: string;
  name: string;
  program_id: string | null;
  day_label: string | null;
  focus: string | null;
  exercises: RoutineExercise[];
  completed_at: string | null;
}

export function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function fetchScheduled(): Promise<ScheduledWorkout[]> {
  const { data, error } = await supabase
    .from("scheduled_workouts")
    .select("id,scheduled_for,name,program_id,day_label,focus,exercises,completed_at")
    .order("scheduled_for", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as ScheduledWorkout[];
}

/** Spread every day of a program across the calendar, week by week. */
export async function scheduleProgram(userId: string, program: Program, startDate: Date) {
  const perWeek = Math.max(program.days.length, 1);
  const spacing = Math.max(1, Math.floor(7 / perWeek));
  const rows: {
    user_id: string;
    scheduled_for: string;
    name: string;
    program_id: string;
    day_label: string;
    focus: string;
    exercises: never;
  }[] = [];

  for (let week = 0; week < program.weeks; week++) {
    program.days.forEach((day, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + week * 7 + Math.min(6, i * spacing));
      rows.push({
        user_id: userId,
        scheduled_for: isoDay(d),
        name: `${program.name} — ${day.day}`,
        program_id: program.id,
        day_label: `W${week + 1} · ${day.day}`,
        focus: day.focus,
        exercises: day.exercises as never,
      });
    });
  }

  const { error } = await supabase.from("scheduled_workouts").insert(rows);
  if (error) throw error;
  return rows.length;
}

export async function removeProgramFromCalendar(programId: string) {
  const { error } = await supabase
    .from("scheduled_workouts")
    .delete()
    .eq("program_id", programId)
    .is("completed_at", null);
  if (error) throw error;
}

export async function deleteScheduled(id: string) {
  const { error } = await supabase.from("scheduled_workouts").delete().eq("id", id);
  if (error) throw error;
}

export async function markScheduledComplete(id: string) {
  const { error } = await supabase
    .from("scheduled_workouts")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
