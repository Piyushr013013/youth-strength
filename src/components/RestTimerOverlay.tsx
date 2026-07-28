import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useActiveWorkout } from "@/lib/active-workout";
import { formatDuration } from "@/lib/fitness";

export function RestTimerOverlay() {
  const { restRemaining, restSeconds, stopRest, startRest } = useActiveWorkout();
  const open = restRemaining !== null && restRemaining > 0;
  const pct = open ? 1 - (restRemaining ?? 0) / Math.max(restSeconds, 1) : 0;
  const circumference = 2 * Math.PI * 54;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 px-4 pb-28 backdrop-blur-md"
        >
          <motion.div
            initial={{ y: 40, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="glass glow-cyan w-full max-w-sm rounded-3xl p-6 text-center"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rest timer</p>
              <button onClick={stopRest} aria-label="Skip rest" className="text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="relative mx-auto mt-4 h-32 w-32">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r="54" className="fill-none stroke-border" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  className="fill-none stroke-cyan"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - pct)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-3xl font-bold text-cyan">
                  {formatDuration(restRemaining ?? 0)}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => startRest(Math.max(15, (restRemaining ?? 0) - 15))}
                className="flex items-center gap-1 rounded-xl border border-border bg-surface-2/70 px-4 py-2 text-sm"
              >
                <Minus size={14} /> 15s
              </button>
              <button
                onClick={() => startRest((restRemaining ?? 0) + 15)}
                className="flex items-center gap-1 rounded-xl border border-border bg-surface-2/70 px-4 py-2 text-sm"
              >
                <Plus size={14} /> 15s
              </button>
              <button
                onClick={stopRest}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
              >
                Skip
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
