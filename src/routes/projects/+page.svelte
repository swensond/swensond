<script lang="ts">
  const projects = [
    {
      name: "Lost Ark Planner",
      tagline: "Character progression and gold planner for Lost Ark",
      image: { src: "/projects/loa-planner.webp", width: 3432, height: 2170 },
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
      image: { src: "/projects/anime.webp", width: 3432, height: 1914 },
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
      name: "Recipes",
      tagline: "Recipe collection fed by a companion Chrome extension",
      image: { src: "/projects/recipes.webp", width: 3432, height: 1305 },
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
    "Personal projects by David Swenson: a Lost Ark progression planner, an anime watchlist, and a recipe collection with a Chrome extension.";

  // One native <dialog> serves as the lightbox for every screenshot.
  let lightbox: HTMLDialogElement;
  let active = $state<(typeof projects)[number] | null>(null);

  function openScreenshot(project: (typeof projects)[number]) {
    active = project;
    lightbox.showModal();
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

      <button
        type="button"
        class="mt-6 block w-full cursor-zoom-in rounded-md"
        aria-label="View larger screenshot of {project.name}"
        onclick={() => openScreenshot(project)}
      >
        <img
          src={project.image.src}
          width={project.image.width}
          height={project.image.height}
          alt="Screenshot of {project.name}"
          loading="lazy"
          class="h-auto w-full rounded-md border border-line"
        />
      </button>

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

<!-- Clicking anywhere (image, backdrop, or Close) dismisses; Escape works natively. -->
<dialog
  bind:this={lightbox}
  class="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-black/80"
  aria-label={active ? `${active.name} screenshot` : undefined}
  onclick={() => lightbox.close()}
>
  {#if active}
    <figure class="flex flex-col items-center gap-3 p-4">
      <img
        src={active.image.src}
        width={active.image.width}
        height={active.image.height}
        alt="Screenshot of {active.name}"
        class="h-auto max-h-[85vh] w-auto max-w-[95vw] cursor-zoom-out rounded-md"
      />
      <figcaption class="flex items-baseline gap-4 text-[0.95rem] text-white/80">
        {active.name}
        <button type="button" class="text-white underline underline-offset-4">Close</button>
      </figcaption>
    </figure>
  {/if}
</dialog>
