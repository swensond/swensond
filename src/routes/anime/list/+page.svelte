<script lang="ts">
  import { getContext } from 'svelte';
  import { seasonLabel, statusLabel, formatAiring } from '$lib/api/anilist';
  import type { AniListMedia, AniListSeason } from '$lib/types/anime';

  function coverGradient(color: string | null): string {
    if (!color) return 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(11,10,14,0) 70%)';
    return `linear-gradient(180deg, ${color}14 0%, ${color}55 45%, #0b0a0e 92%)`;
  }

  const ctx = getContext<{
    watched: AniListMedia[];
    watchingList: AniListMedia[];
    watchedSet: Set<number>;
    progressMap: Record<number, number>;
    watchedLoading: boolean;
    watchedError: string | null;
    retryWatched: () => void;
    setSelected: (m: AniListMedia | null) => void;
    selectedTitle: (m: AniListMedia) => string;
    totalEpisodes: (m: AniListMedia) => number;
    isCompletedByMe: (m: AniListMedia) => boolean;
    advanceProgress: (id: number) => void;
    relationSummary: (m: AniListMedia, watchedSet: Set<number>) => { isContinuation: boolean; label: string | null };
  }>('anime');

  const watchingList = $derived(ctx.watchingList);
  const watchedSet = $derived(ctx.watchedSet);
  const progressMap = $derived(ctx.progressMap);

  const watchedLoading = $derived(ctx.watchedLoading);
  const watchedError = $derived(ctx.watchedError);

  function seasonOfMonth(month: number | null): AniListSeason | null {
    if (!month) return null;
    if (month <= 3) return 'WINTER';
    if (month <= 6) return 'SPRING';
    if (month <= 9) return 'SUMMER';
    return 'FALL';
  }

  type FinishedGroup = { key: string; label: string; items: AniListMedia[] };
  const FINISHED_SEASON_ORDER: Record<string, number> = { SPRING: 0, SUMMER: 1, FALL: 2, WINTER: 3 };

  function seasonOfMonthMap(m: AniListMedia) {
    return seasonOfMonth(m.startDate?.month ?? null);
  }

  const finishedGroups = $derived((() => {
    const groups = new Map<string, AniListMedia[]>();
    const orderKeys: string[] = [];
    for (const m of watchingList) {
      if (m.status !== 'FINISHED') continue;
      const seasonOf = seasonOfMonthMap(m);
      const year = m.startDate?.year ?? null;
      const key = seasonOf && year ? `${year}|${seasonOf}` : 'unknown';
      if (!orderKeys.includes(key)) orderKeys.push(key);
      groups.set(key, [...(groups.get(key) ?? []), m]);
    }
    const numeric = (key: string) => {
      if (key === 'unknown') return Number.NEGATIVE_INFINITY;
      const [year, s] = key.split('|');
      return Number(year) * 4 + (FINISHED_SEASON_ORDER[s] ?? 0);
    };
    const label = (key: string) =>
      key === 'unknown' ? 'Unknown season' : seasonLabel(key.split('|')[1] as AniListSeason, Number(key.split('|')[0]));
    return orderKeys
      .sort((a, b) => numeric(b) - numeric(a))
      .map((key) => ({ key, label: label(key), items: groups.get(key) ?? [] }));
  })());

  const airingList = $derived(watchingList.filter((m) => m.status === 'RELEASING'));

  const upcomingGroups = $derived((() => {
    const groups = new Map<string, AniListMedia[]>();
    const orderKeys: string[] = [];
    for (const m of watchingList) {
      if (m.status === 'FINISHED' || m.status === 'RELEASING') continue;
      const seasonOf = seasonOfMonthMap(m);
      const year = m.startDate?.year ?? null;
      const key = seasonOf && year ? `${year}|${seasonOf}` : 'unknown';
      if (!orderKeys.includes(key)) orderKeys.push(key);
      groups.set(key, [...(groups.get(key) ?? []), m]);
    }
    const numeric = (key: string) => {
      if (key === 'unknown') return Number.POSITIVE_INFINITY;
      const [year, s] = key.split('|');
      return Number(year) * 4 + (FINISHED_SEASON_ORDER[s] ?? 0);
    };
    const label = (key: string) =>
      key === 'unknown' ? 'Unknown season' : seasonLabel(key.split('|')[1] as AniListSeason, Number(key.split('|')[0]));
    return orderKeys
      .filter((key) => (groups.get(key) ?? []).length > 0)
      .sort((a, b) => numeric(a) - numeric(b))
      .map((key) => ({ key, label: label(key), items: groups.get(key) ?? [] }));
  })());

  type ListFilter = 'airing' | 'finished';
  let myFilter = $state<ListFilter>('airing');
  let mySeason = $state<'all' | string>('all');

  const myFilteredFinished = $derived(
    mySeason === 'all' ? finishedGroups : finishedGroups.filter((g) => g.key === mySeason),
  );

  function openModal(m: AniListMedia) {
    ctx.setSelected(m);
  }
</script>

<svelte:head>
  <title>My List</title>
</svelte:head>

<div class="h-px" aria-hidden="true"></div>
{#if watchedLoading}
  <div class="space-y-2">
    {#each Array(4) as _, i}
      <div class="schedule-row" style="cursor: default; border-color: transparent;">
        <div class="w-12 h-16 skeleton"></div>
        <div class="flex-1 space-y-1.5">
          <div class="h-3.5 w-2/3 skeleton rounded"></div>
          <div class="h-2.5 w-1/3 skeleton rounded"></div>
        </div>
      </div>
    {/each}
  </div>
{:else if watchedError}
  <div class="card p-6 text-center space-y-3">
    <div style="color: var(--text-muted);">Could not load your shows.</div>
    <div class="text-xs" style="color: var(--red);">{watchedError}</div>
    <button class="btn" onclick={ctx.retryWatched}>Retry</button>
  </div>
{:else if watchingList.length === 0}
  <div class="card p-6 text-center">
    <div style="color: var(--text-muted);">
      No shows picked yet - open the Season tab and tap <span class="la-gold-text">+</span> on anything you're watching.
    </div>
  </div>
{:else}
  <!-- FLAT STATUS FILTER -->
  <div class="flex flex-wrap items-center gap-2">
    {#each [
      { key: 'airing' as ListFilter, label: 'Airing & Upcoming', count: airingList.length + upcomingGroups.reduce((n, g) => n + g.items.length, 0) },
      { key: 'finished' as ListFilter, label: 'Finished', count: watchingList.filter((m) => m.status === 'FINISHED').length },
    ] as f (f.key)}
      <button class="filter-chip" class:active={myFilter === f.key} onclick={() => (myFilter = f.key)}>
        <span>{f.label}</span>
        <span class="filter-chip-count">{f.count}</span>
      </button>
    {/each}
  </div>

  <!-- LIST WITH SEASON SIDEBAR (only while the Finished filter is active) -->
  <div class="grid gap-6" class:sidebar-layout={finishedGroups.length > 1 && myFilter === 'finished'}>
    {#if finishedGroups.length > 1 && myFilter === 'finished'}
      <aside>
        <div class="card p-3">
          <div class="text-xs uppercase tracking-widest px-2 pb-2" style="color: var(--text-muted);">
            Seasons
          </div>
          <nav class="flex gap-1 lg:flex-col">
            <button class="filter-chip" class:active={mySeason === 'all'} onclick={() => (mySeason = 'all')}>
              <span>All</span>
              <span class="filter-chip-count">{finishedGroups.reduce((n, g) => n + g.items.length, 0)}</span>
            </button>
            {#each finishedGroups as g (g.key)}
              <button class="filter-chip" class:active={mySeason === g.key} onclick={() => (mySeason = g.key)}>
                <span>{g.label}</span>
                <span class="filter-chip-count">{g.items.length}</span>
              </button>
            {/each}
          </nav>
        </div>
      </aside>
    {/if}
    <div class="space-y-4">
      <!-- AIRING & UPCOMING (default filter) -->
      {#if myFilter === 'airing'}
        {#if airingList.length > 0 || upcomingGroups.length > 0}
          {#if airingList.length > 0}
            <div class="space-y-1">
              <div class="flex items-baseline gap-2">
                <h3 class="la-heading text-base font-bold">Airing</h3>
                <span class="text-xs" style="color: var(--text-muted);">{airingList.length}</span>
              </div>
              <div class="space-y-2">
                {#each airingList as m (m.id)}
                  {@render row(m)}
                {/each}
              </div>
            </div>
          {/if}

          {#if upcomingGroups.length > 0}
            {#each upcomingGroups as g (g.key)}
              {#if g.items.length > 0}
                <div class="space-y-1">
                  <div class="flex items-baseline gap-2">
                    <h3 class="la-heading text-base font-bold">{g.label}</h3>
                    <span class="text-xs" style="color: var(--text-muted);">{g.items.length}</span>
                  </div>
                  <div class="space-y-2">
                    {#each g.items as m (m.id)}
                      {@render row(m)}
                    {/each}
                  </div>
                </div>
              {/if}
            {/each}
          {/if}
        {:else}
          <div class="card p-6 text-center">
            <div style="color: var(--text-muted);">
              Nothing currently airing or on the way - check back with the Season tab.
            </div>
          </div>
        {/if}
      {/if}

      <!-- FINISHED SHOWS, grouped by season -->
      {#if myFilter === 'finished'}
        {#if myFilteredFinished.length > 0}
          {#each myFilteredFinished as g (g.key)}
            {#if g.items.length > 0}
              <div class="space-y-1">
                <div class="flex items-baseline gap-2">
                  <h3 class="la-heading text-base font-bold">{g.label}</h3>
                  <span class="text-xs" style="color: var(--text-muted);">{g.items.length}</span>
                </div>
                <div class="space-y-2">
                  {#each g.items as m (m.id)}
                    {@render row(m)}
                  {/each}
                </div>
              </div>
            {/if}
          {/each}
        {:else}
          <div class="card p-6 text-center">
            <div style="color: var(--text-muted);">No finished shows on your list yet.</div>
          </div>
        {/if}
      {/if}
    </div>
  </div>
{/if}

{#snippet row(m: AniListMedia)}
  {@const s = statusLabel(m.status)}
  {@const air = formatAiring(m)}
  {@const title = ctx.selectedTitle(m)}
  {@const rel = ctx.relationSummary(m, watchedSet)}
  {@const seen = progressMap[m.id] ?? 0}
  {@const total = ctx.totalEpisodes(m)}
  <div
    class="schedule-row"
    role="button"
    tabindex="0"
    aria-label={`View details for ${title}`}
    onclick={() => openModal(m)}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(m);
      }
    }}
  >
    <div class="w-[3px] self-stretch shrink-0 rounded-sm"
      style="background: {rel.isContinuation ? 'var(--accent)' : 'transparent'};"
      title={rel.label ?? undefined}></div>
    <img class="schedule-cover" style="background: {coverGradient(m.coverImage.color)};"
      src={m.coverImage.extraLarge ?? m.coverImage.large} alt="" loading="lazy" />
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium leading-tight line-clamp-1">{title}</div>
      <div class="text-xs mt-0.5 flex items-center gap-2" style="color: var(--text-muted);">
        <span class="badge {s.className} shrink-0">{s.text}</span>
        {#if rel.isContinuation}
          <span class="badge b-cont shrink-0" title={rel.label ?? 'Continuing franchise'}>Continuing</span>
        {/if}
        {#if air.at}
          <span title={`Airs ${air.at}`}>{air.text}</span>
        {:else if m.status === 'FINISHED'}
          <span>Completed{m.episodes ? ` · ${m.episodes} eps` : ''}</span>
        {:else if m.status === 'NOT_YET_RELEASED'}
          <span>Not aired yet</span>
        {/if}
        {#if seen > 0}
          <span class="badge b-progress shrink-0" title="Episodes you've watched">
            <span class="tabular-nums">{seen}</span>
            {#if total}<span class="opacity-70">/{total}</span>{/if}
          </span>
        {/if}
      </div>
    </div>
    {#if m.averageScore}
      <span class="score-badge shrink-0">{m.averageScore}</span>
    {/if}
    {#if !ctx.isCompletedByMe(m) && m.status !== 'NOT_YET_RELEASED'}
      <button class="btn shrink-0 px-2" title="Mark another episode watched"
        aria-label={`Mark episode ${seen + 1} of ${title} watched`}
        onclick={(e) => { e.stopPropagation(); ctx.advanceProgress(m.id); }}>
        +1
      </button>
    {/if}
  </div>
{/snippet}
