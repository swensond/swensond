import { describe, expect, it } from 'vitest';

import { roles, skills, tenure, toMonths } from './career';

describe('toMonths', () => {
    it('counts months from year zero', () => {
        expect(toMonths('Jan 2023')).toBe(2023 * 12);
        expect(toMonths('Dec 2023')).toBe(2023 * 12 + 11);
    });

    it('resolves Present against the supplied now', () => {
        expect(toMonths('Present', new Date(2026, 8, 29))).toBe(2026 * 12 + 8);
    });

    it('returns a difference that survives a December to January boundary', () => {
        expect(toMonths('Jan 2024') - toMonths('Dec 2023')).toBe(1);
    });
});

describe('tenure', () => {
    it('renders years and months', () => {
        expect(tenure('Mar 2023 – Jan 2025', new Date(2026, 8, 29))).toBe('1y 10m');
    });

    it('drops the months when they are zero', () => {
        expect(tenure('Mar 2023 – Mar 2024', new Date(2026, 8, 29))).toBe('1y');
    });

    it('keeps counting for an ongoing role', () => {
        expect(tenure('Mar 2023 – Present', new Date(2026, 8, 29))).toBe('3y 6m');
    });

    it('drops the years when they are zero', () => {
        expect(tenure('Jan 2026 – Jul 2026', new Date(2026, 8, 29))).toBe('6m');
    });

    it('returns an empty string under a month', () => {
        expect(tenure('Jan 2026 – Jan 2026', new Date(2026, 8, 29))).toBe('');
    });
});

describe('roles', () => {
    it('flattens employers into one entry per role', () => {
        const evive = roles.filter((role) => role.company === 'Evive Health');
        expect(evive).toHaveLength(3);
    });

    it('reads the start year off the dates', () => {
        expect(roles[0].year).toBe('2023');
    });

    it('marks only the ongoing role as current', () => {
        expect(roles.filter((role) => role.current).map((role) => role.company)).toEqual(['Global Unity Impact']);
    });

    it('keeps the original order', () => {
        expect(roles[0].company).toBe('Global Unity Impact');
        expect(roles.at(-1)?.company).toBe('Continuum Managed Services');
    });

    it('gives every role a company, a location, and at least one bullet', () => {
        for (const role of roles) {
            expect(role.company).toBeTruthy();
            expect(role.location).toBeTruthy();
            expect(role.bullets.length).toBeGreaterThan(0);
        }
    });
});

describe('skills', () => {
    it('has no empty category or item', () => {
        for (const group of skills) {
            expect(group.category).toBeTruthy();
            expect(group.items.length).toBeGreaterThan(0);
        }
    });
});
