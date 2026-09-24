<script lang="ts">
  // Add screenshots to static/projects/ and list them here; caption is optional.
  type Screenshot = { src: string; width: number; height: number; caption?: string };
  type Project = {
    name: string;
    tagline: string;
    images: Screenshot[];
    description: string;
    highlights: string[];
    stack: string[];
  };

  const projects: Project[] = [
    {
      name: "Lost Ark Planner",
      tagline: "Character progression and gold planner for Lost Ark",
      images: [{ src: "/projects/loa-planner.webp", width: 3432, height: 2170 }],
      description:
        "Plans progression across a full roster of characters. It calculates honing and material costs, tracks owned materials and weekly gold income, and projects whether the roster will have enough gold by a target date.",
      highlights: [
        "Roster management with per-character honing, karma, engraving, and accessory planning",
        "Gold projection chart comparing logged balance history with the gold required by a target date",
        "Automatic gold log covering every purchase, deposit, and raid clear",
        "Saved plans persisted locally in the browser",
      ],
      stack: ["SvelteKit", "Svelte 5", "TypeScript", "Tailwind CSS", "Vite"],
    },
    {
      name: "Anime Watchlist",
      tagline: "Anime tracking and discovery built on the AniList API",
      images: [{ src: "/projects/anime.webp", width: 3432, height: 1914 }],
      description:
        "A watchlist manager backed by the AniList GraphQL API. It browses current and past seasons, recommends shows by genre, tracks progress and rewatches, and builds shared watch-party lists. A Cloudflare Worker backed by Workers KV keeps everything in sync across browsers.",
      highlights: [
        "AniList responses cached in IndexedDB for six hours, so repeat visits load quickly and survive flaky connections",
        "Season browser, genre-based recommendations, backlog, and rewatch tracking",
        "Cross-browser sync through a Cloudflare Worker with Workers KV storage, so the watchlist follows you between devices",
        "Shareable list URLs and exportable image infographics",
      ],
      stack: ["SvelteKit", "Svelte 5", "TypeScript", "Tailwind CSS", "GraphQL", "IndexedDB", "Cloudflare Workers", "Workers KV"],
    },
    {
      name: "Mouse Research Intelligence",
      tagline: "Knowledge graph platform built from mouse genetics literature (work in progress)",
      images: [{ src: "/projects/mouse-research.webp", width: 3432, height: 1694 }],
      description:
        "Ingests papers from PubMed, Europe PMC, MGI, UniProt, ChEMBL, and other biomedical sources, then uses an LLM to extract sourced facts about genes, diseases, and drugs into a MongoDB knowledge graph. Every fact keeps a receipt back to its paper and quote, and every quote is checked against the source text before it's trusted, so researchers can verify AI-read findings rather than take them on faith.",
      highlights: [
        "Ingestion pipeline across ten public sources (PubMed, Europe PMC, PubTator, MGI, UniProt, Gene Ontology, Reactome, ChEMBL, Disease Ontology) with raw payloads landed in SQLite before deterministic shaping into MongoDB",
        "LLM-driven fact extraction with quote verification against source text, confidence scoring, and multi-pass re-reads that stop once no new facts are found",
        "Conflicting evidence is kept and flagged rather than silently resolved, so contradicting papers stay visible for a human to weigh",
        "Investigation workspaces with a human-in-the-loop verification queue for AI-extracted quotes, gap detection, and entity bookmarking",
      ],
      stack: ["React", "Vite", "TypeScript", "Hono", "MongoDB", "SQLite", "Prisma", "LLM extraction"],
    },
    {
name: "My Gym",
tagline: "Subscription-free iOS and Android app for home exercise equipment (work in progress)",
      images: [
        { src: "/projects/my-gym-1.webp", width: 1284, height: 2778, caption: "Home dashboard with this week's totals and every paired machine" },
        { src: "/projects/my-gym-2.webp", width: 1284, height: 2778, caption: "Pairing flow that scans for FTMS machines and heart-rate monitors over Bluetooth or Wi-Fi" },
        { src: "/projects/my-gym-3.webp", width: 1284, height: 2778, caption: "Live session view with heart-rate zone, stride rate, power, resistance, incline, distance, and calories" },
        { src: "/projects/my-gym-4.webp", width: 1284, height: 2778, caption: "Post-workout breakdown with an interactive pace and heart-rate chart, zone strip, and per-mile splits" },
        { src: "/projects/my-gym-5.webp", width: 1284, height: 2778, caption: "Weekly, monthly, and yearly activity with session history filtered by machine" },
      ],
      description:
"Reads live data straight from a home treadmill, bike, elliptical, rower, or heart-rate strap over Bluetooth FTMS or Wi-Fi, records every workout second by second, and keeps it all on the device. No account, no server, and no subscription to see your own numbers.",
      highlights: [
"Bluetooth FTMS parsing for treadmill, indoor bike, cross trainer, and rower data, plus a heart-rate strap that can join any live session",
"Live workout screens tailored to each machine type, with 1 Hz sample recording, pause and finish, and auto-pause when movement stops",
"History with weekly, monthly, and yearly charts, a per-session timeline, and calorie estimates from power or distance",
"Local-first SQLite storage with CSV export, and Wi-Fi discovery over mDNS for Wahoo DIRCON devices",
"Phone and tablet layouts from one codebase, designed screen by screen before implementation",
      ],
stack: ["Expo", "React Native", "TypeScript", "Expo Router", "SQLite", "Bluetooth LE", "React Native SVG", "Jest"],
    },
    {
      name: "Recipes",
      tagline: "Recipe collection fed by a companion Chrome extension",
      images: [{ src: "/projects/recipes.webp", width: 3432, height: 1305 }],
      description:
        "Clips recipes from any website with a Chrome extension and syncs them into a personal collection through a Cloudflare Worker backed by Workers KV, so the collection is the same in every browser. Recipes can be rated, tagged, and turned into a shopping list.",
      highlights: [
        "Chrome extension that captures recipes from any page",
        "Cloudflare Worker and Workers KV backend that syncs the collection between the extension and any browser, secured by a private collection key",
        "Ratings, tags, favorites, and a generated shopping list",
      ],
      stack: ["SvelteKit", "TypeScript", "Tailwind CSS", "Chrome Extensions", "Cloudflare Workers", "Workers KV"],
    },
  ];

  const description =
    "Personal projects by David Swenson: a Lost Ark progression planner, an anime watchlist, a mouse genetics knowledge graph, a home gym app, and a recipe collection with a Chrome extension.";

  // One native <dialog> serves as the lightbox for every screenshot.
  let lightbox: HTMLDialogElement;
  let active = $state<{ project: Project; index: number } | null>(null);
  const shot = $derived(active && active.project.images[active.index]);

  function openScreenshot(project: Project, index: number) {
    active = { project, index };
    lightbox.showModal();
  }

  function step(delta: number) {
    if (!active) return;
    const n = active.project.images.length;
    active.index = (active.index + delta + n) % n;
  }
</script>

<svelte:head>
  <title>Projects | David Swenson</title>
  <meta name="description" content={description} />
  <meta property="og:title" content="Projects | David Swenson" />
  <meta property="og:description" content={description} />
</svelte:head>

<header>
  <h1 class="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Projects</h1>
  <p class="mt-4 text-lg leading-relaxed text-ink-soft">
    Personal projects I design, build, and use every day. I built them with AI pair-programming
    tools, and I owned the product decisions, architecture, data modeling, and code review.
  </p>
</header>

<div class="mt-16 space-y-20">
  {#each projects as project}
    <article>
      <h2 class="font-serif text-2xl font-semibold">{project.name}</h2>
      <p class="mt-1 text-muted">{project.tagline}</p>

      <!-- One screenshot spans the column; several become a fixed-height strip that scrolls sideways. -->
      {#if project.images.length}
        {@const many = project.images.length > 1}
        <div class={many ? "mt-6 flex snap-x gap-3 overflow-x-auto pb-2" : "mt-6"}>
          {#each project.images as image, i}
            <button
              type="button"
              class={many ? "shrink-0 cursor-zoom-in snap-start rounded-md" : "block w-full cursor-zoom-in rounded-md"}
              aria-label="View larger screenshot {i + 1} of {project.name}"
              onclick={() => openScreenshot(project, i)}
            >
              <img
                src={image.src}
                width={image.width}
                height={image.height}
                alt={image.caption ?? `Screenshot of ${project.name}`}
                loading="lazy"
                class={many ? "h-64 w-auto rounded-md border border-line" : "h-auto w-full rounded-md border border-line"}
              />
            </button>
          {/each}
        </div>
      {/if}

      <p class="mt-6 text-ink-soft">{project.description}</p>

      <ul class="mt-3 list-disc space-y-1.5 pl-5 text-ink-soft marker:text-muted">
        {#each project.highlights as highlight}
          <li>{highlight}</li>
        {/each}
      </ul>

      <p class="mt-4 text-[0.95rem] text-muted">Built with {project.stack.join(", ")}</p>
    </article>
  {/each}
</div>

<!-- Clicking the image, backdrop, or Close dismisses; Escape works natively; arrow keys and
     Previous/Next page through a project's screenshots. -->
<dialog
  bind:this={lightbox}
  class="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-black/80"
  aria-label={active ? `${active.project.name} screenshots` : undefined}
  onclick={() => lightbox.close()}
  onkeydown={(e) => {
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  }}
  onclose={() => (active = null)}
>
  {#if active && shot}
    {@const many = active.project.images.length > 1}
    <figure class="flex flex-col items-center gap-3 p-4">
      <img
        src={shot.src}
        width={shot.width}
        height={shot.height}
        alt={shot.caption ?? `Screenshot of ${active.project.name}`}
        class="h-auto max-h-[85vh] w-auto max-w-[95vw] cursor-zoom-out rounded-md"
      />
      <figcaption class="flex items-baseline gap-4 text-[0.95rem] text-white/80">
        {#if many}
          <button type="button" class="text-white underline underline-offset-4" onclick={(e) => { e.stopPropagation(); step(-1); }}>Previous</button>
        {/if}
        <span>
          {shot.caption ?? active.project.name}
          {#if many}<span class="text-white/60">({active.index + 1} of {active.project.images.length})</span>{/if}
        </span>
        {#if many}
          <button type="button" class="text-white underline underline-offset-4" onclick={(e) => { e.stopPropagation(); step(1); }}>Next</button>
        {/if}
        <button type="button" class="text-white underline underline-offset-4">Close</button>
      </figcaption>
    </figure>
  {/if}
</dialog>
