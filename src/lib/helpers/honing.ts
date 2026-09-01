import type { HoningMode } from "$lib/stores/planner";

// --------------------
// CORE COST FUNCTION
// --------------------

import t4Data from "$lib/data/t4.json";
import t41_20Data from "$lib/data/t41-20.json";
import t421_40Data from "$lib/data/t421-40.json";
import t4UpperData from "$lib/data/t4_upper.json";


// Map JSON names to your exact seed/migration IDs
const MATERIAL_MAP: Record<string, string> = {
  "Honor Shards": "destinyShard",
  "Honing Shards": "destinyShard",
  "Abidos Fusion Material": "abidosFusionMaterial",
  "Superior Abidos Fusion Material": "superiorAbidosFusionMaterial",
  "Destiny Destruction Stone": "destinyDestructionStone",
  "Destiny Crystallized Destruction Stone": "destinyCrystallizedDestructionStone",
  "Destiny Guardian Stone": "destinyGuardianStone",
  "Destiny Crystallized Guardian Stone": "destinyCrystallizedGuardianStone",
  "Destiny Leapstone": "destinyLeapstone",
  "Great Destiny Leapstone": "greatDestinyLeapstone",
  "Glacier Breath": "glacierBreath",
  "Lava Breath": "lavaBreath",
  "Lava's Breath": "lavaBreath",
  // Migration IDs
  "Tailoring: Hellfire [19-20]": "tailoringBook19to20",
  "Metallurgy: Hellfire [19-20]": "metallurgyBook19to20",
  "Artisan's Tailoring: Level 3": "tailoringScrollLv3",
  "Artisan's Tailoring: Level 4": "tailoringScrollLv4",
  "Artisan's Metallurgy: Level 3": "metallurgyScrollLv3",
  "Artisan's Metallurgy: Level 4": "metallurgyScrollLv4",
  // Fallback for older tiers (add to materials.ts later if tracked)
  "Tailoring: Hellfire [11-14]": "tailoringBook11to14",
  "Tailoring: Hellfire [15-18]": "tailoringBook15to18",
  "Metallurgy: Hellfire [11-14]": "metallurgyBook11to14",
  "Metallurgy: Hellfire [15-18]": "metallurgyBook15to18",
  "Artisan's Tailoring: Level 1": "tailoringScrollLv1",
  "Artisan's Tailoring: Level 2": "tailoringScrollLv2",
  "Artisan's Metallurgy: Level 1": "metallurgyScrollLv1",
  "Artisan's Metallurgy: Level 2": "metallurgyScrollLv2",
};

function getLevelData(type: "weapon" | "armor", level: number, mode: HoningMode) {
  if (mode === "regular") return t4Data[type][String(level)];
  if (mode === "postReset") return t4UpperData[type][String(level)];
  if (mode === "advanced") {
    return level <= 20 ? t41_20Data[type][String(level)] : t421_40Data[type][String(level)];
  }
  return null;
}

// --------------------
// GOLD CALCULATION
// --------------------
export function calculateHoningCost(
  type: "weapon" | "armor",
  from: number,
  to: number,
  mode: HoningMode
): number {
  if (to <= from) return 0;

  let total = 0;
  for (let level = from + 1; level <= to; level++) {
    const data = getLevelData(type, level, mode);
    if (data) total += data.Gold || 0;
  }
  return total;
}

// --------------------
// MATERIAL CALCULATION
// --------------------
export function calculateMaterialRequirements(
  type: "weapon" | "armor",
  from: number,
  to: number,
  mode: HoningMode
): Record<string, number> {
  if (to <= from) return {};

  const totals: Record<string, number> = {};

  for (let level = from + 1; level <= to; level++) {
    const data = getLevelData(type, level, mode);
    if (!data) continue;

    // Map main materials
    for (const [jsonName, seedId] of Object.entries(MATERIAL_MAP)) {
      const amount = data[jsonName as keyof typeof data];
      if (amount && amount > 0) {
        totals[seedId] = (totals[seedId] || 0) + amount;
      }
    }

    // Map "Other Materials"
    if (data["Other Materials"]) {
      for (const [jsonName, amount] of Object.entries(data["Other Materials"] as Record<string, number>)) {
        if (amount > 0) {
          const seedId = MATERIAL_MAP[jsonName] || jsonName.toLowerCase().replace(/[^a-z0-9]/gi, "");
          totals[seedId] = (totals[seedId] || 0) + amount;
        }
      }
    }
  }

  return totals;
}
