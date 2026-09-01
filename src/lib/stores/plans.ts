import type { Planner } from "$lib/stores/planner";
import { writable } from "svelte/store";

/* ------------------------------------------------------
   TYPES
------------------------------------------------------ */

export interface SavedPlan {
  id: string;
  name: string;
  savedAt: string;
  data: Planner;
}

/* ------------------------------------------------------
   PERSISTENCE
------------------------------------------------------ */

const PLANS_STORAGE_KEY = "lostark-planner-plans-v1";

function loadPlans(): SavedPlan[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(PLANS_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(plans: SavedPlan[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
}

/* ------------------------------------------------------
   STORE
------------------------------------------------------ */

export const plans = writable<SavedPlan[]>(loadPlans());

plans.subscribe((value) => persist(value));

/* ------------------------------------------------------
   HELPERS
------------------------------------------------------ */

export function sanitizeName(name: string): string {
  return name.trim().slice(0, 60) || "Untitled Plan";
}