import { writable } from "svelte/store";

const STORAGE_KEY = "lostark-planner";

export interface Character {
  id: string;
  name: string;
  weeklyGold: number;
}

export interface Goal {
  id: string;
  name: string;
  cost: number;
}

export interface PlannerState {
  currentGold: number;
  releaseDate: string;
  roster: Character[];
  goals: Goal[];
}

const defaultState: PlannerState = {
  currentGold: 311186,
  releaseDate: "9/16/2026",

  roster: [
    { id: "ikusawa", name: "Ikusawa", weeklyGold: 148000 },
    { id: "manazuru", name: "Manazuru", weeklyGold: 148000 },
    { id: "yajima", name: "Yajima", weeklyGold: 148000 },
    { id: "ishimori", name: "Ishimori", weeklyGold: 148000 },
    { id: "neuschwanstein", name: "Neuschwanstein", weeklyGold: 148000 },
    { id: "mizunokouji", name: "Mizunokouji", weeklyGold: 148000 },
  ],

  goals: [
    {
      id: crypto.randomUUID(),
      name: "Ambush Master",
      cost: 0
    },
    {
      id: crypto.randomUUID(),
      name: "Keen Blunt Weapon",
      cost: 0
    }
  ]
};
function createStore() {
  const browser = typeof window !== "undefined";

  const stored = browser ? localStorage.getItem(STORAGE_KEY) : null;

  const initial: PlannerState = stored
    ? JSON.parse(stored)
    : defaultState;

  const { subscribe, set, update } = writable<PlannerState>(initial);

  subscribe((value) => {
    if (!browser) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  });

  return {
    subscribe,

    // --------------------
    // GOLD ACTIONS
    // --------------------
    setGold: (gold: number) =>
      update((state) => ({
        ...state,
        currentGold: gold,
      })),

    addGold: (amount: number) =>
      update((state) => ({
        ...state,
        currentGold: state.currentGold + amount,
      })),

    spendGold: (amount: number) =>
      update((state) => ({
        ...state,
        currentGold: state.currentGold - amount,
      })),

    // --------------------
    // ROSTER ACTIONS
    // --------------------
    addCharacter: (char: Character) =>
      update((state) => ({
        ...state,
        roster: [...state.roster, char],
      })),

    removeCharacter: (id: string) =>
      update((state) => ({
        ...state,
        roster: state.roster.filter((c) => c.id !== id),
      })),

    updateCharacter: (id: string, patch: Partial<Character>) =>
      update((state) => ({
        ...state,
        roster: state.roster.map((c) =>
          c.id === id ? { ...c, ...patch } : c
        ),
      })),
    // --------------------
    // GOALS ACTIONS
    // --------------------
    addGoal: (goal: Goal) =>
      update((state) => ({
        ...state,
        goals: [...state.goals, goal],
      })),

    removeGoal: (id: string) =>
      update((state) => ({
        ...state,
        goals: state.goals.filter((g) => g.id !== id),
      })),

    set,
    update,
  };
}

export const planner = createStore();