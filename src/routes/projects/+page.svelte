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
      images: [{ src: "/projects/loa-planner.webp", width: 3432, height: 2170, caption: "Materials view for one character, with the best pick for each drop and required, owned, and missing counts priced at market" }],
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
      images: [{ src: "/projects/anime.webp", width: 3432, height: 1914, caption: "Show detail page with progress, rating, and rewatch tracking, the trailer, sequels, and similar recommendations" }],
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
      images: [{ src: "/projects/mouse-research.webp", width: 3432, height: 1694, caption: "Workspace home with new evidence, a flagged contradiction, and queues for AI quote verification, peer review, and gaps" }],
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
      images: [{ src: "/projects/recipes.webp", width: 3432, height: 1305, caption: "Collection dashboard with sync status and recently clipped recipes, tagged by source and cook time" }],
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
  let swipeStart: number | null = null;

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

<header class="grid gap-6 border-t-[3px] border-ink pt-10 sm:pt-14 lg:grid-cols-12 lg:items-end">
  <h1 class="text-[clamp(3.5rem,13vw,10.75rem)] leading-[0.88] font-bold tracking-[-0.06em] lg:col-span-8">Projects</h1>
  <p class="text-lg leading-normal text-ink-soft lg:col-span-4">
    Personal projects I design, build, and use every day. Built with AI pair-programming tools; the
    product decisions, architecture, data modeling, and code review are mine.
  </p>
</header>

<ol class="mt-20 flex flex-col gap-24 sm:mt-24 sm:gap-30">
  {#each projects as project, n}
    {@const wip = project.tagline.endsWith("(work in progress)")}
    {@const many = project.images.length > 1}
    {@const slug = project.images[0]?.src.split("/").pop()?.replace(/(-\d+)?\.\w+$/, "")}
    <li>
      <article>
        <div class="overflow-hidden rounded-[20px] border border-line bg-surface">
          <div class="flex items-center justify-between border-b border-line px-5 py-3 font-mono text-[0.8125rem] text-muted">
            <span><span class="text-accent">{String(n + 1).padStart(2, "0")}</span> — {slug}</span>
            {#if many}<span>{project.images.length} screens</span>{/if}
          </div>
          <!-- One screenshot fills the panel; several become a strip that scrolls sideways. -->
          <div class={many ? "flex snap-x gap-4 overflow-x-auto px-6 pt-8 sm:justify-between sm:px-12 sm:pt-11" : ""}>
            {#each project.images as image, i}
              <button
                type="button"
                class={many ? "shrink-0 cursor-zoom-in snap-start" : "block w-full cursor-zoom-in"}
                aria-label="View larger screenshot {i + 1} of {project.name}"
                onclick={() => openScreenshot(project, i)}
              >
                <img
                  src={image.src}
                  width={image.width}
                  height={image.height}
                  alt={image.caption ?? `Screenshot of ${project.name}`}
                  loading="lazy"
                  class={many
                    ? "h-80 w-auto rounded-t-[20px] border border-b-0 border-[#3a3935] object-cover object-top sm:h-[31rem]"
                    : "h-auto w-full"}
                />
              </button>
            {/each}
          </div>
        </div>

        <div class="mt-8 grid gap-6 border-t-[3px] border-ink pt-7 lg:grid-cols-12">
          <div class="flex flex-col gap-3 lg:col-span-8">
            <h2 class="text-4xl leading-[0.95] font-bold tracking-[-0.05em] sm:text-6xl">{project.name}</h2>
            <p class="text-xl leading-snug text-accent">{project.tagline.replace(" (work in progress)", "")}</p>
          </div>
          <div class="flex flex-wrap content-start gap-1.5 font-mono text-xs lg:col-span-4">
            {#if wip}<span class="rounded-full bg-accent px-2.5 py-1 text-paper">In progress</span>{/if}
            {#each project.stack as tech}
              <span class="rounded-md border border-line bg-surface px-2 py-1">{tech}</span>
            {/each}
          </div>
          <p class="leading-relaxed text-ink-soft lg:col-span-5 lg:mt-2">{project.description}</p>
          <ul class="grid gap-x-6 gap-y-4 text-[0.9375rem] leading-normal text-ink-soft sm:grid-cols-2 lg:col-span-6 lg:col-start-7 lg:mt-2">
            {#each project.highlights as highlight}
              <li class="border-t border-line pt-2.5">{highlight}</li>
            {/each}
          </ul>
        </div>
      </article>
    </li>
  {/each}
</ol>

<!-- Backdrop clicks and Close dismiss; Escape works natively. Arrow keys, Home/End, the
     Previous/Next buttons, thumbnails, and horizontal swipes page through a project's screenshots. -->
<dialog
  bind:this={lightbox}
  class="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-ink backdrop:bg-[#0f0f0e]/95 backdrop:backdrop-blur-sm"
  aria-label={active ? `${active.project.name} screenshots` : undefined}
  onclick={(e) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.backdrop !== undefined) lightbox.close();
  }}
  onkeydown={(e) => {
    if (!active) return;
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
    if (e.key === "Home") active.index = 0;
    if (e.key === "End") active.index = active.project.images.length - 1;
  }}
  onpointerdown={(e) => (swipeStart = e.pointerType === "mouse" ? null : e.clientX)}
  onpointerup={(e) => {
    if (swipeStart === null) return;
    const dx = e.clientX - swipeStart;
    swipeStart = null;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  }}
  onclose={() => (active = null)}
>
  {#if active && shot}
    {@const many = active.project.images.length > 1}
    {@const num = String(projects.indexOf(active.project) + 1).padStart(2, "0")}
    {@const slug = active.project.images[0].src.split("/").pop()?.replace(/(-\d+)?\.\w+$/, "")}
    <div class="flex h-full flex-col">
      <div class="flex items-center justify-between gap-4 border-b border-line px-4 py-3 font-mono text-[0.8125rem] sm:px-8">
        <span class="truncate text-muted"><span class="text-accent">{num}</span> — {slug}</span>
        <div class="flex items-center gap-4">
          {#if many}
            <span class="text-muted tabular-nums" aria-live="polite">{active.index + 1} / {active.project.images.length}</span>
          {/if}
          <button
            type="button"
            class="flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-line px-3.5 hover:border-accent hover:text-accent"
            onclick={() => lightbox.close()}
          >close <kbd class="text-muted">esc</kbd></button>
        </div>
      </div>

      <figure class="flex min-h-0 flex-1 flex-col">
        <div class="relative flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8" data-backdrop>
          {#if many}
            <button
              type="button"
              aria-label="Previous screenshot"
              class="absolute left-4 z-10 hidden size-11 cursor-pointer items-center justify-center rounded-[10px] border border-line bg-surface font-mono hover:border-accent hover:text-accent sm:flex lg:left-8"
              onclick={() => step(-1)}
            >←</button>
          {/if}
          {#key shot.src}
            <img
              src={shot.src}
              width={shot.width}
              height={shot.height}
              alt={shot.caption ?? `Screenshot of ${active.project.name}`}
              draggable="false"
              class="max-h-full w-auto max-w-full rounded-[14px] border border-line object-contain select-none {many ? 'sm:max-w-[calc(100%-8rem)]' : ''}"
            />
          {/key}
          {#if many}
            <button
              type="button"
              aria-label="Next screenshot"
              class="absolute right-4 z-10 hidden size-11 cursor-pointer items-center justify-center rounded-[10px] border border-line bg-surface font-mono hover:border-accent hover:text-accent sm:flex lg:right-8"
              onclick={() => step(1)}
            >→</button>
          {/if}
        </div>

        <figcaption class="border-t-[3px] border-ink px-4 pt-4 pb-5 sm:px-8">
          <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <span class="text-xl font-bold tracking-[-0.03em]">{active.project.name}</span>
            {#if shot.caption}<span class="text-ink-soft">{shot.caption}</span>{/if}
          </div>
          {#if many}
            <div class="mt-4 flex gap-2 overflow-x-auto">
              {#each active.project.images as image, i}
                <button
                  type="button"
                  aria-label="Show screenshot {i + 1}"
                  aria-current={i === active.index ? "true" : undefined}
                  class="shrink-0 cursor-pointer overflow-hidden rounded-md border-2 {i === active.index ? 'border-accent' : 'border-transparent opacity-50 hover:opacity-100'}"
                  onclick={() => active && (active.index = i)}
                >
                  <img src={image.src} alt="" class="h-14 w-auto object-cover object-top" />
                </button>
              {/each}
            </div>
          {/if}
        </figcaption>
      </figure>
    </div>
  {/if}
</dialog>
