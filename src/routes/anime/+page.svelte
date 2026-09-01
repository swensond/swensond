<script lang="ts">
  import { getContext } from 'svelte';
  import { ChevronRight } from '@lucide/svelte';
  import StatCard from '$lib/components/StatCard.svelte';
  import type { AniListMedia, AniListAiringSchedule } from '$lib/types/anime';

  const ctx = getContext<{
    now: Date;
    watched: AniListMedia[];
    watchedSet: Set<number>;
    watchingList: AniListMedia[];
    todayAirings: AniListAiringSchedule[];
    activeAirings: AniListAiringSchedule[];
    progressMap: Record<number, number>;
    lastVisit: number | null;
    selected: AniListMedia | null;
    setSelected: (m: AniListMedia | null) => void;
    selectedTitle: (m: AniListMedia) => string;
    totalEpisodes: (m: AniListMedia) => number;
    maxCatchUp: (m: AniListMedia) => number;
    coverGradient: (color: string | null) => string;
    airingLabel: (a: AniListAiringSchedule) => { text: string; at: string };
    airingDay: (a: AniListAiringSchedule) => string;
    advanceProgress: (id: number) => void;
    statusLabel: (status: string | null) => { text: string; className: string };
    isToday: (secs: number) => boolean;
    formatAiring: (m: AniListMedia) => { text: string; at: string | null };
    isSingleEpisode: (m: AniListMedia) => boolean;
    setProgress: (id: number, ep: number) => void;
    flashMarked: (id: number) => void;
  }>('anime');

  let missedOpen = $state(false);
  let markingIds = $state<Record<number, boolean>>({});

  function flashMarked(id: number): void {
    markingIds = { ...markingIds, [id]: true };
    setTimeout(() => { markingIds = { ...markingIds, [id]: false }; }, 700);
  }

  const progressMap = $derived(ctx.progressMap);
  const watchedSet = $derived(ctx.watchedSet);
  const now = $derived(ctx.now);

  const watchingList = $derived(ctx.watchingList);

  const dashboardEpsWatched = $derived(
    watchingList.reduce((sum, m) => sum + (progressMap[m.id] ?? 0), 0),
  );

  const dashboardAvgScore = $derived((() => {
    const rated = watchingList.filter((m) => m.averageScore != null && m.averageScore > 0);
    if (rated.length === 0) return null;
    return Math.round(rated.reduce((s, m) => s + (m.averageScore ?? 0), 0) / rated.length);
  })());

  const activeAirings = $derived(ctx.activeAirings);

  const missedSinceVisit = $derived(
    ctx.lastVisit === null
      ? []
      : activeAirings
          .filter((a) => a.airingAt * 1000 >= ctx.lastVisit! && a.airingAt * 1000 < +now)
          .filter((a) => (progressMap[a.media.id] ?? 0) < a.episode)
          .sort((a, b) => a.airingAt - b.airingAt),
  );

  const missedByShow = $derived((() => {
    const map = new Map<number, { m: AniListMedia; eps: number[] }>();
    for (const a of missedSinceVisit) {
      const entry = map.get(a.media.id);
      if (entry) entry.eps.push(a.episode);
      else map.set(a.media.id, { m: a.media, eps: [a.episode] });
    }
    return [...map.values()];
  })());

  const todayAirings = $derived(ctx.todayAirings);

  function totalEpisodes(m: AniListMedia): number {
    return m.episodes ?? m.nextAiringEpisode?.episode ?? Number.POSITIVE_INFINITY;
  }

  function maxCatchUp(m: AniListMedia): number {
    if (m.status === 'RELEASING' && m.nextAiringEpisode) return m.nextAiringEpisode.episode - 1;
    return totalEpisodes(m);
  }

  const weekAirings = $derived(
    activeAirings
      .filter((a) => {
        if (ctx.isToday(a.airingAt)) return false;
        const diff = a.airingAt * 1000 - +now;
        return diff > 0 && diff <= 6 * 24 * 60 * 60 * 1000;
      })
      .sort((a, b) => a.airingAt - b.airingAt),
  );

  const weekGroups = $derived(
    weekAirings.reduce(
      (groups, a) => {
        const key = new Date(a.airingAt * 1000).toLocaleDateString(undefined, {
          weekday: 'short', month: 'short', day: 'numeric',
        });
        (groups[key] ??= []).push(a);
        return groups;
      },
      {} as Record<string, AniListAiringSchedule[]>,
    ),
  );

  function continueWatchingSort(m: AniListMedia) {
    const seen = progressMap[m.id] ?? 0;
    const cap = maxCatchUp(m);
    return seen < cap;
  }

  const continueWatching = $derived(
    watchingList
      .filter((m) => {
        if (m.status !== 'RELEASING') return false;
        const seen = progressMap[m.id] ?? 0;
        if (seen <= 0) return false;
        return continueWatchingSort(m);
      })
      .sort((a, b) => {
        const airA = a.nextAiringEpisode?.airingAt ?? Number.POSITIVE_INFINITY;
        const airB = b.nextAiringEpisode?.airingAt ?? Number.POSITIVE_INFINITY;
        return airA - airB || (progressMap[b.id] ?? 0) - (progressMap[a.id] ?? 0) || (b.popularity ?? 0) - (a.popularity ?? 0);
      }),
  );
</script>

<svelte:head>
  <title>Dashboard</title>
</svelte:head>

<style>
  .chevron-icon {
    transition: transform 0.15s;
  }
  .chevron-icon.rotated {
    transform: rotate(90deg);
  }
  .behind-badge {
    background: rgba(214, 100, 74, 0.15);
    border-color: rgba(214, 100, 74, 0.5);
    color: #e89080;
  }
  .progress-track {
    background: rgba(255, 255, 255, 0.08);
  }
  .schedule-row.block {
    display: block;
  }
</style>

<!-- DASHBOARD -->
<div class="h-px" aria-hidden="true"></div>
<div class="card px-4 py-3 flex items-center gap-3">
  <div>
    <div class="la-heading text-lg font-bold la-gold-text">
      {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
    </div>
  </div>
</div>

{#if watchingList.length === 0}
  <div class="card p-6 text-center">
    <div class="text-[#a29e96]">
      No shows picked yet - head to <a href="/anime/seasons/" class="la-gold-text underline">Seasons</a> and tap
      <span class="la-gold-text">+</span> on anything you're watching.
    </div>
  </div>
{:else}
  <!-- STATS -->
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
    <StatCard label="On List" value={watchingList.length} />
    <StatCard label="Episodes Watched" value={dashboardEpsWatched} />
    <StatCard label="Avg Score" value={dashboardAvgScore ?? '—'} />
  </div>

  <!-- SINCE LAST VISIT -->
  {#if missedSinceVisit.length > 0}
    <div class="card border overflow-hidden" style="border-color: rgba(74,222,128,0.25);">
      <button class="w-full px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-left"
        onclick={() => (missedOpen = !missedOpen)} aria-expanded={missedOpen}>
        <ChevronRight size={15} class="chevron-icon shrink-0 {missedOpen ? 'rotated' : ''}" color="var(--la-green-bright)" />
        <span class="text-xs uppercase tracking-widest shrink-0" style="color: var(--la-text-muted);">Since your last visit</span>
        <span class="text-[11px] tabular-nums ml-auto whitespace-nowrap" style="color: var(--la-green-bright);">
          Missed {missedSinceVisit.length} episode{missedSinceVisit.length === 1 ? '' : 's'}
        </span>
      </button>
      {#if missedOpen}
        <div class="px-4 pb-3 border-t" style="border-color: var(--la-border);">
          <div class="space-y-1 pt-2">
            {#each missedByShow as entry (entry.m.id)}
              {@const m = entry.m}
              {@const eps = entry.eps}
              <a href={`/anime/${m.id}/`}
                class="schedule-row block">
                <img class="schedule-cover" style="background: {ctx.coverGradient(m.coverImage.color)};"
                  src={m.coverImage.extraLarge ?? m.coverImage.large} alt="" loading="lazy" />
                <div class="flex-1 min-w-0">
                  <div class="text-[13px] font-medium leading-tight line-clamp-1">{ctx.selectedTitle(m)}</div>
                  <div class="text-[11px] mt-0.5 tabular-nums" style="color: var(--la-text-muted);">
                    {eps.length} episode{eps.length === 1 ? '' : 's'} missed - Ep {eps.join(', ')}
                  </div>
                </div>
              </a>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- CONTINUE WATCHING -->
  {#if continueWatching.length > 0}
    <div class="space-y-2">
      <div class="text-xs uppercase tracking-widest" style="color: var(--la-text-muted);">Started Watching</div>
      <div class="flex gap-3 snap-x overflow-x-auto pb-1">
        {#each continueWatching as m (m.id)}
          {@const seen = progressMap[m.id] ?? 0}
          {@const total = totalEpisodes(m)}
          {@const pct = total === Number.POSITIVE_INFINITY ? 0 : Math.min(100, Math.round((seen / total) * 100))}
          <a href={`/anime/${m.id}/`}
            class="card shrink-0 w-64 flex gap-3 p-2 cursor-pointer snap-start">
            <img class="w-10 h-14 shrink-0 rounded-sm object-cover"
              style="background: {ctx.coverGradient(m.coverImage.color)};"
              src={m.coverImage.extraLarge ?? m.coverImage.large} alt="" loading="lazy" />
            <div class="min-w-0 flex-1">
              <div class="text-[13px] font-medium leading-tight line-clamp-1">{ctx.selectedTitle(m)}</div>
              <div class="text-[11px] mt-0.5 tabular-nums" style="color: var(--la-text-muted);">
                Ep {seen}{#if total !== Number.POSITIVE_INFINITY} / {total}{/if}{#if m.nextAiringEpisode} · next {m.nextAiringEpisode.episode}{/if}
              </div>
              <div class="mt-1.5 h-1 rounded-full overflow-hidden progress-track">
                <div class="h-full rounded-full" style="width: {pct}%; background: var(--la-accent);"></div>
              </div>
              <div class="flex items-center gap-2 mt-1.5">
                <span class="badge {ctx.statusLabel(m.status).className}">{ctx.statusLabel(m.status).text}</span>
                <button class="btn shrink-0 ml-auto px-2 py-0.5 text-[11px]"
                  onclick={(e) => { e.preventDefault(); e.stopPropagation(); ctx.advanceProgress(m.id); flashMarked(m.id); }}>
                  +1
                </button>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </div>
  {/if}

  <!-- AIRING TODAY -->
  {#if todayAirings.length > 0}
    <div class="space-y-2">
      <div class="flex items-baseline gap-2">
        <div class="text-xs uppercase tracking-widest" style="color: var(--la-text-muted);">Airing Today</div>
        <div class="text-[11px] tabular-nums" style="color: var(--la-text-faint);">
          {todayAirings.length} episode{todayAirings.length === 1 ? '' : 's'}
        </div>
      </div>
      <div class="space-y-1">
        {#each todayAirings as a (a.media.id)}
          {@const m = a.media}
          {@const label = ctx.airingLabel(a)}
          {@const aired = a.episode}
          {@const seen = progressMap[m.id] ?? 0}
          {@const caughtUp = seen >= aired}
          <a href={`/anime/${m.id}/`} class="schedule-row">
            <img class="schedule-cover" style="background: {ctx.coverGradient(m.coverImage.color)};"
              src={m.coverImage.extraLarge ?? m.coverImage.large} alt="" loading="lazy" />
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium leading-tight line-clamp-1">{ctx.selectedTitle(m)}</div>
              <div class="text-xs mt-0.5 flex items-center flex-wrap gap-x-3" style="color: var(--la-text-muted);">
                <span class="tabular-nums">{label.text}</span>
                <span class="tabular-nums">{label.at}</span>
                <span class="badge {ctx.statusLabel(m.status).className} shrink-0">{ctx.statusLabel(m.status).text}</span>
                {#if !caughtUp}
                    <span class="badge behind-badge shrink-0">
                      {seen === 0 ? 'Not started' : `${aired - seen} episode${aired - seen === 1 ? '' : 's'} behind`}
                    </span>
                {/if}
              </div>
            </div>
            <button class="btn shrink-0 px-2 py-0.5 text-[11px] flex items-center justify-center gap-1 w-16"
              class:disabled={caughtUp || markingIds[m.id]}
              disabled={caughtUp || markingIds[m.id]}
              onclick={(e) => { e.preventDefault(); e.stopPropagation(); ctx.advanceProgress(m.id); flashMarked(m.id); }}>
              {#if markingIds[m.id]}<span class="spinner" aria-hidden="true"></span>{:else}Watched{/if}
            </button>
          </a>
        {/each}
      </div>
    </div>
  {/if}

  <!-- COMING UP -->
  {#if weekAirings.length > 0}
    <div class="space-y-3">
      <div class="flex items-baseline gap-2">
        <div class="text-xs uppercase tracking-widest" style="color: var(--la-text-muted);">Coming Up</div>
        <div class="text-[11px] tabular-nums" style="color: var(--la-text-faint);">
          {weekAirings.length} episode{weekAirings.length === 1 ? '' : 's'}
        </div>
      </div>
      {#each Object.entries(weekGroups) as [day, list] (day)}
        <div class="space-y-1">
          <div class="text-xs uppercase tracking-widest pt-1 first:pt-0" style="color: var(--la-text-muted);">{day}</div>
          {#each list as a (a.airingAt)}
            {@const m = a.media}
            {@const label = ctx.airingLabel(a)}
            <a href={`/anime/${m.id}/`} class="schedule-row">
              <img class="schedule-cover" style="background: {ctx.coverGradient(m.coverImage.color)};"
                src={m.coverImage.extraLarge ?? m.coverImage.large} alt="" loading="lazy" />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium leading-tight line-clamp-1">{ctx.selectedTitle(m)}</div>
                <div class="text-xs mt-0.5 flex items-center flex-wrap gap-x-3" style="color: var(--la-text-muted);">
                  <span class="tabular-nums">{label.text}</span>
                  <span class="tabular-nums">{label.at}</span>
                  <span class="badge {ctx.statusLabel(m.status).className} shrink-0">{ctx.statusLabel(m.status).text}</span>
                </div>
              </div>
            </a>
          {/each}
        </div>
      {/each}
    </div>
  {/if}
{/if}
