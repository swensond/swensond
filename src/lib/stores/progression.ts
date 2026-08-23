import { derived } from "svelte/store";
import { persisted } from "./persistence";

export interface KarmaPlan {
  current: number;
  target: number;
  goldCost: number;
}

export interface HoningPlan {
  currentItemLevel: number;

  targetItemLevel: number;

  goldCost: number;

  advancedHoningComplete: boolean;
}

export interface GearTransferPlan {
  weapon: boolean;
  helmet: boolean;
  shoulders: boolean;
  chest: boolean;
  gloves: boolean;
  pants: boolean;

  goldCost: number;
}

export interface ProgressionState {
  evolution: KarmaPlan;

  enlightenment: KarmaPlan;

  leap: KarmaPlan;

  honing: HoningPlan;

  transfer: GearTransferPlan;
}

export const progressionStore =
  persisted<ProgressionState>(
    "la-progression",
    {
      evolution: {
        current: 21,
        target: 25,
        goldCost: 0,
      },

      enlightenment: {
        current: 21,
        target: 25,
        goldCost: 0,
      },

      leap: {
        current: 21,
        target: 25,
        goldCost: 0,
      },

      honing: {
        currentItemLevel: 1700,
        targetItemLevel: 1750,
        goldCost: 0,
        advancedHoningComplete: true,
      },

      transfer: {
        weapon: false,
        helmet: false,
        shoulders: false,
        chest: false,
        gloves: false,
        pants: false,
        goldCost: 0,
      },
    },
  );

export const progressionCostStore =
  derived(
    progressionStore,
    ($progression) =>
      $progression.evolution.goldCost +
      $progression.enlightenment.goldCost +
      $progression.leap.goldCost +
      $progression.honing.goldCost +
      $progression.transfer.goldCost,
  );