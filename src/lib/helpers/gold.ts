import { isGoldEarner, type Character } from "$lib/helpers/character";
import { raids } from "$lib/data/raids";

// --------------------
// BUILD RAID LOOKUP MAP (ONCE)
// --------------------

const raidMap = new Map(
  raids.map((r) => [r.id, r] as const)
);

// --------------------
// SINGLE CHARACTER GOLD
// Non-gold-earners earn nothing (max 6 earners per roster).
// --------------------

export function characterWeeklyGold(char: Character): number {
  if (!isGoldEarner(char)) return 0;

  let total = 0;

  for (const raidId of char.assignedRaids) {
    const raid = raidMap.get(raidId);
    if (!raid) continue;

    total += raid.tradableGold ?? 0;
  }

  return total;
}

// --------------------
// SINGLE CHARACTER GOLD SPLIT (TRADEABLE VS BOUND VS TOTAL)
// Descriptive only - the planner's balance receives tradable gold.
// --------------------

export function characterGoldBreakdown(
  char: Character,
): { tradable: number; bound: number; total: number } {
  let tradable = 0;
  let bound = 0;

  if (!isGoldEarner(char)) return { tradable: 0, bound: 0, total: 0 };

  for (const raidId of char.assignedRaids) {
    const raid = raidMap.get(raidId);
    if (!raid) continue;

    tradable += raid.tradableGold ?? 0;
    bound += Math.max(0, raid.rewardGold - (raid.tradableGold ?? 0));
  }

  return { tradable, bound, total: tradable + bound };
}

// --------------------
// ROSTER TOTAL GOLD
// --------------------

export function rosterWeeklyGold(roster: Character[]): number {
  let total = 0;

  for (const char of roster) {
    total += characterWeeklyGold(char);
  }

  return total;
}
