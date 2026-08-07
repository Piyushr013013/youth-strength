import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Play, ChevronRight, X, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { fetchRoutines } from "@/lib/api";
import { scheduleProgram } from "@/lib/schedule";
import { PROGRAMS, programGroups, type Program, type ProgramDay } from "@/lib/programs";
import { GlassCard, SectionTitle, Chip } from "@/components/ui-kit";
import { useActiveWorkout } from "@/lib/active-workout";
import { sportVisual } from "@/lib/sport-visuals";
import { programBadges } from "@/lib/program-badges";
import { TagChip } from "@/components/hype-bits";

export const Route = createFileRoute("/_authenticated/routines")({
  head: () => ({
    meta: [
      { title: "Programs & Routines — ATHLETE OS" },
      {
        name: "description",
        content:
          "Hundreds of sport-specific programs — football, cricket, soccer, powerlifting, bodybuilding, speed and more.",
      },
      { property: "og:title", content: "Programs & Routines — ATHLETE OS" },
      {
        property: "og:description",
        content: "Sport-by-sport program library plus your own custom routines.",
      },
    ],
  }),
  component: RoutinesPage,
});

function RoutinesPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { start, addExercises } = useActiveWorkout();
  const routines = useQuery({ queryKey: ["routines"], queryFn: fetchRoutines });
  const schedule = useMutation({
    mutationFn: (program: Program) => scheduleProgram(user.id, program, new Date()),
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ["scheduled"] });
      toast.success(`${count} sessions added to your calendar`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const groups = useMemo(() => programGroups(), []);
  const [group, setGroup] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Program | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROGRAMS.filter((p) => {
      if (group && p.group !== group) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        (p.group ?? "").toLowerCase().includes(q)
      );
    });
  }, [group, query]);

  const startDay = (program: Program, day: ProgramDay) => {
    start({ name: `${program.name} — ${day.day}`, exercises: [] });
    addExercises(day.exercises.map((e) => e.exerciseId));
    toast.success("Session started");
    setOpen(null);
    navigate({ to: "/log" });
  };


  return (
    <div className="space-y-5 pb-32">
      <div>
        <h1 className="font-display text-3xl font-bold">Programs</h1>
        <p className="text-xs text-muted-foreground">
          {PROGRAMS.length} programs across {groups.length} sports & goals
        </p>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search programs…"
          className="w-full rounded-xl border border-border bg-surface-2/70 py-3 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip active={!group} onClick={() => setGroup(null)}>
          All
        </Chip>
        {groups.map((g) => (
          <Chip
            key={g.group}
            active={group === g.group}
            onClick={() => setGroup(group === g.group ? null : g.group)}
          >
            {g.group} · {g.count}
          </Chip>
        ))}
      </div>

      <section>
        <SectionTitle>{group ?? "All programs"}</SectionTitle>
        <div className="space-y-2">
          {list.map((p) => {
            const v = sportVisual(p.group);
            return (
              <GlassCard key={p.id} className="cta-glass overflow-hidden p-4" glow={p.accent}>
                <button
                  type="button"
                  onClick={() => setOpen(p)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <span
                    className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border text-2xl ${
                      v.accent === "lime"
                        ? "border-lime/40 bg-lime/10"
                        : v.accent === "cyan"
                          ? "border-cyan/40 bg-cyan/10"
                          : "border-flare/40 bg-flare/10"
                    }`}
                  >
                    <span className="absolute -bottom-3 -right-2 text-5xl opacity-20" aria-hidden>
                      {v.emoji}
                    </span>
                    <span className="relative" aria-hidden>
                      {v.emoji}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-display block text-sm font-bold">{p.name}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{p.tagline}</span>
                    <span className="mt-2 flex flex-wrap gap-1">
                      {programBadges(p).map((b) => (
                        <TagChip key={b.label} badge={b} />
                      ))}
                    </span>
                  </span>
                  <ChevronRight size={18} className="mt-1 shrink-0 text-muted-foreground" />
                </button>
              </GlassCard>
            );
          })}
          {!list.length ? (
            <GlassCard className="p-5 text-sm text-muted-foreground">
              No programs match that search.
            </GlassCard>
          ) : null}
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
              No custom routines yet — build one from the Library tab.
            </GlassCard>
          ) : null}
        </div>
      </section>

      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border/60 bg-background/95 px-4 pb-3 pt-6 backdrop-blur">
            <div className="min-w-0">
              <h2 className="font-display truncate text-xl font-bold">{open.name}</h2>
              <p className="text-xs text-muted-foreground">
                {open.weeks} weeks · {open.daysPerWeek}x/wk · {open.level}
              </p>
            </div>
            <button
              onClick={() => setOpen(null)}
              className="flex shrink-0 items-center gap-1 rounded-xl border border-border bg-surface-2/80 px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
              aria-label="Close program"
            >
              <X size={16} /> Close
            </button>
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-32 pt-3">

            <p className="text-sm text-muted-foreground">{open.tagline}</p>
            <button
              onClick={() => schedule.mutate(open)}
              disabled={schedule.isPending}
              className="glow-lime flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-black uppercase tracking-wider text-primary-foreground disabled:opacity-60"
            >
              <CalendarPlus size={16} />
              {schedule.isPending ? "Adding…" : "Add whole plan to calendar"}
            </button>

            {open.days.map((d) => (
              <GlassCard key={d.day} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-sm font-bold">{d.day}</p>
                    <p className="text-xs text-muted-foreground">{d.focus}</p>
                  </div>
                  <button
                    onClick={() => startDay(open, d)}
                    className="flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground"
                  >
                    <Play size={13} /> Start
                  </button>
                </div>
                <ul className="mt-3 space-y-1">
                  {d.exercises.map((e, i) => (
                    <li key={`${e.exerciseId}-${i}`} className="flex justify-between text-xs">
                      <span className="truncate pr-2">{e.name}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {e.sets} × {e.reps}
                      </span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
