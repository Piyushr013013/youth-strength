import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function GlassCard({
  children,
  className,
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: "lime" | "cyan" | "flare" | null;
}) {
  return (
    <div
      className={cn(
        "glass rounded-2xl",
        glow === "lime" && "glow-lime",
        glow === "cyan" && "glow-cyan",
        glow === "flare" && "glow-flare",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatTile({
  label,
  value,
  sub,
  accent = "lime",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "lime" | "cyan" | "flare";
}) {
  return (
    <GlassCard className="p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p
        className={cn(
          "font-display mt-1 text-2xl font-bold",
          accent === "lime" && "text-lime",
          accent === "cyan" && "text-cyan",
          accent === "flare" && "text-flare",
        )}
      >
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
    </GlassCard>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {children}
      </h2>
      {action}
    </div>
  );
}

export function Chip({
  children,
  active,
  onClick,
  tone = "default",
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  tone?: "default" | "lime" | "cyan" | "flare";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-transparent bg-primary text-primary-foreground shadow-[0_0_20px_-6px_var(--lime)]"
          : "border-border bg-surface-2/60 text-muted-foreground hover:text-foreground",
        !active && tone === "cyan" && "text-cyan",
        !active && tone === "flare" && "text-flare",
      )}
    >
      {children}
    </button>
  );
}
