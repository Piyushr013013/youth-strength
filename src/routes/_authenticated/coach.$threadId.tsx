import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchThreadMessages, messageText, renameThread } from "@/lib/coach";
import coachMark from "@/assets/coach-mark.png";
import { Markdown } from "@/components/Markdown";
import { CoachToolCard } from "@/components/CoachToolCard";

export const Route = createFileRoute("/_authenticated/coach/$threadId")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Coach Chat — ATHLETE OS" },
      { name: "description", content: "Chat with your AI strength & conditioning coach." },
      { property: "og:title", content: "Coach Chat — ATHLETE OS" },
      { property: "og:description", content: "Chat with your AI strength coach." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CoachThread,
});

function CoachThread() {
  const { threadId } = Route.useParams();
  const { q } = Route.useSearch();
  const history = useQuery({
    queryKey: ["coach-messages", threadId],
    queryFn: () => fetchThreadMessages(threadId),
  });

  if (history.isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="animate-spin" size={20} />
      </div>
    );
  }

  return (
    <ChatWindow
      key={threadId}
      threadId={threadId}
      initial={history.data ?? []}
      firstPrompt={q}
    />
  );
}

function ChatWindow({
  threadId,
  initial,
  firstPrompt,
}: {
  threadId: string;
  initial: UIMessage[];
  firstPrompt?: string;
}) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sentFirst = useRef(false);

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initial,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { threadId },
      fetch: async (input, init) => {
        const { data } = await supabase.auth.getSession();
        const headers = new Headers(init?.headers);
        if (data.session) headers.set("Authorization", `Bearer ${data.session.access_token}`);
        return fetch(input, { ...init, headers });
      },
    }),
    onError: (e) => toast.error(e.message || "The coach could not answer. Try again."),
    onFinish: () => {
      qc.invalidateQueries({ queryKey: ["coach-threads"] });
      inputRef.current?.focus();
    },
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    if (!messages.length) void renameThread(threadId, trimmed.slice(0, 60));
    await sendMessage({ text: trimmed });
    inputRef.current?.focus();
  }

  useEffect(() => {
    if (!firstPrompt || sentFirst.current || initial.length) return;
    sentFirst.current = true;
    void send(firstPrompt);
    navigate({ to: "/coach/$threadId", params: { threadId }, search: {}, replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstPrompt, initial.length, threadId]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col pb-28">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/coach" className="rounded-xl border border-border p-2 text-muted-foreground">
          <ArrowLeft size={16} />
        </Link>
        <img src={coachMark} alt="" className="h-8 w-8 rounded-lg" />
        <p className="font-display text-lg font-bold">Coach</p>
      </div>

      <div className="flex-1 space-y-4">
        {!messages.length ? (
          <p className="text-sm text-muted-foreground">
            Ask about programming, in-season load, recovery, nutrition or a specific lift.
          </p>
        ) : null}

        {messages.map((m) => {
          const text = messageText(m);
          const tools = m.parts.filter((p) => p.type.startsWith("tool-"));
          if (!text && !tools.length) return null;
          if (m.role === "user") {
            return (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium leading-relaxed text-primary-foreground">
                  {text}
                </div>
              </div>
            );
          }
          return (
            <div key={m.id} className="space-y-2">
              {tools.map((p, i) => (
                <CoachToolCard key={`${m.id}-tool-${i}`} part={p as never} />
              ))}
              {text ? <Markdown>{text}</Markdown> : null}
            </div>
          );
        })}

        {status === "submitted" ? (
          <p className="shimmer text-sm text-muted-foreground">Coach is thinking…</p>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="glass fixed inset-x-0 bottom-24 z-30 mx-auto flex max-w-lg items-end gap-2 rounded-2xl p-2"
        style={{ width: "calc(100% - 2rem)" }}
      >
        <textarea
          ref={inputRef}
          value={input}
          rows={1}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          placeholder="Ask your coach…"
          className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={18} />}
        </button>
      </form>
    </div>
  );
}
