import { describe, expect, it } from 'vitest';

import { projects, slugOf } from './projects';

describe('slugOf', () => {
    it('drops the directory, the numeric suffix, and the extension', () => {
        expect(slugOf('/projects/my-gym-3.webp')).toBe('my-gym');
    });

    it('leaves an unnumbered screenshot alone', () => {
        expect(slugOf('/projects/loa-planner.webp')).toBe('loa-planner');
    });

    it('returns an empty string when there is no filename', () => {
        expect(slugOf('')).toBe('');
    });
});

describe('projects', () => {
    it('numbers every project from one, zero-padded', () => {
        expect(projects.map((project) => project.index)).toEqual(['01', '02', '03', '04', '05']);
    });

    it('derives each slug from the first screenshot', () => {
        expect(projects.find((project) => project.name === 'My Gym')?.slug).toBe('my-gym');
    });

    it('marks multi-screenshot projects only', () => {
        expect(projects.find((project) => project.name === 'My Gym')?.multi).toBe(true);
        expect(projects.find((project) => project.name === 'Recipes')?.multi).toBe(false);
    });

    it('flags work in progress without the tagline carrying a sentinel', () => {
        const gym = projects.find((project) => project.name === 'My Gym');
        expect(gym?.wip).toBe(true);
        expect(gym?.tagline).not.toContain('work in progress');
        expect(projects.find((project) => project.name === 'Recipes')?.wip).toBeUndefined();
    });

    it('gives every project at least one screenshot', () => {
        for (const project of projects) {
            expect(project.images.length).toBeGreaterThan(0);
        }
    });
});
