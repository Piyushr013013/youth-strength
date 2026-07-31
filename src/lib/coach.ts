import { supabase } from "@/integrations/supabase/client";
import type { UIMessage } from "ai";

export interface CoachThread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export async function fetchThreads(): Promise<CoachThread[]> {
  const { data, error } = await supabase
    .from("coach_threads")
    .select("id,title,created_at,updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CoachThread[];
}

export async function createThread(userId: string, title = "New chat") {
  const { data, error } = await supabase
    .from("coach_threads")
    .insert({ user_id: userId, title })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function renameThread(id: string, title: string) {
  const { error } = await supabase.from("coach_threads").update({ title }).eq("id", id);
  if (error) throw error;
}

export async function deleteThread(id: string) {
  const { error } = await supabase.from("coach_threads").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchThreadMessages(threadId: string): Promise<UIMessage[]> {
  const { data, error } = await supabase
    .from("coach_messages")
    .select("message")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => row.message as unknown as UIMessage);
}

export function messageText(message: UIMessage) {
  return message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}
