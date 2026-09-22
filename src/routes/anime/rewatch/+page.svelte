<script lang="ts">
  import { getContext } from 'svelte';
  import { ChevronLeft, ChevronRight, RefreshCw } from '@lucide/svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import type { AniListMedia } from '$lib/types/anime';
  import { loadMediaByIds, mainTitle } from '$lib/api/anilist';
  import { isCompleted, pickDriver, scoreRewatchCandidates } from '$lib/helpers/rewatch';
  import type { RewatchDriver, RewatchPick, RewatchReasonType } from '$lib/helpers/rewatch';
  import { watchLog } from '$lib/stores/watchlog';

  const ctx = getContext<{
    watched: AniListMedia[];
    watchedLoading: boolean;
    watchedSet: Set<number>;
    progressMap: Record<number, number>;
    setSelected: (m: AniListMedia | null) => void;
    coverGradient: (color: string | null) => string;
  }>('anime');

  const watched = $derived(ctx.watched);
  const watchedLoading = $derived(ctx.watchedLoading);
  const watchedSet = $derived(ctx.watchedSet);
  const progressMap = $derived(ctx.progressMap);

  /* Watchlist payloads skip franchise relations; upgrade completed shows
     (cache-backed, one batched query) so the engine can spot sequels. */
  let enriched = $state<Map<number, AniListMedia>>(new Map());
  const requestedIds = new Set<number>();
  let enrichPending = 0;
  let enriching = $state(false);
  /* Sticky once real content has painted: the skeleton also covers the first
     franchise-relation pass, so groups never reflow after they appear. */
  let contentShown = $state(false);

  $effect(() => {
    const missing = watched
      .filter((m) => isCompleted(m, progressMap) && !m.relations && !requestedIds.has(m.id))
      .map((m) => m.id);
    if (missing.length === 0) return;
    for (const id of missing) requestedIds.add(id);
    enrichPending++;
    enriching = true;
    loadMediaByIds(missing)
      .then((list) => {
        const next = new Map(enriched);
        for (const m of list) next.set(m.id, m);
        enriched = next;
      })
      .catch(() => {
        for (const id of missing) requestedIds.delete(id);
      })
      .finally(() => {
        enrichPending--;
        if (enrichPending === 0) enriching = false;
      });
  });

  const engineMedia = $derived(watched.map((m) => enriched.get(m.id) ?? m));

  const picks = $derived(
    scoreRewatchCandidates([{ ids: [...watchedSet], progress: progressMap, watchLog: $watchLog }], engineMedia),
  );

  const hero = $derived(picks[0] ?? null);
  const heroPct = $derived(Math.min(100, Math.round(hero?.score ?? 0)));
  const heroPitch = $derived(hero ? hero.reasons.slice(0, 3).map((r) => r.label).join(' · ') : '');
  const heroDriver = $derived.by(() => {
    if (!hero) return '';
    const d = pickDriver(hero);
    return d === 'prep' ? 'New Season Incoming' : d === 'overdue' ? 'Long Overdue' : 'Comfort Pick';
  });

  const groups = $derived.by(() => {
    const buckets: Record<RewatchDriver, RewatchPick[]> = { prep: [], overdue: [], comfort: [] };
    for (const p of picks.slice(1)) buckets[pickDriver(p)].push(p);
    return [
      { key: 'prep' as const, title: 'New Season Incoming' },
      { key: 'overdue' as const, title: 'Long Overdue' },
      { key: 'comfort' as const, title: 'Comfort Picks' },
    ]
      .map((g) => ({ ...g, picks: buckets[g.key] }))
      .filter((g) => g.picks.length > 0);
  });

  const showSkeleton = $derived((watchedLoading && watched.length === 0) || (enriching && !contentShown));
  const showEmpty = $derived(!showSkeleton && picks.length === 0);
  const showContent = $derived(!showSkeleton && picks.length > 0);

  $effect(() => {
    if (showContent) contentShown = true;
  });

  function chipClass(type: RewatchReasonType): string {
    return type === 'prep' ? 'badge b-cont' : 'badge b-done';
  }

  /* Only the "why now" factors get chips; taste/effort live in the detail modal. */
  function chipsFor(pick: RewatchPick) {
    return pick.reasons.filter((r) => (r.type === 'prep' || r.type === 'stale') && r.short);
  }

  function scrollRail(key: RewatchDriver, dir: number): void {
    const el = document.querySelector<HTMLElement>(`[data-rail="${key}"]`);
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }
</script>

<svelte:head>
  <title>Rewatch</title>
</svelte:head>

<div class="h-px" aria-hidden="true"></div>
<div class="card px-4 py-3 flex items-center justify-between gap-3">
  <div>
    <div class="text-xs uppercase tracking-widest" style="color: var(--text-muted);">
      Worth Revisiting
    </div>
    <div class="la-heading text-lg font-bold la-gold-text">
      Rewatch Picks ({picks.length})
    </div>
    <div class="text-xs mt-0.5" style="color: var(--text-faint);">
      Scored out of 100: time since you finished, sequel or new-season momentum, genre match, and rewatch effort.
    </div>
  </div>
  <!-- Fixed-height status slot: swaps text in place, never resizes the header. -->
  <div class="h-5 shrink-0 flex items-center">
    {#if enriching}
      <span class="flex items-center gap-1.5 text-xs whitespace-nowrap" style="color: var(--text-faint);">
        <RefreshCw size={12} class="animate-spin" /> Checking franchise relations…
      </span>
    {:else if watchedLoading}
      <span class="flex items-center gap-1.5 text-xs whitespace-nowrap" style="color: var(--text-faint);">
        <RefreshCw size={12} class="animate-spin" /> Refreshing…
      </span>
    {/if}
  </div>
</div>

{#if showSkeleton}
  <!-- Skeleton mirrors the final layout (hero card + three rails) so content
     drops into the same footprint instead of jumping. -->
  <div class="card p-4" style="min-height: 12.5rem;">
    <div class="flex flex-wrap gap-4 items-center">
      <div class="w-16 h-24 rounded-sm skeleton shrink-0"></div>
      <div class="min-w-0 flex-1 basis-52 space-y-2.5">
        <div class="h-2.5 w-28 skeleton rounded"></div>
        <div class="h-5 w-2/3 skeleton rounded"></div>
        <div class="h-3 w-1/2 skeleton rounded"></div>
        <div class="h-1.5 w-32 skeleton rounded-full"></div>
      </div>
      <div class="flex sm:flex-col gap-2 shrink-0">
        <div class="h-8 w-28 skeleton rounded"></div>
        <div class="h-8 w-20 skeleton rounded"></div>
      </div>
    </div>
  </div>
  {#each [0, 1, 2] as g (g)}
    <div class="space-y-1.5">
      <div class="h-3 w-36 skeleton rounded"></div>
      <div class="rail">
        {#each Array(7) as _, i}
          <div class="rail-card" style="cursor: default;">
            <div class="rail-cover skeleton"></div>
            <div class="mt-1.5 h-3 w-3/4 skeleton rounded"></div>
            <div class="mt-1.5 h-2.5 w-1/2 skeleton rounded"></div>
          </div>
        {/each}
      </div>
    </div>
  {/each}
{:else if showEmpty}
  <EmptyState message="No completed shows yet — finish something first">
    {#if watched.length === 0}
      <a class="btn" href="/anime/seasons/">Browse Seasons</a>
    {:else}
      <div class="text-xs mt-2" style="color: var(--text-faint);">
        Mark every episode of a show on your list and it'll land here when it's ripe for a rewatch.
      </div>
    {/if}
  </EmptyState>
{:else}
  {#if hero}
    {@const hm = hero.media}
    <div class="card overflow-hidden" style="border-color: var(--accent);">
      {#if hm.bannerImage}
        <div class="relative h-28 sm:h-36">
          <img class="h-full w-full object-cover" src={hm.bannerImage} alt="" />
          <div class="absolute inset-0" style="background: linear-gradient(to top, var(--panel), transparent);"></div>
        </div>
      {/if}
      <div class="p-4 flex flex-wrap gap-4 items-center {hm.bannerImage ? 'sm:-mt-12 sm:relative' : ''}">
        <img class="w-16 h-24 rounded-sm object-cover border shrink-0"
          style="background: {ctx.coverGradient(hm.coverImage.color)}; border-color: var(--border-strong); box-shadow: 0 8px 24px rgba(0,0,0,0.35);"
          src={hm.coverImage.extraLarge ?? hm.coverImage.large} alt="" />
        <div class="min-w-0 flex-1 basis-52">
          <div class="text-[10px] uppercase tracking-widest la-gold-text">Top Pick · {heroDriver}</div>
          <div class="la-heading text-xl font-bold leading-tight line-clamp-1">{hm.title.english ?? mainTitle(hm)}</div>
          <div class="text-xs mt-1 line-clamp-2" style="color: var(--text-muted);">{heroPitch}</div>
          <div class="mt-2.5 flex items-center gap-2">
            <span
              class="ready flex items-center gap-2"
              data-tip="Rewatch readiness: how strongly the signals point to now - time since you finished (up to 40 pts), a sequel or new season coming (25), genre match (20), and short enough to finish again (15)."
            >
              <span class="block h-1.5 w-32 rounded-full overflow-hidden" style="background: var(--bg-tertiary);">
                <span class="block h-full rounded-full" style="width: {heroPct}%; background: var(--accent);"></span>
              </span>
              <span class="text-xs font-semibold la-gold-text tabular-nums">{heroPct}% ready</span>
            </span>
          </div>
        </div>
        <div class="flex sm:flex-col gap-2 shrink-0">
          <button class="btn" onclick={() => ctx.setSelected(hm)}>Details</button>
        </div>
      </div>
    </div>
  {/if}

  {#each groups as group (group.key)}
    <section class="space-y-1.5">
      <div class="flex items-center justify-between gap-2">
        <div class="text-xs uppercase tracking-widest la-gold-text">
          {group.title} <span class="tabular-nums" style="color: var(--text-faint);">· {group.picks.length}</span>
        </div>
        {#if group.picks.length > 5}
          <div class="hidden sm:flex items-center gap-1">
            <button class="util-btn" onclick={() => scrollRail(group.key, -1)} aria-label="Scroll {group.title} left"><ChevronLeft size={15} /></button>
            <button class="util-btn" onclick={() => scrollRail(group.key, 1)} aria-label="Scroll {group.title} right"><ChevronRight size={15} /></button>
          </div>
        {/if}
      </div>
      <div class="rail" data-rail={group.key}>
        {#each group.picks as pick (pick.media.id)}
          {@const m = pick.media}
          <button class="rail-card" onclick={() => ctx.setSelected(m)}>
            <div class="relative">
              <img class="rail-cover" style="background: {ctx.coverGradient(m.coverImage.color)};"
                src={m.coverImage.extraLarge ?? m.coverImage.large} alt={m.title.english ?? mainTitle(m)} loading="lazy" />
              <span class="score-badge rail-score">{Math.round(pick.score)}</span>
            </div>
            <div class="pt-1.5 text-xs font-medium leading-tight line-clamp-1">{m.title.english ?? mainTitle(m)}</div>
            <div class="pt-1 flex flex-wrap gap-1">
              {#each chipsFor(pick) as c (c.type)}
                <span class="{chipClass(c.type)} whitespace-nowrap">{c.short}</span>
              {/each}
            </div>
          </button>
        {/each}
      </div>
    </section>
  {/each}
{/if}

<style>
  .rail {
    display: flex;
    gap: 0.625rem;
    overflow-x: auto;
    scroll-snap-type: x proximity;
    scroll-padding-left: 0.25rem;
    padding: 0.125rem 0.25rem 0.5rem;
    scrollbar-width: none;
  }

  .rail::-webkit-scrollbar {
    display: none;
  }

  .rail-card {
    flex: 0 0 auto;
    width: 8.75rem;
    scroll-snap-align: start;
    text-align: left;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    padding: 0.375rem;
    cursor: pointer;
    transition: border-color 0.15s ease, transform 0.15s ease;
  }

  .rail-card:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
  }

  .rail-cover {
    display: block;
    width: 100%;
    aspect-ratio: 2 / 3;
    object-fit: cover;
    border-radius: 0.25rem;
  }

  .rail-score {
    position: absolute;
    right: 0.25rem;
    top: 0.25rem;
  }

  .ready {
    position: relative;
    cursor: help;
  }

  .ready[data-tip]::after {
    content: attr(data-tip);
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    transform: translateY(-2px);
    width: max(20rem, 100%);
    max-width: min(26rem, 85vw);
    white-space: normal;
    text-align: left;
    padding: 6px 8px;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.45;
    color: var(--text-inverse);
    background: var(--text);
    border: 1px solid var(--border);
    border-radius: 4px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.12s ease, transform 0.12s ease;
    z-index: 3000;
  }

  .ready[data-tip]:hover::after {
    opacity: 1;
    transform: translateY(0);
  }
</style>
