export type Character = {
    id: string;
    name: string;
    weeklyGold: number;
    assignedRaids: string[];
};

export function createDefaultCharacter(overrides?: Partial<Character>): Character {
    return {
        id: crypto.randomUUID(),
        name: "New Character",
        weeklyGold: 0,
        assignedRaids: [],
        ...overrides,
    };
}
