export type AniListSeason = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

export interface AniListTitle {
    romaji: string | null;
    english: string | null;
    native: string | null;
}

export interface AniListCoverImage {
    extraLarge: string | null;
    large: string | null;
    color: string | null;
}

export interface AniListDate {
    year: number | null;
    month: number | null;
    day: number | null;
}

export interface AniListStudio {
    name: string;
}

export interface AniListTrailer {
    id: string | null;
    site: string | null;
    thumbnail: string | null;
}

export interface AniListAiring {
    episode: number;
    airingAt: number;
    timeUntilAiring: number;
}

export interface AniListRelationNode {
    id: number;
    type: string | null;
    format: string | null;
    status: string | null;
    title: AniListTitle;
    coverImage: { large: string | null; color: string | null } | null;
    startDate: AniListDate | null;
    averageScore: number | null;
    popularity: number | null;
    nextAiringEpisode: { episode: number; airingAt: number } | null;
}

export interface AniListRelationEdge {
    relationType: string | null;
    node: AniListRelationNode;
}

export interface AniListMedia {
    id: number;
    idMal: number | null;
    title: AniListTitle;
    coverImage: AniListCoverImage;
    bannerImage: string | null;
    description: string | null;
    /** Client-side DOMPurify-sanitized version of `description` (see $lib/utils/html.ts). */
    descriptionHtml?: string;
    format: string | null;
    episodes: number | null;
    duration: number | null;
    status: string | null;
    averageScore: number | null;
    popularity: number | null;
    genres: string[];
    studios: { nodes: AniListStudio[] };
    startDate: AniListDate;
    endDate: AniListDate | null;
    nextAiringEpisode: AniListAiring | null;
    trailer: AniListTrailer | null;
    source: string | null;
    isAdult: boolean;
    /** Related titles (franchise season/sequel info). Not loaded on every media payload. */
    relations?: { edges: AniListRelationEdge[] | null };
}

export interface AniListPageInfo {
    hasNextPage: boolean;
    currentPage: number;
}

export interface AniListSeasonPage {
    pageInfo: AniListPageInfo;
    media: AniListMedia[];
}

/** A single scheduled future episode (from the airingSchedules query). */
export interface AniListAiringSchedule {
    id: number;
    episode: number;
    airingAt: number;
    media: AniListMedia;
}