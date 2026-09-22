import type { AniListMedia, AniListRelationNode } from '$lib/types/anime';
import type { ProgressMap } from '$lib/stores/watchlist';
import type { WatchLogEntry } from '$lib/stores/watchlog';

/* ------------------------------------------------------
   Rewatch scoring engine - pure, deterministic, no Svelte
   or store imports. A "member" is one viewer's watch data;
   today the app has exactly one (the visitor), but scoring
   per member and merging keeps the later group phase purely
   additive. All weights are named constants for tuning.
----------------------------------------------------- */

export interface Member {
    /** AniList media ids this member has on their list. */
    ids: number[];
    /** Episodes seen per show. */
    progress: ProgressMap;
    /** Per-episode timestamps; powers staleness. Optional so callers can score without it. */
    watchLog?: WatchLogEntry[];
}

export type RewatchReasonType = 'prep' | 'stale' | 'genre' | 'effort';

export interface RewatchReason {
    type: RewatchReasonType;
    /** Full sentence for the reason line under the card. */
    label: string;
    /** Compact chip text for the cover badge; absent for non-urgency factors. */
    short?: string;
    /** Points this factor contributed to the score. */
    weight: number;
}

export interface RewatchPick {
    media: AniListMedia;
    score: number;
    /** Sorted by weight desc; reasons[0] is the dominant "why now" factor. */
    reasons: RewatchReason[];
}

/** Months finished after which a no-prep pick counts as "long overdue". */
export const OVERDUE_MONTHS = 6;

export type RewatchDriver = 'prep' | 'overdue' | 'comfort';

/** Which narrative bucket a pick belongs to: franchise momentum, time, or taste. */
export function pickDriver(pick: RewatchPick): RewatchDriver {
    if (pick.reasons.some((r) => r.type === 'prep')) return 'prep';
    const stale = pick.reasons.find((r) => r.type === 'stale');
    if (stale && stale.weight >= W_STALENESS * (OVERDUE_MONTHS / STALENESS_RAMP_MONTHS)) return 'overdue';
    return 'comfort';
}

/* ── Tunable weights (max total = 100) ── */

export const W_STALENESS = 40;
export const W_GENRE = 20;
export const W_FEASIBILITY = 15;
export const W_SEQUEL_PREP = 25;

/** Months of no rewatch interest before the staleness score caps out. */
export const STALENESS_RAMP_MONTHS = 36;
/** Sequel/new-cour airings within this window get the full prep boost. */
export const AIRING_SOON_MS = 6 * 7 * 24 * 60 * 60 * 1000;

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_MS = 30 * DAY_MS;

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

/**
 * A show counts as finished when every episode is logged. Ongoing titles
 * (episodes: null) are only "completed" once nothing is scheduled to air -
 * otherwise the viewer is mid-run, not rewatch material.
 */
export function isCompleted(media: AniListMedia, progress: ProgressMap): boolean {
    const seen = progress[media.id] ?? 0;
    if (media.episodes != null) return seen >= media.episodes;
    return seen > 0 && !media.nextAiringEpisode;
}

/** Whole months since the member's last logged episode of `id`; null when never logged. */
export function stalenessMonths(log: WatchLogEntry[], id: number, now = Date.now()): number | null {
    let last = 0;
    for (const e of log) {
        if (e.id === id && e.ts > last) last = e.ts;
    }
    if (last === 0) return null;
    return Math.max(0, (now - last) / MONTH_MS);
}

/** Linear ramp 0→1 over STALENESS_RAMP_MONTHS, capped. Unknown staleness scores 0. */
export function stalenessDecay(months: number | null): number {
    if (months == null) return 0;
    return Math.min(1, Math.max(0, months / STALENESS_RAMP_MONTHS));
}

/** Genre frequency across everything the members have on their lists. */
export function buildGenreCounts(members: Member[], mediaById: Map<number, AniListMedia>): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const member of members) {
        for (const id of member.ids) {
            const m = mediaById.get(id);
            if (!m) continue;
            for (const g of m.genres) counts[g] = (counts[g] ?? 0) + 1;
        }
    }
    return counts;
}

/** Average of the candidate's genres, normalized by the member's most frequent genre. 0..1. */
export function genreAffinity(counts: Record<string, number>, genres: string[]): number {
    if (genres.length === 0) return 0;
    let max = 1;
    for (const c of Object.values(counts)) {
        if (c > max) max = c;
    }
    let sum = 0;
    for (const g of genres) sum += (counts[g] ?? 0) / max;
    return Math.min(1, sum / genres.length);
}

/**
 * Rewatch effort curve: 6-30 eps is the sweet spot (full score), short
 * titles are fine, long runs taper, 100+ eps gets a heavy penalty.
 */
export function feasibility(episodes: number | null): number {
    if (episodes == null) return 0.5;
    if (episodes < 6) return 0.5 + episodes / 12;
    if (episodes <= 30) return 1;
    if (episodes <= 100) return 1 - (episodes - 30) / 140;
    return Math.max(0, 0.5 - (episodes - 100) / 200);
}

export interface SequelPrep {
    boost: number;
    label: string | null;
    short: string | null;
}

function untilLabel(msFromNow: number): string {
    const days = Math.max(0, Math.ceil(msFromNow / DAY_MS));
    return days >= 14 ? `${Math.round(days / 7)} wks` : `${days} d`;
}

/**
 * English-first display title for a sequel node. AniList often leaves the
 * sequel's English title null while the parent has one; for the common
 * "<parent romaji> Season 2" pattern we swap in the parent's English name
 * for the shared franchise prefix.
 */
function sequelTitle(parent: AniListMedia, node: AniListRelationNode, full?: AniListMedia): string {
    const english = full?.title.english ?? node.title.english;
    if (english) return english;
    const romaji = full?.title.romaji ?? node.title.romaji ?? '';
    if (parent.title.english && romaji && parent.title.romaji && romaji.startsWith(parent.title.romaji)) {
        return parent.title.english + romaji.slice(parent.title.romaji.length);
    }
    return romaji || parent.title.english || 'the sequel';
}

/**
 * Franchise momentum: a sequel in the relations (optionally already scheduled)
 * or the show itself picking up new episodes within ~6 weeks. `allMedia` is
 * used to resolve the sequel's display title from richer records when present.
 * A sequel the member already finished is not prep material - no boost.
 */
export function sequelPrepBoost(media: AniListMedia, allMedia: AniListMedia[], now = Date.now(), completedIds: ReadonlySet<number> = new Set()): SequelPrep {
    const edges = media.relations?.edges ?? [];
    const sequel = edges.find((e) => e.relationType === 'SEQUEL' && e.node.type === 'ANIME');
    if (sequel) {
        if (completedIds.has(sequel.node.id)) return { boost: 0, label: null, short: null };
        const full = allMedia.find((m) => m.id === sequel.node.id);
        const title = sequelTitle(media, sequel.node, full);
        const airing = sequel.node.nextAiringEpisode;
        if (airing) {
            const inMs = airing.airingAt * 1000 - now;
            if (inMs >= 0 && inMs <= AIRING_SOON_MS) return { boost: 1, label: `prepping for ${title} (airing in ${untilLabel(inMs)})`, short: `airs in ${untilLabel(inMs)}` };
        }
        return { boost: 1, label: `prepping for ${title}`, short: 'sequel coming' };
    }
    const next = media.nextAiringEpisode;
    if (next) {
        const inMs = next.airingAt * 1000 - now;
        if (inMs >= 0 && inMs <= AIRING_SOON_MS) return { boost: 1, label: `new episodes airing in ${untilLabel(inMs)}`, short: `new eps in ${untilLabel(inMs)}` };
    }
    return { boost: 0, label: null, short: null };
}

/**
 * Score every completed show for each member, keep the best member's pick per
 * show, and sort by score. Incomplete shows (including mid-run airing titles)
 * are excluded - open progress means "keep watching", not "rewatch".
 */
export function scoreRewatchCandidates(members: Member[], media: AniListMedia[], now = Date.now()): RewatchPick[] {
    const byId = new Map(media.map((m) => [m.id, m]));
    const genreCounts = buildGenreCounts(members, byId);
    const best = new Map<number, { pick: RewatchPick; months: number }>();

    for (const member of members) {
        const log = member.watchLog ?? [];
        const completedIds = new Set(media.filter((m) => isCompleted(m, member.progress)).map((m) => m.id));
        for (const m of media) {
            if (!isCompleted(m, member.progress)) continue;

            const months = stalenessMonths(log, m.id, now);
            const prep = sequelPrepBoost(m, media, now, completedIds);
            const genre = genreAffinity(genreCounts, m.genres);
            const wStale = round2(W_STALENESS * stalenessDecay(months));
            const wGenre = round2(W_GENRE * genre);
            const wEffort = round2(W_FEASIBILITY * feasibility(m.episodes));
            const wPrep = round2(W_SEQUEL_PREP * prep.boost);
            const score = wStale + wGenre + wEffort + wPrep;

            const reasons: RewatchReason[] = [];
            if (months != null) {
                reasons.push({
                    type: 'stale',
                    weight: wStale,
                    label: months < 1 ? 'Finished recently' : `Finished ${Math.floor(months)} months ago`,
                    short: months < 1 ? 'recent' : `${Math.floor(months)} mo ago`
                });
            }
            if (m.episodes != null) reasons.push({ type: 'effort', weight: wEffort, label: `${m.episodes} eps` });
            if (prep.label) reasons.push({ type: 'prep', weight: wPrep, label: prep.label, short: prep.short ?? undefined });
            const matched = m.genres.filter((g) => (genreCounts[g] ?? 0) > 0).slice(0, 2);
            if (matched.length > 0) reasons.push({ type: 'genre', weight: wGenre, label: `Your ${matched.join(' + ')} taste` });
            reasons.sort((a, b) => b.weight - a.weight);

            const pick: RewatchPick = { media: m, score: Math.round(score * 100) / 100, reasons };
            const prev = best.get(m.id);
            if (!prev || score > prev.pick.score || (score === prev.pick.score && (months ?? -1) > prev.months)) {
                best.set(m.id, { pick, months: months ?? -1 });
            }
        }
    }

    return [...best.values()].map((b) => b.pick).sort((a, b) => b.score - a.score || a.media.id - b.media.id);
}
