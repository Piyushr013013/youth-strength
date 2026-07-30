import { useMemo, useState } from "react";
import { Search, Plus, Check } from "lucide-react";
import { CATEGORY_META, EQUIPMENT_FILTERS, MUSCLE_FILTERS, searchExercises } from "@/lib/exercises";
import type { ExerciseCategory } from "@/lib/types";
import { Chip } from "./ui-kit";
import { cn } from "@/lib/utils";

export function ExercisePicker({
  onConfirm,
  confirmLabel = "Add",
}: {
  onConfirm: (ids: string[]) => void;
  confirmLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ExerciseCategory | null>(null);
  const [muscle, setMuscle] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const results = useMemo(
    () => searchExercises(query, { category, muscle, equipment }),
    [query, category, muscle, equipment],
  );

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="flex h-full flex-col">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises, muscles, equipment…"
          className="w-full rounded-xl border border-border bg-surface-2/70 py-3 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
        />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        <Chip active={!category} onClick={() => setCategory(null)}>
          All
        </Chip>
        {(Object.keys(CATEGORY_META) as ExerciseCategory[]).map((c) => (
          <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>
            {CATEGORY_META[c].short}
          </Chip>
        ))}
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {MUSCLE_FILTERS.map((m) => (
          <Chip key={m} active={muscle === m} onClick={() => setMuscle(muscle === m ? null : m)}>
            {m}
          </Chip>
        ))}
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {EQUIPMENT_FILTERS.map((eq) => (
          <Chip
            key={eq}
            active={equipment === eq}
            onClick={() => setEquipment(equipment === eq ? null : eq)}
          >
            {eq}
          </Chip>
        ))}
      </div>

      <div className="mt-3 flex-1 space-y-2 overflow-y-auto pb-44">
        {results.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No exercises match that search.
          </p>
        ) : null}
        {results.map((ex) => {
          const on = selected.includes(ex.id);
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => toggle(ex.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                on
                  ? "border-primary/60 bg-primary/10"
                  : "border-border/70 bg-surface/60 hover:border-border",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs",
                  on ? "border-primary bg-primary text-primary-foreground" : "border-border",
                )}
              >
                {on ? <Check size={15} /> : <Plus size={15} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{ex.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {ex.equipment} · {ex.muscles.join(", ")}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {selected.length > 0 ? (
        <div className="sticky bottom-0 -mx-1 bg-gradient-to-t from-background via-background/95 to-transparent px-1 pb-1 pt-3">
          <button
            type="button"
            onClick={() => {
              onConfirm(selected);
              setSelected([]);
            }}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground"
          >
            {confirmLabel} {selected.length} exercise{selected.length > 1 ? "s" : ""}
          </button>
        </div>
      ) : null}
    </div>
  );
}
