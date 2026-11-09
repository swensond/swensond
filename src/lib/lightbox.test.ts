import { describe, expect, it } from 'vitest';

import { createLightbox } from './lightbox-state.svelte';

type TestShot = { src: string; caption?: string };

const gallery = (srcs: string[]) => ({
    number: '01',
    slug: 'demo',
    title: 'Demo',
    shots: srcs.map((src) => ({ src }))
});

const three = gallery(['/a.webp', '/b.webp', '/c.webp']);

describe('createLightbox', () => {
    it('starts closed', () => {
        const lightbox = createLightbox<TestShot>();
        expect(lightbox.active).toBeNull();
        expect(lightbox.shot).toBeUndefined();
        expect(lightbox.count).toBe(0);
        expect(lightbox.multi).toBe(false);
    });

    it('opens on the requested shot', () => {
        const lightbox = createLightbox<TestShot>();
        lightbox.open(three, 1);

        expect(lightbox.active?.title).toBe('Demo');
        expect(lightbox.shot?.src).toBe('/b.webp');
        expect(lightbox.count).toBe(3);
        expect(lightbox.multi).toBe(true);
    });

    it('defaults to the first shot', () => {
        const lightbox = createLightbox<TestShot>();
        lightbox.open(three);

        expect(lightbox.shot?.src).toBe('/a.webp');
    });

    it('clamps an out-of-range index on open', () => {
        const lightbox = createLightbox<TestShot>();
        lightbox.open(three, 99);

        expect(lightbox.shot?.src).toBe('/c.webp');
    });

    it('refuses to open an empty gallery', () => {
        const lightbox = createLightbox<TestShot>();
        lightbox.open(gallery([]));

        expect(lightbox.active).toBeNull();
    });

    it('wraps forward off the end and backward off the start', () => {
        const lightbox = createLightbox<TestShot>();
        lightbox.open(three, 2);
        lightbox.next();
        expect(lightbox.shot?.src).toBe('/a.webp');

        lightbox.prev();
        expect(lightbox.shot?.src).toBe('/c.webp');
    });

    it('stays put on a single-shot gallery', () => {
        const lightbox = createLightbox<TestShot>();
        lightbox.open(gallery(['/only.webp']));
        lightbox.next();

        expect(lightbox.shot?.src).toBe('/only.webp');
        expect(lightbox.multi).toBe(false);
    });

    it('clamps goTo to the gallery bounds', () => {
        const lightbox = createLightbox<TestShot>();
        lightbox.open(three);

        lightbox.goTo(99);
        expect(lightbox.shot?.src).toBe('/c.webp');

        lightbox.goTo(-5);
        expect(lightbox.shot?.src).toBe('/a.webp');
    });

    it('ignores navigation while closed', () => {
        const lightbox = createLightbox<TestShot>();
        lightbox.next();
        lightbox.prev();
        lightbox.goTo(2);

        expect(lightbox.active).toBeNull();
    });

    it('closes', () => {
        const lightbox = createLightbox<TestShot>();
        lightbox.open(three);
        lightbox.close();

        expect(lightbox.active).toBeNull();
        expect(lightbox.shot).toBeUndefined();
    });

    describe('handleKey', () => {
        it('consumes arrows, Home, and End', () => {
            const lightbox = createLightbox<TestShot>();
            lightbox.open(three);

            expect(lightbox.handleKey('ArrowRight')).toBe(true);
            expect(lightbox.shot?.src).toBe('/b.webp');

            expect(lightbox.handleKey('ArrowLeft')).toBe(true);
            expect(lightbox.shot?.src).toBe('/a.webp');

            expect(lightbox.handleKey('End')).toBe(true);
            expect(lightbox.shot?.src).toBe('/c.webp');

            expect(lightbox.handleKey('Home')).toBe(true);
            expect(lightbox.shot?.src).toBe('/a.webp');
        });

        it('does not consume other keys', () => {
            const lightbox = createLightbox<TestShot>();
            lightbox.open(three);

            expect(lightbox.handleKey('Escape')).toBe(false);
            expect(lightbox.handleKey('Tab')).toBe(false);
        });

        it('does nothing while closed', () => {
            const lightbox = createLightbox<TestShot>();

            expect(lightbox.handleKey('ArrowRight')).toBe(false);
        });
    });

    describe('swipe', () => {
        it('advances on a long swipe left', () => {
            const lightbox = createLightbox<TestShot>();
            lightbox.open(three);

            lightbox.beginSwipe('touch', 400);
            lightbox.endSwipe(300);

            expect(lightbox.shot?.src).toBe('/b.webp');
        });

        it('goes back on a long swipe right', () => {
            const lightbox = createLightbox<TestShot>();
            lightbox.open(three, 1);

            lightbox.beginSwipe('touch', 100);
            lightbox.endSwipe(300);

            expect(lightbox.shot?.src).toBe('/a.webp');
        });

        it('ignores a swipe shorter than the threshold', () => {
            const lightbox = createLightbox<TestShot>();
            lightbox.open(three);

            lightbox.beginSwipe('touch', 400);
            lightbox.endSwipe(380);

            expect(lightbox.shot?.src).toBe('/a.webp');
        });

        it('ignores mouse drags', () => {
            const lightbox = createLightbox<TestShot>();
            lightbox.open(three);

            lightbox.beginSwipe('mouse', 400);
            lightbox.endSwipe(100);

            expect(lightbox.shot?.src).toBe('/a.webp');
        });

        it('ignores a pointerup with no matching pointerdown', () => {
            const lightbox = createLightbox<TestShot>();
            lightbox.open(three);

            lightbox.endSwipe(100);

            expect(lightbox.shot?.src).toBe('/a.webp');
        });

        it('only counts the first swipe of a drag', () => {
            const lightbox = createLightbox<TestShot>();
            lightbox.open(three);

            lightbox.beginSwipe('touch', 400);
            lightbox.endSwipe(300);
            lightbox.endSwipe(300);

            expect(lightbox.shot?.src).toBe('/b.webp');
        });
    });
});
