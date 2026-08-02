import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowUp, Loader2, LogOut, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui-kit";
import {
  fetchChatMeta,
  fetchChatTexts,
  leaveChat,
  sendChatText,
  type ChatText,
} from "@/lib/messaging";

export const Route = createFileRoute("/_authenticated/messages/$chatId")({
  head: () => ({
    meta: [
      { title: "Chat — ATHLETE OS" },
      { name: "description", content: "Text your teammates and squad group chats." },
      { property: "og:title", content: "Chat — ATHLETE OS" },
      { property: "og:description", content: "Text your teammates inside ATHLETE OS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChatThread,
});

function stamp(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function ChatThread() {
  const { chatId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const meta = useQuery({ queryKey: ["chat-meta", chatId], queryFn: () => fetchChatMeta(chatId) });
  const texts = useQuery({
    queryKey: ["chat-texts", chatId],
    queryFn: () => fetchChatTexts(chatId),
  });

  useEffect(() => {
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_texts", filter: `chat_id=eq.${chatId}` },
        (payload) => {
          const row = payload.new as ChatText;
          qc.setQueryData<ChatText[]>(["chat-texts", chatId], (prev) =>
            prev?.some((t) => t.id === row.id) ? prev : [...(prev ?? []), row],
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, qc]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [texts.data?.length]);

  const nameOf = (id: string) =>
    meta.data?.participants.find((p) => p.id === id)?.display_name ?? "Athlete";

  const title = useMemo(() => {
    const chat = meta.data?.chat;
    if (!chat) return "Chat";
    if (chat.is_group) return chat.name || "Group chat";
    const other = meta.data?.participants.find((p) => p.id !== user.id);
    return other?.display_name ?? "Direct message";
  }, [meta.data, user.id]);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setDraft("");
    try {
      await sendChatText(chatId, user.id, body);
      qc.invalidateQueries({ queryKey: ["chats"] });
    } catch (e) {
      toast.error((e as Error).message);
      setDraft(body);
    } finally {
      setSending(false);
    }
  };

  const isGroup = !!meta.data?.chat?.is_group;

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col">
      <header className="sticky top-0 z-30 -mx-4 flex items-center gap-3 bg-background/85 px-4 pb-3 pt-1 backdrop-blur">
        <Link
          to="/messages"
          className="rounded-xl border border-border p-2 text-muted-foreground"
          aria-label="Back to messages"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-bold">{title}</h1>
          <p className="truncate text-[11px] text-muted-foreground">
            {isGroup
              ? `${meta.data?.participants.length ?? 0} members · ${(meta.data?.participants ?? [])
                  .map((p) => (p.id === user.id ? "You" : p.display_name))
                  .join(", ")}`
              : "Direct message"}
          </p>
        </div>
        {isGroup ? (
          <button
            onClick={async () => {
              await leaveChat(chatId, user.id);
              qc.invalidateQueries({ queryKey: ["chats"] });
              navigate({ to: "/messages" });
            }}
            aria-label="Leave group"
            className="rounded-xl border border-border p-2 text-muted-foreground"
          >
            <LogOut size={16} />
          </button>
        ) : null}
      </header>

      <div className="flex-1 space-y-2 pb-40 pt-2">
        {texts.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" /> Loading messages…
          </div>
        ) : null}

        {!texts.isLoading && !texts.data?.length ? (
          <GlassCard className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
            <Users size={16} className="text-cyan" />
            No messages yet. Break the ice.
          </GlassCard>
        ) : null}

        {(texts.data ?? []).map((t, i) => {
          const mine = t.sender_id === user.id;
          const prev = (texts.data ?? [])[i - 1];
          const newDay = !prev || dayLabel(prev.created_at) !== dayLabel(t.created_at);
          const showName = isGroup && !mine && (!prev || prev.sender_id !== t.sender_id || newDay);
          return (
            <div key={t.id}>
              {newDay ? (
                <p className="py-3 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {dayLabel(t.created_at)}
                </p>
              ) : null}
              <div className={mine ? "flex justify-end" : "flex justify-start"}>
                <div className="max-w-[80%]">
                  {showName ? (
                    <p className="mb-1 pl-1 text-[10px] font-semibold uppercase tracking-wider text-cyan">
                      {nameOf(t.sender_id)}
                    </p>
                  ) : null}
                  <div
                    className={
                      mine
                        ? "rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm text-primary-foreground"
                        : "glass rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm text-foreground"
                    }
                  >
                    <p className="whitespace-pre-wrap break-words">{t.body}</p>
                  </div>
                  <p
                    className={
                      mine
                        ? "mt-1 pr-1 text-right text-[10px] text-muted-foreground"
                        : "mt-1 pl-1 text-[10px] text-muted-foreground"
                    }
                  >
                    {stamp(t.created_at)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="fixed inset-x-0 bottom-[5.5rem] z-30 px-4">
        <div className="glass mx-auto flex max-w-lg items-end gap-2 rounded-2xl p-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            rows={1}
            placeholder="Message…"
            className="max-h-28 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={() => void send()}
            disabled={!draft.trim() || sending}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
