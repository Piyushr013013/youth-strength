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

const STARTERS: { emoji: string; label: string; prompt: string; accent: string }[] = [
  {
    emoji: "🏈",
    label: "In-season plan",
    prompt: "Build me a 4-day in-season plan for football",
    accent: "border-lime/40 text-lime",
  },
  {
    emoji: "🏀",
    label: "Jump higher",
    prompt: "How do I add 3 inches to my vertical?",
    accent: "border-flare/40 text-flare",
  },
  {
    emoji: "🩹",
    label: "Fix knee pain",
    prompt: "My knees hurt after squats — what should I change?",
    accent: "border-cyan/40 text-cyan",
  },
  {
    emoji: "🍎",
    label: "Game-day fuel",
    prompt: "What should I eat before a 7am game?",
    accent: "border-lime/40 text-lime",
  },
  {
    emoji: "📈",
    label: "Call out my stalls",
    prompt: "Audit my last few weeks and call me out if I'm not progressively overloading",
    accent: "border-flare/40 text-flare",
  },
  {
    emoji: "🗓️",
    label: "Build my routine",
    prompt: "Create a custom 3-day hypertrophy routine in my app",
    accent: "border-cyan/40 text-cyan",
  },
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
      <div className="glass glow-lime flex items-center gap-3 rounded-2xl p-4">
        <span className="relative">
          <img src={coachMark} alt="Titan AI coach badge" className="h-14 w-14 rounded-2xl" />
          <span className="absolute -bottom-1 -right-1 rounded-full border border-background bg-primary px-1.5 py-0.5 text-[9px] font-black uppercase text-primary-foreground">
            AI
          </span>
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-gradient-neon">TITAN AI</h1>
          <p className="text-[11px] uppercase tracking-[0.16em] text-cyan">
            Your strength & conditioning coach
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ask anything — programming, recovery, nutrition or your sport.
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

      <div className="grid grid-cols-2 gap-2">
        {STARTERS.map((s) => (
          <button
            key={s.label}
            onClick={() => create.mutate(s.prompt)}
            className={`glass rounded-2xl border ${s.accent} p-3 text-left`}
          >
            <span className="text-xl">{s.emoji}</span>
            <span className="mt-1.5 block text-sm font-bold text-foreground">{s.label}</span>
            <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
              {s.prompt}
            </span>
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
