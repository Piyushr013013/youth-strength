import { supabase } from "@/integrations/supabase/client";

export interface ChatSummary {
  id: string;
  name: string | null;
  is_group: boolean;
  created_by: string;
  updated_at: string;
  members: { id: string; display_name: string }[];
  lastMessage: string | null;
  lastAt: string | null;
}

export interface ChatText {
  id: string;
  chat_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export async function fetchBlocked(): Promise<{ id: string; blocked_id: string }[]> {
  const { data, error } = await supabase.from("blocked_users").select("id,blocked_id");
  if (error) throw error;
  return data ?? [];
}

export async function blockAthlete(userId: string, blockedId: string) {
  const { error } = await supabase
    .from("blocked_users")
    .insert({ blocker_id: userId, blocked_id: blockedId });
  if (error) throw error;
}

export async function unblockAthlete(id: string) {
  const { error } = await supabase.from("blocked_users").delete().eq("id", id);
  if (error) throw error;
}

export async function openDirectChat(otherId: string) {
  const { data, error } = await supabase.rpc("get_or_create_dm", { _other: otherId });
  if (error) throw error;
  return data as string;
}

export async function createGroupChat(userId: string, name: string, memberIds: string[]) {
  const { data, error } = await supabase
    .from("chats")
    .insert({ name, is_group: true, created_by: userId })
    .select("id")
    .single();
  if (error) throw error;
  const chatId = data.id as string;
  const rows = [userId, ...memberIds].map((id) => ({ chat_id: chatId, user_id: id }));
  const { error: memberError } = await supabase.from("chat_members").insert(rows);
  if (memberError) throw memberError;
  return chatId;
}

export async function fetchChats(userId: string): Promise<ChatSummary[]> {
  const { data: mine, error: mineError } = await supabase
    .from("chat_members")
    .select("chat_id")
    .eq("user_id", userId);
  if (mineError) throw mineError;
  const ids = (mine ?? []).map((m) => m.chat_id);
  if (!ids.length) return [];

  const [{ data: chats, error: chatError }, { data: members }, { data: texts }] = await Promise.all([
    supabase.from("chats").select("id,name,is_group,created_by,updated_at").in("id", ids),
    supabase.from("chat_members").select("chat_id,user_id").in("chat_id", ids),
    supabase
      .from("chat_texts")
      .select("chat_id,body,created_at")
      .in("chat_id", ids)
      .order("created_at", { ascending: false }),
  ]);
  if (chatError) throw chatError;

  const otherIds = [...new Set((members ?? []).map((m) => m.user_id))];
  const { data: profiles } = await supabase.rpc("friend_profiles", { ids: otherIds });
  const nameById = new Map<string, string>(
    ((profiles ?? []) as { id: string; display_name: string }[]).map((p) => [p.id, p.display_name]),
  );

  const lastByChat = new Map<string, { body: string; created_at: string }>();
  for (const t of texts ?? []) if (!lastByChat.has(t.chat_id)) lastByChat.set(t.chat_id, t);

  return (chats ?? [])
    .map((c) => {
      const mem = (members ?? [])
        .filter((m) => m.chat_id === c.id)
        .map((m) => ({ id: m.user_id, display_name: nameById.get(m.user_id) ?? "Athlete" }));
      const last = lastByChat.get(c.id);
      return {
        ...c,
        members: mem,
        lastMessage: last?.body ?? null,
        lastAt: last?.created_at ?? null,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.lastAt ?? b.updated_at).getTime() - new Date(a.lastAt ?? a.updated_at).getTime(),
    );
}

export async function fetchChatTexts(chatId: string): Promise<ChatText[]> {
  const { data, error } = await supabase
    .from("chat_texts")
    .select("id,chat_id,sender_id,body,created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) throw error;
  return data ?? [];
}

export async function sendChatText(chatId: string, senderId: string, body: string) {
  const { error } = await supabase
    .from("chat_texts")
    .insert({ chat_id: chatId, sender_id: senderId, body });
  if (error) throw error;
  await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId);
}

export async function fetchChatMeta(chatId: string) {
  const [{ data: chat, error }, { data: people }] = await Promise.all([
    supabase.from("chats").select("id,name,is_group,created_by").eq("id", chatId).maybeSingle(),
    supabase.rpc("chat_participants", { _chat_id: chatId }),
  ]);
  if (error) throw error;
  return {
    chat,
    participants: (people ?? []) as { id: string; display_name: string }[],
  };
}

export async function leaveChat(chatId: string, userId: string) {
  const { error } = await supabase
    .from("chat_members")
    .delete()
    .eq("chat_id", chatId)
    .eq("user_id", userId);
  if (error) throw error;
}

export function chatTitle(chat: ChatSummary, myId: string) {
  if (chat.is_group) return chat.name || "Group chat";
  const other = chat.members.find((m) => m.id !== myId);
  return other?.display_name ?? "Direct message";
}
