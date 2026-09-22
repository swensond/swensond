<script lang="ts">
  import './theme.css';

  import {
    CALENDAR_AHEAD_MS,
    CALENDAR_BACK_MS,
    clearCalendarCache,
    clearWatchedCache,
    currentSeason,
    fetchAiringSchedulesRaw,
    fetchWatchedMediaRaw,
    loadAiringCalendar,
    loadMediaById,
    loadWatchedMedia,
    mainTitle,
    purgeStaleMediaCache,
    saveAiringCalendarCache,
    saveWatchedMediaCache,
    statusLabel,
    formatAiring,
    formatLabel,
    dateLabel,
    sourceLabel,
    studioNames,
    relationSummary,
  } from '$lib/api/anilist';
  import AnimeInfographic from '$lib/components/AnimeInfographic.svelte';
  import { portal } from '$lib/actions/portal';
  import { Bell, ChevronLeft, ChevronRight, Download, ImageDown, Link, RefreshCw, X } from '@lucide/svelte';
  import {
    advanceProgress,
    applySharedList,
    extractList,
    progress,
    serializeShareUrl,
    setProgress,
    toggleWatch,
    watchlist,
  } from '$lib/stores/watchlist';
  import type { ProgressMap, SharedList } from '$lib/stores/watchlist';
  import { safeDescriptions } from '$lib/utils/html';
  import type {
    AniListAiringSchedule,
    AniListMedia,
    AniListRelationEdge,
    AniListRelationNode,
    AniListSeason,
  } from '$lib/types/anime';
  import { page } from '$app/stores';
  import { setContext } from 'svelte';

  let { children } = $props();

  /* ── Shared state ── */

  let now = $state(new Date());
  let watched = $state<AniListMedia[]>([]);
  let watchedLoading = $state(false);
  let watchedError = $state<string | null>(null);
  let watchReload = $state(0);
  let airings = $state<AniListAiringSchedule[]>([]);
  let calendarReload = $state(0);
  let selected = $state<AniListMedia | null>(null);
  let detailPending = $state(false);

  let watchedLoaded = false;
  let watchedIdsRef: number[] = [];
  let watchReloadRef = 0;
  let calendarLoaded = false;
  let calendarIdsRef: number[] = [];
  let calendarReloadRef = 0;
  let watchedRequestId = 0;
  let calendarRequestId = 0;
  let selectedRequestId = 0;
  const upgradedIds = new Set<number>();
  let prevSelectedId = $state<number | null>(null);

  const progressMap = $derived($progress);
  const watchedSet = $derived(new Set($watchlist));
  const watchingList = $derived(
    [...$watchlist]
      .map((id) => watched.find((m) => m.id === id))
      .filter((m): m is AniListMedia => m !== undefined),
  );

  const activeAirings = $derived(airings.filter((a) => watchedSet.has(a.media.id)));
  const todayAirings = $derived(
    activeAirings.filter((a) => isToday(a.airingAt)).sort((a, b) => a.airingAt - b.airingAt),
  );

  /* ── Detail modal upgrade effect ── */

  $effect(() => {
    if (selected && selected.id !== prevSelectedId) {
      prevSelectedId = selected.id;
      upgradedIds.clear();
    }
  });

  $effect(() => {
    const m = selected;
    if (!m) return;
    const hasRelations = Array.isArray(m.relations?.edges) && m.relations.edges.length > 0;
    if (hasRelations) return;
    if (upgradedIds.has(m.id)) return;
    const id = ++selectedRequestId;
    detailPending = true;
    loadMediaById(m.id)
      .then(async (full) => {
        if (id !== selectedRequestId || selected?.id !== m.id) return;
        upgradedIds.add(m.id);
        selected = (await safeDescriptions([full]))[0];
        detailPending = false;
      })
      .catch(() => { if (id === selectedRequestId) detailPending = false; });
  });

  const selectedRelations = $derived(
    selected
      ? (selected.relations?.edges ?? [])
          .filter((e): e is AniListRelationEdge =>
            e.node.type === 'ANIME' && (e.relationType === 'PREQUEL' || e.relationType === 'SEQUEL'))
          .sort((a, b) => {
            const rank = { PREQUEL: 0, SEQUEL: 1 } as Record<string, number>;
            return (rank[a.relationType ?? ''] ?? 2) - (rank[b.relationType ?? ''] ?? 2);
          })
      : [],
  );

  $effect(() => {
    const { body } = document;
    if (selected || infographicOpen || shareOpen) body.style.overflow = 'hidden';
    return () => { body.style.overflow = ''; };
  });

  let prevPath = $state('');
  $effect(() => {
    const path = $page.url.pathname;
    if (prevPath && prevPath !== path && selected) selected = null;
    prevPath = path;
  });

  /* ── Infographic / share / import ── */

  let importOpen = $state(false);
  let infographicOpen = $state(false);
  let shareOpen = $state(false);
  let shareScope = $state<'all' | 'season'>('all');
  let shareSeason = $state(currentSeason());
  let importText = $state('');
  let importError = $state<string | null>(null);
  let shareCopied = $state(false);
  let shareName = $state('');
  let pendingShare = $state<SharedList | null>(null);
  let sharedMedia = $state<AniListMedia[]>([]);
  let sharedLoading = $state(false);
  let sharedError = $state<string | null>(null);

  /* ── Notifications ── */

  let alertsEnabled = $state(false);
  const alertsSupported = typeof Notification !== 'undefined';
  const LAST_VISIT_KEY = 'anime-watch-tool-last-visit';
  let lastVisit = $state<number | null>(null);
  let lastVisitStamp = $state<number | null>(null);

  /* ── Nav ── */

  let navHeight = $state(56);
  let navRef = $state<HTMLElement | null>(null);

  $effect(() => {
    const el = navRef;
    if (!el) return;
    const measure = () => { navHeight = el.offsetHeight; };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  });

  /* ── Clock ── */

  $effect(() => {
    const t = setInterval(() => { now = new Date(); checkAiringAlerts(); }, 30_000);
    return () => clearInterval(t);
  });

  /* ── Init ── */

  $effect(() => {
    if (typeof window === 'undefined') return;
    void purgeStaleMediaCache();
    try { alertsEnabled = localStorage.getItem('anime-watch-tool-alerts-v1') === '1'; } catch { alertsEnabled = false; }
    const params = new URLSearchParams(window.location.search);
    const code = params.get('list');
    if (code) {
      const data = extractList(window.location.href);
      if (data && data.ids.length > 0) pendingShare = data;
    }
    try { lastVisit = Number(localStorage.getItem(LAST_VISIT_KEY)) || null; } catch { lastVisit = null; }
  });

  $effect(() => {
    if (typeof window === 'undefined' || lastVisitStamp) return;
    lastVisitStamp = +now;
    try { localStorage.setItem(LAST_VISIT_KEY, String(lastVisitStamp)); } catch {}
  });

  /* ── Shared-list preview ── */

  $effect(() => {
    const data = pendingShare;
    if (!data) return;
    sharedLoading = true;
    sharedError = null;
    loadWatchedMedia(data.ids)
      .then(async (list) => {
        if (data !== pendingShare) return;
        const ordered = data.ids.map((id) => list.find((m) => m.id === id)).filter((m): m is AniListMedia => m !== undefined);
        sharedMedia = await safeDescriptions(ordered);
        sharedLoading = false;
      })
      .catch((e) => { if (data === pendingShare) { sharedError = e instanceof Error ? e.message : String(e); sharedLoading = false; } });
  });

  /* ── Watchlist data ── */

  $effect(() => {
    const ids = $watchlist;
    const reloadBumped = watchReload !== watchReloadRef;
    watchReloadRef = watchReload;
    const prev = watchedIdsRef;
    const added = ids.filter((id) => !prev.includes(id));
    const removed = prev.filter((id) => !ids.includes(id));
    watchedIdsRef = ids;
    const id = ++watchedRequestId;

    if (ids.length === 0) { watched = []; watchedError = null; watchedLoading = false; watchedLoaded = true; return; }

    if (!reloadBumped && watchedLoaded && added.length === 1 && removed.length === 0) {
      watchedLoading = false; watchedError = null;
      fetchWatchedMediaRaw(added).then(async (list) => {
        if (id !== watchedRequestId) return;
        watched = [...watched.filter((m) => m.id !== added[0]), ...(await safeDescriptions(list))];
        saveWatchedMediaCache(ids, watched);
      }).catch((e) => { if (id === watchedRequestId) watchedError = e instanceof Error ? e.message : String(e); });
      return;
    }

    if (!reloadBumped && watchedLoaded && added.length === 0 && removed.length === 1) {
      watchedError = null; saveWatchedMediaCache(ids, watched); return;
    }

    if (!reloadBumped && watchedLoaded && added.length === 0 && removed.length === 0) return;

    watchedLoading = true; watchedError = null;
    loadWatchedMedia(ids).then(async (list) => {
      if (id !== watchedRequestId) return;
      watched = await safeDescriptions(list); watchedLoaded = true; watchedLoading = false;
    }).catch((e) => { if (id === watchedRequestId) { watchedError = e instanceof Error ? e.message : String(e); watchedLoading = false; } });
  });

  /* ── Calendar data ── */

  $effect(() => {
    const ids = $watchlist;
    void calendarReload;
    const reloadBumped = calendarReload !== calendarReloadRef;
    calendarReloadRef = calendarReload;
    const from = Math.floor((Date.now() - CALENDAR_BACK_MS) / 1000);
    const to = Math.floor((Date.now() + CALENDAR_AHEAD_MS) / 1000);
    const prev = calendarIdsRef;
    const added = ids.filter((id) => !prev.includes(id));
    const removed = prev.filter((id) => !ids.includes(id));
    calendarIdsRef = ids;
    const id = ++calendarRequestId;

    if (ids.length === 0) { airings = []; calendarLoaded = true; return; }

    if (!reloadBumped && calendarLoaded && added.length === 1 && removed.length === 0) {
      fetchAiringSchedulesRaw(added, from, to).then(async (list) => {
        if (id !== calendarRequestId) return;
        const mediaMap = new Map((await safeDescriptions(list.map((a) => a.media))).map((m) => [m.id, m]));
        airings = [...airings.filter((a) => a.media.id !== added[0]), ...list.map((a) => ({ ...a, media: mediaMap.get(a.media.id) ?? a.media }))];
        saveAiringCalendarCache(ids, from, airings);
      }).catch(() => {});
      return;
    }

    if (!reloadBumped && calendarLoaded && added.length === 0 && removed.length <= 1) return;

    loadAiringCalendar(ids, from, to).then(async (list) => {
      if (id !== calendarRequestId) return;
      const mediaMap = new Map((await safeDescriptions(list.map((a) => a.media))).map((m) => [m.id, m]));
      airings = list.map((a) => ({ ...a, media: mediaMap.get(a.media.id) ?? a.media }));
      calendarLoaded = true;
    }).catch(() => {});
  });

  /* ── Helpers ── */

  function selectedTitle(m: AniListMedia): string { return m.title.english ?? mainTitle(m); }
  function totalEpisodes(m: AniListMedia): number { return m.episodes ?? m.nextAiringEpisode?.episode ?? Number.POSITIVE_INFINITY; }
  function isSingleEpisode(m: AniListMedia): boolean { return m.format === 'MOVIE' || totalEpisodes(m) === 1; }
  function maxCatchUp(m: AniListMedia): number {
    if (m.status === 'RELEASING' && m.nextAiringEpisode) return m.nextAiringEpisode.episode - 1;
    return totalEpisodes(m);
  }
  function isCompletedByMe(m: AniListMedia): boolean {
    const total = totalEpisodes(m);
    return total !== Number.POSITIVE_INFINITY && (progressMap[m.id] ?? 0) >= total;
  }
  function coverGradient(color: string | null): string {
    if (!color) return 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(11,10,14,0) 70%)';
    return `linear-gradient(180deg, ${color}14 0%, ${color}55 45%, #0b0a0e 92%)`;
  }
  function isToday(secs: number): boolean {
    const d = new Date(secs * 1000);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }
  function airTime(secs: number): string {
    return new Date(secs * 1000).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  function airingLabel(a: AniListAiringSchedule): { text: string; at: string } {
    const at = new Date(a.airingAt * 1000);
    const atStr = at.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    const mins = Math.round((a.airingAt * 1000 - +now) / 60000);
    if (mins >= 0) {
      const h = Math.floor(mins / 60); const m = mins % 60;
      return { text: h > 0 ? `Ep ${a.episode} in ${h}h ${m}m` : `Ep ${a.episode} in ${m}m`, at: atStr };
    }
    return { text: `Aired ${at.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`, at: atStr };
  }
  function seasonOfMonth(month: number | null): AniListSeason | null {
    if (!month) return null;
    if (month <= 3) return 'WINTER'; if (month <= 6) return 'SPRING'; if (month <= 9) return 'SUMMER'; return 'FALL';
  }
  function draftFromNode(n: AniListRelationNode): AniListMedia {
    return {
      id: n.id, idMal: null, title: n.title,
      coverImage: { extraLarge: n.coverImage?.large ?? null, large: n.coverImage?.large ?? null, color: n.coverImage?.color ?? null },
      bannerImage: null, description: null, format: n.format, episodes: null, duration: null, status: n.status,
      averageScore: n.averageScore, popularity: n.popularity, genres: [], studios: { nodes: [] },
      startDate: n.startDate ?? { year: null, month: null, day: null }, endDate: null, nextAiringEpisode: null,
      trailer: null, source: null, isAdult: false,
    };
  }
  async function openRecommended(n: AniListRelationNode): Promise<void> { selected = draftFromNode(n); }
  function retryWatched() { clearWatchedCache($watchlist); watchReload++; }
  function retryCalendar() { const from = Math.floor((Date.now() - CALENDAR_BACK_MS) / 1000); clearCalendarCache($watchlist, from); calendarReload++; }
  function refreshCurrent() { retryWatched(); retryCalendar(); }

  /* ── Notifications ── */

  async function toggleAlerts() {
    if (!('Notification' in window)) return;
    if (alertsEnabled) { alertsEnabled = false; persistAlerts(); return; }
    const p = Notification.requestPermission ? await Notification.requestPermission() : undefined;
    if (p !== 'granted') return;
    alertsEnabled = true; persistAlerts(); checkAiringAlerts(true);
  }
  function persistAlerts() { try { localStorage.setItem('anime-watch-tool-alerts-v1', alertsEnabled ? '1' : '0'); } catch {} }
  function checkAiringAlerts(force = false) {
    if (!alertsEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;
    if (airings.length === 0 || todayAirings.length === 0) return;
    const today = new Date();
    const dayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const storageKey = `anime-watch-tool-notified-${dayKey}`;
    let notified = new Set<string>();
    try { notified = new Set(JSON.parse(localStorage.getItem(storageKey) ?? '[]')); } catch {}
    const notify = (tag: string, title: string, body: string) => { try { new Notification(title, { body, tag }); } catch {} notified.add(tag); };
    if (force) {
      const upcoming = todayAirings.filter((a) => a.airingAt * 1000 >= +now);
      if (upcoming.length > 0) {
        const names = upcoming.slice(0, 3).map((a) => selectedTitle(a.media)).join(', ');
        notify(`today-${dayKey}`, `${upcoming.length} episode${upcoming.length === 1 ? '' : 's'} airing today`, names + (upcoming.length > 3 ? '…' : ''));
      }
      return;
    }
    for (const a of todayAirings) {
      const mins = Math.round((a.airingAt * 1000 - +now) / 60000);
      if (mins < 0 || mins > 120) continue;
      const tag = `ep-${a.id}-${dayKey}`;
      if (notified.has(tag)) continue;
      notify(tag, selectedTitle(a.media), `Episode ${a.episode} airs at ${airTime(a.airingAt)} - in ${mins} min`);
    }
    try { localStorage.setItem(storageKey, JSON.stringify([...notified])); } catch {}
  }

  /* ── Share / import ── */

  function buildShareUrl(): string {
    const ids = shareScope === 'all' ? $watchlist : scopedShareMedia.map((m) => m.id);
    const prog: ProgressMap = {};
    for (const id of ids) { const seen = $progress[id] ?? 0; if (seen > 0) prog[id] = seen; }
    return serializeShareUrl(ids, prog, shareName.trim() || undefined);
  }
  async function copyShareLink() {
    const url = buildShareUrl();
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); }
    else { const ta = document.createElement('textarea'); ta.value = url; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    shareCopied = true; setTimeout(() => (shareCopied = false), 2000);
  }
  const scopedShareMedia = $derived(
    watched.filter((m) => {
      const { year, month } = m.startDate ?? {};
      return year === shareSeason.seasonYear && month != null && seasonOfMonth(month) === shareSeason.season;
    }),
  );
  function clearShareParam() {
    const url = new URL(window.location.href);
    if (url.searchParams.has('list')) { url.searchParams.delete('list'); window.history.replaceState({}, '', url); }
  }
  function applyShare(data: SharedList) {
    applySharedList(data); pendingShare = null; importOpen = false; importText = ''; importError = null; clearShareParam(); retryWatched(); retryCalendar();
  }
  function confirmShare() { if (pendingShare) applyShare(pendingShare); }
  function mergeShare() {
    if (!pendingShare) return;
    const currentIds = new Set($watchlist);
    const mergedIds = [...$watchlist];
    for (const id of pendingShare.ids) { if (!currentIds.has(id)) mergedIds.push(id); }
    applySharedList({ ids: mergedIds, progress: { ...$progress, ...pendingShare.progress } });
    pendingShare = null; importOpen = false; clearShareParam(); retryWatched(); retryCalendar();
  }
  function dismissShare() { pendingShare = null; clearShareParam(); }
  function runImport() {
    const data = extractList(importText);
    if (!data || data.ids.length === 0) { importError = 'Could not read a valid list from that. Paste a share link.'; return; }
    applyShare(data);
  }

  /* ── Context for children ── */

  setContext('anime', {
    get now() { return now; },
    get watched() { return watched; },
    get watchedLoading() { return watchedLoading; },
    get watchedError() { return watchedError; },
    get watchReload() { return watchReload; },
    get airings() { return airings; },
    get calendarReload() { return calendarReload; },
    get progressMap() { return progressMap; },
    get watchedSet() { return watchedSet; },
    get watchingList() { return watchingList; },
    get activeAirings() { return activeAirings; },
    get todayAirings() { return todayAirings; },
    get selected() { return selected; },
    setSelected(v: AniListMedia | null) { selected = v; },
    get detailPending() { return detailPending; },
    get selectedRelations() { return selectedRelations; },
    get navHeight() { return navHeight; },
    get alertsEnabled() { return alertsEnabled; },
    get alertsSupported() { return alertsSupported; },
    get pendingShare() { return pendingShare; },
    get sharedMedia() { return sharedMedia; },
    get sharedLoading() { return sharedLoading; },
    get sharedError() { return sharedError; },
    get shareCopied() { return shareCopied; },
    get shareName() { return shareName; },
    get shareScope() { return shareScope; },
    get shareSeason() { return shareSeason; },
    get importText() { return importText; },
    get importError() { return importError; },
    get importOpen() { return importOpen; },
    get infographicOpen() { return infographicOpen; },
    get shareOpen() { return shareOpen; },
    get lastVisit() { return lastVisit; },
    get lastVisitStamp() { return lastVisitStamp; },
    get openRecommended() { return openRecommended; },
    get retryWatched() { return retryWatched; },
    get retryCalendar() { return retryCalendar; },
    get refreshCurrent() { return refreshCurrent; },
    get advanceProgress() { return advanceProgress; },
    get setProgress() { return setProgress; },
    get toggleWatch() { return toggleWatch; },
    get selectedTitle() { return selectedTitle; },
    get totalEpisodes() { return totalEpisodes; },
    get isSingleEpisode() { return isSingleEpisode; },
    get maxCatchUp() { return maxCatchUp; },
    get isCompletedByMe() { return isCompletedByMe; },
    get coverGradient() { return coverGradient; },
    get isToday() { return isToday; },
    get airTime() { return airTime; },
    get airingLabel() { return airingLabel; },
    get seasonOfMonth() { return seasonOfMonth; },
    get statusLabel() { return statusLabel; },
    get formatAiring() { return formatAiring; },
    get formatLabel() { return formatLabel; },
    get dateLabel() { return dateLabel; },
    get sourceLabel() { return sourceLabel; },
    get studioNames() { return studioNames; },
    get relationSummary() { return relationSummary; },
    get watchlistStore() { return watchlist; },
    get progressStore() { return progress; },
  });
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') selected = null; }} />

<div class="anime-app min-h-screen flex flex-col">
    <main class="flex-1">
        <section class="space-y-4">
  <!-- NAV TABS -->
  <nav bind:this={navRef} class="sticky top-0 z-30 border-b flex gap-1 flex-wrap items-center -mt-8 -mx-8 px-8"
    style="border-color: rgba(255,255,255,0.12);">
    <a href="/anime/" class="tab" class:active={$page.url.pathname.replace(/\/$/, '') === '/anime'}>Dashboard</a>
    <a href="/anime/seasons/" class="tab" class:active={$page.url.pathname.startsWith('/anime/seasons')}>Seasons</a>
    <a href="/anime/recommendations/" class="tab" class:active={$page.url.pathname.startsWith('/anime/recommendations')}>Recommendations</a>
    <a href="/anime/rewatch/" class="tab" class:active={$page.url.pathname.startsWith('/anime/rewatch')}>Rewatch</a>
    <a href="/anime/backlog/" class="tab" class:active={$page.url.pathname.startsWith('/anime/backlog')}>Backlog</a>
    <a href="/anime/list/" class="tab" class:active={$page.url.pathname.startsWith('/anime/list')}>My List ({$watchlist.length})</a>

    <div class="flex items-center gap-1 ml-auto">
      {#if alertsSupported}
        <button class="util-btn" class:on={alertsEnabled} onclick={toggleAlerts}
          data-tip={alertsEnabled ? 'Turn off airing alerts' : 'Airing alerts'}
          aria-label={alertsEnabled ? 'Turn off airing alerts' : 'Turn on airing alerts'}>
          <Bell size={15} />
        </button>
      {/if}
      <button class="util-btn" class:on={shareOpen}
        onclick={() => { if (!shareName.trim()) { try { shareName = localStorage.getItem('anime-watch-tool-infographic-name') ?? ''; } catch { shareName = ''; } } shareOpen = true; }}
        data-tip="Share options" aria-label="Open share options">
        <Link size={15} />
      </button>
      <button class="util-btn" class:on={importOpen} onclick={() => (importOpen = !importOpen)}
        data-tip="Import list" aria-label="Import a list from a share link">
        <Download size={15} />
      </button>
      <button class="util-btn" class:on={infographicOpen} onclick={() => (infographicOpen = !infographicOpen)}
        data-tip="Infographic" aria-label="Open your season infographic card">
        <ImageDown size={15} />
      </button>
      <button class="util-btn" onclick={refreshCurrent} data-tip="Refresh" aria-label="Refresh the current view">
        <RefreshCw size={15} />
      </button>
    </div>
  </nav>

  {#if pendingShare}
    <!-- SHARED LIST VIEW -->
    <div class="card px-4 py-3 flex items-center gap-3">
      <div>
        <div class="text-xs uppercase tracking-widest" style="color: var(--text-muted);">Shared List</div>
        <div class="la-heading text-lg font-bold la-gold-text">
          {pendingShare.ids.length} show{pendingShare.ids.length === 1 ? '' : 's'}
          {#if pendingShare.from}<span class="text-sm font-normal">- shared by {pendingShare.from}</span>{/if}
        </div>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <button class="btn" onclick={mergeShare}>Merge into my list</button>
      <button class="btn" onclick={confirmShare}>Replace my list</button>
      <button class="btn" onclick={dismissShare}>Dismiss</button>
    </div>
    {#if sharedLoading}
      <div class="anime-grid">
        {#each Array(6) as _}
          <div class="space-y-1.5"><div class="aspect-[2/3] skeleton rounded-sm"></div><div class="h-3.5 w-3/4 skeleton rounded"></div></div>
        {/each}
      </div>
    {:else if sharedMedia.length > 0}
      <div class="anime-grid">
        {#each sharedMedia as m (m.id)}
          {@const title = m.title.english ?? mainTitle(m)}
          <div class="anime-card group" role="button" tabindex="0"
            onclick={() => (selected = m)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selected = m; } }}>
            <div class="relative aspect-[2/3] overflow-hidden" style="background: {coverGradient(m.coverImage.color)};">
              <img class="h-full w-full object-cover" src={m.coverImage.extraLarge ?? m.coverImage.large} alt={title} loading="lazy" />
              <span class="badge {statusLabel(m.status).className} absolute left-1.5 top-1.5">{statusLabel(m.status).text}</span>
            </div>
            <div class="p-2.5"><div class="text-sm font-medium line-clamp-2">{title}</div></div>
          </div>
        {/each}
      </div>
    {/if}
  {:else}
    {#if importOpen}
      <div class="card px-4 py-3 space-y-2">
        <div class="text-xs" style="color: var(--text-muted);">Paste a share link to replace your current list.</div>
        <div class="flex flex-wrap gap-2">
          <input class="input flex-1 min-w-48" placeholder="https://…/?list=210031,184951:12" bind:value={importText}
            onkeydown={(e) => { if (e.key === 'Enter') runImport(); }} />
          <button class="btn" onclick={runImport}>Apply</button>
        </div>
        {#if importError}<div class="text-xs" style="color: var(--red);">{importError}</div>{/if}
      </div>
    {/if}
    {@render children()}
  {/if}
        </section>
    </main>
</div>

<!-- DETAIL MODAL -->
{#if selected}
  <div use:portal class="fixed inset-0 z-[9999] overflow-y-auto"
    style="background: rgba(0,0,0,0.78); backdrop-filter: blur(4px); overscroll-behavior: contain;">
    <div class="flex min-h-full items-center justify-center p-4" role="presentation"
      onclick={(e) => { if (e.target === e.currentTarget) selected = null; }}>
      <div class="card w-full max-w-2xl my-6 flex flex-col max-h-[90vh]" role="dialog" aria-modal="true">
        {#if selected.bannerImage}
          <div class="relative h-40 sm:h-52 shrink-0">
            <img class="h-full w-full object-cover" style="background: {coverGradient(selected.coverImage.color)};"
              src={selected.bannerImage} alt="" />
            <div class="absolute inset-0" style="background: linear-gradient(to top, var(--panel), transparent);"></div>
          </div>
        {/if}
        <div class="px-5 pt-6 pb-4 space-y-4 overflow-y-auto flex-1 min-h-0">
          <div class="flex gap-4">
            <img class="w-24 h-36 rounded-sm object-cover border shrink-0"
              style="background: {coverGradient(selected.coverImage.color)}; border-color: var(--border-strong); box-shadow: 0 8px 24px rgba(0,0,0,0.6);"
              src={selected.coverImage.extraLarge ?? selected.coverImage.large} alt="" />
            <div class="min-w-0 pt-1">
              <h2 class="la-heading text-2xl font-bold leading-tight">{selected.title.english ?? mainTitle(selected)}</h2>
              {#if selected.title.romaji && selected.title.romaji !== (selected.title.english ?? mainTitle(selected))}
                <div class="text-sm mt-0.5" style="color: var(--text-muted);">{selected.title.romaji}</div>
              {/if}
              {#if selected.title.native}
                <div class="text-xs mt-0.5" style="color: var(--text-faint);">{selected.title.native}</div>
              {/if}
            </div>
          </div>
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs" style="color: var(--text-muted);">
            <span>{formatLabel(selected.format)}{#if selected.episodes} · {selected.episodes} eps{/if}{#if selected.duration} · {selected.duration}m{/if}</span>
            <span>{selected.startDate?.year ? dateLabel(selected.startDate) : '-'}{#if selected.endDate?.year} → {dateLabel(selected.endDate)}{/if}</span>
            <span>Score: <span class="la-gold-text font-semibold">{selected.averageScore ?? '-'}</span> · Pop: {selected.popularity?.toLocaleString() ?? '-'}</span>
            <span>Studio: {studioNames(selected)}</span>
            <span>Source: {sourceLabel(selected.source)}</span>
          </div>
          {#if detailPending}<div class="text-xs" style="color: var(--text-faint);">Loading full details…</div>{/if}
          {#if selected.nextAiringEpisode}
            {@const air = formatAiring(selected)}
            <div class="text-xs font-semibold" style="color: var(--accent-bright);">{air.text} {#if air.at}· airs {air.at}{/if}</div>
          {/if}
          {#if selectedRelations.length > 0}
            <div class="space-y-1.5">
              <div class="text-xs uppercase tracking-widest" style="color: var(--text-muted);">Prequels & Sequels</div>
              <div class="space-y-2">
                {#each selectedRelations as e (e.node.id)}
                  {@const n = e.node}
                  {@const rn = statusLabel(n.status)}
                  <button class="schedule-row w-full text-left" onclick={() => openRecommended(n)}>
                    <img class="schedule-cover" style="background: {coverGradient(n.coverImage?.color ?? null)};"
                      src={n.coverImage?.large ?? ''} alt="" loading="lazy" />
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium line-clamp-1">{n.title.english ?? n.title.romaji}</div>
                      <div class="text-xs mt-0.5 flex items-center gap-2" style="color: var(--text-muted);">
                        <span class="la-gold-text">{e.relationType === 'PREQUEL' ? 'Prequel' : 'Sequel'}</span>
                        <span class="badge {rn.className}">{rn.text}</span>
                        {#if progressMap[n.id]}<span class="badge b-progress">{progressMap[n.id]}ep</span>{/if}
                        {#if watchedSet.has(n.id)}<span class="la-gold-text">✓</span>{/if}
                      </div>
                    </div>
                    {#if n.averageScore}<span class="score-badge">{n.averageScore}</span>{/if}
                  </button>
                {/each}
              </div>
            </div>
          {/if}
          {#if watchedSet.has(selected.id)}
            {@const seen = progressMap[selected.id] ?? 0}
            {@const total = totalEpisodes(selected)}
            {@const cap = maxCatchUp(selected)}
            {@const atCap = cap !== Number.POSITIVE_INFINITY && seen >= cap}
            {@const pct = total === Number.POSITIVE_INFINITY ? 0 : Math.min(100, Math.round((seen / total) * 100))}
            <div class="space-y-1.5">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs uppercase tracking-widest" style="color: var(--text-muted);">Progress</span>
                <span class="text-sm font-semibold tabular-nums">{seen}{#if total !== Number.POSITIVE_INFINITY} <span class="opacity-60">/ {total}</span>{/if}</span>
                <button class="btn px-2 py-0.5" disabled={atCap} onclick={() => setProgress(selected.id, Math.min(seen + 1, cap))}>+1</button>
                <button class="btn px-2 py-0.5" onclick={() => setProgress(selected.id, seen - 1)}>−1</button>
                {#if !atCap && cap !== Number.POSITIVE_INFINITY && seen !== cap}
                  <button class="btn px-2 py-0.5" onclick={() => setProgress(selected.id, cap)}>
                    {isSingleEpisode(selected) ? 'Mark as watched' : 'Catch up'}
                  </button>
                {/if}
              </div>
              {#if total !== Number.POSITIVE_INFINITY}
                <div class="h-1 rounded-full overflow-hidden" style="background: var(--bg-tertiary);">
                  <div class="h-full rounded-full transition-all" style="width: {pct}%; background: var(--accent);"></div>
                </div>
              {/if}
            </div>
          {/if}
          {#if selected.genres.length > 0}
            <div class="flex flex-wrap gap-1.5">{#each selected.genres as g}<span class="tag">{g}</span>{/each}</div>
          {/if}
          {#if selected.descriptionHtml}
            <div class="text-sm leading-relaxed whitespace-pre-line [&_a]:text-[var(--accent)] [&_a]:underline"
              style="color: var(--text-secondary);">{@html selected.descriptionHtml}</div>
          {/if}
          {#if selected.trailer?.site === 'youtube' && selected.trailer.id}
            <div class="aspect-video overflow-hidden rounded-sm border" style="border-color: var(--border);">
              <iframe class="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${selected.trailer.id}`}
                title="Trailer" loading="lazy" frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen></iframe>
            </div>
          {/if}
        </div>
        <div class="px-5 py-3 border-t flex flex-wrap items-center gap-2 shrink-0" style="border-color: var(--border);">
          <button class="btn" class:on={watchedSet.has(selected.id)}
            style={watchedSet.has(selected.id) ? 'color: var(--accent-bright); border-color: var(--accent);' : ''}
            onclick={() => toggleWatch(selected.id)}>
            {watchedSet.has(selected.id) ? '✓ Watching' : '+ Watch'}
          </button>
          <a class="btn" href={`/anime/${selected.id}/`} onclick={() => (selected = null)}>Open Full View ↗</a>
          <a class="btn" href={`https://anilist.co/anime/${selected.id}`} target="_blank" rel="noopener noreferrer">AniList ↗</a>
          {#if selected.idMal}
            <a class="btn" href={`https://myanimelist.net/anime/${selected.idMal}`} target="_blank" rel="noopener noreferrer">MAL ↗</a>
          {/if}
          <button class="btn ml-auto" onclick={() => (selected = null)}>Close</button>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if infographicOpen}
  <AnimeInfographic media={watched} progress={$progress} onclose={() => (infographicOpen = false)} />
{/if}

{#if shareOpen}
  <div use:portal class="fixed inset-0 z-[9999] overflow-y-auto"
    style="background: rgba(0,0,0,0.78); backdrop-filter: blur(4px); overscroll-behavior: contain;">
    <div class="flex min-h-full items-start justify-center p-4" role="presentation"
      onclick={(e) => { if (e.target === e.currentTarget) { shareOpen = false; shareCopied = false; } }}>
      <div class="card w-full max-w-lg my-4 flex flex-col" role="dialog" aria-modal="true">
        <div class="flex items-center gap-2 px-5 pt-4 pb-3">
          <div class="text-xs uppercase tracking-widest" style="color: var(--text-muted);">Share your list</div>
          <button class="util-btn ml-auto" onclick={() => { shareOpen = false; shareCopied = false; }} aria-label="Close"><X size={15} /></button>
        </div>
        <div class="flex gap-2 px-5 pb-3">
          <button class="scope-chip flex-1" class:active={shareScope === 'all'} onclick={() => { shareScope = 'all'; shareCopied = false; }}>
            <span class="scope-chip-title">Full list</span>
            <span class="scope-chip-count">{$watchlist.length} shows</span>
          </button>
          <button class="scope-chip flex-1" class:active={shareScope === 'season'} onclick={() => { shareScope = 'season'; shareCopied = false; }}>
            <span class="scope-chip-title">One season</span>
            <span class="scope-chip-count">{scopedShareMedia.length} shows</span>
          </button>
        </div>
        {#if shareScope === 'season'}
          <div class="card border overflow-hidden px-2 py-1.5 flex items-center justify-between gap-2 mx-5 mb-3">
            <button class="util-btn" onclick={() => (shareSeason = { season: shareSeason.season === 'WINTER' ? 'FALL' : shareSeason.season === 'FALL' ? 'SUMMER' : shareSeason.season === 'SUMMER' ? 'SPRING' : 'WINTER', seasonYear: shareSeason.season === 'WINTER' ? shareSeason.seasonYear - 1 : shareSeason.seasonYear })} aria-label="Previous"><ChevronLeft size={15} /></button>
            <div class="text-xs uppercase tracking-widest la-gold-text">{shareSeason.season.charAt(0) + shareSeason.season.slice(1).toLowerCase()} {shareSeason.seasonYear}</div>
            <button class="util-btn" onclick={() => (shareSeason = { season: shareSeason.season === 'FALL' ? 'WINTER' : shareSeason.season === 'WINTER' ? 'SPRING' : shareSeason.season === 'SPRING' ? 'SUMMER' : 'FALL', seasonYear: shareSeason.season === 'FALL' ? shareSeason.seasonYear + 1 : shareSeason.seasonYear })} aria-label="Next"><ChevronRight size={15} /></button>
          </div>
          <div class="mx-5 mb-3 max-h-56 overflow-y-auto space-y-2 pr-1">
            {#each scopedShareMedia as m (m.id)}
              <div class="flex items-center gap-3">
                <img class="w-9 h-12 shrink-0 rounded-sm object-cover" style="background: {coverGradient(m.coverImage.color)};"
                  src={m.coverImage.extraLarge ?? m.coverImage.large} alt="" loading="lazy" />
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium line-clamp-1">{m.title.english ?? mainTitle(m)}</div>
                  <div class="text-xs" style="color: var(--text-muted);">
                    <span class="badge {statusLabel(m.status).className}">{statusLabel(m.status).text}</span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
        {#if shareCopied}<div class="px-5 pb-2 text-xs" style="color: var(--green-bright);">Link copied!</div>{/if}
        <div class="px-5 pb-3">
          <label class="block text-xs uppercase tracking-widest pb-1.5" for="shareNameInput" style="color: var(--text-muted);">Your name</label>
          <input id="shareNameInput" type="text" maxlength="40" placeholder="Optional" class="input w-full" bind:value={shareName} oninput={() => (shareCopied = false)} />
        </div>
        <div class="px-5 pb-5 pt-1">
          <button class="btn w-full" onclick={copyShareLink}>Copy share link</button>
        </div>
      </div>
    </div>
  </div>
{/if}
