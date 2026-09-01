export type Character = {
    id: string;
    name: string;
    itemLevel?: number;
    weeklyGold: number;
    assignedRaids: string[];
    /** Roster gold slots cap at 6; undefined counts as an earner for legacy data */
    goldEarner?: boolean;
};

/** Only gold earners earn raid gold (max 6 per roster). */
export function isGoldEarner(char: Character): boolean {
    return char.goldEarner ?? true;
}

export function countGoldEarners(roster: Character[]): number {
    return roster.filter(isGoldEarner).length;
}

export const MAX_GOLD_EARNERS = 6;

export function createDefaultCharacter(overrides?: Partial<Character>): Character {
    return {
        id: crypto.randomUUID(),
        name: "New Character",
        weeklyGold: 0,
        assignedRaids: [],
        ...overrides,
    };
}
