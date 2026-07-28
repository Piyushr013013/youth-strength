import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, Dumbbell, Flame, LineChart, Timer, Zap } from "lucide-react";
import { useEffect } from "react";
import { GlassCard } from "@/components/ui-kit";
import { useAuthUser } from "@/hooks/useAuthUser";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ATHLETE OS — Training Tracker Built for Student Athletes" },
      {
        name: "description",
        content:
          "Log lifts, sprints and plyos, find your training gaps, and chase PRs. A mobile-first performance tracker for youth and high-school athletes.",
      },
      { property: "og:title", content: "ATHLETE OS — Training Tracker for Student Athletes" },
      {
        property: "og:description",
        content:
          "Prebuilt sport programs, a live workout logger, gap analysis and achievements — all in one athlete app.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Timer, title: "Live Workout Logger", copy: "Set timers, RPE, supersets, rest chimes." },
  { icon: Zap, title: "Sport Programs", copy: "Multi-week plans for 8+ sports and goals." },
  { icon: Activity, title: "Gap Analysis", copy: "Push/pull, upper/lower and cardio balance." },
  { icon: LineChart, title: "Progress Charts", copy: "e1RM curves, tonnage and streaks." },
];

function Landing() {
  const { user, loading } = useAuthUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/home", replace: true });
  }, [loading, user, navigate]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-5 pb-14 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-lime">
          <Flame size={13} /> Built for student athletes
        </span>
        <h1 className="font-display mt-5 text-5xl font-bold leading-[1.02]">
          TRAIN LIKE THE
          <span className="block text-gradient-neon">SCOREBOARD CARES</span>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          ATHLETE OS is a mobile-first performance tracker for youth and high-school athletes. Pick a
          sport track, run a prebuilt program or build your own, log every set live, and see exactly
          where your training is out of balance.
        </p>

        <div className="mt-7 flex gap-3">
          <Link
            to="/auth"
            className="flex-1 rounded-xl bg-primary py-3.5 text-center text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-[0_0_30px_-8px_var(--lime)]"
          >
            Start training
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signin" }}
            className="glass rounded-xl px-5 py-3.5 text-center text-sm font-semibold"
          >
            Sign in
          </Link>
        </div>
      </motion.div>

      <div className="mt-10 grid grid-cols-2 gap-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
          >
            <GlassCard className="h-full p-4">
              <f.icon size={20} className={i % 2 === 0 ? "text-lime" : "text-cyan"} />
              <p className="font-display mt-3 text-sm font-semibold">{f.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.copy}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard className="mt-4 flex items-center gap-4 p-5" glow="cyan">
        <Dumbbell className="shrink-0 text-cyan" size={26} />
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">130+ exercises</span> across weights,
          bodyweight, conditioning, agility &amp; recovery — searchable in a tap.
        </p>
      </GlassCard>
    </main>
  );
}
