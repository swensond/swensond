export type Screenshot = {
    src: string;
    width: number;
    height: number;
    caption?: string;
};

export type Project = {
    name: string;
    tagline: string;
    /** Rendered as an "In progress" chip and nothing else. */
    wip?: boolean;
    /** Panel background behind the screenshots. Defaults to near-black. */
    backdrop?: string;
    /** Fill the panel with one screenshot instead of the zoomed crop of its top-left. */
    cover?: boolean;
    images: Screenshot[];
    description: string;
    highlights: string[];
    stack: string[];
};

/** A project with every derivation the templates need already made. */
export type ProjectView = Project & {
    /** Zero-padded position, "01". */
    index: string;
    /** Filesystem-friendly handle derived from the first screenshot, "loa-planner". */
    slug: string;
    /** True when there is more than one screenshot. */
    multi: boolean;
};

/** Drops the directory, the numeric suffix, and the extension: "my-gym-3.webp" -> "my-gym". */
export function slugOf(src: string): string {
    return (
        src
            .split('/')
            .pop()
            ?.replace(/(-\d+)?\.\w+$/, '') ?? ''
    );
}

const CATALOG: Project[] = [
    {
        name: 'Lost Ark Planner',
        tagline: 'Character progression and gold planner for Lost Ark',
        images: [
            {
                src: '/projects/loa-planner.webp',
                width: 3432,
                height: 2170,
                caption: 'Materials view for one character, with the best pick for each drop and required, owned, and missing counts priced at market'
            }
        ],
        description:
            'Plans progression across a full roster of characters. It calculates honing and material costs, tracks owned materials and weekly gold income, and projects whether the roster will have enough gold by a target date.',
        highlights: [
            'Roster management with per-character honing, karma, engraving, and accessory planning',
            'Gold projection chart comparing logged balance history with the gold required by a target date',
            'Automatic gold log covering every purchase, deposit, and raid clear',
            'Saved plans persisted locally in the browser'
        ],
        stack: ['SvelteKit', 'Svelte 5', 'TypeScript', 'Tailwind CSS', 'Vite']
    },
    {
        name: 'Anime Watchlist',
        tagline: 'Anime tracking and discovery built on the AniList API',
        images: [
            {
                src: '/projects/anime.webp',
                width: 3432,
                height: 1914,
                caption: 'Show detail page with progress, rating, and rewatch tracking, the trailer, sequels, and similar recommendations'
            }
        ],
        description:
            'A watchlist manager backed by the AniList GraphQL API. It browses current and past seasons, recommends shows by genre, tracks progress and rewatches, and builds shared watch-party lists. A Cloudflare Worker backed by Workers KV keeps everything in sync across browsers.',
        highlights: [
            'AniList responses cached in IndexedDB for six hours, so repeat visits load quickly and survive flaky connections',
            'Season browser, genre-based recommendations, backlog, and rewatch tracking',
            'Cross-browser sync through a Cloudflare Worker with Workers KV storage, so the watchlist follows you between devices',
            'Shareable list URLs and exportable image infographics'
        ],
        stack: ['SvelteKit', 'Svelte 5', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'IndexedDB', 'Cloudflare Workers', 'Workers KV']
    },
    {
        name: 'Mouse Research Intelligence',
        tagline: 'Knowledge graph platform built from mouse genetics literature',
        wip: true,
        backdrop: '#F4F6F8',
        cover: true,
        images: [
            {
                src: '/projects/mouse-research.webp',
                width: 3432,
                height: 1694,
                caption: 'Workspace home with new evidence, a flagged contradiction, and queues for AI quote verification, peer review, and gaps'
            }
        ],
        description:
            "Ingests papers and reference data from PubMed, Europe PMC, MGI, UniProt, ChEMBL, and other biomedical sources, then uses an LLM to extract sourced facts about genes, diseases, and drugs into a MongoDB knowledge graph. Every fact keeps a receipt back to its paper and quote, and every quote is checked against the source text before it's trusted, so researchers can verify AI-read findings rather than take them on faith.",
        highlights: [
            'Ingestion pipeline across more than a dozen public sources, including PubMed, Europe PMC, PubTator, MGI, UniProt, Reactome, and ChEMBL, with raw payloads landed in SQLite before deterministic shaping into MongoDB',
            'LLM-driven fact extraction with quote verification against source text, confidence scoring, and multi-pass re-reads that stop once no new facts are found',
            'Conflicting evidence kept and flagged rather than silently resolved, so contradicting papers stay visible for a human to weigh',
            'Investigation workspaces with a human-in-the-loop verification queue for AI-extracted quotes, gap detection, and entity bookmarking'
        ],
        stack: ['React', 'Vite', 'TypeScript', 'Hono', 'MongoDB', 'SQLite', 'Prisma', 'LLM extraction']
    },
    {
        name: 'My Gym',
        tagline: 'Subscription-free iOS and Android app for home exercise equipment',
        wip: true,
        backdrop: '#1B1114',
        images: [
            { src: '/projects/my-gym-1.webp', width: 1284, height: 2778, caption: "Home dashboard with this week's totals and every paired machine" },
            { src: '/projects/my-gym-2.webp', width: 1284, height: 2778, caption: 'Pairing flow that scans for FTMS machines and heart-rate monitors over Bluetooth or Wi-Fi' },
            {
                src: '/projects/my-gym-3.webp',
                width: 1284,
                height: 2778,
                caption: 'Live session view with heart-rate zone, stride rate, power, resistance, incline, distance, and calories'
            },
            {
                src: '/projects/my-gym-4.webp',
                width: 1284,
                height: 2778,
                caption: 'Post-workout breakdown with an interactive pace and heart-rate chart, zone strip, and per-mile splits'
            },
            { src: '/projects/my-gym-5.webp', width: 1284, height: 2778, caption: 'Weekly, monthly, and yearly activity with session history filtered by machine' }
        ],
        description:
            'Reads live data straight from a home treadmill, bike, elliptical, rower, or heart-rate strap over Bluetooth FTMS or Wi-Fi, records every workout second by second, and keeps it all on the device. No account, no server, and no subscription to see your own numbers.',
        highlights: [
            'Bluetooth FTMS parsing for treadmill, indoor bike, cross trainer, and rower data, plus a heart-rate strap that can join any live session',
            'Live workout screens tailored to each machine type, with 1 Hz sample recording, pause and finish, and auto-pause when movement stops',
            'History with weekly, monthly, and yearly charts, a per-session timeline, and calorie estimates from power or distance',
            'Local-first SQLite storage with CSV export, and Wi-Fi discovery over mDNS for Wahoo DIRCON devices',
            'Phone and tablet layouts from one codebase, designed screen by screen before implementation'
        ],
        stack: ['Expo', 'React Native', 'TypeScript', 'Expo Router', 'SQLite', 'Bluetooth LE', 'React Native SVG', 'Jest']
    },
    {
        name: 'Recipes',
        tagline: 'Recipe collection fed by a companion Chrome extension',
        images: [
            {
                src: '/projects/recipes.webp',
                width: 3432,
                height: 1305,
                caption: 'Collection dashboard with sync status and recently clipped recipes, tagged by source and cook time'
            }
        ],
        description:
            'Clips recipes from any website with a Chrome extension and syncs them into a personal collection through a Cloudflare Worker backed by Workers KV, so the collection is the same in every browser. Recipes can be rated, tagged, and turned into a shopping list.',
        highlights: [
            'Chrome extension that captures recipes from any page',
            'Cloudflare Worker and Workers KV backend that syncs the collection between the extension and any browser, secured by a private collection key',
            'Ratings, tags, favorites, and a generated shopping list'
        ],
        stack: ['SvelteKit', 'TypeScript', 'Tailwind CSS', 'Chrome Extensions', 'Cloudflare Workers', 'Workers KV']
    }
];

/** Add a screenshot to static/projects/ and append an entry above; everything else derives. */
export const projects: ProjectView[] = CATALOG.map((project, position) => ({
    ...project,
    index: String(position + 1).padStart(2, '0'),
    slug: project.images[0] ? slugOf(project.images[0].src) : '',
    multi: project.images.length > 1
}));
