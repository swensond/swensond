<script lang="ts">
  let projects = [
    {
      slug: "anime",
      name: "Anime Watchlist",
      tagline: "A personal anime tracking and discovery tool",
      href: "/anime/",
      description:
        "A full-featured anime watchlist manager built around the AniList GraphQL API. Track what you're watching, browse current and past seasons, get genre-based recommendations, maintain a backlog, and export shareable lists and visual infographics. Ships with a polished dark UI with gold accents and offline-first IndexedDB caching.",
      stack: [
        "SvelteKit",
        "Svelte 5",
        "TypeScript",
        "Tailwind CSS",
        "GraphQL",
        "IndexedDB",
        "Vite",
      ],
      highlights: [
        "Live AniList API integration with 6-hour cached responses persisted to IndexedDB for a fast, offline-tolerant experience",
        "Dynamic season browsing, recommendations, and a persistent watchlist with custom watch statuses and progress tracking",
        "Shareable list URLs and generated visual infographics for easy list summaries",
        "Fully client-side rendered section with responsive grids and a portal-based detail modal",
      ],
      aiAssisted: true,
      aiNote:
        "This project was built with the assistance of AI pair-programming tools. I used AI to scaffold components, iterate rapidly on UI and state management, and refactor across Svelte's runes model. It demonstrates how I blend modern AI-assisted engineering with real product decisions, architecture, and code review.",
    },
  ];
</script>

<svelte:head>
  <title>Projects | David Swenson</title>
  <meta
    name="description"
    content="Selected projects by David Swenson, including the AI-assisted Anime Watchlist app."
  />
</svelte:head>

<div>
  <section class="mb-10">
    <h3 class="font-bold text-2xl">Projects</h3>
    <p class="tracking-tight leading-relaxed mt-4 text-zinc-700">
      Selected work that demonstrates how I build, ship, and iterate —
      including projects developed with AI-assisted workflows to move faster
      and stay on top of modern software engineering.
    </p>
  </section>

  {#each projects as project}
    <section
      class="project-card bg-white border border-zinc-200 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-8"
    >
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h4 class="text-xl font-bold text-zinc-900">{project.name}</h4>
          <p class="text-sm text-zinc-500 mt-1">{project.tagline}</p>
        </div>
        <a
          href={project.href}
          target="_blank"
          class="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-accent text-white text-sm font-semibold hover:bg-zinc-950 hover:text-white transition no-underline"
        >
          Open app
        </a>
      </div>

      <p class="tracking-tight leading-relaxed mt-5 text-zinc-700">
        {project.description}
      </p>

      <!-- AI assistance badge -->
      {#if project.aiAssisted}
        <div
          class="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5"
        >
          <div class="flex items-start gap-3">
            <span
              class="shrink-0 inline-flex items-center px-3 py-1 rounded-full bg-white border border-blue-200 text-blue-700 text-xs font-semibold"
            >
              Built with AI assistance
            </span>
            <p class="text-sm text-zinc-700 leading-relaxed">
              {project.aiNote}
            </p>
          </div>
        </div>
      {/if}

      <!-- Key features -->
      {#if project.highlights?.length}
        <h5 class="font-semibold text-zinc-900 mt-6 mb-2">Highlights</h5>
        <ul class="list-disc list-outside ml-5 space-y-2 text-zinc-700">
          {#each project.highlights as highlight}
            <li>{highlight}</li>
          {/each}
        </ul>
      {/if}

      <!-- Tech stack -->
      {#if project.stack?.length}
        <h5 class="font-semibold text-zinc-900 mt-6 mb-3">Tech stack</h5>
        <div class="skills-chips">
          {#each project.stack as tech}
            <span class="skill-chip">{tech}</span>
          {/each}
        </div>
      {/if}
    </section>
  {/each}
</div>
