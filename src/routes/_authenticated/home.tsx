import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Flame, Play, Sparkles, TrendingUp } from "lucide-react";
import { fetchProfile, fetchRoutines, fetchWorkouts } from "@/lib/api";
import { computeStreak, formatDuration, formatVolume } from "@/lib/fitness";
import { GlassCard, SectionTitle, StatTile } from "@/components/ui-kit";
import { PROGRAMS } from "@/lib/programs";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Dashboard — ATHLETE OS" },
      { name: "description", content: "Your streak, tonnage and next session at a glance." },
      { property: "og:title", content: "Dashboard — ATHLETE OS" },
      { property: "og:description", content: "Your streak, tonnage and next session." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile(user.id) });
  const workouts = useQuery({ queryKey: ["workouts"], queryFn: fetchWorkouts });
  const routines = useQuery({ queryKey: ["routines"], queryFn: fetchRoutines });

  useEffect(() => {
    if (profile.data && !profile.data.onboarded) navigate({ to: "/onboarding", replace: true });
  }, [profile.data, navigate]);

  const list = workouts.data ?? [];
  const tonnage = list.reduce((a, w) => a + Number(w.total_volume ?? 0), 0);
  const streak = computeStreak(list.map((w) => w.started_at));
  const thisWeek = list.filter(
    (w) => Date.now() - new Date(w.started_at).getTime() < 7 * 864e5,
  ).length;

  const suggested = PROGRAMS.filter((p) =>
    (profile.data?.tracks ?? []).some((t) => p.tracks.includes(t)),
  ).slice(0, 3);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Welcome back</p>
        <h1 className="font-display text-3xl font-bold">
          {profile.data?.display_name ?? "Athlete"}
        </h1>
        {profile.data?.sport ? (
          <p className="mt-1 text-xs text-cyan">{profile.data.sport} track</p>
        ) : null}
      </header>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/log" className="block">
          <GlassCard className="flex items-center gap-4 p-5" glow="lime">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-lime">
              <Play size={22} />
            </span>
            <div className="flex-1">
              <p className="font-display text-lg font-bold">Start a live workout</p>
              <p className="text-xs text-muted-foreground">Empty session, routine or program day</p>
            </div>
            <ChevronRight className="text-muted-foreground" size={18} />
          </GlassCard>
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/library"
          className="glow-lime flex items-center justify-center rounded-2xl bg-primary py-4 text-center text-sm font-black uppercase tracking-wider text-primary-foreground"
        >
          Exercise library
        </Link>
        <Link
          to="/builder"
          className="flex items-center justify-center rounded-2xl border border-cyan/50 bg-surface-2/60 py-4 text-center text-sm font-black uppercase tracking-wider text-cyan"
        >
          Build routine
        </Link>
        <Link
          to="/progress"
          className="flex items-center justify-center rounded-2xl border border-border bg-surface-2/60 py-4 text-center text-sm font-black uppercase tracking-wider"
        >
          Progress & PRs
        </Link>
        <Link
          to="/form"
          className="flex items-center justify-center rounded-2xl border border-flare/50 bg-surface-2/60 py-4 text-center text-sm font-black uppercase tracking-wider text-flare"
        >
          AI form judge
        </Link>
      </div>




      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Streak" value={`${streak}d`} accent="flare" />
        <StatTile label="This week" value={`${thisWeek}`} sub="sessions" accent="cyan" />
        <StatTile label="Tonnage" value={formatVolume(tonnage)} sub="lb lifted" />
      </div>

      <section>
        <SectionTitle
          action={
            <Link to="/routines" className="text-xs text-lime">
              All routines
            </Link>
          }
        >
          Your routines
        </SectionTitle>
        {routines.data?.length ? (
          <div className="space-y-2">
            {routines.data.slice(0, 3).map((r) => (
              <GlassCard key={r.id} className="flex items-center gap-3 p-4">
                <Sparkles size={16} className="text-cyan" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.exercises.length} exercises</p>
                </div>
                <Link
                  to="/log"
                  search={{ routine: r.id }}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                >
                  Start
                </Link>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="p-5 text-sm text-muted-foreground">
            No routines yet —{" "}
            <Link to="/routines" className="text-lime">
              grab a program
            </Link>{" "}
            or build your own.
          </GlassCard>
        )}
      </section>

      {suggested.length ? (
        <section>
          <SectionTitle>Picked for your track</SectionTitle>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {suggested.map((p) => (
              <Link key={p.id} to="/routines" className="w-56 shrink-0">
                <GlassCard className="h-full p-4" glow={p.accent}>
                  <p className="font-display text-sm font-bold">{p.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{p.tagline}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-wider text-cyan">
                    {p.weeks} weeks · {p.daysPerWeek}x/wk
                  </p>
                </GlassCard>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionTitle
          action={
            <Link to="/analysis" className="text-xs text-lime">
              Analyze
            </Link>
          }
        >
          Recent sessions
        </SectionTitle>
        <div className="space-y-2">
          {list.slice(0, 5).map((w) => (
            <GlassCard key={w.id} className="flex items-center gap-3 p-4">
              <Flame size={16} className="text-flare" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{w.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(w.started_at).toLocaleDateString()} · {formatDuration(w.duration_sec)} ·{" "}
                  {w.total_sets} sets
                </p>
              </div>
              <span className="flex items-center gap-1 text-xs text-lime">
                <TrendingUp size={13} /> {formatVolume(Number(w.total_volume))}
              </span>
            </GlassCard>
          ))}
          {!list.length ? (
            <GlassCard className="p-5 text-sm text-muted-foreground">
              Nothing logged yet. Your first session unlocks the analytics hub.
            </GlassCard>
          ) : null}
        </div>
      </section>
    </div>
  );
}
