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
// ROSTER TOTAL GOLD
// --------------------

export function rosterWeeklyGold(roster: Character[]): number {
  let total = 0;

  for (const char of roster) {
    total += characterWeeklyGold(char);
  }

  return total;
}
