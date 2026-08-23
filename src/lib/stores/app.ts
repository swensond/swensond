import { derived } from "svelte/store";
import { weeksRemainingStore } from "./countdown";
import { marketCostStore } from "./market";
import { persisted } from "./persistence";
import { progressionCostStore } from "./progression";
import { weeklyGoldStore } from "./roster";
import { timelineCostStore } from "./timeline";

export const currentGoldStore = persisted<number>("la-current-gold", 0);

export const projectedGoldStore = derived(
    [currentGoldStore, weeklyGoldStore, weeksRemainingStore],
    ([currentGold, weeklyGold, weeksRemaining]) => currentGold + weeklyGold * weeksRemaining
);

export const totalRequiredStore = derived(
    [marketCostStore, progressionCostStore, timelineCostStore],
    ([marketCost, progressionCost, timelineCost]) => marketCost + progressionCost + timelineCost
);

export const surplusStore = derived(
    [projectedGoldStore, totalRequiredStore],
    ([projectedGold, totalRequired,]) => projectedGold - totalRequired
);
