<script lang="ts">
  import { getContext } from 'svelte';
  import { RefreshCw } from '@lucide/svelte';
  import AnimeCard from '$lib/components/AnimeCard.svelte';
  import type { AniListMedia } from '$lib/types/anime';
  import { clearGenreCache, loadMediaByGenres } from '$lib/api/anilist';
  import { safeDescriptions } from '$lib/utils/html';

  const ctx = getContext<{
    watched: AniListMedia[];
    watchedSet: Set<number>;
    setSelected: (m: AniListMedia | null) => void;
  }>('anime');

  const watched = $derived(ctx.watched);
  const watchedSet = $derived(ctx.watchedSet);

  let recommendedMedia = $state<AniListMedia[]>([]);
  let recommendedLoading = $state(false);
  let recommendedError = $state<string | null>(null);
  let recommendationReload = $state(0);
  let recommendationCooldown = $state(false);

  let recommendationPageRef = 1;
  let recommendationsHasMore = $state(false);
  let loadingMoreRecommendations = $state(false);
  let loadMoreRecommendationsError = $state<string | null>(null);
  let currentGenreKey = '';
  let lastFetchedGenreKey = '';

  const topGenres = $derived(
    Object.entries((() => {
      const counts: Record<string, number> = {};
      for (const m of watched) {
        for (const g of m.genres) counts[g] = (counts[g] || 0) + 1;
      }
      return counts;
    })())
      .sort((a, b) => b[1] - a[1])
      .map(([genre]) => genre),
  );

  function loadRecommendations() {
    if (recommendationCooldown) return;
    recommendationCooldown = true;
    lastFetchedGenreKey = '';
    clearGenreCache();
    recommendationReload++;
    setTimeout(() => { recommendationCooldown = false; }, 3000);
  }

  $effect(() => {
    void recommendationReload;
    if (topGenres.length === 0) return;
    const genresKey = topGenres.slice(0, 3).sort().join(',');
    if (genresKey === lastFetchedGenreKey && recommendedMedia.length > 0) return;
    lastFetchedGenreKey = genresKey;

    const pool = topGenres.slice(0, 6);
    const shuffledGenres = [...pool].sort(() => Math.random() - 0.5);
    const genresToFetch = shuffledGenres.slice(0, 3);
    currentGenreKey = genresToFetch.sort().join(',');
    recommendationPageRef = 1;

    recommendedLoading = true;
    recommendedError = null;
    loadingMoreRecommendations = false;
    loadMoreRecommendationsError = null;

    loadMediaByGenres(genresToFetch, 1)
      .then(async (pageData) => {
        if (currentGenreKey !== genresToFetch.sort().join(',')) return;
        recommendationPageRef = 1;
        recommendationsHasMore = pageData.pageInfo.hasNextPage;
        const filtered = pageData.media.filter((m) => !watchedSet.has(m.id));
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        recommendedMedia = await safeDescriptions(shuffled);
        recommendedLoading = false;
      })
      .catch((e) => {
        recommendedError = e instanceof Error ? e.message : String(e);
        recommendedLoading = false;
      });
  });

  async function loadMoreRecommendations(): Promise<void> {
    if (loadingMoreRecommendations || !recommendationsHasMore || recommendedLoading || recommendedError) return;
    loadingMoreRecommendations = true;
    loadMoreRecommendationsError = null;
    const guard = currentGenreKey;
    const nextPage = recommendationPageRef + 1;
    const genres = currentGenreKey.split(',').filter(Boolean);
    try {
      const pageData = await loadMediaByGenres(genres, nextPage);
      if (guard !== currentGenreKey) return;
      const seen = new Set(recommendedMedia.map((m) => m.id));
      const additions = (await safeDescriptions(pageData.media)).filter((m) => !seen.has(m.id) && !watchedSet.has(m.id));
      recommendedMedia = [...recommendedMedia, ...additions];
      recommendationPageRef = nextPage;
      recommendationsHasMore = pageData.pageInfo.hasNextPage;
    } catch (e) {
      if (guard !== currentGenreKey) return;
      loadMoreRecommendationsError = e instanceof Error ? e.message : String(e);
    } finally {
      if (guard === currentGenreKey) loadingMoreRecommendations = false;
    }
  }

  function scrollMoreRecommendations(node: HTMLElement) {
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) loadMoreRecommendations(); },
      { rootMargin: '600px' },
    );
    io.observe(node);
    return { destroy() { io.disconnect(); } };
  }
</script>

<svelte:head>
  <title>Recommendations</title>
</svelte:head>

<div class="h-px" aria-hidden="true"></div>
<div class="card px-4 py-3 flex items-center justify-between gap-3">
  <div>
    <div class="text-xs uppercase tracking-widest" style="color: var(--text-muted);">
      Get Started Watching
    </div>
    <div class="la-heading text-lg font-bold la-gold-text">
      Recommended for You
    </div>
  </div>
  <div class="flex items-center gap-3">
    {#if topGenres.length > 0}
      <div class="text-xs hidden sm:flex flex-wrap gap-1 items-center max-w-md justify-end">
        <span style="color: var(--text-muted);">Based on:</span>
        {#each topGenres.slice(0, 3) as g}
          <span class="tag">{g}</span>
        {/each}
      </div>
    {/if}
    <button
      class="btn flex items-center gap-1.5 px-3 py-1.5 text-xs"
      class:opacity-50={recommendedLoading || recommendationCooldown}
      disabled={recommendedLoading || recommendationCooldown}
      onclick={loadRecommendations}
      title={recommendationCooldown ? 'Please wait a moment before pulling new recommendations' : 'Pull new recommendations'}
    >
      <RefreshCw size={14} class={recommendedLoading ? 'animate-spin' : ''} />
      <span>Refresh</span>
    </button>
  </div>
</div>

{#if watched.length === 0}
  <div class="card p-8 text-center space-y-3">
    <div style="color: var(--text-muted);">
      Add some shows to your list first so we can learn your favorite genres and recommend anime for you to get started watching!
    </div>
    <a class="btn" href="/anime/seasons/">Browse Seasons</a>
  </div>
{:else if recommendedLoading}
  <div class="anime-grid">
    {#each Array(10) as _, i}
      <div class="anime-card" style="cursor: default;">
        <div class="aspect-[2/3] skeleton"></div>
        <div class="p-2.5 space-y-2">
          <div class="h-3.5 skeleton rounded"></div>
          <div class="h-2.5 w-2/3 skeleton rounded"></div>
        </div>
      </div>
    {/each}
  </div>
{:else if recommendedError}
  <div class="card p-6 text-center space-y-3">
    <div style="color: var(--text-muted);">Could not load recommendations.</div>
    <div class="text-xs" style="color: var(--red);">{recommendedError}</div>
    <button class="btn" onclick={loadRecommendations}>Retry</button>
  </div>
{:else if recommendedMedia.length === 0}
  <div class="card p-6 text-center">
    <div style="color: var(--text-muted);">No recommendations found matching your favorite genres.</div>
  </div>
{:else}
  <div class="anime-grid">
    {#each recommendedMedia as m (m.id)}
      <AnimeCard media={m} watchedSet={watchedSet} onclick={() => ctx.setSelected(m)} />
    {/each}
  </div>

  <div use:scrollMoreRecommendations class="h-2" aria-hidden="true"></div>
  {#if loadingMoreRecommendations}
    <div class="text-center text-xs py-4" style="color: var(--text-muted);">
      Loading more recommendations…
    </div>
  {:else if loadMoreRecommendationsError}
    <div class="flex items-center justify-center gap-3 py-4">
      <div class="text-xs" style="color: var(--red);">Could not load more.</div>
      <button class="btn" onclick={loadMoreRecommendations}>Retry</button>
    </div>
  {:else if !recommendationsHasMore && recommendedMedia.length > 0}
    <div class="text-center text-xs py-4" style="color: var(--text-faint);">
      You've reached the end of these recommendations. Hit Refresh to pull a new batch!
    </div>
  {:else if recommendedMedia.length > 0}
    <div class="text-center text-xs py-4" style="color: var(--text-faint);">
      Scroll for more recommendations…
    </div>
  {/if}
{/if}
