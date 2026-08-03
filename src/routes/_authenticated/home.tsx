import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Dumbbell, Play, ScanFace, Sparkles, TrendingUp, Users } from "lucide-react";
import { fetchProfile, fetchRoutines, fetchWorkouts } from "@/lib/api";
import { computeStreak, formatDuration, formatVolume } from "@/lib/fitness";
import { GlassCard, SectionTitle } from "@/components/ui-kit";
import { StreakBanner } from "@/components/StreakFlame";
import { ProgressRing } from "@/components/ProgressRing";
import { levelFromXp } from "@/lib/history";
import { levelTitle, trainingXp } from "@/lib/levels";
import { sportVisual } from "@/lib/sport-visuals";
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

  const { level, progress, ceil } = useMemo(
    () => levelFromXp(trainingXp({ tonnage, sessions: list.length, prCount: 0 })),
    [tonnage, list.length],
  );
  const xp = trainingXp({ tonnage, sessions: list.length, prCount: 0 });

  const suggested = PROGRAMS.filter((p) =>
    (profile.data?.tracks ?? []).some((t) => p.tracks.includes(t)),
  ).slice(0, 4);

  return (
    <div className="space-y-4 pb-32">
      <header className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Welcome back</p>
          <h1 className="font-display truncate text-3xl font-bold">
            {profile.data?.display_name ?? "Athlete"}
          </h1>
          {profile.data?.sport ? (
            <p className="mt-1 text-xs text-cyan">
              {sportVisual(profile.data.sport).emoji} {profile.data.sport} track
            </p>
          ) : null}
        </div>
        <Link
          to="/profile"
          className="glass shrink-0 rounded-2xl px-3 py-2 text-right leading-tight"
        >
          <span className="font-display block text-lg font-black text-lime">LVL {level}</span>
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
            {levelTitle(level)}
          </span>
        </Link>
      </header>

      {/* ── Bento grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Hero action — full width */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-2"
        >
          <Link to="/log" className="block">
            <div className="glass glow-lime pulse-ring relative flex items-center gap-4 overflow-hidden rounded-2xl p-5">
              <span className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Play size={26} />
              </span>
              <div className="relative flex-1">
                <p className="font-display text-xl font-black uppercase tracking-wide">
                  Start training
                </p>
                <p className="text-xs text-muted-foreground">
                  Empty session, routine or program day
                </p>
              </div>
              <ChevronRight className="relative text-muted-foreground" size={20} />
            </div>
          </Link>
        </motion.div>

        {/* Streak — full width, animated flame */}
        <div className="col-span-2">
          <StreakBanner days={streak} />
        </div>

        {/* Weekly ring */}
        <GlassCard className="flex flex-col items-center justify-center p-4">
          <ProgressRing value={thisWeek} goal={4} accent="cyan" label={`${thisWeek}/4`} caption="This week" />
        </GlassCard>

        {/* Level ring + tonnage */}
        <div className="flex flex-col gap-3">
          <GlassCard className="flex items-center gap-3 p-4">
            <ProgressRing value={progress * 100} goal={100} accent="lime" size={54}>
              <span className="font-display text-xs font-black text-lime">{level}</span>
            </ProgressRing>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold">{levelTitle(level)}</p>
              <p className="text-[10px] text-muted-foreground">
                {xp}/{ceil} XP
              </p>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Tonnage</p>
            <p className="font-display text-xl font-black text-lime">{formatVolume(tonnage)}</p>
            <p className="text-[10px] text-muted-foreground">{list.length} sessions</p>
          </GlassCard>
        </div>

        {/* Glowing action tiles */}
        <Link to="/form" className="col-span-2">
          <div className="glass glow-flare relative flex items-center gap-3 overflow-hidden rounded-2xl p-4">
            <span className="absolute -left-6 bottom--6 h-24 w-24 rounded-full bg-flare/20 blur-2xl" />
            <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-flare/20 text-flare">
              <ScanFace size={20} />
            </span>
            <div className="relative flex-1">
              <p className="font-display text-base font-black uppercase tracking-wide text-flare">
                AI Form Judge
              </p>
              <p className="text-[11px] text-muted-foreground">Film a set, get scored 0–100</p>
            </div>
            <ChevronRight size={18} className="relative text-muted-foreground" />
          </div>
        </Link>

        <Link to="/library">
          <GlassCard className="flex h-full flex-col justify-between gap-2 p-4" glow="lime">
            <Dumbbell size={18} className="text-lime" />
            <p className="font-display text-sm font-black uppercase tracking-wide">Exercises</p>
          </GlassCard>
        </Link>
        <Link to="/builder">
          <GlassCard className="flex h-full flex-col justify-between gap-2 p-4" glow="cyan">
            <Sparkles size={18} className="text-cyan" />
            <p className="font-display text-sm font-black uppercase tracking-wide">Build routine</p>
          </GlassCard>
        </Link>
        <Link to="/progress">
          <GlassCard className="flex h-full flex-col justify-between gap-2 p-4">
            <TrendingUp size={18} className="text-lime" />
            <p className="font-display text-sm font-black uppercase tracking-wide">Progress & PRs</p>
          </GlassCard>
        </Link>
        <Link to="/friends">
          <GlassCard className="flex h-full flex-col justify-between gap-2 p-4">
            <Users size={18} className="text-cyan" />
            <p className="font-display text-sm font-black uppercase tracking-wide">Teammates</p>
          </GlassCard>
        </Link>
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
            {suggested.map((p) => {
              const v = sportVisual(p.group);
              return (
                <Link key={p.id} to="/routines" className="w-56 shrink-0">
                  <GlassCard className="relative h-full overflow-hidden p-4" glow={v.accent}>
                    <span className="absolute -right-4 -top-4 text-6xl opacity-20">{v.emoji}</span>
                    <span className="text-2xl">{v.emoji}</span>
                    <p className="font-display mt-2 text-sm font-bold">{p.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{p.tagline}</p>
                    <p className="mt-3 text-[11px] uppercase tracking-wider text-cyan">
                      {p.weeks} weeks · {p.daysPerWeek}x/wk
                    </p>
                  </GlassCard>
                </Link>
              );
            })}
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
              <span className="text-lg">🔥</span>
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
