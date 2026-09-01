import { honingBrackets } from "$lib/data/honing";

export function calculateHoningCost(current: number, target: number) {
  return honingBrackets
    .filter((b) => b.from >= current && b.to <= target)
    .reduce((sum, bracket) => sum + bracket.averageGold, 0);
}
