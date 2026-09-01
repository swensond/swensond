import { writable } from 'svelte/store';
import { recordWatch } from './watchlog';

/* ------------------------------------------------------
   Anime watchlist - AniList media IDs the visitor is watching,
   plus per-show episode progress. Persisted locally so picks
   survive across visits, and serializable for copy/share.
------------------------------------------------------ */

const WATCHLIST_STORAGE_KEY = 'nexhunter-anime-watchlist-v1';
const PROGRESS_STORAGE_KEY = 'nexhunter-anime-progress-v1';

export type ProgressMap = Record<number, number>;

function loadWatchlist(): number[] {
    if (typeof window === 'undefined') return [];

    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : [];
    } catch {
        return [];
    }
}

function loadProgress(): ProgressMap {
    if (typeof window === 'undefined') return {};

    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return {};

    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
        const out: ProgressMap = {};
        for (const [id, eps] of Object.entries(parsed)) {
            const n = Number(id);
            if (Number.isFinite(n) && Number.isFinite(Number(eps)) && Number(eps) > 0) out[n] = Number(eps);
        }
        return out;
    } catch {
        return {};
    }
}

function persist(key: string, value: unknown) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
}

export const watchlist = writable<number[]>(loadWatchlist());
watchlist.subscribe((value) => persist(WATCHLIST_STORAGE_KEY, value));

export const progress = writable<ProgressMap>(loadProgress());
progress.subscribe((value) => persist(PROGRESS_STORAGE_KEY, value));

export function toggleWatch(id: number): void {
    let removing = false;
    watchlist.update((ids) => {
        removing = ids.includes(id);
        return removing ? ids.filter((x) => x !== id) : [...ids, id];
    });
    if (removing) progress.update((p) => {
        const next = { ...p };
        delete next[id];
        return next;
    });
}

export function setProgress(id: number, episodes: number): void {
    let delta = 0;
    progress.update((p) => {
        const next = { ...p };
        const prev = p[id] ?? 0;
        if (episodes <= 0) delete next[id];
        else next[id] = episodes;
        delta = episodes - prev;
        return next;
    });
    if (delta > 0) recordWatch(id, delta);
}

export function advanceProgress(id: number): void {
    progress.update((p) => {
        const next = { ...p };
        next[id] = (p[id] ?? 0) + 1;
        return next;
    });
    recordWatch(id, 1);
}

/* ------------------------------------------------------
   Serialization for copy/share/import.
   Format: comma-separated `id:episodes` entries; bare `id`
   when no progress is recorded. Encoded into the `list`
   URL parameter (or pasted directly).

   A share name is baked INTO the `list` code as a trailing
   `~<b64name>:<checksum>` segment so it can't be swapped by
   editing the URL. The checksum ties the name to the list
   content; a mismatched code is rejected on import.
------------------------------------------------------ */

export interface SharedList {
    ids: number[];
    progress: ProgressMap;
    /** Display name of the person who shared the list, used to credit them on import. */
    from?: string;
}

/** base64url (RFC 4648) encode a unicode string without padding. */
function b64urlEncode(str: string): string {
    return btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

/** Decode the inverse of b64urlEncode. */
function b64urlDecode(str: string): string {
    let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return decodeURIComponent(escape(atob(b64)));
}

/** FNV-1a 32-bit hex checksum used to bind the name to the list content. */
function checksum(text: string): string {
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = (h * 0x01000193) >>> 0;
    }
    return h.toString(16);
}

export function serializeList(ids: number[], prog: ProgressMap, from?: string): string {
    const base = ids.map((id) => (prog[id] ? `${id}:${prog[id]}` : `${id}`)).join(',');
    if (!from) return base;
    return `${base}~${b64urlEncode(from)}:${checksum(`${base}|${from}`)}`;
}

export function serializeShareUrl(ids: number[], prog: ProgressMap, from?: string): string {
    const url = new URL(window.location.href);
    url.searchParams.set('list', serializeList(ids, prog, from));
    return url.toString();
}

export function parseList(text: string): SharedList | null {
    let base = text;
    let from: string | undefined;

    const tilde = text.indexOf('~');
    if (tilde !== -1) {
        const tail = text.slice(tilde + 1);
        const [namePart, sumPart] = tail.split(':');
        if (!namePart || !sumPart) return null;
        let name: string;
        try {
            name = b64urlDecode(namePart);
        } catch {
            return null;
        }
        base = text.slice(0, tilde);
        if (checksum(`${base}|${name}`) !== sumPart) return null;
        from = name;
    }

    const parts = base.split(',').filter((p) => p.length > 0);
    if (parts.length === 0) return null;

    const ids: number[] = [];
    const prog: ProgressMap = {};

    for (const part of parts) {
        const [idRaw, epsRaw] = part.split(':');
        const id = Number(idRaw);
        if (!Number.isInteger(id)) return null;
        ids.push(id);
        if (epsRaw !== undefined) {
            const eps = Number(epsRaw);
            if (Number.isInteger(eps) && eps > 0) prog[id] = eps;
        }
    }
    return { ids, progress: prog, from };
}

/** Accepts either a full share URL or the raw `list` code. */
export function extractList(input: string): SharedList | null {
    const text = input.trim();
    if (!text) return null;

    let code = text;
    if (text.includes('?')) {
        try {
            const parsed = new URL(text);
            const param = parsed.searchParams.get('list');
            if (!param) return null;
            code = param;
        } catch {
            return null;
        }
    }
    return parseList(code);
}

export function applySharedList(data: SharedList): void {
    watchlist.set(data.ids);
    progress.set(data.progress);
}