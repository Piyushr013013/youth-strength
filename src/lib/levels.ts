/** Athlete level titles — youth-athlete flavoured progression ladder. */
export const LEVEL_TITLES = [
  "Rookie",
  "Walk-On",
  "Practice Squad",
  "Varsity Prospect",
  "Starter",
  "Team Captain",
  "All-Conference",
  "All-State",
  "Blue Chip",
  "D1 Recruit",
  "Elite",
  "Legend",
];

export function levelTitle(level: number) {
  return LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, Math.max(0, level - 1))];
}

/** XP from real training work: tonnage, sessions and records. */
export function trainingXp(input: { tonnage: number; sessions: number; prCount: number }) {
  return Math.round(input.tonnage / 100 + input.sessions * 60 + input.prCount * 40);
}
