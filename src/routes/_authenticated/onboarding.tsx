import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { TRACKS } from "@/lib/programs";
import { updateProfile } from "@/lib/api";
import { GlassCard } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Choose your track — ATHLETE OS" },
      { name: "description", content: "Pick your athletic goals to tailor your programs." },
      { property: "og:title", content: "Choose your track — ATHLETE OS" },
      { property: "og:description", content: "Pick your athletic goals." },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const { user } = Route.useRouteContext();
  const [tracks, setTracks] = useState<string[]>([]);
  const [sport, setSport] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const toggle = (id: string) =>
    setTracks((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  async function save() {
    if (!tracks.length) {
      toast.error("Pick at least one track");
      return;
    }
    setBusy(true);
    try {
      await updateProfile(user.id, {
        tracks,
        sport,
        onboarded: true,
        ...(name ? { display_name: name } : {}),
      });
      await qc.invalidateQueries({ queryKey: ["profile"] });
      navigate({ to: "/home", replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 pb-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Step 1 of 1</p>
        <h1 className="font-display text-3xl font-bold">What are you training for?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick every track that fits. We'll surface the right programs and gap alerts.
        </p>
      </header>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Display name (optional)"
        className="w-full rounded-xl border border-border bg-surface-2/70 px-4 py-3 text-sm outline-none focus:border-primary/60"
      />

      <div className="space-y-3">
        {TRACKS.map((t, i) => {
          const on = tracks.includes(t.id);
          return (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              type="button"
              onClick={() => toggle(t.id)}
              className="block w-full text-left"
            >
              <GlassCard className="flex items-start gap-3 p-4" glow={on ? "lime" : null}>
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
                    on ? "border-primary bg-primary text-primary-foreground" : "border-border",
                  )}
                >
                  {on ? <Check size={14} /> : null}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{t.name}</span>
                  <span className="block text-xs text-muted-foreground">{t.blurb}</span>
                </span>
              </GlassCard>
            </motion.button>
          );
        })}
      </div>

      {tracks.includes("sport") ? (
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Your sport</p>
          <div className="flex flex-wrap gap-2">
            {TRACKS[0].sports.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSport(sport === s ? null : s)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium",
                  sport === s
                    ? "border-transparent bg-accent text-accent-foreground"
                    : "border-border bg-surface-2/60 text-muted-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <button
        onClick={save}
        disabled={busy}
        className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-60"
      >
        Build my dashboard
      </button>
    </div>
  );
}
