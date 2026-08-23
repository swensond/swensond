import type { Character } from "$lib/helpers/character";
import { raids } from "$lib/data/raids";

// --------------------
// BUILD RAID LOOKUP MAP (ONCE)
// --------------------

const raidMap = new Map(
  raids.map((r) => [r.id, r] as const)
);

// --------------------
// SINGLE CHARACTER GOLD
// --------------------

export function characterWeeklyGold(char: Character): number {
  let total = 0;

  for (const raidId of char.assignedRaids) {
    const raid = raidMap.get(raidId);
    if (!raid) continue;

    total += raid.tradableGold ?? 0;
  }

  return total;
}

// --------------------
// SINGLE CHARACTER GOLD SPLIT (TRADEABLE VS TOTAL)
// --------------------

export function characterGoldBreakdown(
  char: Character,
): { tradable: number; total: number } {
  let tradable = 0;
  let total = 0;

  for (const raidId of char.assignedRaids) {
    const raid = raidMap.get(raidId);
    if (!raid) continue;

    tradable += raid.tradableGold ?? 0;
    total += raid.rewardGold;
  }

  return { tradable, total };
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
