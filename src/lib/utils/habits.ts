import type { WatchLogEntry } from '$lib/stores/watchlog';

/* ------------------------------------------------------
   Pure math for the watch-streak and season-goal meters.
   Deliberately framework-free (no Svelte imports) so the
   logic is unit-testable; the page feeds it the watchLog
   store plus the current season's date window.
----------------------------------------------------- */

export interface MomentumStats {
    /** Consecutive days ending today (or yesterday if nothing logged yet today). */
    currentStreak: number;
    /** Episodes logged in the trailing 7 days. */
    thisWeek: number;
    /** Episodes logged today. */
    today: number;
}

const DAY_MS = 86_400_000;

function dayKey(ts: number): string {
    const d = new Date(ts);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Consecutive days (ending today, or yesterday if today is empty) with at least one episode. */
export function computeStreak(log: WatchLogEntry[], now = new Date()): number {
    const byDay = new Set(log.map((e) => dayKey(e.ts)));
    let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (!byDay.has(dayKey(+cursor))) cursor = new Date(+cursor - DAY_MS);
    let streak = 0;
    while (byDay.has(dayKey(+cursor))) {
        streak += 1;
        cursor = new Date(+cursor - DAY_MS);
    }
    return streak;
}

export function episodesThisWeek(log: WatchLogEntry[], now = new Date()): number {
    const cutoff = +now - 7 * DAY_MS;
    return log.filter((e) => e.ts >= cutoff).length;
}

export function episodesToday(log: WatchLogEntry[], now = new Date()): number {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return log.filter((e) => e.ts >= +start).length;
}

export function computeMomentum(log: WatchLogEntry[], now = new Date()): MomentumStats {
    return {
        currentStreak: computeStreak(log, now),
        thisWeek: episodesThisWeek(log, now),
        today: episodesToday(log, now),
    };
}

/** Episodes logged inside the inclusive [start, end] window (ms timestamps). */
export function episodesInWindow(log: WatchLogEntry[], startMs: number, endMs: number): number {
    return log.filter((e) => e.ts >= startMs && e.ts <= endMs).length;
}