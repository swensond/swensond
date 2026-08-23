export interface KarmaCost {
  from: number;
  to: number;
  gold: number;
}

export const karmaCosts: KarmaCost[] = [
  // Levels 1–4 repeat every 5 levels through rank 6 (levels 1-24)
  // Pattern: 20% → 15% → 10% → 7% per group of 4, then rank-up at level 5
  // Average attempts = 1/successRate (capped by pity)

  // Level 1: 20% success, 10 pity → avg ~5 attempts
  { from: 1, to: 2, gold: 5500 },
  // Level 2: 15% success, 14 pity → avg ~6.7 attempts
  { from: 2, to: 3, gold: 7333 },
  // Level 3: 10% success, 20 pity → avg ~10 attempts
  { from: 3, to: 4, gold: 11000 },
  // Level 4: 7% success, 29 pity → avg ~14.3 attempts
  { from: 4, to: 5, gold: 15714 },
  // Level 5: 20% → rank up required before continuing
  { from: 5, to: 6, gold: 5500 },
  { from: 6, to: 7, gold: 7333 },
  { from: 7, to: 8, gold: 11000 },
  { from: 8, to: 9, gold: 15714 },
  { from: 9, to: 10, gold: 5500 },
  { from: 10, to: 11, gold: 7333 },
  { from: 11, to: 12, gold: 11000 },
  { from: 12, to: 13, gold: 15714 },
  { from: 13, to: 14, gold: 5500 },
  { from: 14, to: 15, gold: 7333 },
  { from: 15, to: 16, gold: 11000 },
  { from: 16, to: 17, gold: 15714 },
  { from: 17, to: 18, gold: 5500 },
  { from: 18, to: 19, gold: 7333 },
  { from: 19, to: 20, gold: 11000 },
  { from: 20, to: 21, gold: 15714 },
  // Rank 6 levels — same pattern for 21-24, then sharp spike at 25
  { from: 21, to: 22, gold: 5500 },   // 20% success
  { from: 22, to: 23, gold: 7333 },   // 15% success
  { from: 23, to: 24, gold: 11000 },  // 10% success
  { from: 24, to: 25, gold: 15714 },  // 7% success
  // Level 25: 4% success, 56 pity → avg ~25 attempts
  { from: 25, to: 26, gold: 27500 },
  // Level 26: 2% success, 112 pity → avg ~50 attempts
  { from: 26, to: 27, gold: 55000 },
  // Level 27: 1% success, 250 pity → avg ~100 attempts
  { from: 27, to: 28, gold: 110000 },
  // Level 28: 0.5% success, 500 pity → avg ~200 attempts
  { from: 28, to: 29, gold: 220000 },
  // Level 29: 0.2% success, 1250 pity → avg ~500 attempts
  { from: 29, to: 30, gold: 550000 },
];
