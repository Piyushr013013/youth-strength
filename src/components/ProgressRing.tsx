import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Visual ring tracker — used instead of raw numbers on the dashboard. */
export function ProgressRing({
  value,
  goal,
  label,
  caption,
  accent = "lime",
  size = 96,
  children,
}: {
  value: number;
  goal: number;
  label?: string;
  caption?: string;
  accent?: "lime" | "cyan" | "flare";
  size?: number;
  children?: ReactNode;
}) {
  const pct = Math.max(0, Math.min(1, goal > 0 ? value / goal : 0));
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = accent === "lime" ? "var(--lime)" : accent === "cyan" ? "var(--cyan)" : "var(--flare)";

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--surface-2)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - pct) }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children ?? (
            <span
              className={cn(
                "font-display text-xl font-black leading-none",
                accent === "lime" && "text-lime",
                accent === "cyan" && "text-cyan",
                accent === "flare" && "text-flare",
              )}
            >
              {label ?? `${value}/${goal}`}
            </span>
          )}
        </div>
      </div>
      {caption ? (
        <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {caption}
        </p>
      ) : null}
    </div>
  );
}
