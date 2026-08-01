import { Link } from "@tanstack/react-router";
import { CheckCircle2, ClipboardList, Dumbbell, Loader2, Search, TrendingUp } from "lucide-react";
import type { UIMessage } from "ai";

type Part = UIMessage["parts"][number] & {
  type: string;
  state?: string;
  output?: unknown;
};

const META: Record<string, { label: string; icon: typeof Dumbbell }> = {
  "tool-create_routine": { label: "Building routine", icon: ClipboardList },
  "tool-search_exercises": { label: "Searching exercise library", icon: Search },
  "tool-get_training_report": { label: "Reading your training history", icon: TrendingUp },
};

/** Inline card for a coach tool call inside an assistant message. */
export function CoachToolCard({ part }: { part: Part }) {
  const meta = META[part.type];
  if (!meta) return null;
  const Icon = meta.icon;
  const done = part.state === "output-available";
  const output = (part.output ?? null) as
    | { ok?: boolean; routineId?: string; name?: string; exercises?: string[]; error?: string }
    | null;

  return (
    <div className="rounded-2xl border border-border bg-surface-2/50 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
        {done ? (
          <CheckCircle2 size={14} className="text-lime" />
        ) : (
          <Loader2 size={14} className="animate-spin text-cyan" />
        )}
        <Icon size={14} className="text-muted-foreground" />
        <span className="text-muted-foreground">{meta.label}</span>
      </div>

      {done && part.type === "tool-create_routine" && output?.ok ? (
        <div className="mt-2 space-y-1">
          <p className="text-sm font-semibold">{output.name}</p>
          <ul className="space-y-0.5 text-xs text-muted-foreground">
            {(output.exercises ?? []).map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <Link
            to="/routines"
            className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground"
          >
            <Dumbbell size={13} /> Open in Plans
          </Link>
        </div>
      ) : null}

      {done && output?.ok === false ? (
        <p className="mt-1 text-xs text-destructive">{output.error}</p>
      ) : null}
    </div>
  );
}
