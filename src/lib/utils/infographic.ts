import type { AniListMedia, AniListSeason } from '$lib/types/anime';
import type { ProgressMap } from '$lib/stores/watchlist';

/* ------------------------------------------------------
   Pure, framework-free computation of the season
   infographic card: totals, genre share, and the list
   bucketed by broadcast season.
   ----------------------------------------------------- */

export interface InfographicStats {
    listSize: number;
    episodesWatched: number;
    completed: number;
    avgScore: number | null;
    avgScoreCount: number;
    genres: GenreShare[];
    seasons: SeasonBucket[];
}

export interface GenreShare {
    genre: string;
    share: number;
}

export interface SeasonBucket {
    season: string | null;
    label: string;
    count: number;
    seen: number;
}

const SEASON_NAMES: Record<AniListSeason, string> = {
    WINTER: 'Winter',
    SPRING: 'Spring',
    SUMMER: 'Summer',
    FALL: 'Fall',
};

/** Total episodes for a series (from the listing, the next airing episode, or unknown). */
export function totalEpisodes(m: AniListMedia): number {
    return m.episodes ?? m.nextAiringEpisode?.episode ?? Number.POSITIVE_INFINITY;
}

function seasonOfMonth(month: number | null): AniListSeason | null {
    if (!month) return null;
    if (month <= 3) return 'WINTER';
    if (month <= 6) return 'SPRING';
    if (month <= 9) return 'SUMMER';
    return 'FALL';
}

/** Share of each genre across the list (0-100 relative to the most common genre). */
export function computeGenreShare(media: AniListMedia[], p: ProgressMap, top = 5): GenreShare[] {
    const counts = new Map<string, number>();
    for (const m of media) {
        if ((p[m.id] ?? 0) === 0) continue;
        for (const g of m.genres) {
            counts.set(g, (counts.get(g) ?? 0) + 1);
        }
    }
    const max = [...counts.values()].reduce((a, b) => Math.max(a, b), 1);
    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, top)
        .map(([genre, count]) => ({ genre, share: Math.round((count / max) * 100) }));
}

/** List grouped by broadcast season (newest first), with watcher progress summed. */
export function computeSeasonBuckets(media: AniListMedia[], p: ProgressMap, maxSeasons = 12): SeasonBucket[] {
    const groups = new Map<string, SeasonBucket>();
    const orderKeys: string[] = [];
    const SEASONS: AniListSeason[] = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
    for (const m of media) {
        const seasonOf = seasonOfMonth(m.startDate?.month ?? null);
        const year = m.startDate?.year ?? null;
        const key = seasonOf && year ? `${year}|${seasonOf}` : 'unknown';
        if (!orderKeys.includes(key)) orderKeys.push(key);
        const bucket = groups.get(key) ?? { season: seasonOf, label: '', count: 0, seen: 0 };
        bucket.count += 1;
        bucket.seen += Math.min(p[m.id] ?? 0, totalEpisodes(m));
        groups.set(key, bucket);
    }
    const numeric = (key: string) => {
        if (key === 'unknown') return Number.NEGATIVE_INFINITY;
        const [year, s] = key.split('|');
        const seasonIdx = SEASONS.indexOf(s as AniListSeason);
        return Number(year) * 4 + seasonIdx;
    };
    const seasonLabel = (s: AniListSeason | null, year: number | null) =>
        s && year ? `${SEASON_NAMES[s]} ${year}` : 'Unknown season';
    return orderKeys
        .sort((a, b) => numeric(b) - numeric(a))
        .slice(0, maxSeasons)
        .map((key) => {
            const b = groups.get(key) as SeasonBucket;
            const [year, s] = key.split('|');
            return {
                ...b,
                season: s as AniListSeason | null,
                label: seasonLabel(s as AniListSeason | null, Number(year)),
            };
        });
}

export function computeInfographic(media: AniListMedia[], p: ProgressMap): InfographicStats {
    let episodesWatched = 0;
    let completed = 0;
    let scoreSum = 0;
    let scoreCount = 0;
    for (const m of media) {
        const seen = Math.min(p[m.id] ?? 0, totalEpisodes(m));
        episodesWatched += seen;
        if (totalEpisodes(m) === seen && seen > 0) completed += 1;
        if (m.averageScore) {
            scoreSum += m.averageScore;
            scoreCount += 1;
        }
    }
    return {
        listSize: media.length,
        episodesWatched,
        completed,
        avgScore: scoreCount > 0 ? Math.round(scoreSum / scoreCount) : null,
        avgScoreCount: scoreCount,
        genres: computeGenreShare(media, p),
        seasons: computeSeasonBuckets(media, p),
    };
}