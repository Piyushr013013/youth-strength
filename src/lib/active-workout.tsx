import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { findExercise } from "./exercises";
import type { ActiveWorkout, SetType, WorkoutExercise, WorkoutSet } from "./types";

const STORAGE_KEY = "athlete-os:active-workout";
const REST_KEY = "athlete-os:rest-default";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function makeSet(type: SetType = "normal", template?: Partial<WorkoutSet>): WorkoutSet {
  return {
    id: uid(),
    type,
    weight: template?.weight ?? null,
    reps: template?.reps ?? null,
    seconds: template?.seconds ?? null,
    rpe: template?.rpe ?? null,
    done: false,
  };
}

export function makeExercise(exerciseId: string, sets = 3): WorkoutExercise {
  const meta = findExercise(exerciseId);
  return {
    id: uid(),
    exerciseId,
    name: meta?.name ?? exerciseId,
    metric: meta?.metric ?? "weight_reps",
    supersetGroup: null,
    sets: Array.from({ length: sets }, () => makeSet()),
  };
}

interface Ctx {
  workout: ActiveWorkout | null;
  elapsed: number;
  restSeconds: number;
  restRemaining: number | null;
  restDefault: number;
  start: (init: { name: string; exercises: WorkoutExercise[]; routineId?: string | null }) => void;
  discard: () => void;
  update: (fn: (w: ActiveWorkout) => ActiveWorkout) => void;
  addExercises: (ids: string[]) => void;
  startRest: (seconds?: number) => void;
  stopRest: () => void;
  setRestDefault: (seconds: number) => void;
}

const ActiveWorkoutContext = createContext<Ctx | null>(null);

export function ActiveWorkoutProvider({ children }: { children: ReactNode }) {
  const [workout, setWorkout] = useState<ActiveWorkout | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const [restSeconds, setRestSeconds] = useState(90);
  const [restRemaining, setRestRemaining] = useState<number | null>(null);
  const [restDefault, setRestDefaultState] = useState(90);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setWorkout(JSON.parse(raw) as ActiveWorkout);
      const rd = localStorage.getItem(REST_KEY);
      if (rd) setRestDefaultState(Number(rd) || 90);
    } catch {
      /* ignore */
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      if (workout) localStorage.setItem(STORAGE_KEY, JSON.stringify(workout));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [workout]);

  useEffect(() => {
    if (!workout) {
      setElapsed(0);
      return;
    }
    const tick = () => setElapsed(Math.floor((Date.now() - workout.startedAt) / 1000));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [workout]);

  useEffect(() => {
    if (restEndsAt === null) {
      setRestRemaining(null);
      return;
    }
    const tick = () => {
      const left = Math.ceil((restEndsAt - Date.now()) / 1000);
      if (left <= 0) {
        setRestRemaining(0);
        setRestEndsAt(null);
        playChime();
      } else {
        setRestRemaining(left);
      }
    };
    tick();
    const t = setInterval(tick, 250);
    return () => clearInterval(t);
  }, [restEndsAt]);

  const start = useCallback<Ctx["start"]>((init) => {
    setWorkout({
      name: init.name,
      startedAt: Date.now(),
      exercises: init.exercises,
      routineId: init.routineId ?? null,
    });
  }, []);

  const discard = useCallback(() => {
    setWorkout(null);
    setRestEndsAt(null);
  }, []);

  const update = useCallback<Ctx["update"]>((fn) => {
    setWorkout((prev) => (prev ? fn(prev) : prev));
  }, []);

  const addExercises = useCallback((ids: string[]) => {
    setWorkout((prev) =>
      prev ? { ...prev, exercises: [...prev.exercises, ...ids.map((id) => makeExercise(id))] } : prev,
    );
  }, []);

  const startRest = useCallback(
    (seconds?: number) => {
      const s = seconds ?? restDefault;
      setRestSeconds(s);
      setRestEndsAt(Date.now() + s * 1000);
    },
    [restDefault],
  );

  const stopRest = useCallback(() => setRestEndsAt(null), []);

  const setRestDefault = useCallback((seconds: number) => {
    setRestDefaultState(seconds);
    try {
      localStorage.setItem(REST_KEY, String(seconds));
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      workout,
      elapsed,
      restSeconds,
      restRemaining,
      restDefault,
      start,
      discard,
      update,
      addExercises,
      startRest,
      stopRest,
      setRestDefault,
    }),
    [
      workout,
      elapsed,
      restSeconds,
      restRemaining,
      restDefault,
      start,
      discard,
      update,
      addExercises,
      startRest,
      stopRest,
      setRestDefault,
    ],
  );

  return <ActiveWorkoutContext.Provider value={value}>{children}</ActiveWorkoutContext.Provider>;
}

export function useActiveWorkout() {
  const ctx = useContext(ActiveWorkoutContext);
  if (!ctx) throw new Error("useActiveWorkout must be used inside ActiveWorkoutProvider");
  return ctx;
}

export function playChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    const ctx = new AudioCtor();
    const now = ctx.currentTime;
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.25, now + i * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 0.35);
    });
    setTimeout(() => void ctx.close(), 1200);
  } catch {
    /* audio not available */
  }
}
