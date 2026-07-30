import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProfile, fetchWorkouts } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard, SectionTitle, StatTile } from "@/components/ui-kit";
import { computeStreak, formatVolume, workoutVolume } from "@/lib/fitness";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile & Training Calendar — ATHLETE OS" },
      {
        name: "description",
        content:
          "Your athlete profile, streaks, lifetime tonnage and a month-by-month training calendar.",
      },
      { property: "og:title", content: "Your Profile & Training Calendar — ATHLETE OS" },
      {
        property: "og:description",
        content: "Streaks, tonnage and a Hevy-style training calendar.",
      },
    ],
  }),
  component: ProfilePage,
});

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile(user.id) });
  const workouts = useQuery({ queryKey: ["workouts"], queryFn: fetchWorkouts });

  const stats = useMemo(() => {
    const list = workouts.data ?? [];
    const byDay = new Map<string, { count: number; volume: number }>();
    let volume = 0;
    for (const w of list) {
      const v = workoutVolume(w.exercises);
      volume += v;
      const key = new Date(w.started_at).toISOString().slice(0, 10);
      const cur = byDay.get(key) ?? { count: 0, volume: 0 };
      byDay.set(key, { count: cur.count + 1, volume: cur.volume + v });
    }
    return {
      total: list.length,
      volume,
      byDay,
      streak: computeStreak([...byDay.keys()]),
    };
  }, [workouts.data]);

  const months = useMemo(() => {
    const now = new Date();
    return [2, 1, 0].map((back) => {
      const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
      const first = new Date(d.getFullYear(), d.getMonth(), 1);
      const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      const cells: (string | null)[] = Array.from({ length: first.getDay() }, () => null);
      for (let i = 1; i <= days; i++) {
        cells.push(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
        );
      }
      return {
        label: d.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
        cells,
      };
    });
  }, []);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="space-y-5 pb-32">
      <h1 className="font-display text-3xl font-bold">Profile</h1>

      <GlassCard className="p-5">
        <p className="font-display text-lg font-bold">{profile.data?.display_name ?? "Athlete"}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
        {profile.data?.sport ? <p className="mt-2 text-xs text-cyan">{profile.data.sport}</p> : null}
      </GlassCard>

      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Sessions" value={String(stats.total)} />
        <StatTile label="Tonnage" value={formatVolume(stats.volume)} />
        <StatTile label="Streak" value={`${stats.streak}d`} />
      </div>

      <section>
        <SectionTitle>Training calendar</SectionTitle>
        <div className="space-y-3">
          {months.map((m) => (
            <GlassCard key={m.label} className="p-4">
              <p className="font-display text-sm font-bold">{m.label}</p>
              <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                {DOW.map((d, i) => (
                  <span key={i} className="text-[10px] uppercase text-muted-foreground">
                    {d}
                  </span>
                ))}
                {m.cells.map((key, i) => {
                  const entry = key ? stats.byDay.get(key) : undefined;
                  const isToday = key === new Date().toISOString().slice(0, 10);
                  return (
                    <span
                      key={i}
                      title={entry ? `${entry.count} session(s) · ${formatVolume(entry.volume)}` : key ?? ""}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-md text-[10px] font-semibold",
                        !key && "opacity-0",
                        key && !entry && "bg-surface-2/60 text-muted-foreground",
                        entry && "bg-primary/70 text-primary-foreground",
                        entry && entry.count > 1 && "bg-primary glow-lime",
                        isToday && "ring-1 ring-cyan",
                      )}
                    >
                      {key ? Number(key.slice(-2)) : ""}
                    </span>
                  );
                })}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Recent sessions</SectionTitle>
        <div className="space-y-2">
          {(workouts.data ?? []).slice(0, 8).map((w) => (
            <GlassCard key={w.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{w.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(w.started_at).toLocaleDateString()} · {w.exercises.length} exercises
                </p>
              </div>
              <p className="font-display text-sm font-bold text-lime">
                {formatVolume(workoutVolume(w.exercises))}
              </p>
            </GlassCard>
          ))}
          {!workouts.data?.length ? (
            <GlassCard className="p-5 text-sm text-muted-foreground">
              No sessions logged yet.
            </GlassCard>
          ) : null}
        </div>
      </section>

      <button
        onClick={signOut}
        className="w-full rounded-xl border border-border py-3 text-sm font-semibold text-flare"
      >
        Sign out
      </button>
    </div>
  );
}
