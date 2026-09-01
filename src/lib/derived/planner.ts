import { raids } from "$lib/data/raids";
import { rosterWeeklyGold } from "$lib/helpers/gold";
import { calculateHoningCost, calculateMaterialRequirements } from "$lib/helpers/honing";
import { getTrackTotal } from "$lib/helpers/karma";
import type { Planner } from "$lib/stores/planner";
import { planner } from "$lib/stores/planner";
import { derived, type Readable } from "svelte/store";

// ======================================================
// DISPLAY HELPERS
// ======================================================

const ceil = <T extends number>(store: Readable<T>) =>
  derived(store, ($v) => Math.ceil($v));

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Which future projection week an event date lands in.
 * Returns null for past dates (they no longer count as income).
 */
function eventWeek(dateStr: string, nowMs: number): number | null {
  const diff = new Date(dateStr).getTime() - nowMs;

  if (!(diff > 0)) return null;

  return Math.max(1, Math.ceil(diff / WEEK_MS));
}

/** Sum of scheduled events of a kind, optionally only up to a release date. */
export function sumEvents(
  $p: Planner,
  kind: "tradable" | "bound",
  untilDate?: string | null
): number {
  let sum = 0;

  for (const e of $p.events ?? []) {
    if ((e.kind ?? "tradable") !== kind) continue;
    if (untilDate && e.date > untilDate) continue;
    sum += e.amount || 0;
  }

  return sum;
}

// Exported for the honing page
export { calculateHoningCost };

function aggregateRequirements($planner: any) {
  const totals: Record<string, number> = {};

  const processSlot = (slotData: any, type: 'weapon' | 'armor') => {
    ['regular', 'advanced', 'postReset'].forEach((mode: any) => {
      const { currentLevel, targetLevel } = slotData[mode];
      const reqs = calculateMaterialRequirements(type, currentLevel, targetLevel, mode);
      for (const [id, amount] of Object.entries(reqs)) {
        totals[id] = (totals[id] || 0) + amount;
      }
    });
  };

  processSlot($planner.weapon, 'weapon');
  Object.values($planner.armor).forEach((slot: any) => {
    processSlot(slot, 'armor');
  });

  return totals;
}

export const materialPlans = derived(planner, ($planner) => {
  const requiredTotals = aggregateRequirements($planner);

  return $planner.materials
    .map(m => {
      const required = requiredTotals[m.id] || 0;
      if (required === 0) return null;

      // Calculate total owned including boxes
      const totalOwned = m.owned + (m.boxes?.reduce((sum, box) => sum + (box.owned * box.size), 0) || 0);
      const missing = Math.max(0, required - totalOwned);

      // Pass dynamically calculated required/owned to the optimizer
      const plan = getBestMaterialPlan({ ...m, required, owned: totalOwned });

      return {
        ...m,
        required,
        missing,
        totalCost: plan.cost,
        breakdown: plan.breakdown,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);
});

// Derive totals directly from the optimized plans to prevent double-counting
export const totalMaterialCost = derived(materialPlans, ($plans) =>
  $plans.reduce((sum, m) => sum + (m.totalCost || 0), 0)
);

export const displayMaterialCost = ceil(totalMaterialCost);

// ======================================================
// RAID LOOKUP
// ======================================================

const raidGoldMap = Object.fromEntries(
  raids.map((r) => [r.id, r.tradableGold])
);

// ======================================================
// WEEKLY INCOME
// ======================================================

export const weeklyIncome = derived(planner, ($p) =>
  rosterWeeklyGold($p.roster)
);

// ======================================================
// COMPLETED RAIDS
// ======================================================

export const completedWeeklyGold = derived(planner, ($p) => {
  let total = 0;

  for (const charId in $p.completedRaids) {
    const raidsDone = $p.completedRaids[charId] ?? [];

    for (const raidId of raidsDone) {
      total += raidGoldMap[raidId] ?? 0;
    }
  }

  return total;
});

// ======================================================
// REMAINING INCOME
// ======================================================

export const remainingWeeklyIncome = derived(
  [weeklyIncome, completedWeeklyGold],
  ([$w, $d]) => Math.max(0, $w - $d)
);

// ======================================================
// WEEKS REMAINING
// ======================================================

export const weeksRemaining = derived(planner, ($p) => {
  if (!$p.releaseDate) return 0;

  const diff =
    new Date($p.releaseDate).getTime() - Date.now();

  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24 * 7)));
});

// ======================================================
// PROJECTED GOLD
// ======================================================

export const projectedGold = derived(
  [planner, weeklyIncome, remainingWeeklyIncome, weeksRemaining],
  ([$p, $w, $r, $weeks]) => {
    if ($weeks <= 0) return $p.currentGold;

    const futureWeeks = Math.max(0, $weeks - 1);

    return (
      $p.currentGold +
      $r +
      futureWeeks * $w +
      sumEvents($p, "tradable", $p.releaseDate)
    );
  }
);

// ======================================================
// BOUND (ROSTER) GOLD PROJECTION
// Raid gold is character-bound and can't be pooled, so the
// planner's bound pool only grows via scheduled events.
// ======================================================

export const projectedBoundGold = derived(planner, ($p) => {
  if (!$p.releaseDate || new Date() >= new Date($p.releaseDate)) {
    return $p.currentBoundGold ?? 0;
  }

  return (
    ($p.currentBoundGold ?? 0) + sumEvents($p, "bound", $p.releaseDate)
  );
});

/** Tradable + roster-bound combined - bound covers honing/karma gold costs. */
export const projectedCombinedGold = derived(
  [projectedGold, projectedBoundGold],
  ([$t, $b]) => $t + $b
);

// ======================================================
// MATERIAL OPTIMIZER
// ======================================================

function getBestMaterialPlan(m: any) {
  const missing = Math.max(0, m.required - m.owned);
  if (!missing) return { cost: 0, breakdown: [] };

  const options = m.pricingOptions?.length 
    ? m.pricingOptions 
    : m.pricing 
      ? [{ label: m.pricing.label ?? "Market", marketSize: m.pricing.marketSize, marketPrice: m.pricing.marketPrice }]
      : [];

  const normalized = options
    .map((o: any) => ({ ...o, unit: o.marketPrice / o.marketSize }))
    .sort((a: any, b: any) => a.unit - b.unit);

  const best = normalized[0];
  let bestCost = Infinity;
  let bestPlan: any[] = [];

  for (const opt of normalized) {
    const size = opt.marketSize;
    const bundles = Math.floor(missing / size);
    const remainder = missing % size;

    let cost = bundles * opt.marketPrice;
    const breakdown: any[] = [];

    if (bundles) {
      breakdown.push({ label: opt.label, qty: bundles, size, price: opt.marketPrice });
    }
    if (remainder) {
      cost += best.marketPrice;
      breakdown.push({ label: best.label, qty: 1, size: best.marketSize, price: best.marketPrice, remainderFill: true });
    }

    if (cost < bestCost) {
      bestCost = cost;
      bestPlan = breakdown;
    }
  }

  return { cost: bestCost, breakdown: bestPlan };
}


// ======================================================
// MATERIALS
// ======================================================

// export const materialPlans = derived(planner, ($p) =>
//   $p.materials.map((m) => {
//     const plan = getBestMaterialPlan(m);

//     return {
//       id: m.id,
//       name: m.name,
//       icon: m.icon,

//       required: m.required,
//       owned: m.owned,
//       missing: Math.max(0, m.required - m.owned),

//       pricing: m.pricing,
//       pricingOptions: m.pricingOptions,

//       cost: plan.cost,
//       breakdown: plan.breakdown,
//     };
//   })
// );

// ======================================================
// TOTAL COSTS
// ======================================================

export const totalEngravingCost = derived(planner, ($p) =>
  $p.engravings.reduce((sum, e) => {
    const missing = Math.max(0, e.booksRequired - e.booksOwned);
    return sum + missing * e.pricePerBook;
  }, 0)
);

// ======================================================
// ACCESSORIES COST
// ======================================================

export const totalAccessoriesCost = derived(planner, ($p) =>
  $p.accessories.reduce((sum, a) => {
    return sum + (!a.owned ? a.goldCost : 0);
  }, 0)
);

// ======================================================
// HONING COST
// ======================================================

function sumGear(track: any, type: "weapon" | "armor") {
  return (
    calculateHoningCost(type, track.regular.currentLevel, track.regular.targetLevel, "regular") +
    calculateHoningCost(type, track.advanced.currentLevel, track.advanced.targetLevel, "advanced") +
    calculateHoningCost(type, track.postReset.currentLevel, track.postReset.targetLevel, "postReset")
  );
}

export const totalHoningCost = derived(planner, ($p) => {
  let total = sumGear($p.weapon, "weapon");

  for (const piece of Object.values($p.armor)) {
    total += sumGear(piece, "armor");
  }

  return total;
});

// ======================================================
// KARMA COST
// ======================================================

export const totalKarmaCost = derived(planner, ($p) => {
  const k = $p.karma;

  return (
    getTrackTotal(k.enlightenment.currentLevel, k.enlightenment.targetLevel) +
    getTrackTotal(k.evolution.currentLevel, k.evolution.targetLevel) +
    getTrackTotal(k.leap.currentLevel, k.leap.targetLevel)
  );
});

// ======================================================
// TOTALS
// ======================================================

export const totalCost = derived(
  [totalMaterialCost, totalHoningCost, totalKarmaCost, totalEngravingCost, totalAccessoriesCost],
  ([$m, $h, $k, $e, $a]) => $m + $h + $k + $e + $a
);

// ======================================================
// FUNDING GAP
// ======================================================

/**
 * Market-only costs (materials, engravings, accessories) must be covered
 * by tradable gold alone.
 */
export const marketOnlyCost = derived(
  [totalMaterialCost, totalEngravingCost, totalAccessoriesCost],
  ([$m, $e, $a]) => $m + $e + $a
);

export const marketShortfall = derived(
  [marketOnlyCost, projectedGold],
  ([$cost, $tradable]) => Math.max(0, $cost - $tradable)
);

export const fundingGap = derived(
  [totalCost, projectedCombinedGold],
  ([total, projected]) => total - projected
);

// export const displayMaterialCost = ceil(totalMaterialCost);
export const displayEngravingCost = ceil(totalEngravingCost);
export const displayHoningCost = ceil(totalHoningCost);
export const displayKarmaCost = ceil(totalKarmaCost);
export const displayAccessoriesCost = ceil(totalAccessoriesCost);
export const displayTotalCost = ceil(totalCost);

export const displayProjectedGold = ceil(projectedGold);
export const displayProjectedBoundGold = ceil(projectedBoundGold);
export const displayMarketShortfall = ceil(marketShortfall);
export const displayFundingGap = ceil(fundingGap);

// ======================================================
// GOLD HISTORY & PROJECTION OVER TIME
// ======================================================

export interface GoldPoint {
  /** Negative = historical week offset from now; 0 = now; positive = projected */
  week: number;
  gold: number;
  actual: boolean;
}

function weeksRemainingOf($p: any): number {
  if (!$p.releaseDate) return 0;

  const diff = new Date($p.releaseDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24 * 7)));
}

/**
 * Historical balance per week (from the gold log), then a forward
 * projection based on weekly income and scheduled events. Week 0 is "now".
 * The crossing detection counts roster-bound event gold toward coverage.
 */
export const goldProjection = derived(
  [planner, weeklyIncome, remainingWeeklyIncome, totalCost],
  ([$p, $w, $r, $cost]): {
    points: GoldPoint[];
    /** Roster-bound gold pool over time (from scheduled bound events) */
    boundPoints: GoldPoint[];
    threshold: number;
    crossingWeek: number | null;
    maxPastWeeks: number;
    maxFutureWeeks: number;
  } => {
    // ---- History: bucket gold log entries into weekly balances ----
    const entries = [...($p.goldLog ?? [])].sort(
      (a, b) => +new Date(a.timestamp) - +new Date(b.timestamp)
    );

    const nowMs = Date.now();

    // Map each entry to a negative week index relative to now
    const byWeek = new Map<number, number>();
    let maxPastWeeks = 0;

    for (const e of entries) {
      const weeksAgo = Math.floor((nowMs - +new Date(e.timestamp)) / WEEK_MS);
      byWeek.set(weeksAgo, e.balanceAfter);
      maxPastWeeks = Math.max(maxPastWeeks, weeksAgo);
    }

    // Fill gaps backwards: weeks without entries carry the next known balance
    const history: GoldPoint[] = [];
    let carry = $p.currentGold;

    for (let w = maxPastWeeks; w >= 1; w--) {
      if (byWeek.has(w)) carry = byWeek.get(w)!;
      history.push({ week: -w, gold: carry, actual: true });
    }

    // ---- Scheduled events bucketed by projection week ----
    const evTradable = new Map<number, number>();
    const evBound = new Map<number, number>();
    let maxEventWeek = 0;

    for (const e of $p.events ?? []) {
      const wk = eventWeek(e.date, nowMs);
      if (wk === null) continue;

      const map =
        (e.kind ?? "tradable") === "bound" ? evBound : evTradable;

      map.set(wk, (map.get(wk) ?? 0) + (e.amount || 0));
      maxEventWeek = Math.max(maxEventWeek, wk);
    }

    const cumEvents = (map: Map<number, number>, week: number): number => {
      let sum = 0;
      for (const [wk, amount] of map) {
        if (wk <= week) sum += amount;
      }
      return sum;
    };

    // ---- Projection forward ----
    const tradableAt = (week: number): number =>
      week <= 0
        ? $p.currentGold
        : $p.currentGold + $r + (week - 1) * $w + cumEvents(evTradable, week);

    const boundAt = (week: number): number =>
      week <= 0
        ? ($p.currentBoundGold ?? 0)
        : ($p.currentBoundGold ?? 0) + cumEvents(evBound, week);

    // First week where tradable + roster-bound covers the required gold
    let crossingWeek: number | null = null;

    if ($cost > 0) {
      for (let week = 1; week <= 520; week++) {
        if (tradableAt(week) + boundAt(week) >= $cost) {
          crossingWeek = week;
          break;
        }
      }
    }

    const maxFutureWeeks = Math.max(
      4,
      weeksRemainingOf($p),
      crossingWeek ?? 0,
      maxEventWeek
    );

    const future: GoldPoint[] = [];
    const boundPoints: GoldPoint[] = [];

    for (let week = 0; week <= maxFutureWeeks; week++) {
      future.push({
        week,
        gold: tradableAt(week),
        actual: week === 0,
      });

      boundPoints.push({ week, gold: boundAt(week), actual: false });
    }

    return {
      points: [...history, ...future],
      boundPoints,
      threshold: $cost,
      crossingWeek,
      maxPastWeeks,
      maxFutureWeeks,
    };
  }
);
