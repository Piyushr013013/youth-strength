import type { Exercise, ExerciseCategory } from "./types";
import { EXTRA_EXERCISES } from "./exercises-extended";
import { MORE_EXERCISES } from "./exercises-more";
import { SPORT_EXERCISES } from "./exercises-sports";


const e = (
  id: string,
  name: string,
  category: ExerciseCategory,
  muscles: Exercise["muscles"],
  equipment: string,
  pattern: Exercise["pattern"],
  metric: Exercise["metric"] = "weight_reps",
): Exercise => ({ id, name, category, muscles, equipment, pattern, metric });

const BASE_EXERCISES: Exercise[] = [
  // ---------- Resistance & Weightlifting ----------
  e("bb-back-squat", "Barbell Back Squat", "resistance", ["quads", "glutes"], "Barbell", "legs"),
  e("bb-front-squat", "Barbell Front Squat", "resistance", ["quads", "core"], "Barbell", "legs"),
  e("bb-deadlift", "Barbell Deadlift", "resistance", ["hamstrings", "back", "glutes"], "Barbell", "pull"),
  e("bb-rdl", "Romanian Deadlift", "resistance", ["hamstrings", "glutes"], "Barbell", "pull"),
  e("bb-bench", "Barbell Bench Press", "resistance", ["chest", "triceps"], "Barbell", "push"),
  e("bb-incline-bench", "Incline Barbell Press", "resistance", ["chest", "shoulders"], "Barbell", "push"),
  e("bb-ohp", "Standing Overhead Press", "resistance", ["shoulders", "triceps"], "Barbell", "push"),
  e("bb-row", "Barbell Bent-Over Row", "resistance", ["back", "biceps"], "Barbell", "pull"),
  e("bb-hip-thrust", "Barbell Hip Thrust", "resistance", ["glutes", "hamstrings"], "Barbell", "legs"),
  e("bb-power-clean", "Power Clean", "resistance", ["full body", "quads"], "Barbell", "pull"),
  e("bb-push-press", "Push Press", "resistance", ["shoulders", "quads"], "Barbell", "push"),
  e("bb-hang-snatch", "Hang Power Snatch", "resistance", ["full body", "shoulders"], "Barbell", "pull"),
  e("db-bench", "Dumbbell Bench Press", "resistance", ["chest", "triceps"], "Dumbbell", "push"),
  e("db-incline", "Incline Dumbbell Press", "resistance", ["chest", "shoulders"], "Dumbbell", "push"),
  e("db-shoulder-press", "Dumbbell Shoulder Press", "resistance", ["shoulders", "triceps"], "Dumbbell", "push"),
  e("db-lateral-raise", "Dumbbell Lateral Raise", "resistance", ["shoulders"], "Dumbbell", "push"),
  e("db-row", "One-Arm Dumbbell Row", "resistance", ["back", "biceps"], "Dumbbell", "pull"),
  e("db-curl", "Dumbbell Biceps Curl", "resistance", ["biceps"], "Dumbbell", "pull"),
  e("db-hammer-curl", "Hammer Curl", "resistance", ["biceps"], "Dumbbell", "pull"),
  e("db-bulgarian", "Bulgarian Split Squat", "resistance", ["quads", "glutes"], "Dumbbell", "legs"),
  e("db-walking-lunge", "Walking Lunge", "resistance", ["quads", "glutes"], "Dumbbell", "legs"),
  e("db-step-up", "Dumbbell Step-Up", "resistance", ["quads", "glutes"], "Dumbbell", "legs"),
  e("db-farmer", "Farmer's Carry", "resistance", ["core", "full body"], "Dumbbell", "core", "time"),
  e("kb-swing", "Kettlebell Swing", "resistance", ["glutes", "hamstrings"], "Kettlebell", "pull"),
  e("kb-goblet-squat", "Goblet Squat", "resistance", ["quads", "glutes"], "Kettlebell", "legs"),
  e("kb-turkish-getup", "Turkish Get-Up", "resistance", ["core", "shoulders"], "Kettlebell", "core"),
  e("kb-clean-press", "Kettlebell Clean & Press", "resistance", ["shoulders", "full body"], "Kettlebell", "push"),
  e("cbl-lat-pulldown", "Lat Pulldown", "resistance", ["back", "biceps"], "Cable", "pull"),
  e("cbl-seated-row", "Seated Cable Row", "resistance", ["back", "biceps"], "Cable", "pull"),
  e("cbl-face-pull", "Cable Face Pull", "resistance", ["shoulders", "back"], "Cable", "pull"),
  e("cbl-triceps-pushdown", "Triceps Pushdown", "resistance", ["triceps"], "Cable", "push"),
  e("cbl-pallof", "Pallof Press", "resistance", ["core"], "Cable", "core"),
  e("cbl-woodchop", "Cable Woodchopper", "resistance", ["core"], "Cable", "core"),
  e("mch-leg-press", "Leg Press", "resistance", ["quads", "glutes"], "Machine", "legs"),
  e("mch-leg-curl", "Seated Leg Curl", "resistance", ["hamstrings"], "Machine", "legs"),
  e("mch-leg-ext", "Leg Extension", "resistance", ["quads"], "Machine", "legs"),
  e("mch-calf-raise", "Standing Calf Raise", "resistance", ["calves"], "Machine", "legs"),
  e("mch-chest-press", "Machine Chest Press", "resistance", ["chest", "triceps"], "Machine", "push"),
  e("mch-rear-delt-fly", "Rear Delt Fly", "resistance", ["shoulders", "back"], "Machine", "pull"),
  e("band-pull-apart", "Band Pull-Apart", "resistance", ["shoulders", "back"], "Band", "pull", "reps"),

  // ---------- Calisthenics & Bodyweight ----------
  e("cal-pullup", "Pull-Up", "calisthenics", ["back", "biceps"], "Bodyweight", "pull", "reps"),
  e("cal-chinup", "Chin-Up", "calisthenics", ["back", "biceps"], "Bodyweight", "pull", "reps"),
  e("cal-wide-pullup", "Wide-Grip Pull-Up", "calisthenics", ["back"], "Bodyweight", "pull", "reps"),
  e("cal-neutral-pullup", "Neutral-Grip Pull-Up", "calisthenics", ["back", "biceps"], "Bodyweight", "pull", "reps"),
  e("cal-inverted-row", "Inverted Row", "calisthenics", ["back", "biceps"], "Bodyweight", "pull", "reps"),
  e("cal-muscleup", "Muscle-Up", "calisthenics", ["back", "chest", "triceps"], "Bodyweight", "pull", "reps"),
  e("cal-pushup", "Push-Up", "calisthenics", ["chest", "triceps"], "Bodyweight", "push", "reps"),
  e("cal-diamond-pushup", "Diamond Push-Up", "calisthenics", ["triceps", "chest"], "Bodyweight", "push", "reps"),
  e("cal-archer-pushup", "Archer Push-Up", "calisthenics", ["chest", "shoulders"], "Bodyweight", "push", "reps"),
  e("cal-decline-pushup", "Decline Push-Up", "calisthenics", ["chest", "shoulders"], "Bodyweight", "push", "reps"),
  e("cal-pike-pushup", "Pike Push-Up", "calisthenics", ["shoulders", "triceps"], "Bodyweight", "push", "reps"),
  e("cal-dip", "Parallel Bar Dip", "calisthenics", ["chest", "triceps"], "Bodyweight", "push", "reps"),
  e("cal-bench-dip", "Bench Dip", "calisthenics", ["triceps"], "Bodyweight", "push", "reps"),
  e("cal-pistol-squat", "Pistol Squat", "calisthenics", ["quads", "glutes"], "Bodyweight", "legs", "reps"),
  e("cal-nordic", "Nordic Hamstring Curl", "calisthenics", ["hamstrings"], "Bodyweight", "legs", "reps"),
  e("cal-hanging-leg-raise", "Hanging Leg Raise", "calisthenics", ["core"], "Bodyweight", "core", "reps"),
  e("cal-toes-to-bar", "Toes-to-Bar", "calisthenics", ["core"], "Bodyweight", "core", "reps"),
  e("cal-plank", "Front Plank", "calisthenics", ["core"], "Bodyweight", "core", "time"),
  e("cal-side-plank", "Side Plank", "calisthenics", ["core"], "Bodyweight", "core", "time"),
  e("cal-hollow-hold", "Hollow Body Hold", "calisthenics", ["core"], "Bodyweight", "core", "time"),
  e("cal-l-sit", "L-Sit Hold", "calisthenics", ["core"], "Bodyweight", "core", "time"),
  e("cal-deadbug", "Dead Bug", "calisthenics", ["core"], "Bodyweight", "core", "reps"),
  e("cal-glute-bridge", "Glute Bridge", "calisthenics", ["glutes"], "Bodyweight", "legs", "reps"),
  e("cal-burpee", "Burpee", "calisthenics", ["full body", "conditioning"], "Bodyweight", "cardio", "reps"),

  // ---------- Cardio & Endurance ----------
  e("car-sprint-40", "40-Yard Sprint", "cardio", ["conditioning", "quads"], "Track", "cardio", "reps"),
  e("car-sprint-100", "100m Sprint", "cardio", ["conditioning"], "Track", "cardio", "reps"),
  e("car-flying-30", "Flying 30s", "cardio", ["conditioning"], "Track", "cardio", "reps"),
  e("car-zone2-run", "Zone 2 Run", "cardio", ["conditioning"], "Outdoor", "cardio", "time"),
  e("car-tempo-run", "Tempo Run", "cardio", ["conditioning"], "Outdoor", "cardio", "time"),
  e("car-treadmill", "Treadmill Intervals", "cardio", ["conditioning"], "Machine", "cardio", "time"),
  e("car-row-erg", "Rowing Erg", "cardio", ["conditioning", "back"], "Machine", "cardio", "time"),
  e("car-assault-bike", "Air Bike Intervals", "cardio", ["conditioning"], "Machine", "cardio", "time"),
  e("car-cycling", "Steady-State Cycling", "cardio", ["conditioning"], "Bike", "cardio", "time"),
  e("car-jump-rope", "Jump Rope", "cardio", ["calves", "conditioning"], "Rope", "cardio", "time"),
  e("car-double-unders", "Double-Unders", "cardio", ["calves", "conditioning"], "Rope", "cardio", "reps"),
  e("car-shuttle", "300-Yard Shuttle", "cardio", ["conditioning"], "Track", "cardio", "reps"),
  e("car-suicides", "Court Suicides", "cardio", ["conditioning"], "Court", "cardio", "reps"),
  e("car-swim-laps", "Swim Laps", "cardio", ["conditioning", "full body"], "Pool", "cardio", "time"),
  e("car-sled-push", "Sled Push", "cardio", ["quads", "conditioning"], "Sled", "cardio", "distance"),

  // ---------- Athletic Sport Prep ----------
  e("ath-ladder-icky", "Agility Ladder — Icky Shuffle", "athletic", ["conditioning", "calves"], "Agility Ladder", "cardio", "reps"),
  e("ath-ladder-inout", "Agility Ladder — In & Outs", "athletic", ["conditioning"], "Agility Ladder", "cardio", "reps"),
  e("ath-ladder-lateral", "Agility Ladder — Lateral Runs", "athletic", ["conditioning"], "Agility Ladder", "cardio", "reps"),
  e("ath-cone-5105", "5-10-5 Pro Agility", "athletic", ["conditioning"], "Cones", "cardio", "reps"),
  e("ath-cone-tdrill", "T-Drill", "athletic", ["conditioning"], "Cones", "cardio", "reps"),
  e("ath-box-jump", "Box Jump", "athletic", ["quads", "glutes"], "Plyo Box", "legs", "reps"),
  e("ath-depth-jump", "Depth Jump", "athletic", ["quads", "calves"], "Plyo Box", "legs", "reps"),
  e("ath-broad-jump", "Standing Broad Jump", "athletic", ["glutes", "quads"], "Bodyweight", "legs", "reps"),
  e("ath-approach-jump", "Approach Vertical Jump", "athletic", ["quads", "calves"], "Bodyweight", "legs", "reps"),
  e("ath-bounds", "Alternating Bounds", "athletic", ["glutes", "hamstrings"], "Bodyweight", "legs", "reps"),
  e("ath-pogo", "Pogo Hops", "athletic", ["calves"], "Bodyweight", "legs", "reps"),
  e("ath-lateral-bound", "Lateral Skater Bound", "athletic", ["glutes", "quads"], "Bodyweight", "legs", "reps"),
  e("ath-mb-slam", "Medicine Ball Slam", "athletic", ["core", "full body"], "Med Ball", "core", "reps"),
  e("ath-mb-rotational", "Rotational Med Ball Throw", "athletic", ["core"], "Med Ball", "core", "reps"),
  e("ath-mb-chest-pass", "Explosive Chest Pass", "athletic", ["chest", "core"], "Med Ball", "push", "reps"),
  e("ath-mb-overhead", "Overhead Med Ball Throw", "athletic", ["full body", "core"], "Med Ball", "push", "reps"),
  e("ath-aframe", "A-Skips", "athletic", ["conditioning", "calves"], "Bodyweight", "cardio", "reps"),
  e("ath-highknee", "High Knees", "athletic", ["conditioning"], "Bodyweight", "cardio", "time"),
  e("ath-band-monster", "Banded Monster Walk", "athletic", ["glutes"], "Band", "legs", "reps"),
  e("ath-single-leg-balance", "Single-Leg Balance Reach", "athletic", ["core", "glutes"], "Bodyweight", "mobility", "time"),
  e("ath-ankle-hops", "Ankle Stiffness Hops", "athletic", ["calves"], "Bodyweight", "legs", "reps"),
  e("ath-copenhagen", "Copenhagen Plank", "athletic", ["core", "glutes"], "Bodyweight", "core", "time"),

  // ---------- Recovery & Mobility ----------
  e("rec-couch-stretch", "Couch Stretch", "recovery", ["mobility", "quads"], "Bodyweight", "mobility", "time"),
  e("rec-90-90", "90/90 Hip Switch", "recovery", ["mobility", "glutes"], "Bodyweight", "mobility", "time"),
  e("rec-worlds-greatest", "World's Greatest Stretch", "recovery", ["mobility"], "Bodyweight", "mobility", "time"),
  e("rec-catcow", "Cat-Cow Flow", "recovery", ["mobility", "core"], "Bodyweight", "mobility", "time"),
  e("rec-thoracic-open", "Thoracic Open-Book", "recovery", ["mobility", "back"], "Bodyweight", "mobility", "reps"),
  e("rec-hamstring-floss", "Hamstring Nerve Floss", "recovery", ["mobility", "hamstrings"], "Bodyweight", "mobility", "reps"),
  e("rec-foam-quads", "Foam Roll — Quads", "recovery", ["mobility", "quads"], "Foam Roller", "mobility", "time"),
  e("rec-foam-tspine", "Foam Roll — T-Spine", "recovery", ["mobility", "back"], "Foam Roller", "mobility", "time"),
  e("rec-lacrosse-glute", "Lacrosse Ball — Glutes", "recovery", ["mobility", "glutes"], "Massage Ball", "mobility", "time"),
  e("rec-ankle-dorsi", "Ankle Dorsiflexion Drill", "recovery", ["mobility", "calves"], "Bodyweight", "mobility", "reps"),
  e("rec-shoulder-cars", "Shoulder CARs", "recovery", ["mobility", "shoulders"], "Bodyweight", "mobility", "reps"),
  e("rec-hip-cars", "Hip CARs", "recovery", ["mobility", "glutes"], "Bodyweight", "mobility", "reps"),
  e("rec-box-breathing", "Box Breathing Reset", "recovery", ["mobility"], "None", "mobility", "time"),
  e("rec-walk", "Recovery Walk", "recovery", ["conditioning", "mobility"], "Outdoor", "mobility", "time"),
];

const seen = new Set<string>();
export const EXERCISES: Exercise[] = [...BASE_EXERCISES, ...EXTRA_EXERCISES, ...MORE_EXERCISES]
  .filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)))
  .sort((a, b) => a.name.localeCompare(b.name));



export const CATEGORY_META: Record<
  ExerciseCategory,
  { label: string; short: string; blurb: string }
> = {
  resistance: {
    label: "Resistance & Weightlifting",
    short: "Weights",
    blurb: "Barbell, dumbbell, kettlebell, cable & machine strength work.",
  },
  calisthenics: {
    label: "Calisthenics & Bodyweight",
    short: "Bodyweight",
    blurb: "Pull-up, push-up, dip & advanced core progressions.",
  },
  cardio: {
    label: "Cardio & Endurance",
    short: "Cardio",
    blurb: "Sprints, Zone 2, rowing, cycling, rope & shuttles.",
  },
  athletic: {
    label: "Athletic Sport Prep",
    short: "Athletic",
    blurb: "Agility ladders, plyos, med ball power & stabilization.",
  },
  recovery: {
    label: "Recovery & Mobility",
    short: "Recovery",
    blurb: "Flows, CARs, soft tissue & down-regulation drills.",
  },
};

export const MUSCLE_FILTERS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "core",
  "full body",
  "conditioning",
  "mobility",
] as const;

export const EQUIPMENT_FILTERS = Array.from(
  new Set(EXERCISES.map((x) => x.equipment)),
).sort();

export const EXERCISE_MAP = new Map(EXERCISES.map((x) => [x.id, x]));

export function findExercise(id: string) {
  return EXERCISE_MAP.get(id);
}

/** Normalize for fuzzy matching: lowercase, strip punctuation, de-pluralize. */
function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .map((w) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w))
    .join(" ");
}

const SYNONYMS: Record<string, string> = {
  pushup: "push up",
  pullup: "pull up",
  chinup: "chin up",
  situp: "sit up",
  bench: "bench press",
  ohp: "overhead press",
  rdl: "romanian deadlift",
  db: "dumbbell",
  bb: "barbell",
  kb: "kettlebell",
  smith: "smith machine",
  abs: "core",
  cardio: "conditioning",
};

function haystack(x: Exercise) {
  return normalize(
    [x.name, x.equipment, x.category, x.pattern, ...x.muscles].join(" "),
  );
}

const HAYSTACKS = new Map(EXERCISES.map((x) => [x.id, haystack(x)]));

/** True when every word of the query appears somewhere in the exercise. */
export function matchesExercise(x: Exercise, query: string) {
  const q = normalize(query);
  if (!q) return true;
  const hay = HAYSTACKS.get(x.id) ?? haystack(x);
  return q
    .split(" ")
    .flatMap((w) => (SYNONYMS[w] ? normalize(SYNONYMS[w]).split(" ") : [w]))
    .every((w) => hay.includes(w));
}

/** Most general / closest names first (so "push up" beats "archer push up"). */
export function rankExercises(list: Exercise[], query: string) {
  const q = normalize(query);
  if (!q) return list;
  const score = (x: Exercise) => {
    const n = normalize(x.name);
    if (n === q) return 0;
    if (n.startsWith(q)) return 1;
    if (n.includes(q)) return 2;
    return 3;
  };
  return [...list].sort(
    (a, b) => score(a) - score(b) || a.name.length - b.name.length || a.name.localeCompare(b.name),
  );
}

export function searchExercises(
  query: string,
  filters: { category?: string | null; muscle?: string | null; equipment?: string | null } = {},
) {
  const filtered = EXERCISES.filter((x) => {
    if (filters.category && x.category !== filters.category) return false;
    if (filters.muscle && !x.muscles.includes(filters.muscle as never)) return false;
    if (filters.equipment && x.equipment !== filters.equipment) return false;
    return matchesExercise(x, query);
  });
  return rankExercises(filtered, query);
}

