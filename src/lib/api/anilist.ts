import type {
    AniListAiringSchedule,
    AniListMedia,
    AniListPageInfo,
    AniListSeason,
    AniListSeasonPage,
} from '$lib/types/anime';

const ENDPOINT = 'https://graphql.anilist.co';

/** Shared Media field selection used by every query. */
const MEDIA_FIELDS = `
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
          color
        }
        bannerImage
        description
        format
        episodes
        duration
        status
        averageScore
        popularity
        genres
        studios(isMain: true) {
          nodes {
            name
          }
        }
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        nextAiringEpisode {
          episode
          airingAt
          timeUntilAiring
        }
        trailer {
          id
          site
          thumbnail
        }
        source
        isAdult
`;

/** Franchise relations (sequel/prequel detection). Kept out of MEDIA_FIELDS so the
    airingSchedules payload stays lean - only season + watched media add it. */
const RELATION_FIELDS = `
        relations {
          edges {
            relationType
            node {
              id
              type
              format
              status
              title {
                romaji
                english
                native
              }
              coverImage {
                large
                color
              }
              startDate {
                year
                month
                day
              }
              averageScore
              popularity
              nextAiringEpisode {
                episode
                airingAt
              }
            }
          }
        }
`;

const SEASON_QUERY = `
  query Season($season: MediaSeason, $seasonYear: Int, $page: Int) {
    Page(page: $page, perPage: 50) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(
        season: $season
        seasonYear: $seasonYear
        type: ANIME
        sort: [POPULARITY_DESC]
        isAdult: false
      ) {
        ${MEDIA_FIELDS}
        ${RELATION_FIELDS}
      }
    }
  }
`;

const WATCHED_QUERY = `
  query Watched($ids: [Int], $page: Int) {
    Page(page: $page, perPage: 50) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(id_in: $ids, type: ANIME) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const GENRE_QUERY = `
  query GenreRecommendations($genres: [String], $page: Int) {
    Page(page: $page, perPage: 50) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(genre_in: $genres, type: ANIME, sort: [SCORE_DESC, POPULARITY_DESC], isAdult: false) {
        ${MEDIA_FIELDS}
        ${RELATION_FIELDS}
      }
    }
  }
`;

const CALENDAR_QUERY = `
  query Calendar($ids: [Int], $from: Int, $to: Int, $page: Int) {
    Page(page: $page, perPage: 50) {
      pageInfo {
        hasNextPage
        currentPage
      }
      airingSchedules(
        mediaId_in: $ids
        airingAt_greater: $from
        airingAt_lesser: $to
        sort: TIME
      ) {
        id
        episode
        airingAt
        media {
          ${MEDIA_FIELDS}
        }
      }
    }
  }
`;

const SEASON_ORDER: AniListSeason[] = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];

const SEASON_NAMES: Record<AniListSeason, string> = {
    WINTER: 'Winter',
    SPRING: 'Spring',
    SUMMER: 'Summer',
    FALL: 'Fall',
};

export function currentSeason(date = new Date()): { season: AniListSeason; seasonYear: number } {
    const month = date.getMonth() + 1;
    const season = month <= 3 ? 'WINTER' : month <= 6 ? 'SPRING' : month <= 9 ? 'SUMMER' : 'FALL';
    return { season, seasonYear: date.getFullYear() };
}

export function seasonLabel(season: AniListSeason, seasonYear: number): string {
    return `${SEASON_NAMES[season]} ${seasonYear}`;
}

export function shiftSeason(
    season: AniListSeason,
    seasonYear: number,
    delta: number,
): { season: AniListSeason; seasonYear: number } {
    const n = SEASON_ORDER.indexOf(season) + delta;
    return {
        season: SEASON_ORDER[((n % 4) + 4) % 4],
        seasonYear: seasonYear + Math.floor(n / 4),
    };
}

export function seasonOptions(fromYear: number, toYear: number): { season: AniListSeason; seasonYear: number; label: string }[] {
    const options: { season: AniListSeason; seasonYear: number; label: string }[] = [];
    for (let year = fromYear; year <= toYear; year++) {
        for (const season of SEASON_ORDER) {
            options.push({ season, seasonYear: year, label: seasonLabel(season, year) });
        }
    }
    return options;
}

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    let lastErr: Error | null = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
        const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ query, variables }),
        });

        // 429 = rate-limited. AniList locks further requests for ~a minute, so retrying
        // only adds more requests to an already-throttled window. Fail fast instead.
        if (res.status === 429) {
            throw new Error('AniList request failed (429 Too Many Requests)');
        }

        try {
            if (res.status === 500 || res.status === 502) {
                const retryAfter = Number(res.headers.get('Retry-After'));
                await delay((Number.isFinite(retryAfter) ? retryAfter : 2) * 1000 * attempt);
                lastErr = new Error(`AniList request failed (${res.status})`);
                continue;
            }

            if (!res.ok) {
                throw new Error(`AniList request failed (${res.status})`);
            }

            const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
            if (json.errors?.length) {
                throw new Error(json.errors[0].message);
            }
            if (!json.data) {
                throw new Error('AniList returned no data');
            }
            return json.data;
        } catch (e) {
            lastErr = e instanceof Error ? e : new Error(String(e));
            await delay(500 * attempt);
        }
    }

    throw lastErr ?? new Error('AniList request failed');
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchSeason(
    season: AniListSeason,
    seasonYear: number,
    page = 1,
): Promise<AniListSeasonPage> {
    const data = await gql<{ Page: AniListSeasonPage }>(SEASON_QUERY, { season, seasonYear, page });
    for (const m of data.Page.media) saveMedia(m);
    return data.Page;
}

export function seasonStatus(media: AniListMedia[]): { airing: number; upcoming: number; finished: number } {
    return {
        airing: media.filter((m) => m.status === 'RELEASING').length,
        upcoming: media.filter((m) => m.status === 'NOT_YET_RELEASED').length,
        finished: media.filter((m) => m.status === 'FINISHED' || m.status === 'CANCELLED' || m.status === 'HIATUS').length,
    };
}

// ---------------------------------------------------------------------------
// Local caching - avoid hammering the AniList API on every visit/view.
// A per-season payload is kept in memory for the session and persisted to
// IndexedDB (TTL'd) for repeat visits. Client-only; SSR/prerender never
// touches storage or the network here.
// ---------------------------------------------------------------------------

import {
    idbDeleteMany,
    idbGetMany,
    idbGet,
    idbKeys,
    idbSet,
} from '$lib/db/idb';

const CACHE_PREFIX = 'anime-watch-tool.anilist.v8'; // bump when the payload shape/behavior changes (IndexedDB-backed store)
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

interface SeasonCacheEntry {
    cachedAt: number;
    page: unknown;
}

const memCache = new Map<string, SeasonCacheEntry>();

function seasonCacheKey(season: AniListSeason, seasonYear: number): string {
    return `${CACHE_PREFIX}.season.${seasonYear}.${season}`;
}

async function readCache(key: string, ttlMs: number = CACHE_TTL_MS): Promise<unknown> {
    const now = Date.now();

    const mem = memCache.get(key);
    if (mem && now - mem.cachedAt < ttlMs) return mem.page;

    let value: unknown;
    try {
        value = await idbGet(key);
    } catch {
        return null;
    }
    if (value && (value as SeasonCacheEntry).page) {
        const entry = value as SeasonCacheEntry;
        if (now - entry.cachedAt < ttlMs) {
            memCache.set(key, entry);
            return entry.page;
        }
    }
    return null;
}

async function writeCache(key: string, page: unknown): Promise<void> {
    const entry: SeasonCacheEntry = { cachedAt: Date.now(), page };
    memCache.set(key, entry);
    try {
        await idbSet(key, entry);
    } catch {
        // IndexedDB unavailable - memory cache still covers the session.
    }
}

/** Fetch the cached values for a batch of keys in a single IndexedDB read.
    Returns a Map keyed on the original keys, only including live hits. */
async function readCacheBatch(keys: string[], ttlMs: number = CACHE_TTL_MS): Promise<Map<string, unknown>> {
    const now = Date.now();
    const out = new Map<string, unknown>();
    const missing: string[] = [];

    for (const key of keys) {
        const mem = memCache.get(key);
        if (mem && now - mem.cachedAt < ttlMs) out.set(key, mem.page);
        else missing.push(key);
    }

    if (missing.length > 0) {
        try {
            const found = await idbGetMany(missing);
            for (const [key, value] of found) {
                const entry = value as SeasonCacheEntry;
                if (entry?.page && now - entry.cachedAt < ttlMs) {
                    memCache.set(key, entry);
                    out.set(key, entry.page);
                }
            }
        } catch {
            // IndexedDB read failed - whatever came from memory still counts.
        }
    }

    return out;
}

/** Drop cached values whose keys start with `prefix` from memory and IndexedDB. */
async function clearCachePrefix(prefix: string): Promise<void> {
    for (const key of memCache.keys()) {
        if (key.startsWith(prefix)) memCache.delete(key);
    }
    try {
        const keys = await idbKeys(prefix);
        if (keys.length > 0) await idbDeleteMany(keys);
    } catch {
        // ignored - next read just misses
    }
}

/** In-flight requests per key, so concurrent callers share a single GraphQL call. */
const pending = new Map<string, Promise<unknown>>();

/** Opt-in diagnostics: append ?cacheDebug=1 to see every cache hit/miss/write. */
const CACHE_DEBUG =
    typeof location !== 'undefined' && new URLSearchParams(location.search).has('cacheDebug');

function trace(event: string, key: string, detail?: unknown): void {
    if (CACHE_DEBUG) {
        console.debug(`[cache] ${event}`, key, detail ?? '');
    }
}

/** Read-through helper: local/mem hit first, else one shared network fetch, then persist.
    `accept` optionally rejects a present cached value (e.g. a stale relation-less record),
    which then falls through to the network path and overwrites the bad entry. */
async function readThrough<T>(
    key: string,
    ttlMs: number,
    fetchData: () => Promise<T>,
    accept?: (value: unknown) => boolean,
): Promise<T> {
    const hit = await readCache(key, ttlMs);
    if (hit) {
        if (!accept || accept(hit)) {
            trace('hit', key);
            return hit as T;
        }
        trace('reject', key, 'cached value has stale shape - refetching');
        memCache.delete(key);
    } else {
        trace('miss', key);
    }

    const inFlight = pending.get(key);
    if (inFlight) {
        trace('in-flight share', key);
        return inFlight as Promise<T>;
    }

    const p = fetchData()
        .then(async (data) => {
            await writeCache(key, data);
            trace('write', key);
            pending.delete(key);
            return data;
        })
        .catch((e) => {
            trace('error', key, e instanceof Error ? e.message : String(e));
            pending.delete(key);
            throw e;
        });
    pending.set(key, p);
    return p;
}

/** Drops every cached value for a season (main key, per-page and count keys). */
export function clearSeasonCache(season: AniListSeason, seasonYear: number): void {
    void clearCachePrefix(seasonCacheKey(season, seasonYear));
}

export function clearGenreCache(): void {
    void clearCachePrefix(`${CACHE_PREFIX}.genres.`);
}

const MEDIA_BY_ID_QUERY = `
  query Media($id: Int) {
    Media(id: $id, type: ANIME) {
      ${MEDIA_FIELDS}
      ${RELATION_FIELDS}
    }
  }
`;

function mediaIdKey(id: number): string {
    return `${CACHE_PREFIX}.media.${id}`;
}

/** Publish a full record to the per-id cache so later lookups (details, batch fetches)
    hit local storage instead of the network. Only call with MEDIA_FIELDS+RELATION_FIELDS
    payloads - relation-less media (e.g. calendar) is deliberately NOT written here, so it
    can't shadow a richer record and hide franchise info in the detail popup. */
function saveMedia(media: AniListMedia): void {
    void writeCache(mediaIdKey(media.id), media);
}

/** True when a cached per-id media record carries franchise relations. Older cache
    generations wrote relation-less watchlist payloads into the per-id store; those
    can't power the detail popup correctly, so they're treated as misses. */
function mediaHasRelations(m: unknown): boolean {
    return (m as AniListMedia)?.relations?.edges !== undefined;
}

/** Full cached record for a single anime (used to open details for recommended titles).
    A stored value missing `relations` is stale (written by an older fetch path) and is
    refetched, so bad cached watchlist data can't shadow an up-to-date rich record. */
export async function loadMediaById(id: number): Promise<AniListMedia> {
    return readThrough<AniListMedia>(mediaIdKey(id), CACHE_TTL_MS, async () => {
        const data = await gql<{ Media: AniListMedia | null }>(MEDIA_BY_ID_QUERY, { id });
        if (!data.Media) throw new Error('Media not found');
        return data.Media;
    }, mediaHasRelations);
}

/** Drop every cached per-id media record that lacks `relations` (stale relation-less
    payloads written by earlier fetch paths). Self-heals the cache for existing users
    so the popup upgrade effect can never feed on bad watchlist data. Safe to call any
    time; memory and IndexedDB misses simply resolve on the next fetch. */
export async function purgeStaleMediaCache(): Promise<void> {
    const prefix = `${CACHE_PREFIX}.media.`;

    const staleMem: string[] = [];
    for (const [key, entry] of memCache) {
        if (!key.startsWith(prefix)) continue;
        if (!mediaHasRelations((entry as SeasonCacheEntry).page)) staleMem.push(key);
    }
    for (const key of staleMem) memCache.delete(key);

    try {
        const keys = await idbKeys(prefix);
        if (keys.length === 0) return;
        const found = await idbGetMany(keys);
        const stale: string[] = [];
        for (const [key, value] of found) {
            if (!mediaHasRelations((value as SeasonCacheEntry)?.page)) stale.push(key);
        }
        if (stale.length > 0) await idbDeleteMany(stale);
    } catch {
        // IndexedDB unavailable - memory purge above still covers the session.
    }
}

/** Fetch many media in as few requests as possible. Already-cached ids are served from
    local storage; the remainder is pulled with one `id_in` query per 50, and every full
    record is published to the per-id cache. Returns items in the input order.
    `ids.length > 0` is required. */
export async function loadMediaByIds(ids: number[]): Promise<AniListMedia[]> {
    if (ids.length === 0) return [];

    const unique = [...new Set(ids)];
    const found = new Map<number, AniListMedia>();
    const missing: number[] = [];

    const cachedById = await readCacheBatch(unique.map((id) => mediaIdKey(id)));
    for (const id of unique) {
        const cached = cachedById.get(mediaIdKey(id));
        if (cached) found.set(id, cached as AniListMedia);
        else missing.push(id);
    }

    if (missing.length > 0) {
        const query = `
          query MediaBatch($ids: [Int], $page: Int) {
            Page(page: $page, perPage: 50) {
              pageInfo { hasNextPage currentPage }
              media(id_in: $ids, type: ANIME) {
                ${MEDIA_FIELDS}
                ${RELATION_FIELDS}
              }
            }
          }
        `;
        for (let i = 0; i < missing.length; i += 50) {
            const chunk = missing.slice(i, i + 50);
            const chunkKey = `batch|${[...chunk].sort((a, b) => a - b).join(',')}`;
            const inFlight = pending.get(chunkKey);
            if (inFlight) {
                for (const m of (await inFlight) as AniListMedia[]) {
                    found.set(m.id, m);
                }
                continue;
            }
            const p = (async () => {
                const collected: AniListMedia[] = [];
                let page = 1;
                let hasNextPage = true;
                while (hasNextPage && page <= 20) {
                    const data = await gql<{ Page: AniListSeasonPage }>(query, { ids: chunk, page });
                    for (const m of data.Page.media) {
                        if (!found.has(m.id)) found.set(m.id, m);
                        saveMedia(m);
                        collected.push(m);
                    }
                    hasNextPage = data.Page.pageInfo.hasNextPage;
                    if (data.Page.media.length === 0) break;
                    page++;
                }
                return collected;
            })().finally(() => pending.delete(chunkKey));
            pending.set(chunkKey, p);
            await p;
        }
    }

    return unique.map((id) => found.get(id)).filter((m): m is AniListMedia => m !== undefined);
}

/** Cached seasonal fetch (page 1, top-50 by popularity). Deeper pages are fetched on demand
    via `loadSeasonPage` as the visitor scrolls. */
export async function loadSeason(season: AniListSeason, seasonYear: number): Promise<AniListSeasonPage> {
    const key = seasonCacheKey(season, seasonYear);
    return readThrough(key, CACHE_TTL_MS, () => fetchSeason(season, seasonYear));
}

/** Cached fetch of a specific season page (page 1 delegates to `loadSeason` so the main
    key stays the single source for the first screen). */
export async function loadSeasonPage(
    season: AniListSeason,
    seasonYear: number,
    page: number,
): Promise<AniListSeasonPage> {
    if (page <= 1) return loadSeason(season, seasonYear);
    const key = `${seasonCacheKey(season, seasonYear)}.p${page}`;
    return readThrough(key, CACHE_TTL_MS, () => fetchSeason(season, seasonYear, page));
}

/** Un-cached direct fetch of watched-list details (used by the clean-refresh merge path). */
export async function fetchWatchedMediaRaw(ids: number[]): Promise<AniListMedia[]> {
    if (ids.length === 0) return [];

    const all: AniListMedia[] = [];
    const seen = new Set<number>();
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage && page <= 20) {
        const data = await gql<{ Page: AniListSeasonPage }>(WATCHED_QUERY, { ids, page });
        for (const m of data.Page.media) {
            if (!seen.has(m.id)) {
                seen.add(m.id);
                all.push(m);
            }
        }
        hasNextPage = data.Page.pageInfo.hasNextPage;
        if (data.Page.media.length === 0) break;
        page++;
    }

    return all;
}

/** Cached fetch of watched-list details (keyed by the exact ID set, so picks bust the cache).
    Per-id cache entries make small list changes cheap: only the IDs not stored locally are
    fetched, then the whole set is persisted under the set key for fast full reloads. */
export async function loadWatchedMedia(ids: number[]): Promise<AniListMedia[]> {
    if (ids.length === 0) return [];

    const key = watchedCacheKey(ids);
    const hit = (await readCache(key, CACHE_TTL_MS)) as
        | { pageInfo: AniListPageInfo; media: AniListMedia[] }
        | null;
    if (hit) return hit.media;

    const inFlight = pending.get(key);
    if (inFlight) return (await inFlight) as AniListMedia[];

    const p = (async () => {
        const cachedById = await readCacheBatch(ids.map((id) => mediaIdKey(id)));
        const missing = ids.filter((id) => !cachedById.has(mediaIdKey(id)));
        const fetched = missing.length > 0 ? await fetchWatchedMediaRaw(missing) : [];
        const byId = new Map<number, AniListMedia>();
        for (const [cacheKey, value] of cachedById) {
            const id = Number(cacheKey.slice(cacheKey.lastIndexOf('.') + 1));
            if (!Number.isNaN(id)) byId.set(id, value as AniListMedia);
        }
        for (const m of fetched) byId.set(m.id, m);
        const list = ids.map((id) => byId.get(id)).filter((m): m is AniListMedia => m !== undefined);
        await writeCache(key, { pageInfo: { hasNextPage: false, currentPage: 1 }, media: list });
        return list;
    })().finally(() => pending.delete(key));
    pending.set(key, p);
    return p;
}

export async function loadMediaByGenres(genres: string[], page = 1): Promise<AniListSeasonPage> {
    if (genres.length === 0) return { pageInfo: { hasNextPage: false, currentPage: 1 }, media: [] };
    const key = `${CACHE_PREFIX}.genres.${page}.${[...genres].sort().join(',')}`;
    return readThrough(key, CACHE_TTL_MS, async () => {
        const data = await gql<{ Page: AniListSeasonPage }>(GENRE_QUERY, { genres, page });
        for (const m of data.Page.media) saveMedia(m);
        return data.Page;
    });
}

/** Persist a merged watched list under the given id-set key (clean-refresh merge path). */
export function saveWatchedMediaCache(ids: number[], list: AniListMedia[]): void {
    if (ids.length === 0) return;
    const key = watchedCacheKey(ids);
    void writeCache(key, { pageInfo: { hasNextPage: false, currentPage: 1 }, media: list });
}

export function clearWatchedCache(ids: number[]): void {
    if (ids.length === 0) return;
    const key = watchedCacheKey(ids);
    memCache.delete(key);
    // Drop the per-id entries too, so a forced refresh actually re-fetches from AniList.
    for (const id of ids) memCache.delete(mediaIdKey(id));
    void clearCachePrefix(`${CACHE_PREFIX}.watched.`);
    void clearCachePrefix(`${CACHE_PREFIX}.media.`);
}

function watchedCacheKey(ids: number[]): string {
    return `${CACHE_PREFIX}.watched.${[...ids].sort((a, b) => a - b).join(',')}`;
}

/**
 * Calendar window: ~6 months of history so back-navigation into past weeks/months
 * still has aired episodes, plus ~2 months ahead for upcoming airings.
 */
export const CALENDAR_BACK_MS = 62 * 24 * 60 * 60 * 1000;
export const CALENDAR_AHEAD_MS = 64 * 24 * 60 * 60 * 1000;

/**
 * The daily calendar payload is re-fetched at most once per day (key rotates by
 * date); the aired-history portion is immutable, so cache it for the whole day.
 */
export const CALENDAR_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Un-cached direct fetch of scheduled episodes for IDs within [from, to] seconds.
    Paginates through airingSchedules (page cap 50). Single-ID calls used by the
    clean-refresh merge path are typically 1–2 pages. */
export async function fetchAiringSchedulesRaw(
    ids: number[],
    from: number,
    to: number,
): Promise<AniListAiringSchedule[]> {
    if (ids.length === 0 || to <= from) return [];

    const schedules: AniListAiringSchedule[] = [];
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage && page <= 20) {
        const data = await gql<{ Page: { pageInfo: AniListPageInfo; airingSchedules: AniListAiringSchedule[] } }>(
            CALENDAR_QUERY,
            { ids, from, to, page },
        );
        schedules.push(...data.Page.airingSchedules);
        hasNextPage = data.Page.pageInfo.hasNextPage;
        if (data.Page.airingSchedules.length === 0) break;
        page++;
    }

    return schedules;
}

/**
 * Fetch every scheduled episode (aired and upcoming) for watched IDs within [from, to] seconds.
 * Caches per-watchlist/day.
 */
export async function loadAiringCalendar(
    ids: number[],
    from: number,
    to: number,
): Promise<AniListAiringSchedule[]> {
    const key = calendarCacheKey(ids, from);
    return readThrough(key, CALENDAR_CACHE_TTL_MS, () => fetchAiringSchedulesRaw(ids, from, to));
}

/** Persist a merged schedules list under the given id-set/day key (clean-refresh merge path). */
export function saveAiringCalendarCache(ids: number[], from: number, schedules: AniListAiringSchedule[]): void {
    if (ids.length === 0) return;
    void writeCache(calendarCacheKey(ids, from), schedules);
}

export function clearCalendarCache(ids: number[], from: number): void {
    if (ids.length === 0) return;
    const key = calendarCacheKey(ids, from);
    memCache.delete(key);
    void clearCachePrefix(`${CACHE_PREFIX}.calendar.`);
}

function calendarCacheKey(ids: number[], from: number): string {
    const dayKey = new Date(from * 1000).toISOString().slice(0, 10);
    return `${CACHE_PREFIX}.calendar.${[...ids].sort((a, b) => a - b).join(',')}.${dayKey}`;
}

export function statusLabel(status: string | null): { text: string; className: string } {
    switch (status) {
        case 'RELEASING':
            return { text: 'Airing', className: 'b-air' };
        case 'NOT_YET_RELEASED':
            return { text: 'Upcoming', className: 'b-new' };
        case 'FINISHED':
            return { text: 'Finished', className: 'b-done' };
        case 'CANCELLED':
            return { text: 'Cancelled', className: 'b-hold' };
        case 'HIATUS':
            return { text: 'Hiatus', className: 'b-hold' };
        default:
            return { text: status ?? 'Unknown', className: 'b-unknown' };
    }
}

export function formatLabel(format: string | null): string {
    switch (format) {
        case 'TV':
            return 'TV';
        case 'TV_SHORT':
            return 'TV Short';
        case 'MOVIE':
            return 'Movie';
        case 'OVA':
            return 'OVA';
        case 'ONA':
            return 'ONA';
        case 'SPECIAL':
            return 'Special';
        case 'MUSIC':
            return 'Music';
        default:
            return format ?? '-';
    }
}

export function sourceLabel(source: string | null): string {
    switch (source) {
        case 'ORIGINAL':
            return 'Original';
        case 'MANGA':
            return 'Manga';
        case 'LIGHT_NOVEL':
            return 'Light Novel';
        case 'NOVEL':
            return 'Novel';
        case 'ONE_SHOT':
            return 'One-shot';
        case 'GAME':
            return 'Game';
        case 'VISUAL_NOVEL':
            return 'Visual Novel';
        case 'WEB_MANGA':
            return 'Web Manga';
        case 'OTHER':
            return 'Other';
        default:
            return source ?? '-';
    }
}

export function studioNames(media: AniListMedia): string {
    return media.studios.nodes.map((s) => s.name).join(', ') || 'Unknown';
}

/**
 * Franchise continuity info. AniList relationType is from the node's perspective:
 * a media with an ANIME PREQUEL relation is a later season of a franchise (a sequel).
 * Only those count as "continuing" - first seasons never do - and only when the
 * prequel title is actually in the user's watch list.
 */
export function relationSummary(
    media: AniListMedia,
    watchedIds: ReadonlySet<number> = new Set(),
): { isContinuation: boolean; label: string | null; targetId: number | null } {
    const edges = media.relations?.edges ?? [];
    const prequel = edges.find((e) => e.relationType === 'PREQUEL' && e.node.type === 'ANIME');
    if (prequel && watchedIds.has(prequel.node.id)) {
        const name = prequel.node.title.english ?? prequel.node.title.romaji;
        return { isContinuation: true, label: `Sequel to ${name}`, targetId: prequel.node.id };
    }
    return { isContinuation: false, label: null, targetId: null };
}

export function dateLabel(date: AniListMedia['startDate'] | AniListMedia['endDate']): string {
    if (!date?.year) return '-';
    const m = date.month ?? 1;
    const d = date.day ?? 1;
    return new Date(date.year, m - 1, d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatAiring(media: AniListMedia): { text: string; at: string | null } {
    const next = media.nextAiringEpisode;
    if (!next) return { text: '', at: null };
    const secs = Math.max(next.timeUntilAiring, 0);
    const days = Math.floor(secs / 86400);
    const hours = Math.floor((secs % 86400) / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const text =
        days > 0
            ? `Ep ${next.episode} in ${days}d ${hours}h`
            : hours > 0
              ? `Ep ${next.episode} in ${hours}h ${minutes}m`
              : `Ep ${next.episode} in ${minutes}m`;
    const at = new Date(next.airingAt * 1000).toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
    return { text, at };
}

export function mainTitle(media: AniListMedia): string {
    return media.title.romaji ?? media.title.native ?? `Anime #${media.id}`;
}