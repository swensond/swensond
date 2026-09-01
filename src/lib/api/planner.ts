import { plans, sanitizeName, type SavedPlan } from "$lib/stores/plans";
import { get } from "svelte/store";
import chronomancerData from "$lib/data/chronomancer.json";
import { raids, raidFamily, suggestRaids } from "$lib/data/raids";
import { createDefaultCharacter, isGoldEarner, MAX_GOLD_EARNERS, type Character } from "$lib/helpers/character";
import { calculateMaterialRequirements } from "$lib/helpers/honing";
import { type AccessorySlot, type armorPieces, type modes, type ArmorSlot, type HoningMode, type KarmaKey, karmaTracks, type Planner, type PlannedEvent, type TapEntry, type GoldEntry, planner, STORAGE_VERSION } from "$lib/stores/planner";
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

/**
 * Apply a gold change and record it in the gold log.
 * Returns a new planner state.
 */
function applyGold(p: Planner, newGold: number, note?: string): Planner {
    const delta = Math.round(newGold) - p.currentGold;

    if (delta === 0) return p;

    const entry: GoldEntry = {
        id: crypto.randomUUID(),
        amount: delta,
        balanceAfter: Math.max(0, Math.round(newGold)),
        note,
        timestamp: new Date().toISOString(),
    };

    return {
        ...p,
        currentGold: entry.balanceAfter,
        goldLog: [...(p.goldLog ?? []), entry],
    };
}

// ======================================================
// CORE PLANNER API
// ======================================================

export const plannerApi = {
    setGold(currentGold: number) {
        update((p) => applyGold(p, currentGold, "Set balance"));
    },

    addGold(amount: number, note?: string) {
        if (!amount) return;
        update((p) => applyGold(p, p.currentGold + amount, note ?? "Manual add"));
    },

    spendGold(amount: number, note?: string) {
        if (!amount) return;
        update((p) =>
            applyGold(
                p,
                Math.max(0, p.currentGold - amount),
                note ?? "Manual spend",
            )
        );
    },

    clearGoldLog() {
        update((p) => ({ ...p, goldLog: [] }));
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
    patch: Partial<{ currentLevel: number; targetLevel: number; artisan: number }>
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
    patch: Partial<{ currentLevel: number; targetLevel: number; artisan: number }>
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

    // ======================================================
    // SCHEDULED EVENTS (one-off income)
    // ======================================================

    addEvent(partial?: Partial<PlannedEvent>) {
        const event: PlannedEvent = {
            id: partial?.id ?? crypto.randomUUID(),
            label: partial?.label?.trim() || "Event",
            date: partial?.date ?? new Date().toISOString().slice(0, 10),
            amount: Math.round(partial?.amount ?? 0),
            kind: partial?.kind ?? "tradable",
        };

        update((p) => ({
            ...p,
            events: [...(p.events ?? []), event],
        }));
    },

    updateEvent(
        id: string,
        patch: Partial<Omit<PlannedEvent, "id">>
    ) {
        update((p) => ({
            ...p,
            events: (p.events ?? []).map((e) =>
                e.id === id ? { ...e, ...patch } : e
            ),
        }));
    },

    removeEvent(id: string) {
        update((p) => ({
            ...p,
            events: (p.events ?? []).filter((e) => e.id !== id),
        }));
    },

    /** Quick-add: clone an existing event dated one week later. */
    duplicateEventNextWeek(id: string) {
        update((p) => {
            const source = (p.events ?? []).find((e) => e.id === id);
            if (!source) return p;

            const next = new Date(source.date);
            next.setDate(next.getDate() + 7);

            return {
                ...p,
                events: [
                    ...(p.events ?? []),
                    {
                        ...source,
                        id: crypto.randomUUID(),
                        date: next.toISOString().slice(0, 10),
                    },
                ],
            };
        });
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

            const char = p.roster.find(
                (c: Character) => c.id === charId
            );
            const earnsGold = char ? isGoldEarner(char) : false;

            // Raid gold is character-bound; only the tradable share joins
            // the planner's spendable balance
            const raid = raids.find((r) => r.id === raidId);
            const gold = earnsGold ? (raid?.tradableGold ?? 0) : 0;

            const nextGold = exists
                ? Math.max(0, p.currentGold - gold)
                : p.currentGold + gold;

            const next = applyGold(
                p,
                nextGold,
                `${exists ? "Undo" : "Clear"}: ${raid?.name ?? raidId}`,
            );

            return {
                ...next,
                completedRaids: {
                    ...next.completedRaids,
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
        const character = createDefaultCharacter({
            ...partial,
            // New characters are gold earners while roster slots allow
            goldEarner: partial?.goldEarner ?? undefined,
        });

        update((p) => {
            if (character.goldEarner === undefined) {
                character.goldEarner =
                    p.roster.filter(isGoldEarner).length < MAX_GOLD_EARNERS;
            }

            return { ...p, roster: [...p.roster, character] };
        });
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

    /** Toggle a character's gold-earner status, capped at MAX_GOLD_EARNERS. */
    toggleGoldEarner(charId: string) {
        update((p) => {
            const char = p.roster.find((c: Character) => c.id === charId);
            if (!char) return p;

            const earning = isGoldEarner(char);

            if (
                !earning &&
                p.roster.filter(isGoldEarner).length >= MAX_GOLD_EARNERS
            ) {
                alert(
                    `Only ${MAX_GOLD_EARNERS} characters can earn gold. ` +
                        "Unmark another gold earner first."
                );
                return p;
            }

            return {
                ...p,
                roster: p.roster.map((c: Character) =>
                    c.id === charId ? { ...c, goldEarner: !earning } : c
                ),
            };
        });
    },

    toggleAssignedRaid(charId: string, raidId: string) {
        update((p) => {
            const char = p.roster.find((c: Character) => c.id === charId);
            if (!char) return p;

            const assigned = char.assignedRaids.includes(raidId);
            let assignedRaids: string[];

            if (assigned) {
                assignedRaids = char.assignedRaids.filter((r) => r !== raidId);
            } else {
                const family = raidFamily(raidId);

                assignedRaids = [
                    ...char.assignedRaids.filter(
                        (r) => raidFamily(r) !== family
                    ),
                    raidId,
                ];
            }

            return applyAssignedRaids(p, charId, assignedRaids);
        });
    },

    /** Fill the 3 gold slots with the best-paying raids the character's ilvl allows. */
    autoAssignRaids(charId: string) {
        update((p) => {
            const char = p.roster.find((c: Character) => c.id === charId);
            if (!char) return p;

            const suggested = suggestRaids(char.itemLevel ?? 0).map(
                (r) => r.id
            );

            return applyAssignedRaids(p, charId, suggested);
        });
    },
};

/** Assign raids to a character, un-completing (and un-crediting) any removed ones. */
function applyAssignedRaids(
    p: Planner,
    charId: string,
    assignedRaids: string[]
): Planner {
    const staleCompleted = (p.completedRaids[charId] ?? []).filter(
        (r) => !assignedRaids.includes(r)
    );

    let completedRaids = p.completedRaids;
    let next = p;

    if (staleCompleted.length > 0) {
        completedRaids = {
            ...p.completedRaids,
            [charId]: (p.completedRaids[charId] ?? []).filter((r) =>
                assignedRaids.includes(r)
            ),
        };

        const removedTradable = staleCompleted.reduce(
            (sum, id) =>
                sum + (raids.find((r) => r.id === id)?.tradableGold ?? 0),
            0
        );

        next = applyGold(
            p,
            Math.max(0, p.currentGold - removedTradable),
            "Removed assigned raids"
        );
    }

    return {
        ...next,
        completedRaids,
        roster: next.roster.map((c: Character) =>
            c.id === charId ? { ...c, assignedRaids } : c
        ),
    };
}

// ======================================================
// TAP LOG API
// ======================================================

function createTapEntry(
    kind: TapEntry["kind"],
    trackKey: string,
    trackLabel: string,
    level: number,
    artisan: number | null,
): TapEntry {
    return {
        id: crypto.randomUUID(),
        kind,
        trackKey,
        trackLabel,
        level,
        artisan,
        timestamp: new Date().toISOString(),
    };
}

export const logApi = {
    logWeaponTap(mode: HoningMode, artisan: number | null) {
        update((p) => {
            const track = p.weapon[mode];

            return {
                ...p,
                weapon: {
                    ...p.weapon,
                    [mode]: {
                        ...track,
                        currentLevel: track.currentLevel + 1,
                        ...(artisan !== null ? { artisan } : {}),
                    },
                },
                tapLog: [
                    ...(p.tapLog ?? []),
                    createTapEntry(
                        "honing",
                        `weapon:${mode}`,
                        `Weapon · ${mode}`,
                        track.currentLevel + 1,
                        artisan,
                    ),
                ],
            };
        });
    },

    logArmorTap(piece: ArmorSlot, mode: HoningMode, artisan: number | null) {
        update((p) => {
            const track = p.armor[piece][mode];

            return {
                ...p,
                armor: {
                    ...p.armor,
                    [piece]: {
                        ...p.armor[piece],
                        [mode]: {
                            ...track,
                            currentLevel: track.currentLevel + 1,
                            ...(artisan !== null ? { artisan } : {}),
                        },
                    },
                },
                tapLog: [
                    ...(p.tapLog ?? []),
                    createTapEntry(
                        "honing",
                        `armor:${piece}:${mode}`,
                        `${piece} · ${mode}`,
                        track.currentLevel + 1,
                        artisan,
                    ),
                ],
            };
        });
    },

    logKarmaTap(key: KarmaKey, artisan: number | null) {
        update((p) => {
            const karma = p.karma[key];
            const label =
                karmaTracks.find((t) => t.key === key)?.label ?? key;

            return {
                ...p,
                karma: {
                    ...p.karma,
                    [key]: {
                        ...karma,
                        currentLevel: karma.currentLevel + 1,
                        ...(artisan !== null ? { artisan } : {}),
                    },
                },
                tapLog: [
                    ...(p.tapLog ?? []),
                    createTapEntry(
                        "karma",
                        `karma:${key}`,
                        label,
                        karma.currentLevel + 1,
                        artisan,
                    ),
                ],
            };
        });
    },

    removeTap(id: string) {
        update((p: Planner) => ({
            ...p,
            tapLog: (p.tapLog ?? []).filter((t) => t.id !== id),
        }));
    },

    clearTaps() {
        update((p: Planner) => ({ ...p, tapLog: [] }));
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

// ======================================================
// SAVED PLANS API
// ======================================================

function downloadJson(filename: string, data: unknown) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export const plansApi = {
    /** Snapshot the current planner state into a named plan. */
    save(name: string) {
        const current = get(planner);

        const saved: SavedPlan = {
            id: crypto.randomUUID(),
            name: sanitizeName(name),
            savedAt: new Date().toISOString(),
            data: current,
        };

        plans.update((list) => [saved, ...list]);
    },

    /** Overwrite an existing saved plan with the current planner state. */
    update(id: string) {
        const current = get(planner);

        plans.update((list) =>
            list.map((plan) =>
                plan.id === id
                    ? {
                        ...plan,
                        savedAt: new Date().toISOString(),
                        data: current,
                    }
                    : plan
            )
        );
    },

    rename(id: string, name: string) {
        plans.update((list) =>
            list.map((plan) =>
                plan.id === id ? { ...plan, name: sanitizeName(name) } : plan
            )
        );
    },

    delete(id: string) {
        plans.update((list) => list.filter((plan) => plan.id !== id));
    },

    /** Replace the active planner state with a saved plan. */
    load(id: string) {
        const list = get(plans);
        const plan = list.find((p) => p.id === id);
        if (!plan) return;

        planner.set({
            ...plan.data,
            __version: STORAGE_VERSION,
        });
    },

    export(id: string) {
        const plan = get(plans).find((p) => p.id === id);
        if (!plan) return;

        downloadJson(
            `${plan.name.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase()}.json`,
            plan
        );
    },

    import(file: File) {
        const reader = new FileReader();

        reader.onload = () => {
            try {
                const parsed = JSON.parse(String(reader.result));

                // Accept either a full SavedPlan or a raw Planner snapshot
                const isSavedPlan =
                    parsed && typeof parsed === "object" && "data" in parsed;

                const saved: SavedPlan = {
                    id: crypto.randomUUID(),
                    name: sanitizeName(
                        isSavedPlan ? parsed.name : "Imported Plan"
                    ),
                    savedAt: new Date().toISOString(),
                    data: isSavedPlan ? parsed.data : parsed,
                };

                plans.update((list) => [saved, ...list]);
            } catch {
                alert("Could not import plan: invalid JSON file.");
            }
        };

        reader.readAsText(file);
    },
};
