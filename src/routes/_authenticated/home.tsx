import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Dumbbell,
  Play,
  ScanFace,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { fetchProfile, fetchRoutines, fetchWorkouts } from "@/lib/api";
import { fetchScheduled, isoDay } from "@/lib/schedule";
import { fetchPRs } from "@/lib/prs";
import { computeStreak, formatDuration, formatVolume } from "@/lib/fitness";
import { GlassCard, SectionTitle } from "@/components/ui-kit";
import { ProgressRing } from "@/components/ProgressRing";
import { levelFromXp } from "@/lib/history";
import { levelTitle, trainingXp } from "@/lib/levels";
import { sportVisual } from "@/lib/sport-visuals";
import { PROGRAMS } from "@/lib/programs";
import { AnimatedBolt, AnimatedFire, TagChip } from "@/components/hype-bits";
import { programBadges } from "@/lib/program-badges";
import { dailyCoachTip } from "@/lib/coach-tips";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Command Center — ATHLETE OS" },
      {
        name: "description",
        content:
          "Your streak, weekly goal ring, tonnage, PRs, next session and daily coach note in one high-energy dashboard.",
      },
      { property: "og:title", content: "Command Center — ATHLETE OS" },
      {
        property: "og:description",
        content: "Streak, weekly ring, tonnage, PRs and your next session at a glance.",
      },
    ],
  }),
  component: HomePage,
});

const FEATURED_IDS = ["off-season-soccer-agility", "vertical-jump", "speed-acceleration"];

function HomePage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile(user.id) });
  const workouts = useQuery({ queryKey: ["workouts"], queryFn: fetchWorkouts });
  const routines = useQuery({ queryKey: ["routines"], queryFn: fetchRoutines });
  const scheduled = useQuery({ queryKey: ["scheduled"], queryFn: fetchScheduled });
  const prs = useQuery({ queryKey: ["prs"], queryFn: fetchPRs });

  useEffect(() => {
    if (profile.data && !profile.data.onboarded) navigate({ to: "/onboarding", replace: true });
  }, [profile.data, navigate]);

  const list = workouts.data ?? [];
  const tonnage = list.reduce((a, w) => a + Number(w.total_volume ?? 0), 0);
  const streak = computeStreak(list.map((w) => w.started_at));
  const thisWeek = list.filter(
    (w) => Date.now() - new Date(w.started_at).getTime() < 7 * 864e5,
  ).length;
  const prCount = prs.data?.length ?? 0;

  const { level, progress, ceil } = useMemo(
    () => levelFromXp(trainingXp({ tonnage, sessions: list.length, prCount })),
    [tonnage, list.length, prCount],
  );
  const xp = trainingXp({ tonnage, sessions: list.length, prCount });

  /** Today's scheduled session, else the next upcoming one, else the newest routine. */
  const nextUp = useMemo(() => {
    const rows = (scheduled.data ?? []).filter((s) => !s.completed_at);
    const today = isoDay(new Date());
    const todays = rows.find((s) => s.scheduled_for === today);
    const upcoming = rows.find((s) => s.scheduled_for >= today);
    const pick = todays ?? upcoming;
    if (pick) {
      const sets = pick.exercises.reduce((a, e) => a + (e.sets || 3), 0);
      return {
        eyebrow: pick.scheduled_for === today ? "Today's session" : "Next session",
        title: pick.name,
        meta: [pick.focus, `${Math.max(20, Math.round((sets * 2.6 + 8) / 5) * 5)} Min`]
          .filter(Boolean)
          .join(" — "),
      };
    }
    const r = routines.data?.[0];
    if (r)
      return {
        eyebrow: "Next session",
        title: r.name,
        meta: `${r.exercises.length} exercises — your routine`,
      };
    return {
      eyebrow: "Next session",
      title: "Freestyle session",
      meta: "Build it as you go — pick exercises live",
    };
  }, [scheduled.data, routines.data]);

  const featured = useMemo(() => {
    const picked = FEATURED_IDS.map((id) => PROGRAMS.find((p) => p.id === id)).filter(
      (p): p is (typeof PROGRAMS)[number] => Boolean(p),
    );
    const tracked = PROGRAMS.filter(
      (p) =>
        !picked.includes(p) &&
        (profile.data?.tracks ?? []).some((t) => p.tracks.includes(t)),
    ).slice(0, 6);
    return [...picked, ...tracked].slice(0, 8);
  }, [profile.data?.tracks]);

  return (
    <div className="mx-auto w-full max-w-md space-y-5 pb-32">
      {/* ── Hero header ─────────────────────────────────── */}
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Command center
            </p>
            <h1 className="font-display truncate text-3xl font-black uppercase tracking-tight">
              Welcome back, {profile.data?.display_name ?? "Athlete"} 💪
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
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="glass glow-flare flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold">
            <AnimatedFire size={16} />
            <span className="text-flare">{streak}-Day Streak</span>
          </span>
          <span className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-lime">
            <Trophy size={13} /> {prCount} PRs
          </span>
          <span className="glass rounded-full px-3 py-1.5 text-xs font-bold text-cyan">
            {xp}/{ceil} XP
          </span>
        </div>
      </header>

      {/* ── Next workout CTA ────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass glow-lime pulse-ring cta-glass relative overflow-hidden rounded-3xl p-5">
          <span className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-primary/25 blur-3xl" />
          <p className="relative text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {nextUp.eyebrow}
          </p>
          <p className="font-display relative mt-1 text-2xl font-black uppercase leading-tight">
            {nextUp.title}
          </p>
          <p className="relative mt-1 text-xs text-muted-foreground">{nextUp.meta}</p>
          <Link
            to="/log"
            className="glow-lime relative mt-4 flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-black uppercase tracking-wide text-primary-foreground transition-transform active:scale-[0.98]"
          >
            <Play size={18} /> Start training
          </Link>
        </div>
      </motion.div>

      {/* ── Quick stats + weekly ring ───────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <GlassCard className="flex flex-col items-center gap-1 p-3 text-center" glow="cyan">
          <span className="font-display text-2xl font-black text-cyan">{thisWeek}</span>
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Workouts this week
          </p>
        </GlassCard>
        <GlassCard className="flex flex-col items-center gap-1 p-3 text-center" glow="lime">
          <AnimatedBolt size={24} />
          <span className="font-display text-lg font-black text-lime">
            {formatVolume(tonnage)}
          </span>
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Tonnage</p>
        </GlassCard>
        <GlassCard className="flex flex-col items-center gap-1 p-3 text-center" glow="flare">
          <Trophy size={20} className="text-flare" />
          <span className="font-display text-lg font-black text-flare">{prCount}</span>
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Personal records
          </p>
        </GlassCard>
      </div>

      <GlassCard className="flex items-center gap-4 p-4">
        <ProgressRing
          value={thisWeek}
          goal={4}
          accent="cyan"
          label={`${thisWeek}/4`}
          size={88}
        />
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-black uppercase tracking-wide">Weekly goal</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {thisWeek} of 4 workouts completed
            {thisWeek >= 4 ? " — goal smashed 🔥" : ` · ${4 - thisWeek} to go`}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <ProgressRing value={progress * 100} goal={100} accent="lime" size={40}>
              <span className="font-display text-[10px] font-black text-lime">{level}</span>
            </ProgressRing>
            <p className="text-[11px] text-muted-foreground">
              {levelTitle(level)} · {list.length} sessions logged
            </p>
          </div>
        </div>
      </GlassCard>

      {/* ── Daily coach note ────────────────────────────── */}
      <Link to="/coach" className="block">
        <GlassCard className="relative overflow-hidden p-4" glow="flare">
          <span className="absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-flare/20 blur-2xl" />
          <div className="relative flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-flare/20 text-lg">
              🧠
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-xs font-black uppercase tracking-[0.16em] text-flare">
                Coach note
              </p>
              <p className="mt-1 text-sm leading-snug">
                {dailyCoachTip(profile.data?.display_name ?? "")}
              </p>
              <p className="mt-2 text-[11px] font-bold text-cyan">Ask Titan AI →</p>
            </div>
          </div>
        </GlassCard>
      </Link>

      {/* ── Featured programs carousel ──────────────────── */}
      <section>
        <SectionTitle
          action={
            <Link to="/routines" className="text-xs text-lime">
              All programs
            </Link>
          }
        >
          Featured programs
        </SectionTitle>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
          {featured.map((p) => {
            const v = sportVisual(p.group);
            return (
              <Link key={p.id} to="/routines" className="w-56 shrink-0">
                <GlassCard className="relative h-full overflow-hidden p-4" glow={v.accent}>
                  <span className="absolute -right-4 -top-5 text-7xl opacity-15">{v.emoji}</span>
                  <span className="text-2xl">{v.emoji}</span>
                  <p className="font-display mt-2 text-sm font-black uppercase leading-tight">
                    {p.name}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.tagline}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {programBadges(p)
                      .slice(0, 3)
                      .map((b) => (
                        <TagChip key={b.label} badge={b} />
                      ))}
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Quick access tiles ──────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/form" className="col-span-2">
          <div className="glass glow-flare relative flex items-center gap-3 overflow-hidden rounded-2xl p-4">
            <span className="absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-flare/20 blur-2xl" />
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
              <AnimatedFire size={20} />
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
