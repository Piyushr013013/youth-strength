import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MessageCircle, Search, Send, Trash2, Upload, Video } from "lucide-react";
import { toast } from "sonner";
import { GlassCard, SectionTitle } from "@/components/ui-kit";
import { searchExercises } from "@/lib/exercises";
import { askAboutForm, judgeForm } from "@/lib/form-check.functions";
import { Markdown } from "@/components/Markdown";
import {
  deleteFormCheck,
  extractFrames,
  fetchFormChecks,
  saveFormCheck,
  signedVideoUrl,
  uploadFormVideo,
} from "@/lib/form-checks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/form")({
  head: () => ({
    meta: [
      { title: "AI Form Judge — ATHLETE OS" },
      {
        name: "description",
        content: "Upload a lift clip and get an AI technique score, coaching cues and risk flags.",
      },
      { property: "og:title", content: "AI Form Judge — ATHLETE OS" },
      { property: "og:description", content: "AI technique scoring for your lifts." },
    ],
  }),
  component: FormJudgePage,
});

function FormJudgePage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const judge = useServerFn(judgeForm);
  const fileRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [exercise, setExercise] = useState<{ id: string; name: string } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<string | null>(null);

  const checks = useQuery({ queryKey: ["form-checks"], queryFn: fetchFormChecks });

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    return searchExercises(query).slice(0, 10);
  }, [query]);

  const run = useMutation({
    mutationFn: async () => {
      if (!file || !exercise) throw new Error("Pick an exercise and a clip first");
      setStage("Reading your clip…");
      const frames = await extractFrames(file, 5);
      setStage("Saving video…");
      let path: string | null = null;
      try {
        path = await uploadFormVideo(user.id, file);
      } catch {
        path = null;
      }
      setStage("Coach is watching…");
      const verdict = await judge({ data: { exerciseName: exercise.name, frames } });
      await saveFormCheck(user.id, {
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        video_path: path,
        score: Math.round(verdict.score),
        verdict: verdict.verdict,
        cues: [...verdict.cues, ...verdict.riskFlags.map((r) => `⚠ ${r}`)],
        feedback: verdict.feedback,
      });
    },
    onSuccess: () => {
      setStage(null);
      setFile(null);
      qc.invalidateQueries({ queryKey: ["form-checks"] });
      toast.success("Form review ready");
    },
    onError: (e: Error) => {
      setStage(null);
      toast.error(e.message);
    },
  });

  const remove = useMutation({
    mutationFn: ({ id, path }: { id: string; path: string | null }) => deleteFormCheck(id, path),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["form-checks"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5 pb-32">
      <div>
        <h1 className="font-display text-3xl font-bold">Form judge</h1>
        <p className="text-xs text-muted-foreground">
          Film a set from the side, upload it, and get scored on technique.
        </p>
      </div>

      <GlassCard className="space-y-3 p-5" glow="cyan">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={exercise ? exercise.name : query}
            onChange={(e) => {
              setExercise(null);
              setQuery(e.target.value);
            }}
            placeholder="Which lift is it?"
            className="w-full rounded-xl border border-border bg-surface-2/70 py-3 pl-9 pr-3 text-sm outline-none focus:border-primary/60"
          />
        </div>
        {!exercise && matches.length ? (
          <div className="space-y-1">
            {matches.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setExercise({ id: m.id, name: m.name });
                  setQuery("");
                }}
                className="block w-full rounded-lg border border-border/70 px-3 py-2 text-left text-sm"
              >
                {m.name}
              </button>
            ))}
          </div>
        ) : null}

        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          capture="environment"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold"
        >
          {file ? <Video size={16} /> : <Upload size={16} />}
          {file ? file.name.slice(0, 28) : "Record or upload clip"}
        </button>

        <button
          onClick={() => run.mutate()}
          disabled={run.isPending || !file || !exercise}
          className="glow-lime flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-black uppercase tracking-wider text-primary-foreground disabled:opacity-50"
        >
          {run.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
          {run.isPending ? (stage ?? "Analyzing…") : "Judge my form"}
        </button>
      </GlassCard>

      <section>
        <SectionTitle>Past reviews</SectionTitle>
        <div className="space-y-2">
          {(checks.data ?? []).map((c) => (
            <GlassCard key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{c.exercise_name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(c.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-display text-2xl font-bold",
                      (c.score ?? 0) >= 80
                        ? "text-lime"
                        : (c.score ?? 0) >= 60
                          ? "text-cyan"
                          : "text-flare",
                    )}
                  >
                    {c.score ?? "–"}
                  </span>
                  <button
                    onClick={() => remove.mutate({ id: c.id, path: c.video_path })}
                    aria-label="Delete review"
                    className="text-muted-foreground"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {c.verdict ? <p className="mt-2 text-sm">{c.verdict}</p> : null}
              {c.cues?.length ? (
                <ul className="mt-2 space-y-1">
                  {c.cues.map((cue, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      • {cue}
                    </li>
                  ))}
                </ul>
              ) : null}
              {c.feedback ? (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.feedback}</p>
              ) : null}
              <FormChat check={c} />
              {c.video_path ? (
                <button
                  onClick={async () => {
                    try {
                      window.open(await signedVideoUrl(c.video_path!), "_blank");
                    } catch (e) {
                      toast.error((e as Error).message);
                    }
                  }}
                  className="mt-3 text-xs font-semibold uppercase tracking-wider text-cyan"
                >
                  Watch clip
                </button>
              ) : null}
            </GlassCard>
          ))}
          {checks.data && !checks.data.length ? (
            <GlassCard className="p-5 text-sm text-muted-foreground">
              No reviews yet — film one working set from the side.
            </GlassCard>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function FormChat({
  check,
}: {
  check: {
    exercise_name: string;
    score: number | null;
    verdict: string | null;
    cues: string[];
    feedback: string | null;
  };
}) {
  const ask = useServerFn(askAboutForm);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  const send = useMutation({
    mutationFn: async (text: string) => {
      const history = [...turns, { role: "user" as const, content: text }];
      setTurns(history);
      const res = await ask({
        data: {
          exerciseName: check.exercise_name,
          score: check.score ?? 0,
          verdict: check.verdict ?? "",
          cues: check.cues ?? [],
          feedback: check.feedback ?? "",
          history,
        },
      });
      setTurns([...history, { role: "assistant", content: res.reply }]);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = () => {
    const text = input.trim();
    if (!text || send.isPending) return;
    setInput("");
    setOpen(true);
    send.mutate(text);
  };

  const quick = ["How do I fix this?", "Give me a drill", "Should I drop the weight?"];

  return (
    <div className="mt-3 border-t border-border/60 pt-3">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-lime"
        >
          <MessageCircle size={14} /> Ask Titan about this
        </button>
      ) : (
        <div className="space-y-2">
          {turns.map((t, i) => (
            <div
              key={i}
              className={cn(
                "rounded-xl px-3 py-2 text-xs leading-relaxed",
                t.role === "user"
                  ? "ml-6 bg-primary/15 text-foreground"
                  : "mr-2 border border-border/70 bg-surface-2/60",
              )}
            >
              {t.role === "assistant" ? <Markdown>{t.content}</Markdown> : t.content}
            </div>
          ))}
          {send.isPending ? (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 size={13} className="animate-spin" /> Titan is thinking…
            </p>
          ) : null}
          {!turns.length ? (
            <div className="flex flex-wrap gap-1.5">
              {quick.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput("");
                    send.mutate(q);
                  }}
                  className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="Ask about your form…"
              className="min-w-0 flex-1 rounded-xl border border-border bg-surface-2/70 px-3 py-2 text-xs outline-none focus:border-primary/60"
            />
            <button
              onClick={submit}
              disabled={send.isPending || !input.trim()}
              aria-label="Send"
              className="rounded-xl bg-primary p-2 text-primary-foreground disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
