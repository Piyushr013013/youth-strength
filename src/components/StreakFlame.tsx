import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Animated flame streak counter — Duolingo/Snapchat style habit hook. */
export function StreakFlame({
  days,
  size = "md",
  className,
}: {
  days: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const hot = days >= 7;
  const blazing = days >= 30;
  const dims = size === "lg" ? 68 : size === "md" ? 48 : 32;

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {days > 0 ? (
        <motion.span
          aria-hidden
          className={cn(
            "absolute rounded-full blur-xl",
            blazing ? "bg-flare/50" : hot ? "bg-flare/35" : "bg-primary/25",
          )}
          style={{ width: dims, height: dims }}
          animate={{ opacity: [0.45, 0.9, 0.45], scale: [0.9, 1.12, 0.9] }}
          transition={{ duration: blazing ? 1.1 : 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
      <motion.svg
        viewBox="0 0 24 24"
        width={dims}
        height={dims}
        className="relative"
        animate={
          days > 0
            ? { scale: [1, 1.08, 0.98, 1], rotate: [0, -2.5, 2.5, 0] }
            : { scale: 1, rotate: 0 }
        }
        transition={{ duration: blazing ? 1 : 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="flame-hot" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="var(--flare)" />
            <stop offset="55%" stopColor="var(--chart-4)" />
            <stop offset="100%" stopColor="var(--lime)" />
          </linearGradient>
          <linearGradient id="flame-cold" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="var(--border)" />
            <stop offset="100%" stopColor="var(--muted-foreground)" />
          </linearGradient>
        </defs>
        <path
          d="M12 2.2c2.6 3.1 3.1 4.6 2.4 6.4 1.5-.6 2.2-1.9 2.3-3.3 2 2.3 3.3 5 3.3 7.7 0 4.4-3.6 8-8 8s-8-3.6-8-8c0-3.9 2.6-6.7 5.4-9.1.9-.8 1.9-1.6 2.6-1.7Z"
          fill={days > 0 ? "url(#flame-hot)" : "url(#flame-cold)"}
        />
        <motion.path
          d="M12 11c1.6 1.7 2.2 2.9 2.2 4.2 0 1.9-1.4 3.3-3.2 3.3-1.7 0-3-1.3-3-3 0-1.9 1.7-3.2 4-4.5Z"
          fill="var(--background)"
          opacity={0.55}
          animate={days > 0 ? { opacity: [0.35, 0.65, 0.35] } : { opacity: 0.3 }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      </motion.svg>
    </div>
  );
}

export function StreakBanner({ days }: { days: number }) {
  const next = days >= 30 ? null : days >= 7 ? 30 : 7;
  return (
    <div
      className={cn(
        "glass relative flex items-center gap-4 overflow-hidden rounded-2xl p-4",
        days >= 7 ? "glow-flare" : "glow-lime",
      )}
    >
      <StreakFlame days={days} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="font-display text-3xl font-black leading-none">
          {days}
          <span className="ml-1 text-base font-bold text-muted-foreground">day streak</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {days === 0
            ? "Train today to light the flame."
            : days >= 30
              ? "30+ days. Absolutely blazing."
              : next
                ? `${next - days} more day${next - days === 1 ? "" : "s"} to hit your ${next}-day badge.`
                : ""}
        </p>
      </div>
    </div>
  );
}
