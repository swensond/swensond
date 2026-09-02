<script lang="ts">
  import { untrack, getContext } from 'svelte';
  import { page } from '$app/stores';
  import AnimeCard from '$lib/components/AnimeCard.svelte';
  import {
    clearSeasonCache,
    currentSeason,
    loadSeason,
    loadSeasonPage,
    seasonLabel,
    shiftSeason,
  } from '$lib/api/anilist';
  import { safeDescriptions } from '$lib/utils/html';
  import type { AniListMedia, AniListSeason } from '$lib/types/anime';

  const ctx = getContext<{
    now: Date;
    watchedSet: Set<number>;
    selected: AniListMedia | null;
    setSelected: (m: AniListMedia | null) => void;
    coverGradient: (color: string | null) => string;
    navHeight: number;
  }>('anime');

  const SEASON_MAP: Record<string, AniListSeason> = {
    winter: 'WINTER', spring: 'SPRING', summer: 'SUMMER', fall: 'FALL',
  };
  const SEASON_SLUG: Record<AniListSeason, string> = {
    WINTER: 'winter', SPRING: 'spring', SUMMER: 'summer', FALL: 'fall',
  };
  const MIN_YEAR = 1917;
  const MAX_YEAR = new Date().getFullYear() + 2;

  const yearParam = $derived($page.params.year);
  const seasonParam = $derived($page.params.season?.toLowerCase() ?? '');

  const invalidYear = $derived(!/^\d{4}$/.test(yearParam) || Number(yearParam) < MIN_YEAR || Number(yearParam) > MAX_YEAR);
  const invalidSeason = $derived(!SEASON_MAP[seasonParam]);

  const yearNum = $derived(Number(yearParam));
  const season = $derived<{ season: AniListSeason; seasonYear: number }>({
    season: SEASON_MAP[seasonParam] ?? 'WINTER',
    seasonYear: yearNum,
  });

  const END_MONTH: Record<AniListSeason, number> = { WINTER: 3, SPRING: 6, SUMMER: 9, FALL: 12 };
  const START_MONTH: Record<AniListSeason, number> = { WINTER: 1, SPRING: 4, SUMMER: 7, FALL: 10 };

  const ORDER: Record<string, number> = {
    RELEASING: 0, NOT_YET_RELEASED: 1, FINISHED: 2, HIATUS: 3, CANCELLED: 4,
  };

  function sortMedia(list: AniListMedia[]): AniListMedia[] {
    return [...list].sort(
      (a, b) =>
        (ORDER[a.status ?? ''] ?? 5) - (ORDER[b.status ?? ''] ?? 5) ||
        (b.popularity ?? 0) - (a.popularity ?? 0),
    );
  }

  let media = $state<AniListMedia[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let seasonReload = $state(0);
  let seasonPageRef = 1;
  let seasonHasMore = $state(false);
  let loadingMore = $state(false);
  let loadMoreError = $state<string | null>(null);
  let currentSeasonKey = '';
  let requestId = 0;

  $effect(() => {
    if (invalidYear || invalidSeason) return;
    const key = `${season.seasonYear}|${season.season}`;
    if (key === currentSeasonKey && media.length > 0) return;
    const id = ++requestId;
    loading = true;
    error = null;
    loadingMore = false;
    loadMoreError = null;
    void seasonReload;

    loadSeason(season.season, season.seasonYear)
      .then(async (pageData) => {
        if (id !== requestId) return;
        currentSeasonKey = key;
        seasonPageRef = 1;
        seasonHasMore = pageData.pageInfo.hasNextPage;
        media = sortMedia(await safeDescriptions(pageData.media));
        loading = false;
      })
      .catch((e) => {
        if (id !== requestId) return;
        seasonHasMore = false;
        error = e instanceof Error ? e.message : String(e);
        loading = false;
      });
  });

  async function loadMoreSeason(): Promise<void> {
    if (loadingMore || !seasonHasMore || loading || error) return;
    loadingMore = true;
    loadMoreError = null;
    const guard = `${season.seasonYear}|${season.season}`;
    const nextPage = seasonPageRef + 1;

    try {
      const pageData = await loadSeasonPage(season.season, season.seasonYear, nextPage);
      if (guard !== currentSeasonKey) return;
      const seen = new Set(media.map((m) => m.id));
      const additions = (await safeDescriptions(pageData.media)).filter((m) => !seen.has(m.id));
      media = [...media, ...additions];
      seasonPageRef = nextPage;
      seasonHasMore = pageData.pageInfo.hasNextPage;
    } catch (e) {
      if (guard !== currentSeasonKey) return;
      loadMoreError = e instanceof Error ? e.message : String(e);
    } finally {
      if (guard === currentSeasonKey) loadingMore = false;
    }
  }

  function scrollMore(node: HTMLElement) {
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) loadMoreSeason(); },
      { rootMargin: '600px' },
    );
    io.observe(node);
    return { destroy() { io.disconnect(); } };
  }

  function refetchSeason() {
    clearSeasonCache(season.season, season.seasonYear);
    seasonReload++;
  }

  const countdown = $derived.by(() => {
    const now = ctx.now;
    const start = new Date(season.seasonYear, START_MONTH[season.season], 1);
    const end = new Date(season.seasonYear, END_MONTH[season.season], 0, 23, 59, 59, 999);
    const dateFmt = (d: Date) => d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const range = `${dateFmt(start)} – ${dateFmt(end)}`;
    const oneDay = 86400000;
    if (+now < +start) {
      const d = Math.ceil((+start - +now) / oneDay);
      return { phase: 'before', label: 'Starts In', value: d <= 1 ? 'Tomorrow' : `${d}d`, range };
    }
    if (+now > +end) {
      const d = Math.floor((+now - +end) / oneDay);
      return { phase: 'after', label: 'Ended', value: d === 0 ? 'Today' : `${d}d ago`, range };
    }
    const d = Math.ceil((+end - +now) / oneDay);
    return { phase: 'during', label: 'Ends In', value: d <= 1 ? d === 1 ? 'Tomorrow' : 'Today' : `${d}d`, range };
  });

  const watchedSet = $derived(ctx.watchedSet);

  const prevSeason = $derived(shiftSeason(season.season, season.seasonYear, -1));
  const nextSeason = $derived(shiftSeason(season.season, season.seasonYear, 1));
  const curSeason = $derived(currentSeason());
  let seasonPickerStuck = $state(false);
  let seasonPickerSentinel = $state<HTMLElement | null>(null);

  $effect(() => {
    const io = new IntersectionObserver(([entry]) => { untrack(() => seasonPickerStuck = !entry.isIntersecting)});
    io.observe(seasonPickerSentinel);
    return () => io.disconnect();
  });
</script>

<svelte:head>
  <title>{invalidYear || invalidSeason ? 'Seasons' : `${season.season[0] + season.season.slice(1).toLowerCase()} ${season.seasonYear}`}</title>
</svelte:head>

{#if invalidYear || invalidSeason}
  <div class="h-px" aria-hidden="true"></div>
  <div class="card p-8 text-center space-y-3">
    <div class="la-heading text-lg font-bold la-gold-text">Season not found</div>
    <div class="text-sm max-w-md mx-auto" style="color: var(--la-text-muted);">
      {#if invalidSeason}
        "<strong>{$page.params.season}</strong>" isn't a valid season — use
        <span class="la-gold-text">winter</span>, <span class="la-gold-text">spring</span>,
        <span class="la-gold-text">summer</span>, or <span class="la-gold-text">fall</span>.
      {:else}
        "<strong>{$page.params.year}</strong>" isn't a valid year — use a four-digit year between
        <span class="la-gold-text">{MIN_YEAR}</span> and <span class="la-gold-text">{MAX_YEAR}</span>.
      {/if}
    </div>
    <p>
      <a class="btn" href={`/anime/seasons/${currentSeason().seasonYear}/${SEASON_SLUG[currentSeason().season]}/`}>
        Go to the current season
      </a>
    </p>
  </div>
{:else}

<div bind:this={seasonPickerSentinel} class="h-px" aria-hidden="true"></div>


<!-- SEASON CONTROLS -->
<div
  class="card py-3 flex flex-wrap items-center gap-x-5 gap-y-2 sticky z-30"
  class:affixed={seasonPickerStuck}
  class:w-full={!seasonPickerStuck}
  class:-mx-8={seasonPickerStuck}
  class:px-8={seasonPickerStuck}
  class:px-4={!seasonPickerStuck}
  style="top: 56px;"
>
  <div>
    <div class="text-xs uppercase tracking-widest" style="color: var(--la-text-muted);">Season</div>
    <div class="la-heading text-lg font-bold la-gold-text">
      {seasonLabel(season.season, season.seasonYear)}
    </div>
  </div>

  <div class="flex items-center gap-2">
    <a class="btn" href={`/anime/seasons/${prevSeason.seasonYear}/${SEASON_SLUG[prevSeason.season]}/`}>
      ← Prev
    </a>
    <a class="btn" href={`/anime/seasons/${curSeason.seasonYear}/${SEASON_SLUG[curSeason.season]}/`}>
      Current
    </a>
    <a class="btn" href={`/anime/seasons/${nextSeason.seasonYear}/${SEASON_SLUG[nextSeason.season]}/`}>
      Next →
    </a>
  </div>

  <div class="stat-card days-left {countdown.phase} shrink-0">
    <div class="stat-label">{countdown.label}</div>
    <div class="stat-value">{countdown.value}</div>
    <div class="stat-range">{countdown.range}</div>
  </div>
</div>

<!-- GRID -->
{#if loading}
  <div class="anime-grid">
    {#each Array(10) as _}
      <div class="anime-card" style="cursor: default;">
        <div class="aspect-[2/3] skeleton"></div>
        <div class="p-2.5 space-y-2">
          <div class="h-3.5 skeleton rounded"></div>
          <div class="h-2.5 w-2/3 skeleton rounded"></div>
        </div>
      </div>
    {/each}
  </div>
{:else if error}
  <div class="card p-6 text-center space-y-3">
    <div class="text-[#a29e96]">Could not load season data.</div>
    <div class="text-xs" style="color: var(--la-red);">{error}</div>
    <button class="btn" onclick={refetchSeason}>Retry</button>
  </div>
{:else if media.length === 0}
  <div class="card p-6 text-center">
    <div class="text-[#a29e96]">No titles found for this season.</div>
  </div>
{:else}
  <div class="anime-grid">
    {#each media as m (m.id)}
      <AnimeCard
        media={m}
        watchedSet={watchedSet}
        onclick={() => ctx.setSelected(m)}
      />
    {/each}
  </div>

  <div use:scrollMore class="h-2" aria-hidden="true"></div>
  {#if loadingMore}
    <div class="text-center text-xs py-4" style="color: var(--la-text-muted);">Loading more…</div>
  {:else if loadMoreError}
    <div class="flex items-center justify-center gap-3 py-4">
      <div class="text-xs" style="color: var(--la-red);">Could not load more.</div>
      <button class="btn" onclick={loadMoreSeason}>Retry</button>
    </div>
  {:else if !seasonHasMore}
    <div class="text-center text-xs py-4" style="color: var(--la-text-faint);">You've reached the end of this season.</div>
  {:else if media.length > 50}
    <div class="text-center text-xs py-4" style="color: var(--la-text-faint);">Scroll for more titles…</div>
  {/if}
{/if}
{/if}