import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Flame, Trophy } from "lucide-react";
import { fetchWorkouts } from "@/lib/api";
import { GlassCard, SectionTitle, StatTile, Chip } from "@/components/ui-kit";
import {
  bestE1RMs,
  buildBadges,
  computeStreak,
  formatVolume,
  analyzeVolume,
} from "@/lib/fitness";
import { e1rmSeries, levelFromXp, trainedExercises } from "@/lib/history";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({
    meta: [
      { title: "Progress, 1RM Charts & Badges — ATHLETE OS" },
      {
        name: "description",
        content:
          "Track estimated 1RM per lift, personal records, training XP and unlockable badges.",
      },
      { property: "og:title", content: "Progress, 1RM Charts & Badges — ATHLETE OS" },
      { property: "og:description", content: "1RM charts, PRs, XP levels and badges." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const workouts = useQuery({ queryKey: ["workouts"], queryFn: fetchWorkouts });
  const list = workouts.data ?? [];
  const [selected, setSelected] = useState<string | null>(null);

  const exercises = useMemo(() => trainedExercises(list), [list]);
  const activeId = selected ?? exercises[0]?.id ?? null;
  const series = useMemo(
    () => (activeId ? e1rmSeries(list, activeId) : []),
    [list, activeId],
  );
  const prs = useMemo(() => [...bestE1RMs(list).values()].sort((a, b) => b.value - a.value), [list]);

  const tonnage = list.reduce((a, w) => a + Number(w.total_volume ?? 0), 0);
  const streak = computeStreak(list.map((w) => w.started_at));
  const breakdown = useMemo(() => analyzeVolume(list), [list]);
  const xp = Math.round(tonnage / 100 + list.length * 60 + prs.length * 40);
  const { level, progress, ceil } = levelFromXp(xp);
  const badges = buildBadges({
    workouts: list.length,
    tonnage,
    streak,
    cardioSets: breakdown.cardioSets,
    prCount: prs.length,
  });

  return (
    <div className="space-y-5 pb-32">
      <div>
        <h1 className="font-display text-3xl font-bold">Progress</h1>
        <p className="text-xs text-muted-foreground">Strength curves, PRs and unlocks.</p>
      </div>

      <GlassCard className="p-5" glow="lime">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Athlete level
            </p>
            <p className="font-display text-4xl font-bold text-lime">{level}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {xp} / {ceil} XP
          </p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </GlassCard>

      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Sessions" value={String(list.length)} />
        <StatTile label="Tonnage" value={formatVolume(tonnage)} accent="cyan" />
        <StatTile label="Streak" value={`${streak}d`} accent="flare" />
      </div>

      <section>
        <SectionTitle>Estimated 1RM</SectionTitle>
        {exercises.length ? (
          <>
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {exercises.slice(0, 12).map((e) => (
                <Chip key={e.id} active={e.id === activeId} onClick={() => setSelected(e.id)}>
                  {e.name}
                </Chip>
              ))}
            </div>
            <GlassCard className="p-4">
              {series.length > 1 ? (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: "rgba(255,255,255,0.45)" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "rgba(255,255,255,0.45)" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#0f1117",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="e1rm"
                        name="Est. 1RM"
                        stroke="var(--lime)"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Log this lift at least twice to see a curve.
                </p>
              )}
            </GlassCard>
          </>
        ) : (
          <GlassCard className="p-5 text-sm text-muted-foreground">
            Finish a workout to unlock strength charts.
          </GlassCard>
        )}
      </section>

      <section>
        <SectionTitle>Personal records</SectionTitle>
        <div className="space-y-2">
          {prs.slice(0, 12).map((p) => (
            <GlassCard key={p.name} className="flex items-center justify-between p-3">
              <span className="flex min-w-0 items-center gap-2">
                <Trophy size={14} className="shrink-0 text-lime" />
                <span className="truncate text-sm">{p.name}</span>
              </span>
              <span className="font-display shrink-0 text-sm font-bold text-lime">
                {p.value} e1RM
              </span>
            </GlassCard>
          ))}
          {!prs.length ? (
            <p className="text-sm text-muted-foreground">No PRs recorded yet.</p>
          ) : null}
        </div>
      </section>

      <section>
        <SectionTitle>Badges</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {badges.map((b) => (
            <GlassCard
              key={b.id}
              className={cn("p-4", b.earned ? "border border-primary/40" : "opacity-70")}
            >
              <Flame size={16} className={b.earned ? "text-lime" : "text-muted-foreground"} />
              <p className="mt-2 text-sm font-semibold">{b.name}</p>
              <p className="text-[11px] text-muted-foreground">{b.detail}</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn("h-full rounded-full", b.earned ? "bg-primary" : "bg-cyan/60")}
                  style={{ width: `${Math.round(b.progress * 100)}%` }}
                />
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
}
