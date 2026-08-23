import chronomancerData from "$lib/data/chronomancer.json";
import { raids } from "$lib/data/raids";
import { createDefaultCharacter, type Character } from "$lib/helpers/character";
import { calculateMaterialRequirements } from "$lib/helpers/honing";
import { type AccessorySlot, type armorPieces, type modes, type ArmorSlot, type HoningMode, type KarmaKey, type Planner, planner } from "$lib/stores/planner";
import type { MaterialPricingOption } from "$lib/types/material";
const MODES: HoningMode[] = ["regular", "advanced", "postReset"];

const ARMOR_SLOTS: ArmorSlot[] = [
    "chest",
    "pants",
    "gloves",
    "shoulder",
    "head",
];


function recalculateMaterialRequirements(p: Planner) {
  const totals: Record<string, number> = {};

  const processSlot = (slotData: any, type: 'weapon' | 'armor') => {
    (['regular', 'advanced', 'postReset'] as const).forEach((mode) => {
      const { currentLevel, targetLevel } = slotData[mode];
      const reqs = calculateMaterialRequirements(type, currentLevel, targetLevel, mode);
      for (const [id, amount] of Object.entries(reqs)) {
        totals[id] = (totals[id] || 0) + amount;
      }
    });
  };

  processSlot(p.weapon, 'weapon');
    for (const slot of Object.values(p.armor)) {
        processSlot(slot as any, 'armor');
    }

  // Return a new materials array with updated `required` values
  return p.materials.map(m => ({ ...m, required: totals[m.id] || 0 }));
}

// ======================================================
// INTERNAL UPDATE HELPER
// ======================================================

function update(fn: (p: any) => any) {
    planner.update((p) => fn(p));
}

// ======================================================
// CORE PLANNER API
// ======================================================

export const plannerApi = {
    setGold(currentGold: number) {
        update((p) => ({ ...p, currentGold }));
    },

    addGold(amount: number) {
        update((p) => ({
            ...p,
            currentGold: p.currentGold + amount,
        }));
    },

    spendGold(amount: number) {
        update((p) => ({
            ...p,
            currentGold: Math.max(0, p.currentGold - amount),
        }));
    },

    setReleaseDate(releaseDate: string | null) {
        update((p) => ({ ...p, releaseDate }));
    },

    updateMaterial(id: string, patch: Partial<{
        required: number;
        owned: number;
        pricing: MaterialPricingOption;
        pricingOptions: MaterialPricingOption[];
        boxes?: {
            label: string;
            size: number;
            owned: number;
        }[];
    }>) {
        planner.update((p) => ({
            ...p,
            materials: p.materials.map((m) =>
                m.id === id
                    ? { ...m, ...patch }
                    : m
            )
        }));
    },
    updateMaterialPricingOption(
        materialId: string,
        label: string,
        patch: Partial<{ marketSize: number; marketPrice: number }>
    ) {
        planner.update((p) => ({
            ...p,
            materials: p.materials.map((m) => {
                if (m.id !== materialId) return m;

                if (!m.pricingOptions) return m;

                return {
                    ...m,
                    pricingOptions: m.pricingOptions.map((opt) =>
                        opt.label === label ? { ...opt, ...patch } : opt
                    ),
                };
            }),
        }));
    },
    updatePricingField(
        materialId: string,
        field: "marketPrice" | "marketSize",
        value: number
    ) {
        planner.update((p) => ({
            ...p,
            materials: p.materials.map((m) => {
                if (m.id !== materialId) return m;
                if (!m.pricing) return m;

                const pricing = {
                    ...m.pricing,
                    [field]: value
                };

                return {
                    ...m,
                    pricing,
                    pricingOptions: m.pricingOptions?.map((opt) =>
                        opt.label === pricing.label
                            ? { ...opt, [field]: value }
                            : opt
                    )
                };
            })
        }));
    },
  setWeapon(track: any) {
    update((p) => {
      const newWeapon = track;
      const newState = { ...p, weapon: newWeapon };
      return { ...newState, materials: recalculateMaterialRequirements(newState) };
    });
  },

  setArmor(slot: string, track: any) {
    update((p) => {
      const newArmor = { ...p.armor, [slot]: track };
      const newState = { ...p, armor: newArmor };
      return { ...newState, materials: recalculateMaterialRequirements(newState) };
    });
  },

  updateWeapon(
    mode: "regular" | "advanced" | "postReset",
    patch: Partial<{ currentLevel: number; targetLevel: number }>
  ) {
    update((p) => {
      const newWeapon = { ...p.weapon, [mode]: { ...p.weapon[mode], ...patch } };
      const newState = { ...p, weapon: newWeapon };
      return { ...newState, materials: recalculateMaterialRequirements(newState) };
    });
  },

  updateArmorPiece(
    piece: (typeof armorPieces)[number],
    mode: (typeof modes)[number],
    patch: Partial<{ currentLevel: number; targetLevel: number }>
  ) {
    update((p) => {
      const newArmor = { ...p.armor, [piece]: { ...p.armor[piece], [mode]: { ...p.armor[piece][mode], ...patch } } };
      const newState = { ...p, armor: newArmor };
      return { ...newState, materials: recalculateMaterialRequirements(newState) };
    });
  },
    updateKarma(
        key: KarmaKey,
        patch: Partial<{
            currentLevel: number;
            targetLevel: number;
        }>
    ) {
        update((p) => ({
            ...p,
            karma: {
                ...p.karma,
                [key]: {
                    ...p.karma[key],
                    ...patch,
                },
            },
        }));
    },
    updateEngraving(
        id: string,
        patch: Partial<{
            name: string;
            booksOwned: number;
            booksRequired: number;
            pricePerBook: number;
        }>
    ) {
        update((p) => ({
            ...p,
            engravings: p.engravings.map((e: any) =>
                e.id === id
                    ? {
                        ...e,
                        ...patch,
                    }
                    : e
            ),
        }));
    },

    addEngraving(partial?: Partial<{
        id: string;
        name: string;
        booksOwned: number;
        booksRequired: number;
        pricePerBook: number;
    }>) {
        const engraving = {
            id: partial?.id ?? crypto.randomUUID(),
            name: partial?.name ?? "New Engraving",
            booksOwned: partial?.booksOwned ?? 0,
            booksRequired: partial?.booksRequired ?? 20,
            pricePerBook: partial?.pricePerBook ?? 0,
        };

        update((p) => ({
            ...p,
            engravings: [...p.engravings, engraving],
        }));
    },

    removeEngraving(id: string) {
        update((p) => ({
            ...p,
            engravings: p.engravings.filter((e: any) => e.id !== id),
        }));
    },

    // ======================================================
    // ACCESSORIES
    // ======================================================

    updateAccessory(
        slot: AccessorySlot,
        patch: Partial<{ label: string; owned: boolean; goldCost: number }>
    ) {
        update((p) => ({
            ...p,
            accessories: p.accessories.map((a) =>
                a.slot === slot ? { ...a, ...patch } : a
            ),
        }));
    },

    toggleAccessory(slot: AccessorySlot) {
        update((p) => ({
            ...p,
            accessories: p.accessories.map((a) =>
                a.slot === slot ? { ...a, owned: !a.owned } : a
            ),
        }));
    },
};

// ======================================================
// RAID API
// ======================================================

export const raidApi = {
    toggleCompletedRaid(charId: string, raidId: string) {
        update((p: Planner) => {
            const current = p.completedRaids[charId] ?? [];
            const exists = current.includes(raidId);

            const raid = raids.find((r) => r.id === raidId);
            const gold = raid?.tradableGold ?? 0;

            return {
                ...p,
                currentGold: exists
                    ? Math.max(0, p.currentGold - gold)
                    : p.currentGold + gold,

                completedRaids: {
                    ...p.completedRaids,
                    [charId]: exists
                        ? current.filter((r) => r !== raidId)
                        : [...current, raidId],
                },
            };
        });
    },

    setCompletedRaids(charId: string, raidsDone: string[]) {
        update((p) => ({
            ...p,
            completedRaids: {
                ...p.completedRaids,
                [charId]: raidsDone,
            },
        }));
    },

    toggleRaid(charId: string, raidId: string) {
        update((p) => {
            const current = p.completedRaids[charId] ?? [];
            const exists = current.includes(raidId);

            return {
                ...p,
                completedRaids: {
                    ...p.completedRaids,
                    [charId]: exists
                        ? current.filter((r: string) => r !== raidId)
                        : [...current, raidId],
                },
            };
        });
    }
};

// ======================================================
// ROSTER API
// ======================================================

export const rosterApi = {
    setRoster(roster: Character[]) {
        update((p) => ({ ...p, roster }));
    },

    addCharacter(partial?: Partial<Character>) {
        const character = createDefaultCharacter(partial);

        update((p) => ({
            ...p,
            roster: [...p.roster, character],
        }));
    },

    updateCharacter(charId: string, patch: Partial<Character>) {
        update((p) => ({
            ...p,
            roster: p.roster.map((c: Character) =>
                c.id === charId ? { ...c, ...patch } : c
            ),
        }));
    },

    removeCharacter(charId: string) {
        update((p) => ({
            ...p,
            roster: p.roster.filter((c: Character) => c.id !== charId),
        }));
    },

    setWeeklyGold(charId: string, weeklyGold: number) {
        update((p) => ({
            ...p,
            roster: p.roster.map((c: Character) =>
                c.id === charId ? { ...c, weeklyGold } : c
            ),
        }));
    },

    toggleAssignedRaid(charId: string, raidId: string) {
        update((p) => ({
            ...p,
            roster: p.roster.map((c: Character) => {
                if (c.id !== charId) return c;

                const assigned = c.assignedRaids.includes(raidId);

                return {
                    ...c,
                    assignedRaids: assigned
                        ? c.assignedRaids.filter((r) => r !== raidId)
                        : [...c.assignedRaids, raidId],
                };
            }),
        }));
    },
};

// ======================================================
// PROGRESSION API
// ======================================================

export const progressionApi = {
    setWeapon(track: any) {
        update((p) => ({ ...p, weapon: track }));
    },

    setArmor(slot: string, track: any) {
        update((p) => ({
            ...p,
            armor: {
                ...p.armor,
                [slot]: track,
            },
        }));
    },

    setKarma(karma: any) {
        update((p) => ({ ...p, karma }));
    },

    // ======================================================
    // CHRONOMANCER PREFILL
    // ======================================================

    prefillChronomancer(data = chronomancerData) {
        update((p: Planner) => {
            // ======================================================
            // MATERIALS (only required)
            // ======================================================
            const materials = p.materials.map((m) => {
                const incoming = data.materials?.find(
                    (x: any) => x.id === m.id
                );

                return incoming
                    ? { ...m, required: incoming.required, owned: incoming.owned }
                    : m;
            });

            // ======================================================
            // WEAPON (mode-based merge)
            // ======================================================
            const weaponTrack = { ...p.weapon };

            for (const mode of MODES) {
                weaponTrack[mode] = {
                    ...weaponTrack[mode],
                    ...data.weapon?.[mode],
                };
            }

            const weapon = weaponTrack;

            // ======================================================
            // ARMOR (5 slots + mode-based merge)
            // ======================================================
            const armor = { ...p.armor };

            for (const slot of ARMOR_SLOTS) {
                const incoming = data.armor?.[slot];
                if (!incoming) continue;

                armor[slot] = { ...armor[slot] };

                for (const mode of MODES) {
                    armor[slot][mode] = {
                        ...armor[slot][mode],
                        ...incoming[mode],
                    };
                }
            }

            // ======================================================
            // KARMA (NEW)
            // ======================================================
            const karma = {
                enlightenment: {
                    ...p.karma.enlightenment,
                    ...data.karma?.enlightenment,
                },
                evolution: {
                    ...p.karma.evolution,
                    ...data.karma?.evolution,
                },
                leap: {
                    ...p.karma.leap,
                    ...data.karma?.leap,
                },
            };

            // ======================================================
            // FINAL STATE PATCH
            // ======================================================
            return {
                ...p,

                releaseDate: data.releaseDate ?? p.releaseDate,

                materials,
                weapon,
                armor,
                karma,
            };
        });
    }
};
