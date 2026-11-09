export type Shot = {
    src: string;
    width?: number;
    height?: number;
    caption?: string;
};

export type Gallery<T extends Shot> = {
    /** Zero-padded position, "01". */
    number: string;
    slug: string;
    title: string;
    shots: T[];
};

export type Active<T extends Shot> = Gallery<T> & { index: number };

/** Horizontal travel, in pixels, before a drag counts as a swipe. */
const SWIPE_THRESHOLD = 50;

/**
 * Owns the lightbox state machine: what is open, which shot, and every way of
 * moving between shots. Deliberately knows nothing about the DOM beyond the
 * dialog element it drives, so the wrap and threshold logic is exercisable
 * without a browser.
 */
export function createLightbox<T extends Shot>() {
    let active = $state<Active<T> | null>(null);
    let element = $state<HTMLDialogElement | undefined>(undefined);
    let swipeStart: number | null = null;

    const shot = $derived(active ? active.shots[active.index] : undefined);
    const count = $derived(active ? active.shots.length : 0);
    const multi = $derived(count > 1);

    function open(gallery: Gallery<T>, index = 0): void {
        if (!gallery.shots.length) {
            return;
        }

        active = { ...gallery, index: Math.min(Math.max(index, 0), gallery.shots.length - 1) };
        element?.showModal();
    }

    function close(): void {
        active = null;
        element?.close();
    }

    /** Moves by `delta` shots, wrapping at both ends so it always lands on a shot. */
    function step(delta: number): void {
        if (!active?.shots.length) {
            return;
        }

        const total = active.shots.length;
        active.index = (((active.index + delta) % total) + total) % total;
    }

    function next(): void {
        step(1);
    }

    function prev(): void {
        step(-1);
    }

    function goTo(index: number): void {
        if (!active) {
            return;
        }

        active.index = Math.min(Math.max(index, 0), active.shots.length - 1);
    }

    /** Arrow keys and Home/End. Returns true when the key was consumed. */
    function handleKey(key: string): boolean {
        if (!active) {
            return false;
        }

        if (key === 'ArrowLeft') prev();
        else if (key === 'ArrowRight') next();
        else if (key === 'Home') goTo(0);
        else if (key === 'End') goTo(count - 1);
        else return false;

        return true;
    }

    /** Mouse drags are the browser's business; only touch and pen start a swipe. */
    function beginSwipe(pointerType: string, clientX: number): void {
        swipeStart = pointerType === 'mouse' ? null : clientX;
    }

    function endSwipe(clientX: number): void {
        if (swipeStart === null) {
            return;
        }

        const distance = clientX - swipeStart;
        swipeStart = null;

        if (Math.abs(distance) > SWIPE_THRESHOLD) {
            step(distance < 0 ? 1 : -1);
        }
    }

    return {
        get active() {
            return active;
        },
        get shot() {
            return shot;
        },
        get count() {
            return count;
        },
        get multi() {
            return multi;
        },
        /** Bound by the dialog so open/close can drive showModal. */
        get element() {
            return element;
        },
        set element(node: HTMLDialogElement | undefined) {
            element = node;
        },
        open,
        close,
        next,
        prev,
        goTo,
        handleKey,
        beginSwipe,
        endSwipe
    };
}

export type Lightbox<T extends Shot = Shot> = ReturnType<typeof createLightbox<T>>;
