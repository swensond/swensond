import { derived } from "svelte/store";
import { persisted } from "./persistence";

export interface MarketGoal {
  id: string;
  name: string;

  cost: number;

  purchased: boolean;
}

export const marketStore =
  persisted<MarketGoal[]>(
    "la-market",
    [],
  );

export const marketCostStore = derived(
  marketStore,
  ($market) =>
    $market
      .filter((x) => !x.purchased)
      .reduce(
        (sum, item) => sum + item.cost,
        0,
      ),
);