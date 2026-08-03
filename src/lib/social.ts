import { supabase } from "@/integrations/supabase/client";

export interface AthleteResult {
  id: string;
  display_name: string;
  sport: string | null;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
}

export interface FriendStat {
  id: string;
  display_name: string;
  sport: string | null;
  school: string | null;
  club_team: string | null;
  grad_year: number | null;
  workout_count: number;
  total_volume: number;
  last_workout: string | null;
}

export async function searchAthletes(q: string): Promise<AthleteResult[]> {
  if (q.trim().length < 2) return [];
  const { data, error } = await supabase.rpc("search_athletes", { q });
  if (error) throw error;
  return (data ?? []) as AthleteResult[];
}

export async function fetchFriendships(): Promise<Friendship[]> {
  const { data, error } = await supabase
    .from("friendships")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Friendship[];
}

export async function fetchFriendProfiles(ids: string[]): Promise<AthleteResult[]> {
  if (!ids.length) return [];
  const { data, error } = await supabase.rpc("friend_profiles", { ids });
  if (error) throw error;
  return (data ?? []) as AthleteResult[];
}

export async function fetchFriendsLeaderboard(): Promise<FriendStat[]> {
  const { data, error } = await supabase.rpc("friends_leaderboard");
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    display_name: r.display_name as string,
    sport: (r.sport as string) ?? null,
    school: (r.school as string) ?? null,
    club_team: (r.club_team as string) ?? null,
    grad_year: r.grad_year === null || r.grad_year === undefined ? null : Number(r.grad_year),
    workout_count: Number(r.workout_count ?? 0),
    total_volume: Number(r.total_volume ?? 0),
    last_workout: (r.last_workout as string) ?? null,
  }));
}

export async function sendFriendRequest(userId: string, addresseeId: string) {
  const { error } = await supabase
    .from("friendships")
    .insert({ requester_id: userId, addressee_id: addresseeId, status: "pending" });
  if (error) throw error;
}

export async function respondToRequest(id: string, status: "accepted" | "declined") {
  const { error } = await supabase.from("friendships").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function removeFriendship(id: string) {
  const { error } = await supabase.from("friendships").delete().eq("id", id);
  if (error) throw error;
}
