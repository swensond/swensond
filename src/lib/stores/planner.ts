import metallurgyBook from "$lib/assets/metallurgyBook.png";
import metallurgyLvl1 from "$lib/assets/metallurgyLvl1.png";
import metallurgyLvl2 from "$lib/assets/metallurgyLvl2.png";
import metallurgyLvl3 from "$lib/assets/metallurgyLvl3.png";
import metallurgyLvl4 from "$lib/assets/metallurgyLvl4.png";
import tailoringBook from "$lib/assets/tailoringBook.png";
import tailoringLvl1 from "$lib/assets/tailoringLvl1.png";
import tailoringLvl2 from "$lib/assets/tailoringLvl2.png";
import tailoringLvl3 from "$lib/assets/tailoringLvl3.png";
import tailoringLvl4 from "$lib/assets/tailoringLvl4.png";
import { materialSeed } from "$lib/data/materials";
import type { MaterialPricingOption } from "$lib/types/material";
import { writable } from "svelte/store";

/* ------------------------------------------------------
   TYPES
------------------------------------------------------ */

export type KarmaKey = "enlightenment" | "evolution" | "leap";

export interface KarmaTrack {
  key: KarmaKey;
  label: string;
}

export const karmaTracks: KarmaTrack[] = [
  { key: "enlightenment", label: "Enlightenment" },
  { key: "evolution", label: "Evolution" },
  { key: "leap", label: "Leap" },
];

export type KarmaState = {
  currentLevel: number;
  targetLevel: number;
};

export type PlannerKarma = Record<KarmaKey, KarmaState>;

export type Material = {
  id: string;
  name: string;
  icon: string;
  required: number;
  owned: number;

  pricing?: MaterialPricingOption;
  pricingOptions?: MaterialPricingOption[];

  overrideUnitPrice?: number;
  breakdown?: any[];
  
  // For box/chest management
  boxes?: {
    label: string; // e.g. "Small", "Medium", "Large"
    size: number; // How many base materials are in one box of this type
    owned: number; // How many boxes of this type the user owns
  }[];
};

export type ArmorSlot = "chest" | "pants" | "gloves" | "shoulder" | "head";
export type HoningMode = "regular" | "advanced" | "postReset";

export type AccessorySlot = "necklace" | "earring1" | "earring2" | "ring1" | "ring2";

export interface Accessory {
  slot: AccessorySlot;
  label: string;
  owned: boolean;
  goldCost: number;
}

export const modes: HoningMode[] = ["regular", "advanced", "postReset"];
export const armorPieces: ArmorSlot[] = ["head", "shoulder", "chest", "gloves", "pants"];

export interface HoningLevelRange {
  currentLevel: number;
  targetLevel: number;
}

export type GearHoningTrack = Record<HoningMode, HoningLevelRange>;

export type Planner = {
  __version?: string;

  currentGold: number;
  releaseDate: string | null;

  roster: any[];
  completedRaids: Record<string, string[]>;
  lastRaidReset?: string;

  materials: Material[];
  engravings: any[];

  weapon: GearHoningTrack;
  armor: Record<ArmorSlot, GearHoningTrack>;

  accessories: Accessory[];

  karma: Record<KarmaKey, KarmaState>;
};

/* ------------------------------------------------------
   VERSIONING
------------------------------------------------------ */
const STORAGE_VERSION = "3";
const STORAGE_KEY = `lostark-planner-v0.2.0`;

type Migration = (data: any) => any;

/* ------------------------------------------------------
   DEFAULTS
------------------------------------------------------ */

const defaultTrack = (): GearHoningTrack => ({
  regular: { currentLevel: 0, targetLevel: 0 },
  advanced: { currentLevel: 0, targetLevel: 0 },
  postReset: { currentLevel: 0, targetLevel: 0 },
});

function createDefaultPlanner(): Planner {
  return {
    __version: STORAGE_VERSION,

    currentGold: 0,
    releaseDate: null,

    roster: [],
    completedRaids: {},
    lastRaidReset: undefined,

    materials: materialSeed.map((m) => ({
      id: m.id,
      name: m.name,
      icon: m.icon,
      required: m.amount,
      owned: 0,

      pricingOptions: m.pricingOptions,
      pricing: m.pricing,
      overrideUnitPrice: undefined,
      breakdown: [],
      boxes: undefined,
    })),

    engravings: [],

    accessories: [
      { slot: "necklace", label: "Necklace", owned: false, goldCost: 0 },
      { slot: "earring1", label: "Earring 1/2", owned: false, goldCost: 0 },
      { slot: "earring2", label: "Earring 2/2", owned: false, goldCost: 0 },
      { slot: "ring1", label: "Ring 1/2", owned: false, goldCost: 0 },
      { slot: "ring2", label: "Ring 2/2", owned: false, goldCost: 0 },
    ],

    weapon: defaultTrack(),

    armor: {
      chest: defaultTrack(),
      pants: defaultTrack(),
      gloves: defaultTrack(),
      shoulder: defaultTrack(),
      head: defaultTrack(),
    },

    karma: {
      enlightenment: { currentLevel: 0, targetLevel: 0 },
      evolution: { currentLevel: 0, targetLevel: 0 },
      leap: { currentLevel: 0, targetLevel: 0 },
    },
  };
}

function getCurrentRaidResetKey(): string {
  const now = new Date();

  // EST/EDT-aware using New York timezone
  const estNow = new Date(
    now.toLocaleString("en-US", {
      timeZone: "America/New_York",
    })
  );

  const reset = new Date(estNow);

  // Wednesday = 3
  const daysSinceWednesday = (estNow.getDay() - 3 + 7) % 7;

  reset.setDate(estNow.getDate() - daysSinceWednesday);
  reset.setHours(6, 0, 0, 0);

  // Before this week's Wednesday 6am → use previous week's reset
  if (estNow < reset) {
    reset.setDate(reset.getDate() - 7);
  }

  return reset.toISOString();
}

/* ------------------------------------------------------
   MIGRATIONS
------------------------------------------------------ */

const migrations: Record<string, Migration> = {
  "0->1": (data: any): Planner => {
    const roster = Array.isArray(data.roster) ? data.roster : [];

    return {
      __version: STORAGE_VERSION,

      currentGold: data.currentGold ?? 0,
      releaseDate: data.releaseDate ?? null,

      // roster stays same shape
      roster,

      // migrate assignedRaids → completedRaids
      completedRaids: roster.reduce(
        (acc: Record<string, string[]>, char: any) => {
          if (char?.id && Array.isArray(char.assignedRaids)) {
            acc[char.id] = char.assignedRaids;
          }
          return acc;
        },
        {}
      ),

      lastRaidReset: undefined,

      // materials migration
      materials: materialSeed.map((seed) => {
        const existing = (data.materials ?? []).find((m: any) => m.id === seed.id);

        return {
          id: seed.id,
          name: seed.name,
          icon: seed.icon,

          required: existing?.required ?? seed.amount,
          owned: existing?.owned ?? 0,

          pricingOptions: seed.pricingOptions,
          pricing: seed.pricing,

          overrideUnitPrice: undefined,
          breakdown: [],
        };
      }),

      engravings: data.engravings ?? [],

      weapon: data.weapon ?? createDefaultPlanner().weapon,
      armor: data.armor ?? createDefaultPlanner().armor,
      accessories: data.accessories ?? createDefaultPlanner().accessories,
      karma: data.karma ?? createDefaultPlanner().karma,
    };
  },
  "1->2": (data: Planner): Planner => {
    const newMaterials = [
      {
        id: "metallurgyBook19to20",
        name: "Metallurgy: Hellfire [19-20]",
        amount: 0,
        pricing: {
          label: "Default",
          marketSize: 1,
          marketPrice: 3599,
        },
        icon: metallurgyBook, // TODO: add icon
      },
      {
        id: "tailoringBook19to20",
        name: "Tailoring: Hellfire [19-20]",
        amount: 0,
        pricing: {
          label: "Default",
          marketSize: 1,
          marketPrice: 2395,
        },
        icon: tailoringBook, // TODO: add icon
      },
      {
        id: "metallurgyScrollLv3",
        name: "Artisan's Metallurgy: Level 3",
        amount: 0,
        pricing: {
          label: "Default",
          marketSize: 1,
          marketPrice: 825,
        },
        icon: metallurgyLvl3, // TODO: add icon
      },
      {
        id: "metallurgyScrollLv4",
        name: "Artisan's Metallurgy: Level 4",
        amount: 0,
        pricing: {
          label: "Default",
          marketSize: 1,
          marketPrice: 1100,
        },
        icon: metallurgyLvl4, // TODO: add icon
      },
      {
        id: "tailoringScrollLv3",
        name: "Artisan's Tailoring: Level 3",
        amount: 0,
        pricing: {
          label: "Default",
          marketSize: 1,
          marketPrice: 1464,
        },
        icon: tailoringLvl3, // TODO: add icon
      },
      {
        id: "tailoringScrollLv4",
        name: "Artisan's Tailoring: Level 4",
        amount: 0,
        pricing: {
          label: "Default",
          marketSize: 1,
          marketPrice: 1443,
        },
        icon: tailoringLvl4, // TODO: add icon
      },
    ];

    const existingIds = new Set(data.materials.map((m) => m.id));

    return {
      ...data,
      __version: STORAGE_VERSION,
      materials: [
        ...data.materials,
        ...newMaterials
          .filter((m) => !existingIds.has(m.id))
          .map((m) => ({
            id: m.id,
            name: m.name,
            icon: m.icon,
            required: m.amount,
            owned: 0,
            pricing: m.pricing,
            breakdown: [],
          })),
      ],
    };
  },
  "2->3": (data: Planner): Planner => {
    const defaults = createDefaultPlanner();
    const newMaterials = [
      { id: "tailoringBook11to14", name: "Tailoring: Hellfire [11-14]", amount: 0, pricing: { label: "Default", marketSize: 1, marketPrice: 1850 }, icon: tailoringBook },
      { id: "tailoringBook15to18", name: "Tailoring: Hellfire [15-18]", amount: 0, pricing: { label: "Default", marketSize: 1, marketPrice: 2100 }, icon: tailoringBook },
      { id: "metallurgyBook11to14", name: "Metallurgy: Hellfire [11-14]", amount: 0, pricing: { label: "Default", marketSize: 1, marketPrice: 1900 }, icon: metallurgyBook },
      { id: "metallurgyBook15to18", name: "Metallurgy: Hellfire [15-18]", amount: 0, pricing: { label: "Default", marketSize: 1, marketPrice: 2200 }, icon: metallurgyBook },
      { id: "tailoringScrollLv1", name: "Artisan's Tailoring: Level 1", amount: 0, pricing: { label: "Default", marketSize: 1, marketPrice: 450 }, icon: tailoringLvl1 },
      { id: "tailoringScrollLv2", name: "Artisan's Tailoring: Level 2", amount: 0, pricing: { label: "Default", marketSize: 1, marketPrice: 650 }, icon: tailoringLvl2 },
      { id: "metallurgyScrollLv1", name: "Artisan's Metallurgy: Level 1", amount: 0, pricing: { label: "Default", marketSize: 1, marketPrice: 480 }, icon: metallurgyLvl1 },
      { id: "metallurgyScrollLv2", name: "Artisan's Metallurgy: Level 2", amount: 0, pricing: { label: "Default", marketSize: 1, marketPrice: 680 }, icon: metallurgyLvl2 },
    ];

    const existingIds = new Set(data.materials.map((m) => m.id));

    return {
      ...data,
      __version: STORAGE_VERSION,
      accessories: data.accessories ?? defaults.accessories,
      materials: [
        ...data.materials,
        ...newMaterials
          .filter((m) => !existingIds.has(m.id))
          .map((m) => ({
            id: m.id,
            name: m.name,
            icon: m.icon,
            required: m.amount,
            owned: 0,
            pricing: m.pricing,
            breakdown: [],
          })),
      ],
    };
  },
};

function migratePlanner(data: any, fromVersion: string, toVersion: string): Planner {
  let migrated = data;

  let current = Number(fromVersion);
  const target = Number(toVersion);

  while (current < target) {
    const key = `${current}->${current + 1}`;
    const migration = migrations[key];

    if (migration) {
      migrated = migration(migrated);
    } else {
      console.warn(`Missing migration: ${key}`);
    }

    current++;
  }

  return migrated as Planner;
}

/* ------------------------------------------------------
   STORE
------------------------------------------------------ */

function createPlannerStore() {
  const defaults = createDefaultPlanner();
  let initial: Planner = defaults;

  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
      try {
        const parsed = JSON.parse(raw);

        const version = parsed?.__version ?? "0";

        initial = migratePlanner(parsed, version, STORAGE_VERSION);

        initial = {
          ...initial,
          __version: STORAGE_VERSION,
        };
      } catch {
        initial = defaults;
      }
    }
  }

  // Ensure accessories defaults exist for existing stored data
  if (!initial.accessories || initial.accessories.length === 0) {
    initial = {
      ...initial,
      accessories: defaults.accessories,
    };
  }

  const currentResetKey = getCurrentRaidResetKey();

  if (initial.lastRaidReset !== currentResetKey) {
    initial = {
      ...initial,
      completedRaids: {},
      lastRaidReset: currentResetKey,
    };
  }

  const store = writable<Planner>(initial);

  if (typeof window !== "undefined") {
    store.subscribe((value) => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...value,
          __version: STORAGE_VERSION,
        })
      );
    });
  }

  return store;
}

export const planner = createPlannerStore();
