/** Daily coach note — deterministic per day so it feels like a real drop, not random noise. */
const TIPS = [
  "Hydrate well today and focus on explosive hip drive during squats.",
  "Warm up with 5 minutes of A-skips and ankle hops before anything heavy.",
  "Chase one extra rep on your first working set — that's how overload starts.",
  "Sleep is your cheapest supplement. Eight hours beats any pre-workout.",
  "Slow the lowering phase to 3 seconds today; control builds tendons.",
  "Fuel 30–60g of carbs before practice so your last rep looks like your first.",
  "Log every set. What you don't track, you can't beat next week.",
  "Sprint quality over sprint quantity — full recovery between reps.",
  "Brace your core like you're about to take a hit before every heavy pull.",
  "Add 5 lb or 1 rep somewhere today. Small jumps stack into big seasons.",
];

export function dailyCoachTip(seedName = "") {
  const day = Math.floor(Date.now() / 864e5);
  const seed = seedName.length + day;
  return TIPS[Math.abs(seed) % TIPS.length];
}
