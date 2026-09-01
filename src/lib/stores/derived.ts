import { derived } from "svelte/store";
import { planner } from "./planner";

export const weeklyIncome = derived(
  planner,
  ($planner) => $planner.roster.reduce((sum, character) => sum + character.weeklyGold, 0)
);

export const weeksRemaining = derived(
  planner,
  ($planner) => {
    if (!$planner.releaseDate) return 0;

    const now = new Date();
    const release = new Date($planner.releaseDate);

    const diff = release.getTime() - now.getTime();

    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24 * 7)));
  }
);

export const projectedGold = derived(
  [planner, weeklyIncome, weeksRemaining],
  ([$planner, $weeklyIncome, $weeksRemaining]) => $planner.currentGold + $weeklyIncome * $weeksRemaining
);
