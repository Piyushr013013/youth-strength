import { supabase } from "@/integrations/supabase/client";

export const HYPE_EMOJIS = ["🔥", "💪", "🙌", "🫡"] as const;

export interface FeedHype {
  emoji: string;
  user_id: string;
}

export interface FeedItem {
  workout_id: string;
  athlete_id: string;
  display_name: string;
  sport: string | null;
  school: string | null;
  name: string;
  started_at: string;
  duration_sec: number;
  total_sets: number;
  total_volume: number;
  hypes: FeedHype[];
}

export async function fetchActivityFeed(): Promise<FeedItem[]> {
  const { data, error } = await supabase.rpc("friend_activity_feed", { limit_count: 40 });
  if (error) throw error;
  return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    workout_id: r.workout_id as string,
    athlete_id: r.athlete_id as string,
    display_name: (r.display_name as string) ?? "Athlete",
    sport: (r.sport as string) ?? null,
    school: (r.school as string) ?? null,
    name: (r.name as string) ?? "Session",
    started_at: r.started_at as string,
    duration_sec: Number(r.duration_sec ?? 0),
    total_sets: Number(r.total_sets ?? 0),
    total_volume: Number(r.total_volume ?? 0),
    hypes: (r.hypes as FeedHype[]) ?? [],
  }));
}

export async function toggleHype(
  userId: string,
  workoutId: string,
  emoji: string,
  active: boolean,
) {
  if (active) {
    const { error } = await supabase
      .from("workout_hypes")
      .delete()
      .eq("workout_id", workoutId)
      .eq("user_id", userId)
      .eq("emoji", emoji);
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from("workout_hypes")
    .insert({ workout_id: workoutId, user_id: userId, emoji });
  if (error) throw error;
}
