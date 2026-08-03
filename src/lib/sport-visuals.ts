/** Visual identity per program group — emoji mark + accent so plan lists aren't text-only. */
type Visual = { emoji: string; accent: "lime" | "cyan" | "flare" };

const MAP: Record<string, Visual> = {
  Football: { emoji: "🏈", accent: "lime" },
  Basketball: { emoji: "🏀", accent: "flare" },
  Soccer: { emoji: "⚽", accent: "lime" },
  Baseball: { emoji: "⚾", accent: "cyan" },
  Softball: { emoji: "🥎", accent: "cyan" },
  Cricket: { emoji: "🏏", accent: "lime" },
  Rugby: { emoji: "🏉", accent: "flare" },
  Hockey: { emoji: "🏒", accent: "cyan" },
  Volleyball: { emoji: "🏐", accent: "flare" },
  Tennis: { emoji: "🎾", accent: "lime" },
  Golf: { emoji: "⛳", accent: "lime" },
  Swimming: { emoji: "🏊", accent: "cyan" },
  Rowing: { emoji: "🚣", accent: "cyan" },
  Surfing: { emoji: "🏄", accent: "cyan" },
  Climbing: { emoji: "🧗", accent: "flare" },
  Skating: { emoji: "⛸️", accent: "cyan" },
  Wrestling: { emoji: "🤼", accent: "flare" },
  Boxing: { emoji: "🥊", accent: "flare" },
  MMA: { emoji: "🥋", accent: "flare" },
  Track: { emoji: "🏃", accent: "lime" },
  "Track & Field": { emoji: "🏃", accent: "lime" },
  "Cross Country": { emoji: "🥾", accent: "lime" },
  Cycling: { emoji: "🚴", accent: "cyan" },
  Dance: { emoji: "🩰", accent: "flare" },
  Cheer: { emoji: "📣", accent: "flare" },
  Gymnastics: { emoji: "🤸", accent: "flare" },
  Lacrosse: { emoji: "🥍", accent: "lime" },
  Badminton: { emoji: "🏸", accent: "cyan" },
  Skiing: { emoji: "🎿", accent: "cyan" },
  Bodybuilding: { emoji: "💪", accent: "lime" },
  Powerlifting: { emoji: "🏋️", accent: "lime" },
  Weightlifting: { emoji: "🏋️", accent: "lime" },
  Calisthenics: { emoji: "🤾", accent: "cyan" },
  Strongman: { emoji: "🪨", accent: "flare" },
  Hypertrophy: { emoji: "💪", accent: "lime" },
  Speed: { emoji: "⚡", accent: "flare" },
  Mobility: { emoji: "🧘", accent: "cyan" },
  Conditioning: { emoji: "🫀", accent: "flare" },
  Esports: { emoji: "🎮", accent: "cyan" },
  General: { emoji: "🔥", accent: "lime" },
};

export function sportVisual(group?: string | null): Visual {
  if (!group) return MAP.General;
  if (MAP[group]) return MAP[group];
  const hit = Object.keys(MAP).find((k) => group.toLowerCase().includes(k.toLowerCase()));
  return hit ? MAP[hit] : MAP.General;
}

/** One-tap sport picker options for onboarding. */
export const QUICK_SPORTS = [
  "Basketball",
  "Football",
  "Soccer",
  "Track & Field",
  "Baseball / Softball",
  "Volleyball",
  "Wrestling",
  "Swimming",
  "Tennis",
  "Cross Country",
  "Lacrosse",
  "Hockey",
  "Cricket",
  "Rugby",
  "Dance",
  "Cheer",
  "Gymnastics",
  "Golf",
];
