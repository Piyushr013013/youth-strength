export type ExerciseCategory =
  | "resistance"
  | "calisthenics"
  | "cardio"
  | "athletic"
  | "recovery";

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core"
  | "full body"
  | "conditioning"
  | "mobility";

export type Pattern = "push" | "pull" | "legs" | "core" | "cardio" | "mobility";

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscles: MuscleGroup[];
  equipment: string;
  pattern: Pattern;
  metric: "weight_reps" | "reps" | "time" | "distance";
}

export type SetType = "warmup" | "normal" | "drop" | "failure";

export interface WorkoutSet {
  id: string;
  type: SetType;
  weight: number | null;
  reps: number | null;
  seconds: number | null;
  rpe: number | null;
  done: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  metric: Exercise["metric"];
  supersetGroup: number | null;
  notes?: string;
  sets: WorkoutSet[];
}

export interface ActiveWorkout {
  name: string;
  startedAt: number;
  exercises: WorkoutExercise[];
  routineId?: string | null;
}

export interface SavedWorkout {
  id: string;
  name: string;
  started_at: string;
  finished_at: string;
  duration_sec: number;
  total_volume: number;
  total_sets: number;
  notes: string | null;
  exercises: WorkoutExercise[];
}

export interface RoutineExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  supersetGroup?: number | null;
}

export interface Routine {
  id: string;
  name: string;
  description: string | null;
  source: string;
  program_id: string | null;
  exercises: RoutineExercise[];
  created_at?: string;
}

export interface Profile {
  id: string;
  display_name: string;
  sport: string | null;
  tracks: string[];
  body_weight: number | null;
  unit: string;
  onboarded: boolean;
}
