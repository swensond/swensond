<script lang="ts">
  import type { ProjectView } from '$lib/content/projects';

  /**
   * The artwork for one project, in three arrangements: a zoomed crop of one wide
   * screenshot, one screenshot filling the panel, or the first three phone screens.
   * `tile` is the small preview; `panel` is the full-size one, and with `onopen` its
   * screenshots become buttons that open the lightbox at that shot.
   */
  let {
    project,
    size,
    onopen
  }: { project: ProjectView; size: 'tile' | 'panel'; onopen?: (index: number) => void } = $props();

  const tile = $derived(size === 'tile');
  const backdrop = $derived(project.backdrop ?? '#0A0A0C');
  const phones = $derived(project.images.slice(0, 3));
  const lead = $derived(project.images[0]);

  const alt = (caption: string | undefined) => (tile ? '' : (caption ?? `Screenshot of ${project.name}`));
  const label = (index: number) => `View larger screenshot ${index + 1} of ${project.name}`;
</script>

{#if project.multi}
  <div
    class="flex justify-center {tile
      ? 'aspect-[16/10] items-start gap-2 overflow-hidden rounded-2xl px-3.5 pt-3.5'
      : 'min-w-0 flex-[1.5_1_30rem] items-center gap-[3%] p-8 sm:min-h-[23.75rem]'}"
    style:background={backdrop}
  >
    {#each phones as image, i}
      <!-- The slot owns the width so a button wrapper and a bare image size identically. -->
      <div class={tile ? 'w-[29%]' : 'w-[28%]'}>
        {#snippet phone()}
          <img
            src={image.src}
            width={image.width}
            height={image.height}
            alt={alt(image.caption)}
            loading="lazy"
            class="block h-auto w-full {tile ? 'rounded-lg' : 'rounded-[14px]'}"
          />
        {/snippet}
        {#if onopen}
          <button type="button" class="block w-full cursor-zoom-in" aria-label={label(i)} onclick={() => onopen(i)}>
            {@render phone()}
          </button>
        {:else}
          {@render phone()}
        {/if}
      </div>
    {/each}
  </div>
{:else}
  <div
    class="relative overflow-hidden {tile
      ? 'mb-0 aspect-[16/10] rounded-2xl border border-line'
      : 'min-h-[17rem] min-w-0 flex-[1.5_1_30rem] sm:min-h-[23.75rem]'}"
    style:background={backdrop}
  >
    {#snippet shot()}
      <img
        src={lead.src}
        width={lead.width}
        height={lead.height}
        alt={alt(lead.caption)}
        loading="lazy"
        class={project.cover
          ? 'absolute inset-0 size-full object-cover object-left-top'
          : 'absolute top-0 -left-[80%] h-auto w-[260%] max-w-none'}
      />
    {/snippet}
    {#if onopen}
      <button type="button" class="absolute inset-0 block cursor-zoom-in" aria-label={label(0)} onclick={() => onopen(0)}>
        {@render shot()}
      </button>
    {:else}
      {@render shot()}
    {/if}
  </div>
{/if}
