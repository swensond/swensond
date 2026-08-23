import { derived } from "svelte/store";
import { persisted } from "./persistence";

export interface Character {
  id: string;
  name: string;
  itemLevel: number;
  weeklyGold: number;
  raids: string[];
  extraGold: number;
}

export const rosterStore = persisted<Character[]>("la-roster", []);

export const weeklyGoldStore = derived(
  rosterStore,
  ($roster) => $roster.reduce((sum, character) => sum + character.weeklyGold + character.extraGold, 0)
);
