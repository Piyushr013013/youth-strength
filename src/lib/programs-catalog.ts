import type { Program, ProgramDay } from "./programs";
import type { RoutineExercise } from "./types";

const x = (
  exerciseId: string,
  name: string,
  sets: number,
  reps: string,
  supersetGroup: number | null = null,
): RoutineExercise => ({ exerciseId, name, sets, reps, supersetGroup });

/* ------------------------------------------------------------------ */
/* Reusable day blocks built from real exercises in the library         */
/* ------------------------------------------------------------------ */

const D = {
  maxSquat: (): ProgramDay => ({
    day: "Day 1",
    focus: "Max Effort Lower",
    exercises: [
      x("bb-back-squat", "Barbell Back Squat", 5, "5"),
      x("bb-rdl", "Romanian Deadlift", 4, "6"),
      x("mch-leg-press", "Leg Press", 3, "10"),
      x("mch-calf-raise", "Standing Calf Raise", 4, "12"),
      x("cbl-pallof", "Pallof Press", 3, "12 each"),
    ],
  }),
  maxBench: (): ProgramDay => ({
    day: "Day 2",
    focus: "Max Effort Upper",
    exercises: [
      x("bb-bench", "Barbell Bench Press", 5, "5"),
      x("bb-row", "Barbell Bent-Over Row", 4, "6"),
      x("bb-ohp", "Standing Overhead Press", 3, "8"),
      x("cal-pullup", "Pull-Up", 4, "AMRAP"),
      x("cbl-triceps-pushdown", "Triceps Pushdown", 3, "12"),
    ],
  }),
  maxDeadlift: (): ProgramDay => ({
    day: "Day 3",
    focus: "Pull Strength",
    exercises: [
      x("bb-deadlift", "Barbell Deadlift", 5, "3"),
      x("bb-hip-thrust", "Barbell Hip Thrust", 4, "8"),
      x("db-row", "One-Arm Dumbbell Row", 3, "10 each"),
      x("cal-hanging-leg-raise", "Hanging Leg Raise", 3, "12"),
      x("db-farmer", "Farmer's Carry", 3, "40s"),
    ],
  }),
  dynamicPower: (): ProgramDay => ({
    day: "Day 4",
    focus: "Dynamic Effort / Power",
    exercises: [
      x("bb-power-clean", "Power Clean", 6, "3"),
      x("bb-push-press", "Push Press", 4, "4"),
      x("ath-box-jump", "Box Jump", 5, "3"),
      x("ath-mb-slam", "Medicine Ball Slam", 4, "6"),
      x("cal-plank", "Front Plank", 3, "45s"),
    ],
  }),
  push: (): ProgramDay => ({
    day: "Push",
    focus: "Chest · Shoulders · Triceps",
    exercises: [
      x("bb-bench", "Barbell Bench Press", 4, "8"),
      x("db-incline", "Incline Dumbbell Press", 3, "10"),
      x("db-shoulder-press", "Dumbbell Shoulder Press", 3, "10"),
      x("db-lateral-raise", "Dumbbell Lateral Raise", 4, "15"),
      x("cbl-triceps-pushdown", "Triceps Pushdown", 3, "12"),
      x("cal-dip", "Parallel Bar Dip", 3, "AMRAP"),
    ],
  }),
  pull: (): ProgramDay => ({
    day: "Pull",
    focus: "Back · Biceps · Rear Delts",
    exercises: [
      x("cal-pullup", "Pull-Up", 4, "AMRAP"),
      x("bb-row", "Barbell Bent-Over Row", 4, "8"),
      x("cbl-seated-row", "Seated Cable Row", 3, "12"),
      x("mch-rear-delt-fly", "Rear Delt Fly", 3, "15"),
      x("db-curl", "Dumbbell Biceps Curl", 3, "12"),
      x("db-hammer-curl", "Hammer Curl", 3, "12"),
    ],
  }),
  legs: (): ProgramDay => ({
    day: "Legs",
    focus: "Quads · Hamstrings · Glutes",
    exercises: [
      x("bb-back-squat", "Barbell Back Squat", 4, "8"),
      x("bb-rdl", "Romanian Deadlift", 4, "10"),
      x("db-bulgarian", "Bulgarian Split Squat", 3, "10 each"),
      x("mch-leg-curl", "Seated Leg Curl", 3, "12"),
      x("mch-leg-ext", "Leg Extension", 3, "15"),
      x("mch-calf-raise", "Standing Calf Raise", 4, "15"),
    ],
  }),
  upper: (): ProgramDay => ({
    day: "Upper",
    focus: "Full Upper Body",
    exercises: [
      x("bb-bench", "Barbell Bench Press", 4, "6"),
      x("cbl-lat-pulldown", "Lat Pulldown", 4, "10"),
      x("bb-ohp", "Standing Overhead Press", 3, "8"),
      x("db-row", "One-Arm Dumbbell Row", 3, "10 each"),
      x("db-lateral-raise", "Dumbbell Lateral Raise", 3, "15"),
      x("cbl-face-pull", "Cable Face Pull", 3, "15"),
    ],
  }),
  lower: (): ProgramDay => ({
    day: "Lower",
    focus: "Full Lower Body",
    exercises: [
      x("bb-back-squat", "Barbell Back Squat", 4, "6"),
      x("bb-deadlift", "Barbell Deadlift", 3, "5"),
      x("db-walking-lunge", "Walking Lunge", 3, "12 each"),
      x("mch-leg-curl", "Seated Leg Curl", 3, "12"),
      x("cal-hanging-leg-raise", "Hanging Leg Raise", 3, "12"),
    ],
  }),
  fullBody: (n: number): ProgramDay => ({
    day: `Day ${n}`,
    focus: "Full Body",
    exercises: [
      x("bb-back-squat", "Barbell Back Squat", 3, "5"),
      x("bb-bench", "Barbell Bench Press", 3, "5"),
      x("bb-row", "Barbell Bent-Over Row", 3, "8"),
      x("kb-swing", "Kettlebell Swing", 3, "15"),
      x("cal-plank", "Front Plank", 3, "45s"),
    ],
  }),
  accel: (): ProgramDay => ({
    day: "Day 1",
    focus: "Acceleration Mechanics",
    exercises: [
      x("ath-aframe", "A-Skips", 3, "20 yd"),
      x("car-sprint-40", "40-Yard Sprint", 6, "1 rep"),
      x("ath-broad-jump", "Standing Broad Jump", 4, "3"),
      x("bb-trapbar-dl", "Trap Bar Deadlift", 4, "4"),
      x("cal-nordic", "Nordic Hamstring Curl", 3, "5"),
    ],
  }),
  maxVelocity: (): ProgramDay => ({
    day: "Day 2",
    focus: "Max Velocity",
    exercises: [
      x("car-flying-30", "Flying 30s", 5, "1 rep"),
      x("car-sprint-100", "100m Sprint", 3, "1 rep"),
      x("ath-bounds", "Alternating Bounds", 4, "6 each"),
      x("ath-pogo", "Pogo Hops", 4, "10"),
      x("bb-hip-thrust", "Barbell Hip Thrust", 3, "8"),
    ],
  }),
  agility: (): ProgramDay => ({
    day: "Day 3",
    focus: "Change of Direction",
    exercises: [
      x("ath-ladder-icky", "Agility Ladder — Icky Shuffle", 3, "2 passes", 1),
      x("ath-ladder-lateral", "Agility Ladder — Lateral Runs", 3, "2 passes", 1),
      x("ath-cone-5105", "5-10-5 Pro Agility", 5, "1 rep"),
      x("ath-cone-tdrill", "T-Drill", 4, "1 rep"),
      x("ath-lateral-bound", "Lateral Skater Bound", 3, "8 each"),
      x("ath-copenhagen", "Copenhagen Plank", 3, "25s each"),
    ],
  }),
  plyo: (): ProgramDay => ({
    day: "Day 4",
    focus: "Plyometric Shock",
    exercises: [
      x("ath-box-jump", "Box Jump", 5, "3"),
      x("ath-depth-jump", "Depth Jump", 4, "4"),
      x("ath-approach-jump", "Approach Vertical Jump", 4, "3"),
      x("ath-ankle-hops", "Ankle Stiffness Hops", 3, "12"),
      x("cal-glute-bridge", "Glute Bridge", 3, "15"),
    ],
  }),
  metcon: (n = 1): ProgramDay => ({
    day: `Day ${n}`,
    focus: "Metabolic Conditioning",
    exercises: [
      x("car-assault-bike", "Air Bike Intervals", 8, "30s on / 30s off"),
      x("kb-swing", "Kettlebell Swing", 5, "20", 1),
      x("cal-burpee", "Burpee", 5, "12", 1),
      x("car-row-erg", "Rowing Erg", 4, "500m"),
      x("car-jump-rope", "Jump Rope", 3, "2 min"),
    ],
  }),
  liss: (n = 1): ProgramDay => ({
    day: `Day ${n}`,
    focus: "Low-Intensity Steady State",
    exercises: [
      x("car-zone2-run", "Zone 2 Run", 1, "35 min"),
      x("car-cycling", "Steady-State Cycling", 1, "20 min"),
      x("rec-walk", "Recovery Walk", 1, "15 min"),
    ],
  }),
  core: (n: number): ProgramDay => ({
    day: `Day ${n}`,
    focus: "Core & Anti-Rotation",
    exercises: [
      x("cbl-pallof", "Pallof Press", 4, "12 each"),
      x("cbl-woodchop", "Cable Woodchopper", 3, "12 each"),
      x("cal-hollow-hold", "Hollow Body Hold", 3, "40s"),
      x("cal-side-plank", "Side Plank", 3, "40s each"),
      x("db-farmer", "Farmer's Carry", 3, "40 yd"),
    ],
  }),
  mobility: (n: number): ProgramDay => ({
    day: `Day ${n}`,
    focus: "Mobility & Durability",
    exercises: [
      x("rec-worlds-greatest", "World's Greatest Stretch", 2, "60s"),
      x("rec-90-90", "90/90 Hip Switch", 3, "60s"),
      x("rec-shoulder-cars", "Shoulder CARs", 2, "5 each"),
      x("rec-hip-cars", "Hip CARs", 2, "5 each"),
      x("rec-foam-tspine", "Foam Roll — T-Spine", 1, "2 min"),
      x("cal-deadbug", "Dead Bug", 3, "10 each"),
    ],
  }),
  rotational: (n: number): ProgramDay => ({
    day: `Day ${n}`,
    focus: "Rotational Power",
    exercises: [
      x("ath-mb-rotational", "Rotational Med Ball Throw", 5, "5 each"),
      x("ath-mb-slam", "Medicine Ball Slam", 4, "8"),
      x("cbl-woodchop", "Cable Woodchopper", 4, "10 each"),
      x("kb-turkish-getup", "Turkish Get-Up", 3, "3 each"),
      x("cbl-pallof", "Pallof Press", 3, "12 each"),
    ],
  }),
  contact: (n: number): ProgramDay => ({
    day: `Day ${n}`,
    focus: "Collision Force & Absorption",
    exercises: [
      x("car-sled-push", "Sled Push", 6, "20 yd"),
      x("bb-front-squat", "Barbell Front Squat", 4, "5"),
      x("ath-mb-chest-pass", "Explosive Chest Pass", 4, "6"),
      x("bb-push-press", "Push Press", 4, "5"),
      x("cal-plank", "Front Plank", 3, "60s"),
    ],
  }),
  armCare: (n: number): ProgramDay => ({
    day: `Day ${n}`,
    focus: "Shoulder & Arm Care",
    exercises: [
      x("cbl-face-pull", "Cable Face Pull", 4, "15"),
      x("band-pull-apart", "Band Pull-Apart", 3, "20"),
      x("mch-rear-delt-fly", "Rear Delt Fly", 3, "15"),
      x("rec-shoulder-cars", "Shoulder CARs", 2, "5 each"),
      x("cal-side-plank", "Side Plank", 3, "30s each"),
    ],
  }),
  unilateral: (n: number): ProgramDay => ({
    day: `Day ${n}`,
    focus: "Unilateral Strength & Balance",
    exercises: [
      x("db-bulgarian", "Bulgarian Split Squat", 4, "8 each"),
      x("db-step-up", "Dumbbell Step-Up", 3, "10 each"),
      x("db-row", "One-Arm Dumbbell Row", 3, "10 each"),
      x("ath-single-leg-balance", "Single-Leg Balance Reach", 3, "30s each"),
      x("cal-pistol-squat", "Pistol Squat", 3, "5 each"),
    ],
  }),
  pumpDay: (n: number): ProgramDay => ({
    day: `Day ${n}`,
    focus: "Isolation Pump",
    exercises: [
      x("mch-chest-press", "Machine Chest Press", 4, "15"),
      x("cbl-lat-pulldown", "Lat Pulldown", 4, "15"),
      x("db-lateral-raise", "Dumbbell Lateral Raise", 4, "20"),
      x("db-curl", "Dumbbell Biceps Curl", 4, "15", 1),
      x("cbl-triceps-pushdown", "Triceps Pushdown", 4, "15", 1),
      x("mch-leg-ext", "Leg Extension", 3, "20"),
    ],
  }),
};

type Arch =
  | "strength"
  | "power"
  | "hypertrophy"
  | "ppl"
  | "upperlower"
  | "fullbody"
  | "speed"
  | "agility"
  | "plyo"
  | "conditioning"
  | "fatloss"
  | "core"
  | "durability"
  | "rotational"
  | "contact"
  | "unilateral"
  | "hybrid";

function buildDays(arch: Arch, daysPerWeek: number): ProgramDay[] {
  const seq: Record<Arch, ProgramDay[]> = {
    strength: [D.maxSquat(), D.maxBench(), D.maxDeadlift(), D.dynamicPower(), D.core(5)],
    power: [D.dynamicPower(), D.plyo(), D.maxSquat(), D.rotational(4), D.mobility(5)],
    hypertrophy: [D.push(), D.pull(), D.legs(), D.upper(), D.pumpDay(5), D.lower()],
    ppl: [D.push(), D.pull(), D.legs(), D.push(), D.pull(), D.legs()],
    upperlower: [D.upper(), D.lower(), D.upper(), D.lower(), D.core(5)],
    fullbody: [D.fullBody(1), D.fullBody(2), D.fullBody(3), D.core(4)],
    speed: [D.accel(), D.maxVelocity(), D.agility(), D.plyo(), D.mobility(5)],
    agility: [D.agility(), D.accel(), D.plyo(), D.core(4), D.mobility(5)],
    plyo: [D.plyo(), D.accel(), D.maxSquat(), D.core(4), D.mobility(5)],
    conditioning: [D.metcon(1), D.liss(2), D.metcon(3), D.core(4), D.mobility(5)],
    fatloss: [D.metcon(1), D.upper(), D.liss(3), D.legs(), D.metcon(5)],
    core: [D.core(1), D.rotational(2), D.core(3), D.mobility(4)],
    durability: [D.mobility(1), D.unilateral(2), D.armCare(3), D.core(4), D.liss(5)],
    rotational: [D.rotational(1), D.maxSquat(), D.armCare(3), D.core(4), D.mobility(5)],
    contact: [D.contact(1), D.maxSquat(), D.maxBench(), D.metcon(4), D.mobility(5)],
    unilateral: [D.unilateral(1), D.lower(), D.upper(), D.core(4), D.mobility(5)],
    hybrid: [D.maxSquat(), D.metcon(2), D.maxBench(), D.accel(), D.pumpDay(5), D.mobility(6)],
  };
  const days = seq[arch];
  const out: ProgramDay[] = [];
  for (let i = 0; i < daysPerWeek; i++) {
    const base = days[i % days.length];
    out.push({ ...base, day: base.day.match(/^(Push|Pull|Legs|Upper|Lower)/) ? `Day ${i + 1} · ${base.day}` : `Day ${i + 1}` });
  }
  return out;
}

const ACCENTS = ["lime", "cyan", "flare"] as const;

function slug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

type Row = [name: string, group: string, arch: Arch, weeks: number, dpw: number, level: Program["level"]];

const ROWS: Row[] = [
  // -------- General strength / hypertrophy classics --------
  ["Arnold Split Bodybuilding Routine", "Bodybuilding", "hypertrophy", 8, 6, "Intermediate"],
  ["Push Pull Legs 6-Day Hypertrophy Program", "Bodybuilding", "ppl", 10, 6, "Intermediate"],
  ["Upper Lower 4-Day Strength Program", "General", "upperlower", 8, 4, "Intermediate"],
  ["Full Body 3-Day Beginner Routine", "General", "fullbody", 8, 3, "Beginner"],
  ["Bro Split 5-Day Body Part Routine", "Bodybuilding", "hypertrophy", 8, 5, "Beginner"],
  ["German Volume Training Program", "Bodybuilding", "hypertrophy", 6, 4, "Advanced"],
  ["5/3/1 Powerlifting Strength Routine", "Powerlifting", "strength", 12, 4, "Intermediate"],
  ["Starting Strength 5x5 Beginner Program", "Powerlifting", "fullbody", 12, 3, "Beginner"],
  ["PHAT Power Hypertrophy Adaptive Training", "Bodybuilding", "hybrid", 10, 5, "Advanced"],
  ["Westside Barbell Conjugate Routine", "Powerlifting", "strength", 12, 4, "Advanced"],
  ["Texas Method Intermediate Program", "Powerlifting", "strength", 10, 3, "Intermediate"],
  ["High-Intensity Interval Training Fat Loss Routine", "Conditioning", "fatloss", 6, 4, "Beginner"],
  ["CrossFit Style Metabolic Conditioning Workout", "Conditioning", "conditioning", 8, 5, "Intermediate"],
  ["Low-Intensity Steady-State Fat Loss Routine", "Conditioning", "fatloss", 8, 4, "Beginner"],
  ["Plyometric Power and Vertical Jump Program", "Speed & Agility", "plyo", 8, 3, "Intermediate"],
  ["Agility and Change of Direction Conditioning Routine", "Speed & Agility", "agility", 6, 4, "Intermediate"],
  ["Rotational Power and Core Stability Program", "General", "rotational", 8, 4, "Intermediate"],
  ["Max Velocity Acceleration Sprinting Routine", "Speed & Agility", "speed", 8, 4, "Advanced"],
  ["Deceleration and Route Cut Agility Program", "Speed & Agility", "agility", 6, 4, "Intermediate"],
  ["Low-Hip Acceleration and Explosion Program", "Football", "speed", 6, 4, "Intermediate"],
  ["8-Week Program for D-Linemen", "Football", "contact", 8, 4, "Advanced"],
  ["8-Week Program to Increase Speed", "Speed & Agility", "speed", 8, 4, "Intermediate"],
  ["Wide Receiver Speed and Route Running Program", "Football", "speed", 8, 4, "Intermediate"],
  ["Lineman Max Force and Contact Absorption Routine", "Football", "contact", 8, 4, "Advanced"],

  // -------- Goal blocks --------
  ["12-Week Off-Season Football Mass Builder", "Football", "hypertrophy", 12, 5, "Intermediate"],
  ["6-Week Explosive First-Step Quickness Protocol", "Speed & Agility", "agility", 6, 4, "Intermediate"],
  ["4-Week Cutting and Leaning Out Cycle", "Conditioning", "fatloss", 4, 5, "Intermediate"],
  ["10-Week Powerlifting Peaking Program", "Powerlifting", "strength", 10, 4, "Advanced"],
  ["8-Week Functional Hypertrophy Block", "General", "hypertrophy", 8, 4, "Intermediate"],
  ["6-Week Linear Speed and Acceleration Blueprint", "Speed & Agility", "speed", 6, 4, "Intermediate"],
  ["12-Week Hybrid Strength and Conditioning Matrix", "General", "hybrid", 12, 5, "Intermediate"],
  ["4-Week Absolute Strength Intensification Phase", "Powerlifting", "strength", 4, 4, "Advanced"],
  ["8-Week Athletic Durability and Injury Prevention Protocol", "General", "durability", 8, 4, "Beginner"],
  ["6-Week Maximal Oxygen Uptake and Stamina Builder", "Conditioning", "conditioning", 6, 5, "Intermediate"],
  ["12-Week Aesthetic Physique Sculpting Cycle", "Bodybuilding", "hypertrophy", 12, 5, "Intermediate"],
  ["8-Week Rotational Torque and Throwing Power Program", "General", "rotational", 8, 4, "Intermediate"],
  ["4-Week Peaking Phase for Maximum 40-Yard Dash Time", "Football", "speed", 4, 4, "Advanced"],
  ["10-Week Unilateral Strength and Stability Balance Routine", "General", "unilateral", 10, 4, "Intermediate"],
  ["6-Week Explosive Plyometric Shock Cycle", "Speed & Agility", "plyo", 6, 3, "Advanced"],
  ["12-Week Heavy Resistance Hypertrophic Overload", "Bodybuilding", "hypertrophy", 12, 5, "Advanced"],
  ["8-Week Defensive Back Lockdown Speed Program", "Football", "speed", 8, 4, "Intermediate"],
  ["6-Week Linebacker Explosive Tackling Power Protocol", "Football", "contact", 6, 4, "Intermediate"],
  ["10-Week Running Back Tackle-Breaking Strength Routine", "Football", "contact", 10, 4, "Intermediate"],
  ["8-Week Quarterback Rotational Arm Velocity System", "Football", "rotational", 8, 4, "Intermediate"],
  ["12-Week Offensive Lineman Trench Dominance Blueprint", "Football", "contact", 12, 4, "Advanced"],
  ["6-Week Wide Receiver Release and Separation Speed Cycle", "Football", "agility", 6, 4, "Intermediate"],
  ["4-Week Tight End Mismatch Physical Conditioning Block", "Football", "hybrid", 4, 4, "Intermediate"],
  ["8-Week Safety Pursuit Angle and Closing Speed Routine", "Football", "speed", 8, 4, "Intermediate"],
  ["6-Week Kicker and Punter Leg Explosive Power Generator", "Football", "plyo", 6, 4, "Intermediate"],
  ["12-Week Complete Athletic Transformation Protocol", "General", "hybrid", 12, 5, "Intermediate"],
  ["8-Week Absolute Mass Accumulation Phase", "Bodybuilding", "hypertrophy", 8, 5, "Intermediate"],
  ["6-Week Metabolic Shredding and Conditioning Cycle", "Conditioning", "fatloss", 6, 5, "Intermediate"],
  ["10-Week Strength Endurance and Work Capacity Block", "Conditioning", "hybrid", 10, 4, "Intermediate"],
  ["8-Week Explosive Triple Extension Masterclass", "General", "power", 8, 4, "Advanced"],
  ["6-Week Deceleration Mechanics and Knee Stability Protocol", "Speed & Agility", "durability", 6, 4, "Intermediate"],
  ["12-Week Powerbuilding Dual-Focus Program", "Powerlifting", "hybrid", 12, 5, "Intermediate"],
  ["8-Week High-Frequency Upper Body Specialization Routine", "Bodybuilding", "upperlower", 8, 5, "Advanced"],
  ["8-Week High-Frequency Lower Body Specialization Routine", "Bodybuilding", "upperlower", 8, 5, "Advanced"],
  ["6-Week Core Armor and Anti-Rotation Stability Blueprint", "General", "core", 6, 4, "Beginner"],
  ["10-Week Functional Strength and Mobility Matrix", "General", "durability", 10, 4, "Beginner"],
  ["8-Week Raw Strength and Power Development Cycle", "Powerlifting", "strength", 8, 4, "Intermediate"],
  ["6-Week Speed Endurance and Lactic Acid Tolerance Protocol", "Conditioning", "conditioning", 6, 4, "Advanced"],
  ["12-Week Bodybuilding Contest Prep Routine", "Bodybuilding", "hypertrophy", 12, 6, "Advanced"],
  ["8-Week Lean Muscle Retention and Caloric Deficit Protocol", "Bodybuilding", "fatloss", 8, 5, "Intermediate"],
  ["6-Week Fast-Twitch Muscle Fiber Stimulation Routine", "Speed & Agility", "power", 6, 4, "Advanced"],
  ["10-Week Posterior Chain Annihilation Program", "General", "strength", 10, 4, "Intermediate"],
  ["8-Week Quad-Dominant Mass Building Protocol", "Bodybuilding", "hypertrophy", 8, 4, "Intermediate"],
  ["6-Week Shoulder Bulletproofing and Stability Cycle", "General", "durability", 6, 4, "Beginner"],
  ["12-Week Structural Balance and Posture Correction Program", "General", "durability", 12, 4, "Beginner"],
  ["8-Week Absolute Relative Strength Protocol", "General", "strength", 8, 4, "Advanced"],
  ["6-Week Sprint Mechanics Overhaul Blueprint", "Speed & Agility", "speed", 6, 4, "Intermediate"],
  ["10-Week Multi-Directional Agility and Footwork Routine", "Speed & Agility", "agility", 10, 4, "Intermediate"],
  ["8-Week Heavy Bag and Combat Conditioning Hybrid Protocol", "MMA & Combat", "conditioning", 8, 5, "Intermediate"],
  ["6-Week Maximal Force Absorption and Collision Durability Routine", "Football", "contact", 6, 4, "Advanced"],
  ["12-Week Off-Season Mass and Structural Reinforcement Matrix", "General", "hypertrophy", 12, 5, "Intermediate"],
  ["8-Week Explosive Med-Ball Power Development Block", "General", "rotational", 8, 4, "Intermediate"],
  ["6-Week First-Step Reaction Time and Twitch Protocol", "Speed & Agility", "agility", 6, 4, "Intermediate"],
  ["10-Week Strength Plateau-Busting Shock Cycle", "Powerlifting", "strength", 10, 4, "Advanced"],
  ["8-Week Compound Movement Specialization Blueprint", "General", "strength", 8, 4, "Intermediate"],
  ["6-Week Isolation-Heavy Pump and Flush Routine", "Bodybuilding", "hypertrophy", 6, 5, "Beginner"],
  ["12-Week Endurance Athlete Strength Maintenance Program", "Endurance", "hybrid", 12, 3, "Intermediate"],
  ["8-Week Explosive Jumping and Vertical Enhancement Protocol", "Speed & Agility", "plyo", 8, 4, "Intermediate"],
  ["6-Week Lateral Speed and Change of Direction Matrix", "Speed & Agility", "agility", 6, 4, "Intermediate"],
  ["10-Week Core Stability and Functional Bracing Cycle", "General", "core", 10, 4, "Beginner"],
  ["8-Week Upper Body Armor Plate Builder", "Bodybuilding", "upperlower", 8, 4, "Intermediate"],
  ["6-Week Lower Body Spring and Rebound Protocol", "Speed & Agility", "plyo", 6, 4, "Intermediate"],
  ["12-Week Advanced Bodybuilding Periodization Scheme", "Bodybuilding", "hypertrophy", 12, 6, "Advanced"],
  ["8-Week Youth Athletic Foundation and Coordination Routine", "General", "fullbody", 8, 3, "Beginner"],
  ["6-Week High-Intensity Tactical Conditioning Protocol", "Conditioning", "conditioning", 6, 5, "Advanced"],
  ["10-Week Maximal Strength Baseline Builder", "Powerlifting", "strength", 10, 4, "Beginner"],
  ["8-Week Explosive Start-Stop Deceleration Routine", "Speed & Agility", "agility", 8, 4, "Intermediate"],
  ["6-Week Absolute Power Generation Blueprint", "General", "power", 6, 4, "Advanced"],
  ["12-Week Comprehensive Sports Performance Matrix", "General", "hybrid", 12, 5, "Intermediate"],
  ["8-Week Speed-Strength Transfer Protocol", "Speed & Agility", "power", 8, 4, "Advanced"],
  ["6-Week Strength-Speed Conversion Block", "Speed & Agility", "power", 6, 4, "Advanced"],
  ["10-Week Maximal Hypertrophy Volume Protocol", "Bodybuilding", "hypertrophy", 10, 5, "Advanced"],
  ["8-Week Minimal Time High-Efficiency Muscle Builder", "General", "fullbody", 8, 3, "Beginner"],
  ["6-Week Metabolic Conditioning and Fat Incineration Routine", "Conditioning", "fatloss", 6, 5, "Intermediate"],
  ["12-Week Elite Athletic Conditioning System", "Conditioning", "hybrid", 12, 5, "Advanced"],
  ["8-Week Power and Velocity Synchronization Protocol", "General", "power", 8, 4, "Advanced"],
  ["16-Week Ultimate Off-Season Football Transformation Matrix", "Football", "hybrid", 16, 5, "Advanced"],
  ["12-Week Functional Hypertrophy and Athletic Power Block", "General", "hybrid", 12, 5, "Intermediate"],
  ["10-Week Maximal Velocity and Top-End Speed Generator", "Speed & Agility", "speed", 10, 4, "Advanced"],
  ["8-Week Relentless Conditioning and Gas-Tank Expansion Routine", "Conditioning", "conditioning", 8, 5, "Intermediate"],
  ["6-Week Shock-Method Plyometric and Reactive Power Cycle", "Speed & Agility", "plyo", 6, 3, "Advanced"],
  ["12-Week Powerlifting Total Maximization Protocol", "Powerlifting", "strength", 12, 4, "Advanced"],
  ["10-Week Bodybuilding Aesthetic Proportion Framework", "Bodybuilding", "hypertrophy", 10, 5, "Intermediate"],
  ["8-Week Brute Strength and Structural Hardening Phase", "Powerlifting", "strength", 8, 4, "Advanced"],
  ["6-Week Explosive Hip-Extension and Power-Clean Blueprint", "General", "power", 6, 4, "Intermediate"],
  ["12-Week Unilateral Imbalance Correction and Stability Routine", "General", "unilateral", 12, 4, "Beginner"],
  ["8-Week Core-to-Extremity Transfer and Rotational Power System", "General", "rotational", 8, 4, "Intermediate"],
  ["6-Week Maximum Force Output and Neural Drive Protocol", "Powerlifting", "strength", 6, 4, "Advanced"],
  ["10-Week High-Density Metabolic Resistance Training Cycle", "Conditioning", "hybrid", 10, 4, "Intermediate"],
  ["12-Week Lean Mass Preservation During Caloric Restriction", "Bodybuilding", "fatloss", 12, 5, "Intermediate"],
  ["8-Week Advanced Drop-Set and Mechanical Advantage Routine", "Bodybuilding", "hypertrophy", 8, 5, "Advanced"],
  ["6-Week Reactive Agility and Open-Field Quickness Block", "Speed & Agility", "agility", 6, 4, "Intermediate"],
  ["12-Week Structural Durability and Tendon Reinforcement Protocol", "General", "durability", 12, 4, "Intermediate"],
  ["10-Week Fast-Twitch Fiber Recruitment and Speed-Strength Matrix", "Speed & Agility", "power", 10, 4, "Advanced"],
  ["8-Week Explosive First-Step Reaction and Start Protocol", "Speed & Agility", "speed", 8, 4, "Intermediate"],

  // -------- Football position deep cuts --------
  ["10-Week Quarterback Pocket Mobility and Evasion Protocol", "Football", "agility", 10, 4, "Intermediate"],
  ["8-Week Wide Receiver Route-Break Sharpness and Deceleration Masterclass", "Football", "agility", 8, 4, "Advanced"],
  ["12-Week Running Back Open-Field Elusiveness and Contact Balance Routine", "Football", "hybrid", 12, 4, "Intermediate"],
  ["10-Week Offensive Tackle Pass-Protection Anchor and Punch Power Block", "Football", "contact", 10, 4, "Advanced"],
  ["8-Week Defensive End Edge-Rush Burst and Bend System", "Football", "power", 8, 4, "Advanced"],
  ["10-Week Defensive Tackle Gap-Plugging Absolute Mass and Power Routine", "Football", "contact", 10, 4, "Advanced"],
  ["8-Week Middle Linebacker Sideline-to-Sideline Pursuit Speed Protocol", "Football", "speed", 8, 4, "Intermediate"],
  ["10-Week Safety Open-Field Collision and Tracking Angle Blueprint", "Football", "hybrid", 10, 4, "Intermediate"],
  ["8-Week Cornerback Press-Coverage Hand-Combat and Speed Program", "Football", "speed", 8, 4, "Advanced"],
  ["12-Week Tight End Inline Blocking and Seam-Stretching Hybrid Matrix", "Football", "hybrid", 12, 4, "Intermediate"],
  ["8-Week Punter and Kicker Drop-Zone Precision and Leg Speed Protocol", "Football", "plyo", 8, 4, "Intermediate"],
  ["10-Week Edge Rusher Speed-to-Power Conversion Cycle", "Football", "power", 10, 4, "Advanced"],
  ["8-Week Interior Lineman Leverage and Low-Hip Explosion Routine", "Football", "contact", 8, 4, "Advanced"],
  ["12-Week Skill Position Maximum Velocity and Deceleration Matrix", "Football", "speed", 12, 4, "Advanced"],
  ["10-Week Linebacker Shed-Block and Explosive Striking Block", "Football", "contact", 10, 4, "Intermediate"],
  ["8-Week Defensive Back Hip-Fluidity and Transition Speed Routine", "Football", "agility", 8, 4, "Intermediate"],
  ["10-Week Running Back Burst-Acceleration and Vertical Jump Program", "Football", "plyo", 10, 4, "Intermediate"],
  ["8-Week Wide Receiver Vertical Tracking and Contested-Catch Strength Routine", "Football", "hybrid", 8, 4, "Intermediate"],
  ["12-Week Football-Specific Hypertrophy and Force Production System", "Football", "hypertrophy", 12, 5, "Intermediate"],
  ["10-Week Athletic Powerlifting Hybrid Peak Routine", "Powerlifting", "hybrid", 10, 4, "Advanced"],
  ["8-Week Absolute Neural Drive and Fast-Twitch Recruitment Block", "Powerlifting", "power", 8, 4, "Advanced"],

  // -------- Other sports --------
  ["10-Week Cricket Fast Bowler Shin and Shoulder Injury Prevention Protocol", "Cricket", "durability", 10, 4, "Intermediate"],
  ["8-Week Cricket Batsman Rotational Power and Hand-Eye Coordination Routine", "Cricket", "rotational", 8, 4, "Intermediate"],
  ["10-Week Cricket All-Rounder Strength and Repeat-Sprint Matrix", "Cricket", "hybrid", 10, 4, "Intermediate"],
  ["6-Week Cricket Wicketkeeper Squat Mobility and Reaction Cycle", "Cricket", "agility", 6, 4, "Beginner"],
  ["12-Week Soccer Winger High-Intensity Interval Conditioning and Acceleration Matrix", "Soccer", "conditioning", 12, 4, "Intermediate"],
  ["8-Week Soccer Central Midfielder Match-Stamina and Box-to-Box Endurance Program", "Soccer", "conditioning", 8, 4, "Intermediate"],
  ["6-Week Soccer Striker Explosive Finishing and First-Step Quickness Block", "Soccer", "agility", 6, 4, "Intermediate"],
  ["10-Week Soccer Defender Aerial Power and Duel Strength Routine", "Soccer", "power", 10, 4, "Intermediate"],
  ["10-Week Basketball Vertical Jump and Plyometric Shock Program", "Basketball", "plyo", 10, 4, "Intermediate"],
  ["8-Week Basketball Point Guard Lateral Agility and Change-of-Direction Blueprint", "Basketball", "agility", 8, 4, "Intermediate"],
  ["12-Week Basketball Center Post-Dominance and Contact Strength Routine", "Basketball", "contact", 12, 4, "Advanced"],
  ["10-Week Baseball Pitcher Rotational Arm Care and Velocity Protocol", "Baseball", "rotational", 10, 4, "Intermediate"],
  ["8-Week Baseball Hitter Bat Speed and Rotational Power Builder", "Baseball", "rotational", 8, 4, "Intermediate"],
  ["6-Week Track and Field Sprinter Starting Block Mechanics and Acceleration Routine", "Track & Field", "speed", 6, 4, "Advanced"],
  ["8-Week Track and Field Middle-Distance Lactic Acid Threshold Program", "Track & Field", "conditioning", 8, 5, "Intermediate"],
  ["12-Week Track and Field Thrower Absolute Power and Olympic Lifting Block", "Track & Field", "power", 12, 4, "Advanced"],
  ["10-Week Swimming Shoulder Durability and Lat-Focused Power Routine", "Swimming", "durability", 10, 4, "Intermediate"],
  ["8-Week Swimming Flip-Turn Explosive Core and Start Protocol", "Swimming", "core", 8, 4, "Intermediate"],
  ["12-Week Tennis Rotational Core and Shoulder Stabilizer Conditioning Matrix", "Tennis", "rotational", 12, 4, "Intermediate"],
  ["8-Week Rugby Enforcer Collision Durability and Heavy Mass Routine", "Rugby", "contact", 8, 4, "Advanced"],
  ["10-Week Volleyball Vertical Jump and Shoulder Spike Power Program", "Volleyball", "plyo", 10, 4, "Intermediate"],
  ["8-Week Mixed Martial Arts Rotational Core and Gas-Tank Conditioning Routine", "MMA & Combat", "conditioning", 8, 5, "Advanced"],
  ["12-Week Powerlifting and Bodybuilding Concurrent Athletic Hybrid Protocol", "Powerlifting", "hybrid", 12, 5, "Advanced"],
  ["10-Week Hockey Skating Power and Hip Strength Program", "Hockey", "power", 10, 4, "Intermediate"],
  ["8-Week Wrestling Grip Strength and Scramble Conditioning Routine", "Wrestling", "conditioning", 8, 5, "Advanced"],
  ["10-Week Golf Rotational Speed and Hip Separation Program", "Golf", "rotational", 10, 3, "Intermediate"],
  ["8-Week Lacrosse Shot Power and Dodge Agility Routine", "Lacrosse", "agility", 8, 4, "Intermediate"],
  ["10-Week Distance Running Strength and Injury-Proofing Block", "Endurance", "durability", 10, 3, "Intermediate"],
  ["12-Week Triathlon Strength Endurance Support Matrix", "Endurance", "hybrid", 12, 4, "Intermediate"],
  ["8-Week Boxing Footwork and Punch Power Conditioning Cycle", "MMA & Combat", "power", 8, 5, "Intermediate"],
  ["10-Week Gymnastics Strength and Straight-Arm Control Protocol", "Calisthenics", "unilateral", 10, 4, "Advanced"],
  ["8-Week Calisthenics Skill and Hypertrophy Progression", "Calisthenics", "ppl", 8, 5, "Intermediate"],

  // -------- Dance, aesthetic & artistic sports --------
  ["10-Week Dance Power and Jump Height Program", "Dance", "plyo", 10, 4, "Intermediate"],
  ["8-Week Ballet Turnout Strength and Control Routine", "Dance", "unilateral", 8, 4, "Intermediate"],
  ["6-Week Hip-Hop Dance Explosiveness and Stamina Cycle", "Dance", "conditioning", 6, 5, "Beginner"],
  ["8-Week Contemporary Dance Core and Balance Blueprint", "Dance", "core", 8, 4, "Beginner"],
  ["12-Week Dance Conditioning and Injury-Proofing Matrix", "Dance", "durability", 12, 4, "Beginner"],
  ["8-Week Competitive Dance Team Strength Base", "Dance", "fullbody", 8, 3, "Beginner"],
  ["10-Week Cheerleading Tumbling Power Program", "Cheer", "plyo", 10, 4, "Intermediate"],
  ["8-Week Cheer Stunt Stability and Overhead Strength Routine", "Cheer", "durability", 8, 4, "Intermediate"],
  ["8-Week Figure Skating Jump and Landing Control Cycle", "Figure Skating", "plyo", 8, 4, "Intermediate"],
  ["10-Week Figure Skating Edge Strength and Hip Stability Block", "Figure Skating", "unilateral", 10, 4, "Intermediate"],
  ["10-Week Artistic Gymnastics Strength and Skill Program", "Gymnastics", "unilateral", 10, 5, "Advanced"],
  ["8-Week Gymnastics Core Compression and Handstand Routine", "Gymnastics", "core", 8, 5, "Intermediate"],
  ["8-Week Color Guard and Marching Band Endurance Routine", "Dance", "conditioning", 8, 4, "Beginner"],

  // -------- More sports --------
  ["10-Week Rowing Power and Erg Endurance Program", "Rowing", "hybrid", 10, 5, "Intermediate"],
  ["8-Week Swimming Dryland Power and Shoulder Care Routine", "Swimming", "durability", 8, 4, "Intermediate"],
  ["8-Week Water Polo Treading Endurance and Throw Power Cycle", "Water Polo", "rotational", 8, 4, "Intermediate"],
  ["8-Week Badminton Footwork and Overhead Power Program", "Badminton", "agility", 8, 4, "Intermediate"],
  ["6-Week Table Tennis Reaction and Rotational Speed Routine", "Table Tennis", "rotational", 6, 4, "Beginner"],
  ["8-Week Squash Court Movement and Lunge Strength Block", "Squash", "unilateral", 8, 4, "Intermediate"],
  ["10-Week Alpine Ski Racing Leg Strength and Isometric Block", "Skiing", "strength", 10, 4, "Advanced"],
  ["8-Week Snowboard Rotational Control and Landing Program", "Snowboarding", "rotational", 8, 4, "Intermediate"],
  ["10-Week Rock Climbing Pull Strength and Grip Endurance Cycle", "Climbing", "unilateral", 10, 4, "Intermediate"],
  ["8-Week Surfing Paddle Power and Pop-Up Explosiveness Routine", "Surfing", "hybrid", 8, 4, "Intermediate"],
  ["8-Week Ultimate Frisbee Repeat Sprint and Cut Program", "Ultimate", "agility", 8, 4, "Intermediate"],
  ["8-Week Team Handball Throw Velocity and Contact Routine", "Handball", "contact", 8, 4, "Intermediate"],
  ["8-Week Softball Hitting Power and Rotational Torque Program", "Softball", "rotational", 8, 4, "Intermediate"],
  ["8-Week Softball Pitcher Arm Care and Lower Drive Routine", "Softball", "durability", 8, 4, "Intermediate"],
  ["6-Week Fencing Lunge Speed and Reactive Footwork Cycle", "Fencing", "agility", 6, 4, "Intermediate"],
  ["8-Week Cycling Sprint Power and Leg Endurance Program", "Cycling", "conditioning", 8, 4, "Intermediate"],
  ["8-Week Cross Country Runner Strength and Hill Power Block", "Endurance", "durability", 8, 4, "Intermediate"],
  ["8-Week Field Hockey Low-Posture Strength and Speed Routine", "Field Hockey", "unilateral", 8, 4, "Intermediate"],
  ["8-Week Ice Hockey Stride Power and Core Rotation Program", "Hockey", "power", 8, 4, "Intermediate"],
  ["8-Week Netball Jump Landing and Change of Direction Routine", "Netball", "plyo", 8, 4, "Intermediate"],
  ["8-Week Equestrian Rider Core and Leg Endurance Program", "Equestrian", "core", 8, 3, "Beginner"],
  ["8-Week Rugby Sevens Repeat Effort Conditioning Cycle", "Rugby", "conditioning", 8, 5, "Advanced"],
  ["8-Week Track Throws Shot Put and Discus Power Program", "Track & Field", "power", 8, 4, "Advanced"],
  ["8-Week Pole Vault and Jumps Elastic Power Routine", "Track & Field", "plyo", 8, 4, "Advanced"],
  ["8-Week Esports Athlete Posture, Wrist and Cardio Routine", "General", "durability", 8, 3, "Beginner"],
  ["8-Week Marching Season Heat Conditioning Program", "Conditioning", "conditioning", 8, 4, "Beginner"],
  ["8-Week Adaptive Athlete Upper Body Strength Base", "General", "upperlower", 8, 3, "Beginner"],
  ["8-Week Skateboarding Ankle Resilience and Pop Power Routine", "Skateboarding", "plyo", 8, 4, "Intermediate"],
  ["8-Week Volleyball Setter Shoulder and Jump Program", "Volleyball", "plyo", 8, 4, "Intermediate"],
  ["8-Week Basketball Guard First-Step and Finishing Routine", "Basketball", "agility", 8, 4, "Intermediate"],
  ["8-Week Basketball Big Man Post Strength and Rebound Program", "Basketball", "contact", 8, 4, "Intermediate"],
];

const ARCH_BLURB: Record<Arch, string> = {
  strength: "Heavy compound progression with submaximal volume and weekly intensity waves.",
  power: "Triple-extension speed work, contrast pairs and neural-drive focused lifting.",
  hypertrophy: "High-volume muscle building with progressive overload and isolation finishers.",
  ppl: "Six-day push/pull/legs rotation with frequency-driven muscle growth.",
  upperlower: "Alternating upper and lower sessions for balanced strength and size.",
  fullbody: "Simple, high-frequency full-body training built around the big lifts.",
  speed: "Sprint mechanics, acceleration and top-end velocity with heavy posterior chain support.",
  agility: "Cutting mechanics, reactive footwork and deceleration control.",
  plyo: "Jump progression, shock method and elastic power for vertical gains.",
  conditioning: "Interval engine work, work-capacity circuits and aerobic base building.",
  fatloss: "Calorie-burning intervals plus lifting to hold muscle while leaning out.",
  core: "Anti-rotation, bracing and trunk stiffness for force transfer.",
  durability: "Prehab, mobility and tissue resilience so you stay on the field.",
  rotational: "Med-ball throws, hip-shoulder separation and torque development.",
  contact: "Sled work, absolute strength and force absorption for collisions.",
  unilateral: "Single-leg and single-arm work to fix imbalances and build stability.",
  hybrid: "Concurrent strength, size and conditioning in one weekly structure.",
};

export const CATALOG_PROGRAMS: Program[] = ROWS.map(([name, group, arch, weeks, dpw, level], i) => ({
  id: slug(name),
  name,
  tagline: ARCH_BLURB[arch],
  weeks,
  daysPerWeek: dpw,
  level,
  tracks: ["sport", "strength", "speed"],
  accent: ACCENTS[i % 3],
  group,
  days: buildDays(arch, dpw),
}));
