<script lang="ts">
  import type { AniListMedia } from '$lib/types/anime';
  import { mainTitle, formatAiring, studioNames, statusLabel, relationSummary } from '$lib/api/anilist';
  import { toggleWatch } from '$lib/stores/watchlist';

  let {
    media,
    watchedSet = new Set(),
    onclick,
  }: {
    media: AniListMedia;
    watchedSet?: Set<number>;
    onclick?: () => void;
  } = $props();

  const m = $derived(media);
  const s = $derived(statusLabel(m.status));
  const air = $derived(formatAiring(m));
  const title = $derived(m.title.english ?? mainTitle(m));
  const isWatched = $derived(watchedSet.has(m.id));
  const rel = $derived(relationSummary(m, watchedSet));

  function coverGradient(color: string | null): string {
    if (!color) {
      return 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(11,10,14,0) 70%)';
    }
    return `linear-gradient(180deg, ${color}14 0%, ${color}55 45%, #0b0a0e 92%)`;
  }
</script>

<div
  class="anime-card group"
  role="button"
  tabindex="0"
  aria-label={`View details for ${title}`}
  onclick={onclick}
  onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onclick?.();
    }
  }}
>
  <div
    class="relative aspect-[2/3] overflow-hidden"
    style="background: {coverGradient(m.coverImage.color)};"
  >
    <img
      class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
      src={m.coverImage.extraLarge ?? m.coverImage.large}
      alt={title}
      loading="lazy"
    />

    <span class="badge {s.className} absolute left-1.5 top-1.5">{s.text}</span>

    {#if rel.isContinuation}
      <span
        class="badge b-cont absolute left-1.5 top-9"
        title={rel.label ?? 'Continuing franchise'}
      >
        Continuing
      </span>
    {/if}

    <button
      class="watch-toggle"
      class:on={isWatched}
      title={isWatched ? 'Remove from your shows' : 'Add to your shows'}
      aria-label={isWatched
        ? `Remove ${title} from your shows`
        : `Add ${title} to your shows`}
      onclick={(e) => {
        e.stopPropagation();
        toggleWatch(m.id);
      }}
    >
      {isWatched ? '✓' : '+'}
    </button>

    {#if air.text}
      <div
        class="absolute inset-x-0 bottom-0 text-[10px] font-medium text-left"
        title={air.at ? `Airs ${air.at}` : undefined}
        style="color: #fff; padding: 0.375rem 0.5rem; background: rgba(11,10,14,0.35); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-top: 1px solid rgba(255,255,255,0.18);"
      >
        {air.text}
      </div>
    {/if}
  </div>

  <div class="p-2.5 space-y-1.5">
    <div class="text-sm font-medium leading-tight line-clamp-2">{title}</div>
    <div class="text-[11px] line-clamp-1" style="color: var(--text-muted);">
      {studioNames(m)}
    </div>
    <div class="flex flex-wrap gap-1">
      {#each m.genres.slice(0, 3) as g}
        <span class="tag">{g}</span>
      {/each}
    </div>
  </div>
</div>
