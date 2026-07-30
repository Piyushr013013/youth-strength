import type { RoutineExercise } from "./types";
import { EXTRA_PROGRAMS } from "./programs-extended";
import { CATALOG_PROGRAMS } from "./programs-catalog";

export interface ProgramDay {
  day: string;
  focus: string;
  exercises: RoutineExercise[];
}

export interface Program {
  id: string;
  name: string;
  tagline: string;
  weeks: number;
  daysPerWeek: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  tracks: string[];
  accent: "lime" | "cyan" | "flare";
  /** Sport / category tab this program belongs to. */
  group?: string;
  days: ProgramDay[];
}

const x = (
  exerciseId: string,
  name: string,
  sets: number,
  reps: string,
  supersetGroup: number | null = null,
): RoutineExercise => ({ exerciseId, name, sets, reps, supersetGroup });

const BASE_PROGRAMS: Program[] = [
  {
    id: "off-season-soccer-agility",
    name: "Off-Season Soccer Agility",
    tagline: "Change-of-direction speed, single-leg strength and repeat-sprint capacity.",
    weeks: 6,
    daysPerWeek: 3,
    level: "Intermediate",
    tracks: ["sport", "speed"],
    accent: "cyan",
    days: [
      {
        day: "Day 1",
        focus: "Acceleration + Lower Strength",
        exercises: [
          x("ath-aframe", "A-Skips", 3, "20 yd"),
          x("ath-ladder-icky", "Agility Ladder — Icky Shuffle", 3, "2 passes", 1),
          x("ath-cone-5105", "5-10-5 Pro Agility", 4, "1 rep", 1),
          x("db-bulgarian", "Bulgarian Split Squat", 3, "8 each"),
          x("kb-swing", "Kettlebell Swing", 3, "12"),
          x("ath-copenhagen", "Copenhagen Plank", 3, "20s each"),
        ],
      },
      {
        day: "Day 2",
        focus: "Repeat Sprint Conditioning",
        exercises: [
          x("car-shuttle", "300-Yard Shuttle", 3, "1 rep"),
          x("car-sprint-40", "40-Yard Sprint", 6, "1 rep"),
          x("ath-lateral-bound", "Lateral Skater Bound", 3, "8 each"),
          x("cal-nordic", "Nordic Hamstring Curl", 3, "5"),
          x("rec-90-90", "90/90 Hip Switch", 2, "60s"),
        ],
      },
      {
        day: "Day 3",
        focus: "Power + Posterior Chain",
        exercises: [
          x("ath-box-jump", "Box Jump", 4, "4"),
          x("bb-rdl", "Romanian Deadlift", 4, "6"),
          x("db-step-up", "Dumbbell Step-Up", 3, "10 each"),
          x("ath-band-monster", "Banded Monster Walk", 3, "15 each"),
          x("cal-side-plank", "Side Plank", 3, "40s"),
        ],
      },
    ],
  },
  {
    id: "vertical-jump-explosiveness",
    name: "Vertical Jump & Explosiveness",
    tagline: "Force production, rate of force development and elastic bounce.",
    weeks: 8,
    daysPerWeek: 3,
    level: "Advanced",
    tracks: ["speed", "sport"],
    accent: "lime",
    days: [
      {
        day: "Day 1",
        focus: "Max Force",
        exercises: [
          x("ath-pogo", "Pogo Hops", 3, "15"),
          x("bb-back-squat", "Barbell Back Squat", 5, "3"),
          x("ath-depth-jump", "Depth Jump", 4, "3"),
          x("bb-hip-thrust", "Barbell Hip Thrust", 3, "8"),
          x("mch-calf-raise", "Standing Calf Raise", 4, "12"),
        ],
      },
      {
        day: "Day 2",
        focus: "Elastic / Reactive",
        exercises: [
          x("ath-ankle-hops", "Ankle Stiffness Hops", 4, "12"),
          x("ath-bounds", "Alternating Bounds", 4, "6 each"),
          x("ath-approach-jump", "Approach Vertical Jump", 5, "3"),
          x("cal-pistol-squat", "Pistol Squat", 3, "5 each"),
          x("cal-hollow-hold", "Hollow Body Hold", 3, "30s"),
        ],
      },
      {
        day: "Day 3",
        focus: "Speed-Strength",
        exercises: [
          x("bb-power-clean", "Power Clean", 5, "3"),
          x("ath-broad-jump", "Standing Broad Jump", 4, "3"),
          x("db-bulgarian", "Bulgarian Split Squat", 3, "6 each"),
          x("ath-mb-overhead", "Overhead Med Ball Throw", 4, "5"),
          x("rec-couch-stretch", "Couch Stretch", 2, "60s each"),
        ],
      },
    ],
  },
  {
    id: "upper-body-athletic-base",
    name: "Upper Body Athletic Base",
    tagline: "Balanced push/pull hypertrophy with shoulder-health accessories.",
    weeks: 6,
    daysPerWeek: 2,
    level: "Beginner",
    tracks: ["strength"],
    accent: "cyan",
    days: [
      {
        day: "Day 1",
        focus: "Horizontal Emphasis",
        exercises: [
          x("bb-bench", "Barbell Bench Press", 4, "6-8"),
          x("db-row", "One-Arm Dumbbell Row", 4, "10 each", 1),
          x("cal-pushup", "Push-Up", 3, "AMRAP", 1),
          x("cbl-face-pull", "Cable Face Pull", 3, "15"),
          x("db-curl", "Dumbbell Biceps Curl", 3, "12"),
          x("cbl-triceps-pushdown", "Triceps Pushdown", 3, "12"),
        ],
      },
      {
        day: "Day 2",
        focus: "Vertical Emphasis",
        exercises: [
          x("bb-ohp", "Standing Overhead Press", 4, "6"),
          x("cal-pullup", "Pull-Up", 4, "AMRAP"),
          x("db-lateral-raise", "Dumbbell Lateral Raise", 3, "15", 2),
          x("mch-rear-delt-fly", "Rear Delt Fly", 3, "15", 2),
          x("cal-dip", "Parallel Bar Dip", 3, "8"),
          x("cal-hanging-leg-raise", "Hanging Leg Raise", 3, "10"),
        ],
      },
    ],
  },
  {
    id: "hs-baseball-rotational-power",
    name: "High-School Baseball Rotational Power",
    tagline: "Hip-shoulder separation, arm care and bat/throw velocity transfer.",
    weeks: 8,
    daysPerWeek: 3,
    level: "Intermediate",
    tracks: ["sport", "speed"],
    accent: "flare",
    days: [
      {
        day: "Day 1",
        focus: "Rotational Power",
        exercises: [
          x("ath-mb-rotational", "Rotational Med Ball Throw", 5, "5 each"),
          x("bb-front-squat", "Barbell Front Squat", 4, "5"),
          x("cbl-woodchop", "Cable Woodchopper", 3, "12 each"),
          x("cbl-pallof", "Pallof Press", 3, "12 each"),
          x("rec-shoulder-cars", "Shoulder CARs", 2, "5 each"),
        ],
      },
      {
        day: "Day 2",
        focus: "Arm Care + Pull",
        exercises: [
          x("band-pull-apart", "Band Pull-Apart", 3, "20"),
          x("cal-chinup", "Chin-Up", 4, "6"),
          x("db-row", "One-Arm Dumbbell Row", 3, "10 each"),
          x("cbl-face-pull", "Cable Face Pull", 4, "15"),
          x("kb-turkish-getup", "Turkish Get-Up", 3, "3 each"),
        ],
      },
      {
        day: "Day 3",
        focus: "Lower Power + Sprint",
        exercises: [
          x("ath-broad-jump", "Standing Broad Jump", 4, "3"),
          x("bb-rdl", "Romanian Deadlift", 4, "6"),
          x("car-sprint-40", "40-Yard Sprint", 5, "1 rep"),
          x("ath-lateral-bound", "Lateral Skater Bound", 3, "6 each"),
          x("rec-thoracic-open", "Thoracic Open-Book", 2, "8 each"),
        ],
      },
    ],
  },
  {
    id: "beginner-bodyweight-strength",
    name: "Beginner Bodyweight Strength",
    tagline: "No equipment needed — build your movement base in 4 weeks.",
    weeks: 4,
    daysPerWeek: 3,
    level: "Beginner",
    tracks: ["movement", "strength"],
    accent: "lime",
    days: [
      {
        day: "Day 1",
        focus: "Push + Core",
        exercises: [
          x("cal-pushup", "Push-Up", 3, "8-12"),
          x("cal-pike-pushup", "Pike Push-Up", 3, "8"),
          x("cal-bench-dip", "Bench Dip", 3, "10"),
          x("cal-plank", "Front Plank", 3, "30s"),
          x("cal-deadbug", "Dead Bug", 3, "10 each"),
        ],
      },
      {
        day: "Day 2",
        focus: "Pull + Posture",
        exercises: [
          x("cal-inverted-row", "Inverted Row", 3, "10"),
          x("band-pull-apart", "Band Pull-Apart", 3, "15"),
          x("cal-glute-bridge", "Glute Bridge", 3, "15"),
          x("cal-side-plank", "Side Plank", 3, "25s"),
          x("rec-catcow", "Cat-Cow Flow", 2, "60s"),
        ],
      },
      {
        day: "Day 3",
        focus: "Legs + Conditioning",
        exercises: [
          x("db-walking-lunge", "Walking Lunge", 3, "12 each"),
          x("kb-goblet-squat", "Goblet Squat", 3, "12"),
          x("car-jump-rope", "Jump Rope", 4, "60s"),
          x("cal-burpee", "Burpee", 3, "8"),
          x("rec-worlds-greatest", "World's Greatest Stretch", 2, "45s each"),
        ],
      },
    ],
  },
  {
    id: "basketball-engine",
    name: "Basketball In-Season Engine",
    tagline: "Keep hops and lateral quickness alive through a long season.",
    weeks: 6,
    daysPerWeek: 2,
    level: "Intermediate",
    tracks: ["sport"],
    accent: "flare",
    days: [
      {
        day: "Day 1",
        focus: "Maintain Power",
        exercises: [
          x("ath-box-jump", "Box Jump", 3, "4"),
          x("bb-back-squat", "Barbell Back Squat", 3, "5"),
          x("db-bulgarian", "Bulgarian Split Squat", 3, "8 each"),
          x("car-suicides", "Court Suicides", 4, "1 rep"),
          x("rec-lacrosse-glute", "Lacrosse Ball — Glutes", 2, "60s each"),
        ],
      },
      {
        day: "Day 2",
        focus: "Upper + Core Control",
        exercises: [
          x("cal-pullup", "Pull-Up", 4, "6"),
          x("db-bench", "Dumbbell Bench Press", 3, "8"),
          x("cbl-pallof", "Pallof Press", 3, "12 each"),
          x("ath-single-leg-balance", "Single-Leg Balance Reach", 3, "30s each"),
          x("rec-box-breathing", "Box Breathing Reset", 1, "3 min"),
        ],
      },
    ],
  },
  {
    id: "track-speed-block",
    name: "Track & Field Speed Block",
    tagline: "Sprint mechanics, top-end speed and acceleration output.",
    weeks: 6,
    daysPerWeek: 3,
    level: "Advanced",
    tracks: ["speed", "sport"],
    accent: "cyan",
    days: [
      {
        day: "Day 1",
        focus: "Acceleration",
        exercises: [
          x("ath-aframe", "A-Skips", 3, "20 yd"),
          x("car-sprint-40", "40-Yard Sprint", 6, "1 rep"),
          x("car-sled-push", "Sled Push", 4, "20 yd"),
          x("bb-hip-thrust", "Barbell Hip Thrust", 3, "8"),
        ],
      },
      {
        day: "Day 2",
        focus: "Max Velocity",
        exercises: [
          x("car-flying-30", "Flying 30s", 5, "1 rep"),
          x("ath-bounds", "Alternating Bounds", 3, "6 each"),
          x("cal-nordic", "Nordic Hamstring Curl", 3, "5"),
          x("rec-hamstring-floss", "Hamstring Nerve Floss", 2, "10 each"),
        ],
      },
      {
        day: "Day 3",
        focus: "Strength Support",
        exercises: [
          x("bb-back-squat", "Barbell Back Squat", 4, "4"),
          x("bb-power-clean", "Power Clean", 4, "3"),
          x("mch-calf-raise", "Standing Calf Raise", 4, "10"),
          x("cal-hollow-hold", "Hollow Body Hold", 3, "30s"),
        ],
      },
    ],
  },
  {
    id: "swim-dryland",
    name: "Swimmer Dryland & Shoulder Armor",
    tagline: "Overhead durability, lat power and core anti-rotation.",
    weeks: 6,
    daysPerWeek: 3,
    level: "Intermediate",
    tracks: ["sport", "movement"],
    accent: "cyan",
    days: [
      {
        day: "Day 1",
        focus: "Pull Power",
        exercises: [
          x("cal-pullup", "Pull-Up", 4, "6"),
          x("cbl-lat-pulldown", "Lat Pulldown", 3, "12"),
          x("band-pull-apart", "Band Pull-Apart", 3, "20"),
          x("cal-hollow-hold", "Hollow Body Hold", 3, "40s"),
        ],
      },
      {
        day: "Day 2",
        focus: "Push + Stability",
        exercises: [
          x("db-shoulder-press", "Dumbbell Shoulder Press", 3, "10"),
          x("cal-pushup", "Push-Up", 3, "15"),
          x("kb-turkish-getup", "Turkish Get-Up", 3, "3 each"),
          x("rec-shoulder-cars", "Shoulder CARs", 2, "5 each"),
        ],
      },
      {
        day: "Day 3",
        focus: "Legs + Aerobic",
        exercises: [
          x("kb-goblet-squat", "Goblet Squat", 3, "12"),
          x("cal-glute-bridge", "Glute Bridge", 3, "15"),
          x("car-row-erg", "Rowing Erg", 4, "3 min"),
          x("rec-catcow", "Cat-Cow Flow", 2, "60s"),
        ],
      },
    ],
  },
  {
    id: "functional-hypertrophy",
    name: "Functional Strength & Hypertrophy",
    tagline: "Classic 4-day upper/lower split built for young athletes.",
    weeks: 8,
    daysPerWeek: 4,
    level: "Intermediate",
    tracks: ["strength"],
    accent: "lime",
    days: [
      {
        day: "Day 1",
        focus: "Upper Push",
        exercises: [
          x("bb-bench", "Barbell Bench Press", 4, "6"),
          x("db-incline", "Incline Dumbbell Press", 3, "10"),
          x("db-lateral-raise", "Dumbbell Lateral Raise", 3, "15"),
          x("cbl-triceps-pushdown", "Triceps Pushdown", 3, "12"),
        ],
      },
      {
        day: "Day 2",
        focus: "Lower Squat",
        exercises: [
          x("bb-back-squat", "Barbell Back Squat", 4, "6"),
          x("mch-leg-press", "Leg Press", 3, "12"),
          x("mch-leg-curl", "Seated Leg Curl", 3, "12"),
          x("mch-calf-raise", "Standing Calf Raise", 4, "15"),
        ],
      },
      {
        day: "Day 3",
        focus: "Upper Pull",
        exercises: [
          x("cal-pullup", "Pull-Up", 4, "AMRAP"),
          x("bb-row", "Barbell Bent-Over Row", 4, "8"),
          x("cbl-face-pull", "Cable Face Pull", 3, "15"),
          x("db-hammer-curl", "Hammer Curl", 3, "12"),
        ],
      },
      {
        day: "Day 4",
        focus: "Lower Hinge",
        exercises: [
          x("bb-deadlift", "Barbell Deadlift", 4, "5"),
          x("db-bulgarian", "Bulgarian Split Squat", 3, "10 each"),
          x("bb-hip-thrust", "Barbell Hip Thrust", 3, "10"),
          x("cal-hanging-leg-raise", "Hanging Leg Raise", 3, "12"),
        ],
      },
    ],
  },
  {
    id: "movement-base-mobility",
    name: "General Movement Base & Joint Mobility",
    tagline: "Bulletproof joints, clean positions and daily mobility habits.",
    weeks: 4,
    daysPerWeek: 3,
    level: "Beginner",
    tracks: ["movement"],
    accent: "cyan",
    days: [
      {
        day: "Day 1",
        focus: "Hips & Ankles",
        exercises: [
          x("rec-90-90", "90/90 Hip Switch", 3, "60s"),
          x("rec-ankle-dorsi", "Ankle Dorsiflexion Drill", 3, "10 each"),
          x("rec-couch-stretch", "Couch Stretch", 2, "60s each"),
          x("ath-single-leg-balance", "Single-Leg Balance Reach", 3, "30s each"),
        ],
      },
      {
        day: "Day 2",
        focus: "Spine & Shoulders",
        exercises: [
          x("rec-thoracic-open", "Thoracic Open-Book", 3, "8 each"),
          x("rec-shoulder-cars", "Shoulder CARs", 3, "5 each"),
          x("rec-foam-tspine", "Foam Roll — T-Spine", 2, "60s"),
          x("cal-deadbug", "Dead Bug", 3, "10 each"),
        ],
      },
      {
        day: "Day 3",
        focus: "Full Flow",
        exercises: [
          x("rec-worlds-greatest", "World's Greatest Stretch", 3, "45s each"),
          x("rec-hip-cars", "Hip CARs", 3, "5 each"),
          x("cal-glute-bridge", "Glute Bridge", 3, "15"),
          x("rec-walk", "Recovery Walk", 1, "20 min"),
        ],
      },
    ],
  },
];

export const TRACKS = [
  {
    id: "sport",
    name: "Sport-Specific Conditioning",
    blurb: "Train around your season and your sport's demands.",
    sports: [
      "Basketball",
      "Soccer",
      "Track & Field",
      "Football",
      "Swimming",
      "Volleyball",
      "Tennis",
      "Baseball / Softball",
    ],
  },
  {
    id: "strength",
    name: "Functional Strength & Hypertrophy",
    blurb: "Get stronger and add athletic muscle with structured lifting.",
    sports: [],
  },
  {
    id: "speed",
    name: "Speed, Agility & Plyometrics",
    blurb: "Sprint faster, cut harder, jump higher.",
    sports: [],
  },
  {
    id: "movement",
    name: "General Movement Base & Joint Mobility",
    blurb: "Own your positions and stay durable year-round.",
    sports: [],
  },
];

const SPORT_HINTS: [RegExp, string][] = [
  [/quarterback|wide receiver|lineman|football|defensive|linebacker|running back|safety|cornerback|tight end|kicker|punter|edge/i, "Football"],
  [/cricket/i, "Cricket"],
  [/soccer/i, "Soccer"],
  [/basketball/i, "Basketball"],
  [/baseball|pitcher|hitter/i, "Baseball"],
  [/track|sprint/i, "Track & Field"],
  [/swim/i, "Swimming"],
  [/tennis/i, "Tennis"],
  [/rugby/i, "Rugby"],
  [/volleyball/i, "Volleyball"],
  [/hockey/i, "Hockey"],
  [/wrestl/i, "Wrestling"],
  [/golf/i, "Golf"],
  [/lacrosse/i, "Lacrosse"],
  [/mma|martial|boxing|combat/i, "MMA & Combat"],
  [/powerlift|5\/3\/1|conjugate|texas/i, "Powerlifting"],
  [/bodybuild|hypertrophy|physique|aesthetic/i, "Bodybuilding"],
  [/calisthenic|gymnastic/i, "Calisthenics"],
  [/olympic|weightlifting/i, "Olympic Lifting"],
  [/speed|agility|plyo|vertical|jump/i, "Speed & Agility"],
  [/condition|cut|fat|metabolic|endurance|runner|distance|triathlon/i, "Conditioning"],
];

function inferGroup(p: Program): string {
  if (p.group) return p.group;
  const hay = `${p.name} ${p.tagline}`;
  for (const [re, group] of SPORT_HINTS) if (re.test(hay)) return group;
  return "General";
}

const seenProgram = new Set<string>();
export const PROGRAMS: Program[] = [...BASE_PROGRAMS, ...EXTRA_PROGRAMS, ...CATALOG_PROGRAMS]
  .filter((p) => (seenProgram.has(p.id) ? false : (seenProgram.add(p.id), true)))
  .map((p) => ({ ...p, group: inferGroup(p) }));

/** Distinct program tabs, most-populated first (General last). */
export function programGroups(): { group: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of PROGRAMS) counts.set(p.group!, (counts.get(p.group!) ?? 0) + 1);
  return [...counts.entries()]
    .map(([group, count]) => ({ group, count }))
    .sort((a, b) => (a.group === "General" ? 1 : b.group === "General" ? -1 : b.count - a.count));
}

export function programById(id: string) {
  return PROGRAMS.find((p) => p.id === id);
}
