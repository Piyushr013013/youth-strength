import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchWorkouts } from "@/lib/api";
import { GlassCard, SectionTitle } from "@/components/ui-kit";
import { formatVolume } from "@/lib/fitness";

export const Route = createFileRoute("/_authenticated/analysis")({
  head: () => ({
    meta: [
      { title: "Gap Analysis — ATHLETE OS" },
      { name: "description", content: "See where your training is out of balance." },
      { property: "og:title", content: "Gap Analysis — ATHLETE OS" },
      { property: "og:description", content: "See where your training is out of balance." },
    ],
  }),
  component: AnalysisPage,
});

function AnalysisPage() {
  const workouts = useQuery({ queryKey: ["workouts"], queryFn: fetchWorkouts });
  const list = workouts.data ?? [];
  const tonnage = list.reduce((a, w) => a + Number(w.total_volume ?? 0), 0);
  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-bold">Analysis</h1>
      <SectionTitle>Training load</SectionTitle>
      <GlassCard className="p-5" glow="cyan">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Total tonnage</p>
        <p className="font-display text-3xl font-bold text-lime">{formatVolume(tonnage)}</p>
        <p className="mt-1 text-xs text-muted-foreground">{list.length} sessions logged</p>
      </GlassCard>
      {!list.length ? (
        <GlassCard className="p-5 text-sm text-muted-foreground">
          Log a few sessions to unlock push/pull and upper/lower balance insights.
        </GlassCard>
      ) : null}
    </div>
  );
}
