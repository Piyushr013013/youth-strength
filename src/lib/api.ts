import { supabase } from "@/integrations/supabase/client";
import type { Profile, Routine, SavedWorkout, WorkoutExercise } from "./types";

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  if (!data) {
    const { data: created, error: insertError } = await supabase
      .from("profiles")
      .insert({ id: userId })
      .select("*")
      .single();
    if (insertError) throw insertError;
    return created as unknown as Profile;
  }
  return data as unknown as Profile;
}

export async function updateProfile(userId: string, patch: Partial<Profile>) {
  const { error } = await supabase
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}

export async function fetchRoutines(): Promise<Routine[]> {
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Routine[];
}

export async function saveRoutine(
  userId: string,
  routine: Omit<Routine, "id" | "created_at"> & { id?: string },
) {
  const payload = {
    user_id: userId,
    name: routine.name,
    description: routine.description,
    source: routine.source,
    program_id: routine.program_id,
    exercises: routine.exercises as never,
  };
  if (routine.id) {
    const { error } = await supabase.from("routines").update(payload).eq("id", routine.id);
    if (error) throw error;
    return routine.id;
  }
  const { data, error } = await supabase.from("routines").insert(payload).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteRoutine(id: string) {
  const { error } = await supabase.from("routines").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchWorkouts(): Promise<SavedWorkout[]> {
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as unknown as SavedWorkout[];
}

export async function insertWorkout(
  userId: string,
  workout: {
    name: string;
    started_at: string;
    finished_at: string;
    duration_sec: number;
    total_volume: number;
    total_sets: number;
    notes: string | null;
    exercises: WorkoutExercise[];
  },
) {
  const { data, error } = await supabase
    .from("workouts")
    .insert({ ...workout, user_id: userId, exercises: workout.exercises as never })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteWorkout(id: string) {
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) throw error;
}
