<script lang="ts">
  import { projects } from '$lib/content/projects';
  import { createLightbox } from '$lib/lightbox-state.svelte';
  import type { Gallery } from '$lib/lightbox-state.svelte';
  import Lightbox from '$lib/lightbox-view.svelte';
  import ProjectPanel from '$lib/project-panel.svelte';

  const description =
    'Personal projects by David Swenson: a Lost Ark progression planner, an anime watchlist, a mouse genetics knowledge graph, a home gym app, and a recipe collection with a Chrome extension.';

  type Project = (typeof projects)[number];

  const lightbox = createLightbox<Project['images'][number]>();

  /** The lightbox only needs the chrome around the shots; the content module owns the rest. */
  function galleryOf(project: Project): Gallery<Project['images'][number]> {
    return { number: project.index, slug: project.slug, title: project.name, shots: project.images };
  }
</script>

<svelte:head>
  <title>Projects | David Swenson</title>
  <meta name="description" content={description} />
  <meta property="og:title" content="Projects | David Swenson" />
  <meta property="og:description" content={description} />
</svelte:head>

<header class="card flex flex-wrap items-end justify-between gap-x-12 gap-y-5 p-[clamp(1.5rem,3vw,2.75rem)]">
  <h1 class="display text-[clamp(2.75rem,6.2vw,5.75rem)] leading-[0.95] font-bold tracking-[-0.04em]">Projects</h1>
  <p class="min-w-0 flex-[0_1_33.75rem] text-[clamp(1.0625rem,1.35vw,1.1875rem)] leading-normal text-pretty text-ink-soft">
    Personal projects I design, build, and use every day. Built with AI pair-programming tools; <span class="text-accent">the
    product decisions, architecture, data modeling, and code review are mine.</span>
  </p>
</header>

{#each projects as project}
  <article id={project.slug} class="card flex scroll-mt-4 flex-wrap overflow-hidden">
    <ProjectPanel {project} size="panel" onopen={(index) => lightbox.open(galleryOf(project), index)} />
    <div class="box-border flex min-w-0 flex-[1_1_21.25rem] flex-col gap-4 p-[clamp(1.5rem,2.6vw,2.25rem)]">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span class="font-mono text-[0.875rem] font-medium text-accent">{project.index}</span>
        {#if project.wip}
          <span class="rounded-sm border border-accent/60 px-2 py-0.5 font-mono text-[0.6875rem] font-medium tracking-[0.08em] text-accent uppercase">In progress</span>
        {/if}
      </div>
      <div class="flex flex-col gap-1.5">
        <h2 class="display text-[2rem] leading-[1.1] font-semibold tracking-[-0.02em]">{project.name}</h2>
        <p class="font-medium">{project.tagline}</p>
      </div>
      <p class="text-[0.9375rem] leading-relaxed text-pretty text-ink-soft">{project.description}</p>
      <ul class="flex flex-wrap gap-1.5 text-ink-soft">
        {#each project.stack as tech}
          <li class="chip">{tech}</li>
        {/each}
      </ul>
      <ul class="flex flex-col text-sm leading-normal text-ink-soft">
        {#each project.highlights as highlight, i}
          <li class="border-t border-line py-2.5 {i === project.highlights.length - 1 ? 'pb-0' : ''}">{highlight}</li>
        {/each}
      </ul>
    </div>
  </article>
{/each}

<Lightbox {lightbox} />
