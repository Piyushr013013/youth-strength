import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui-kit";
import { createThread, deleteThread, fetchThreads } from "@/lib/coach";
import coachMark from "@/assets/coach-mark.png";

export const Route = createFileRoute("/_authenticated/coach/")({
  head: () => ({
    meta: [
      { title: "AI Coach Chat — ATHLETE OS" },
      {
        name: "description",
        content: "Ask an AI strength coach about programming, recovery and sport performance.",
      },
      { property: "og:title", content: "AI Coach Chat — ATHLETE OS" },
      { property: "og:description", content: "Your always-on AI strength & conditioning coach." },
    ],
  }),
  component: CoachIndex,
});

const STARTERS = [
  "Build me a 4-day in-season plan for football",
  "How do I add 3 inches to my vertical?",
  "My knees hurt after squats — what should I change?",
  "What should I eat before a 7am game?",
];

function CoachIndex() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const threads = useQuery({ queryKey: ["coach-threads"], queryFn: fetchThreads });

  const create = useMutation({
    mutationFn: async (title?: string) => createThread(user.id, title ?? "New chat"),
    onSuccess: (id, title) => {
      qc.invalidateQueries({ queryKey: ["coach-threads"] });
      navigate({
        to: "/coach/$threadId",
        params: { threadId: id },
        search: title ? { q: title } : undefined,
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: deleteThread,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coach-threads"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5 pb-32">
      <div className="flex items-center gap-3">
        <img src={coachMark} alt="" className="h-11 w-11 rounded-xl" />
        <div>
          <h1 className="font-display text-3xl font-bold">Coach</h1>
          <p className="text-xs text-muted-foreground">
            Ask anything about training, recovery or your sport.
          </p>
        </div>
      </div>

      <button
        onClick={() => create.mutate(undefined)}
        disabled={create.isPending}
        className="glow-lime flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-black uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-60"
      >
        <Plus size={20} /> New chat
      </button>

      <div className="grid gap-2">
        {STARTERS.map((s) => (
          <button
            key={s}
            onClick={() => create.mutate(s)}
            className="rounded-xl border border-border bg-surface-2/50 px-4 py-3 text-left text-sm text-muted-foreground hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {(threads.data ?? []).map((t) => (
          <GlassCard key={t.id} className="flex items-center gap-2 p-3">
            <Link
              to="/coach/$threadId"
              params={{ threadId: t.id }}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <MessageSquare size={16} className="shrink-0 text-cyan" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{t.title}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {new Date(t.updated_at).toLocaleDateString()}
                </span>
              </span>
            </Link>
            <button
              onClick={() => remove.mutate(t.id)}
              aria-label={`Delete ${t.title}`}
              className="shrink-0 p-2 text-muted-foreground"
            >
              <Trash2 size={15} />
            </button>
          </GlassCard>
        ))}
        {threads.data && !threads.data.length ? (
          <p className="text-sm text-muted-foreground">No conversations yet.</p>
        ) : null}
      </div>
    </div>
  );
}
