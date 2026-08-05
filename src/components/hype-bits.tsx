import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ProgramBadge } from "@/lib/program-badges";

/** Tag pill used on program cards. */
export function TagChip({ badge }: { badge: ProgramBadge }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        badge.tone === "lime" && "border-lime/35 bg-lime/10 text-lime",
        badge.tone === "cyan" && "border-cyan/35 bg-cyan/10 text-cyan",
        badge.tone === "flare" && "border-flare/35 bg-flare/10 text-flare",
      )}
    >
      <span aria-hidden>{badge.emoji}</span>
      {badge.label}
    </span>
  );
}

/** Glowing, pulsing bolt used for tonnage. */
export function AnimatedBolt({ size = 26 }: { size?: number }) {
  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full bg-lime/40 blur-lg"
        animate={{ opacity: [0.35, 0.9, 0.35], scale: [0.85, 1.15, 0.85] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className="relative"
        animate={{ scale: [1, 1.12, 1], rotate: [0, -3, 3, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="bolt-grad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--cyan)" />
            <stop offset="100%" stopColor="var(--lime)" />
          </linearGradient>
        </defs>
        <path d="M13.2 2 5 13.4h5.1L9.6 22 19 10.2h-5.4L13.2 2Z" fill="url(#bolt-grad)" />
      </motion.svg>
    </span>
  );
}

/** Small animated fire mark for inline streak counters. */
export function AnimatedFire({ size = 20 }: { size?: number }) {
  return (
    <motion.span
      className="inline-block"
      style={{ fontSize: size, lineHeight: 1 }}
      animate={{ scale: [1, 1.18, 1], rotate: [0, -6, 6, 0] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      🔥
    </motion.span>
  );
}
