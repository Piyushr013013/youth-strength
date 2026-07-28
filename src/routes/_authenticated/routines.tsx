import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchRoutines } from "@/lib/api";
import { PROGRAMS } from "@/lib/programs";
import { GlassCard, SectionTitle } from "@/components/ui-kit";

export const Route = createFileRoute("/_authenticated/routines")({
  head: () => ({
    meta: [
      { title: "Programs & Routines — ATHLETE OS" },
      { name: "description", content: "Prebuilt sport programs and your custom routines." },
      { property: "og:title", content: "Programs & Routines — ATHLETE OS" },
      { property: "og:description", content: "Prebuilt sport programs and custom routines." },
    ],
  }),
  component: RoutinesPage,
});

function RoutinesPage() {
  const routines = useQuery({ queryKey: ["routines"], queryFn: fetchRoutines });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Programs</h1>
      <section>
        <SectionTitle>Prebuilt library</SectionTitle>
        <div className="space-y-2">
          {PROGRAMS.map((p) => (
            <GlassCard key={p.id} className="p-4" glow={p.accent}>
              <p className="font-display text-sm font-bold">{p.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{p.tagline}</p>
              <p className="mt-2 text-[11px] uppercase tracking-wider text-cyan">
                {p.weeks} weeks · {p.daysPerWeek}x/wk
              </p>
            </GlassCard>
          ))}
        </div>
      </section>
      <section>
        <SectionTitle>Your routines</SectionTitle>
        <div className="space-y-2">
          {(routines.data ?? []).map((r) => (
            <GlassCard key={r.id} className="p-4">
              <p className="text-sm font-semibold">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.exercises.length} exercises</p>
            </GlassCard>
          ))}
          {!routines.data?.length ? (
            <GlassCard className="p-5 text-sm text-muted-foreground">
              No custom routines yet.
            </GlassCard>
          ) : null}
        </div>
      </section>
    </div>
  );
}
