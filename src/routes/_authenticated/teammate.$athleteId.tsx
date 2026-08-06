import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Ban, Flag, MessageSquare, Trophy } from "lucide-react";
import { toast } from "sonner";
import { GlassCard, SectionTitle, Chip } from "@/components/ui-kit";
import { AnimatedBolt, AnimatedFire } from "@/components/hype-bits";
import { formatVolume } from "@/lib/fitness";
import { sportVisual } from "@/lib/sport-visuals";
import { blockAthlete, fetchBlocked, openDirectChat, unblockAthlete } from "@/lib/messaging";
import { fetchTeammateProfile, REPORT_REASONS, reportAthlete } from "@/lib/athlete-profile";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/teammate/$athleteId")({
  head: () => ({
    meta: [
      { title: "Teammate Profile — ATHLETE OS" },
      {
        name: "description",
        content:
          "See a teammate's streak, 30-day tonnage and sessions, text them, or block and report them.",
      },
      { property: "og:title", content: "Teammate Profile — ATHLETE OS" },
      {
        property: "og:description",
        content: "Teammate streak, tonnage and sessions with safety controls.",
      },
    ],
  }),
  component: TeammatePage,
});

function TeammatePage() {
  const { athleteId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");

  const athlete = useQuery({
    queryKey: ["teammate", athleteId],
    queryFn: () => fetchTeammateProfile(athleteId),
  });
  const blocked = useQuery({ queryKey: ["blocked"], queryFn: fetchBlocked });
  const blockRow = (blocked.data ?? []).find((b) => b.blocked_id === athleteId);

  const dm = useMutation({
    mutationFn: () => openDirectChat(athleteId),
    onSuccess: (chatId) => navigate({ to: "/messages/$chatId", params: { chatId } }),
    onError: (e: Error) => toast.error(e.message),
  });
  const block = useMutation({
    mutationFn: () =>
      blockRow ? unblockAthlete(blockRow.id) : blockAthlete(user.id, athleteId),
    onSuccess: () => {
      toast.success(blockRow ? "Unblocked" : "Blocked — they can't text you");
      qc.invalidateQueries({ queryKey: ["blocked"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const report = useMutation({
    mutationFn: () => reportAthlete(user.id, athleteId, reason, details),
    onSuccess: () => {
      toast.success("Report sent — our team will review it");
      setReporting(false);
      setDetails("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const a = athlete.data;
  const v = sportVisual(a?.sport);
  const initials = (a?.display_name ?? "A")
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto w-full max-w-md space-y-5 pb-32">
      <Link to="/friends" className="flex items-center gap-2 text-xs text-muted-foreground">
        <ArrowLeft size={14} /> Back to teammates
      </Link>

      {athlete.isLoading ? (
        <GlassCard className="p-6 text-sm text-muted-foreground">Loading athlete…</GlassCard>
      ) : !a ? (
        <GlassCard className="p-6 text-sm text-muted-foreground">
          This profile is private. Connect as teammates to see their training.
        </GlassCard>
      ) : (
        <>
          <GlassCard className="relative overflow-hidden p-5" glow={v.accent}>
            <span className="absolute -right-6 -top-8 text-8xl opacity-10">{v.emoji}</span>
            <div className="relative flex items-center gap-4">
              <span
                className={cn(
                  "font-display flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border text-lg font-black",
                  v.accent === "lime" && "border-lime/40 bg-lime/10 text-lime",
                  v.accent === "cyan" && "border-cyan/40 bg-cyan/10 text-cyan",
                  v.accent === "flare" && "border-flare/40 bg-flare/10 text-flare",
                )}
              >
                {initials}
              </span>
              <div className="min-w-0">
                <h1 className="font-display truncate text-2xl font-black uppercase">
                  {a.display_name}
                </h1>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {[a.sport, a.school, a.club_team].filter(Boolean).join(" · ") || "Athlete"}
                  {a.grad_year ? ` · Class of '${String(a.grad_year).slice(2)}` : ""}
                </p>
              </div>
            </div>
            <div className="relative mt-4 flex gap-2">
              <button
                onClick={() => dm.mutate()}
                className="glow-lime flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-black uppercase text-primary-foreground"
              >
                <MessageSquare size={14} /> Text
              </button>
              <button
                onClick={() => block.mutate()}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold",
                  blockRow
                    ? "border-lime/50 text-lime"
                    : "border-border text-muted-foreground",
                )}
              >
                <Ban size={14} /> {blockRow ? "Unblock" : "Block"}
              </button>
              <button
                onClick={() => setReporting((s) => !s)}
                className="flex items-center gap-1.5 rounded-xl border border-flare/40 px-3 py-2.5 text-xs font-bold text-flare"
              >
                <Flag size={14} /> Report
              </button>
            </div>
          </GlassCard>

          {reporting ? (
            <GlassCard className="space-y-3 p-4">
              <SectionTitle>Report {a.display_name}</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {REPORT_REASONS.map((r) => (
                  <Chip key={r} active={reason === r} onClick={() => setReason(r)}>
                    {r}
                  </Chip>
                ))}
              </div>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Anything else we should know? (optional)"
                rows={3}
                className="w-full rounded-xl border border-border bg-surface-2/60 p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-flare/60"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => report.mutate()}
                  disabled={report.isPending}
                  className="flex-1 rounded-xl bg-flare py-2.5 text-xs font-black uppercase text-background disabled:opacity-60"
                >
                  {report.isPending ? "Sending…" : "Send report"}
                </button>
                <button
                  onClick={() => setReporting(false)}
                  className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground"
                >
                  Cancel
                </button>
              </div>
            </GlassCard>
          ) : null}

          <div className="grid grid-cols-3 gap-2">
            <GlassCard className="flex flex-col items-center gap-1 p-3 text-center" glow="flare">
              <AnimatedFire size={20} />
              <span className="font-display text-lg font-black text-flare">{a.streak_days}</span>
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Day streak
              </p>
            </GlassCard>
            <GlassCard className="flex flex-col items-center gap-1 p-3 text-center" glow="lime">
              <AnimatedBolt size={22} />
              <span className="font-display text-base font-black text-lime">
                {formatVolume(a.total_volume)}
              </span>
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                30-day volume
              </p>
            </GlassCard>
            <GlassCard className="flex flex-col items-center gap-1 p-3 text-center" glow="cyan">
              <Trophy size={18} className="text-cyan" />
              <span className="font-display text-lg font-black text-cyan">
                {a.weekly_sessions}
              </span>
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Sessions this week
              </p>
            </GlassCard>
          </div>

          <GlassCard className="p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Last 30 days
            </p>
            <p className="font-display mt-1 text-xl font-black">
              {a.workout_count} sessions logged
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Last workout:{" "}
              {a.last_workout ? new Date(a.last_workout).toLocaleString() : "No sessions yet"}
            </p>
          </GlassCard>
        </>
      )}
    </div>
  );
}
