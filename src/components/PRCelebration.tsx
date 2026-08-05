import { AnimatePresence, motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useEffect } from "react";

export interface PRPayload {
  id: string;
  exercise: string;
  detail: string;
}

const PARTICLES = Array.from({ length: 22 }, (_, i) => i);

export function PRCelebration({
  pr,
  onDone,
  onShare,
}: {
  pr: PRPayload | null;
  onDone: () => void;
  onShare?: (pr: PRPayload) => void;
}) {
  useEffect(() => {
    if (!pr) return;
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [pr, onDone]);

  return (
    <AnimatePresence>
      {pr ? (
        <motion.div
          key={pr.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDone}
          className="pointer-events-auto fixed inset-0 z-[60] flex items-center justify-center bg-background/70 px-6 backdrop-blur-sm"
        >
          <div className="relative">
            {PARTICLES.map((i) => {
              const angle = (i / PARTICLES.length) * Math.PI * 2;
              const dist = 90 + (i % 5) * 26;
              return (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    opacity: 0,
                    scale: 0.3,
                  }}
                  transition={{ duration: 1.4, ease: "easeOut", delay: (i % 4) * 0.06 }}
                  className={`absolute left-1/2 top-1/2 h-2 w-2 rounded-full ${
                    i % 3 === 0 ? "bg-lime" : i % 3 === 1 ? "bg-cyan" : "bg-flare"
                  }`}
                />
              );
            })}
            <motion.div
              initial={{ scale: 0.6, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
              className="glass glow-lime relative rounded-3xl px-8 py-7 text-center"
            >
              <Trophy className="mx-auto text-lime" size={34} />
              <p className="font-display mt-3 text-xl font-bold text-gradient-neon">
                NEW PERSONAL RECORD
              </p>
              <p className="mt-1 text-sm font-semibold">{pr.exercise}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{pr.detail}</p>
              {onShare ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(pr);
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-cyan/50 bg-surface-2/70 px-5 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-cyan"
                >
                  <Share2 size={14} /> Make PR card
                </button>
              ) : null}
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
