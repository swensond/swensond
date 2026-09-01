import { writable } from 'svelte/store';

/* ------------------------------------------------------
   Anime watch-log - one entry per episode marked watched,
   with a timestamp. Feeds streak + per-season goal meters.
   Typed as a plain array of {id, ts} so a "catch up" of N
   episodes records N events (same timestamp) and the math
   downstream (day grouping, season windows) stays trivial.
----------------------------------------------------- */

const WATCHLOG_STORAGE_KEY = 'anime-watch-tool-watchlog-v1';
const MAX_ENTRIES = 2000;

export interface WatchLogEntry {
    id: number;
    ts: number;
}

function loadWatchLog(): WatchLogEntry[] {
    if (typeof window === 'undefined') return [];

    const raw = localStorage.getItem(WATCHLOG_STORAGE_KEY);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter((e) => e && Number.isFinite(e.ts) && Number.isFinite(e.id))
            .map((e) => ({ id: Number(e.id), ts: Number(e.ts) }))
            .slice(-MAX_ENTRIES);
    } catch {
        return [];
    }
}

function persist(value: WatchLogEntry[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(WATCHLOG_STORAGE_KEY, JSON.stringify(value));
}

export const watchLog = writable<WatchLogEntry[]>(loadWatchLog());
watchLog.subscribe((value) => persist(value));

/** Record `count` episodes of `id` as watched at the current time. */
export function recordWatch(id: number, count = 1): void {
    if (!(count >= 1)) return;
    const ts = Date.now();
    watchLog.update((log) => [...log, ...Array.from({ length: count }, () => ({ id, ts }))].slice(-MAX_ENTRIES));
}

/** Remove all recorded watch events (used when clearing the watchlist). */
export function clearWatchLog(): void {
    watchLog.set([]);
}