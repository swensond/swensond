<script lang="ts">
  import { getContext } from 'svelte';
  import AnimeCard from '$lib/components/AnimeCard.svelte';
  import type { AniListMedia } from '$lib/types/anime';

  const ctx = getContext<{
    watchingList: AniListMedia[];
    watchedSet: Set<number>;
    progressMap: Record<number, number>;
    setSelected: (m: AniListMedia | null) => void;
    setProgress: (id: number, ep: number) => void;
    advanceProgress: (id: number) => void;
    isSingleEpisode: (m: AniListMedia) => boolean;
  }>('anime');

  const watchingList = $derived(ctx.watchingList);
  const watchedSet = $derived(ctx.watchedSet);
  const progressMap = $derived(ctx.progressMap);

  const startedWatching = $derived(
    watchingList
      .filter((m) => {
        if (m.status === 'NOT_YET_RELEASED') return false;
        const seen = progressMap[m.id] ?? 0;
        return seen === 0;
      })
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)),
  );
</script>

<svelte:head>
  <title>Backlog</title>
</svelte:head>

<div class="h-px" aria-hidden="true"></div>
<div class="card px-4 py-3 flex items-center justify-between gap-3">
  <div>
    <div class="text-xs uppercase tracking-widest" style="color: var(--text-muted);">
      Your Backlog
    </div>
    <div class="la-heading text-lg font-bold la-gold-text">
      Unstarted Shows ({startedWatching.length})
    </div>
  </div>
</div>

{#if startedWatching.length === 0}
  <div class="card p-8 text-center space-y-3">
    <div style="color: var(--text-muted);">
      Your backlog is empty! All shows on your list have already been started.
    </div>
    <a class="btn" href="/anime/recommendations/">Get Recommendations</a>  </div>
{:else}
  <div class="anime-grid">
    {#each startedWatching as m (m.id)}
      <div>
        <AnimeCard media={m} watchedSet={watchedSet} onclick={() => ctx.setSelected(m)} />
        <div class="p-1.5">
          <button
            class="w-full btn text-xs py-1.5 transition hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)]"
            style="background: var(--accent); border-color: var(--accent); color: var(--text-inverse);"
            title={ctx.isSingleEpisode(m) ? 'Mark as watched' : 'Started watching (mark episode 1 watched)'}
            onclick={() => {
              if (ctx.isSingleEpisode(m)) ctx.setProgress(m.id, 1);
              else ctx.advanceProgress(m.id);
            }}
          >
            {ctx.isSingleEpisode(m) ? 'Mark as Watched' : 'Started Watching (+1)'}
          </button>
        </div>
      </div>
    {/each}
  </div>
{/if}
