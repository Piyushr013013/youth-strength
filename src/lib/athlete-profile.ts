import { supabase } from "@/integrations/supabase/client";

export interface TeammateProfile {
  id: string;
  display_name: string;
  sport: string | null;
  school: string | null;
  club_team: string | null;
  grad_year: number | null;
  workout_count: number;
  total_volume: number;
  last_workout: string | null;
  weekly_sessions: number;
  streak_days: number;
  is_friend: boolean;
}

/** Loosely typed escape hatch — these tables/RPCs are newer than the generated types. */
const db = supabase as unknown as {
  rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
  from: (table: string) => {
    insert: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  };
};

export async function fetchTeammateProfile(id: string): Promise<TeammateProfile | null> {
  const { data, error } = await db.rpc("athlete_public_profile", { _id: id });
  if (error) throw new Error(error.message);
  const row = (data as Record<string, unknown>[] | null)?.[0];
  if (!row) return null;
  return {
    id: row.id as string,
    display_name: (row.display_name as string) ?? "Athlete",
    sport: (row.sport as string) ?? null,
    school: (row.school as string) ?? null,
    club_team: (row.club_team as string) ?? null,
    grad_year: row.grad_year == null ? null : Number(row.grad_year),
    workout_count: Number(row.workout_count ?? 0),
    total_volume: Number(row.total_volume ?? 0),
    last_workout: (row.last_workout as string) ?? null,
    weekly_sessions: Number(row.weekly_sessions ?? 0),
    streak_days: Number(row.streak_days ?? 0),
    is_friend: Boolean(row.is_friend),
  };
}

export const REPORT_REASONS = [
  "Harassment or bullying",
  "Inappropriate messages",
  "Fake or impersonating account",
  "Spam",
  "Something else",
] as const;

export async function reportAthlete(
  reporterId: string,
  reportedId: string,
  reason: string,
  details?: string,
) {
  const { error } = await db.from("athlete_reports").insert({
    reporter_id: reporterId,
    reported_id: reportedId,
    reason,
    details: details?.trim() || null,
  });
  if (error) throw new Error(error.message);
}
