<script lang="ts">
  import './page.css';

  import {
    CALENDAR_AHEAD_MS,
    CALENDAR_BACK_MS,
    clearCalendarCache,
    clearGenreCache,
    clearSeasonCache,
    clearWatchedCache,
    currentSeason,
    dateLabel,
    fetchAiringSchedulesRaw,
    fetchWatchedMediaRaw,
    formatAiring,
    formatLabel,
    loadAiringCalendar,
    loadSeason,
    loadSeasonPage,
    loadWatchedMedia,
    mainTitle,
    loadMediaById,
    loadMediaByGenres,
    purgeStaleMediaCache,
    relationSummary,
    saveAiringCalendarCache,
    saveWatchedMediaCache,
    seasonLabel,
    shiftSeason,
    sourceLabel,
    statusLabel,
    studioNames,
  } from '$lib/api/anilist';
  import AnimeInfographic from '$lib/components/AnimeInfographic.svelte';
  import StatCard from '$lib/components/StatCard.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import { portal } from '$lib/actions/portal';
   import { Bell, CalendarIcon, ChevronLeft, ChevronRight, Download, ImageDown, Link, RefreshCw, X } from '@lucide/svelte';
  import { navigate } from '$app/navigation';
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

  type Tab = 'dashboard' | 'season' | 'recommendations' | 'backlog' | 'watching';

  let tab = $state<Tab>('dashboard');

  const userGenreCounts = $derived(() => {
    const counts: Record<string, number> = {};
    for (const m of watched) {
      for (const g of m.genres) {
        counts[g] = (counts[g] || 0) + 1;
      }
    }
    return counts;
  });

  const topGenres = $derived(
    Object.entries(userGenreCounts())
      .sort((a, b) => b[1] - a[1])
      .map(([genre]) => genre)
  );

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

  function loadRecommendations() {
    if (recommendationCooldown) return;
    recommendationCooldown = true;
    lastFetchedGenreKey = '';
    clearGenreCache();
    recommendationReload++;
    setTimeout(() => {
      recommendationCooldown = false;
    }, 3000);
  }

  $effect(() => {
    void recommendationReload;
    if (tab !== 'recommendations' || topGenres.length === 0) return;
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
        if (tab !== 'recommendations' || currentGenreKey !== genresToFetch.sort().join(',')) return;
        recommendationPageRef = 1;
        recommendationsHasMore = pageData.pageInfo.hasNextPage;
        const filtered = pageData.media.filter((m) => !watchedSet.has(m.id));
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        recommendedMedia = await safeDescriptions(shuffled);
        recommendedLoading = false;
      })
      .catch((e) => {
        if (tab !== 'recommendations') return;
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
      const shuffledAdditions = [...additions].sort(() => Math.random() - 0.5);
      recommendedMedia = [...recommendedMedia, ...shuffledAdditions];
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
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMoreRecommendations();
      },
      { rootMargin: '600px' },
    );
    io.observe(node);
    return {
      destroy() {
        io.disconnect();
      },
    };
  }

  /** Switch tabs and jump back to the top of the page so the new view starts fresh. */
  function setTab(next: Tab): void {
    if (next === tab && !pendingShare) return;
    if (pendingShare) dismissShare();
    tab = next;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  let season = $state(currentSeason());

  /** Jump back to the top whenever the selected season changes (Prev/Current/Next). */
  $effect(() => {
    season;
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  let media = $state<AniListMedia[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let selected = $state<AniListMedia | null>(null);
  let detailPending = $state(false);

  /** Lock background scrolling while a modal is open. */
  $effect(() => {
    const { body } = document;
    if (selected || infographicOpen || shareOpen) body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = '';
    };
  });

  let watched = $state<AniListMedia[]>([]);
  let watchedLoading = $state(false);
  let watchedError = $state<string | null>(null);
  let watchReload = $state(0);

  let airings = $state<AniListAiringSchedule[]>([]);
  let calendarReload = $state(0);
  let seasonReload = $state(0);

  // "Since your last visit" tracking for the dashboard strip.
  const LAST_VISIT_KEY = 'nexhunter-anime-last-visit';
  let lastVisit = $state<number | null>(null);
  let lastVisitStamp = $state<number | null>(null);

  let requestId = 0;
  let watchedRequestId = 0;
  let calendarRequestId = 0;
  let selectedRequestId = 0;

  /** Ids already upgraded to a full record. Relation-less shows (e.g. Zenshu) legitimately
      have an empty `relations` array, so without this the upgrade effect would re-fetch and
      reassign `selected` forever, looping the popup. */
  const upgradedIds = new Set<number>();

  /** Clear upgradedIds whenever `selected` changes to a different show, so that
      re-opening a previously-upgraded record re-fetches its full data. */
  let prevSelectedId = $state<number | null>(null);
  $effect(() => {
    if (selected && selected.id !== prevSelectedId) {
      prevSelectedId = selected.id;
      upgradedIds.clear();
    }
  });

  /** Open the popup and make sure `selected` carries franchise relations. Airing rows
      arrive relation-less (the schedule payload deliberately omits RELATION_FIELDS); this
      effect upgrades the record from the per-id cache / network on demand. */
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
      .catch((e) => {
        if (id !== selectedRequestId) return;
        detailPending = false;
        console.error('Could not load full details', e);
      });
  });

  /** Prequel/sequel anime relations for the open popup, prequels first then sequels. */
  const selectedRelations = $derived(
    selected
      ? (selected.relations?.edges ?? [])
          .filter(
            (e): e is AniListRelationEdge =>
              e.node.type === 'ANIME' && (e.relationType === 'PREQUEL' || e.relationType === 'SEQUEL'),
          )
          .sort((a, b) => {
            const rank = { PREQUEL: 0, SEQUEL: 1 } as Record<string, number>;
            return (rank[a.relationType ?? ''] ?? 2) - (rank[b.relationType ?? ''] ?? 2);
          })
      : [],
  );

  // Episode progress per media id (from the watchlist store).
  const progressMap = $derived($progress);

  // Media ids whose "Watched" action just fired (brief spinner feedback).
  let markingIds = $state<Record<number, boolean>>({});

  function flashMarked(id: number): void {
    markingIds = { ...markingIds, [id]: true };
    setTimeout(() => {
      markingIds = { ...markingIds, [id]: false };
    }, 700);
  }

  // Today-airing notifications.
  let alertsEnabled = $state(false);
  const alertsSupported = typeof Notification !== 'undefined';

  // Share/import UI.
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

  // Season lazy-load bookkeeping: which page is loaded, whether a page remains, and a
  // guard so a late "load more" never appends after the user switched seasons.
  let seasonPageRef = 1;
  let seasonHasMore = $state(false);
  let loadingMore = $state(false);
  let loadMoreError = $state<string | null>(null);
  let currentSeasonKey = '';

  // Clean-refresh bookkeeping: last loaded id-set + reload counters, so a single
  // pick toggle merges one series in place instead of re-fetching everything.
  let watchedLoaded = false;
  let watchedIdsRef: number[] = [];
  let watchReloadRef = 0;
  let calendarLoaded = false;
  let calendarIdsRef: number[] = [];
  let calendarReloadRef = 0;

  let now = $state(new Date());

  /** Height of the affixed nav bar, so the season controls stick just below it. */
  let navHeight = $state(56);
  let navRef = $state<HTMLElement | null>(null);

  $effect(() => {
    const el = navRef;
    if (!el) return;
    const measure = () => {
      navHeight = el.offsetHeight;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  });

  /** True when the sticky season controls are pinned below the site header.
      A zero-height sentinel sits right above the bar; when it scrolls out of
      view the bar is affixed. */
  let seasonPickerStuck = $state(false);
  let seasonPickerSentinel = $state<HTMLElement | null>(null);

  $effect(() => {
    const el = seasonPickerSentinel;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      seasonPickerStuck = !entry.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  });

  $effect(() => {
    const t = setInterval(() => {
      now = new Date();
      checkAiringAlerts();
    }, 30_000);
    return () => clearInterval(t);
  });

  $effect(() => {
    if (typeof window === 'undefined') return;
    // Self-heal the cache: earlier fetch paths stored relation-less watchlist payloads in
    // the per-id media cache; those would otherwise shadow rich records in the popup.
    void purgeStaleMediaCache();
    try {
      alertsEnabled = localStorage.getItem('nexhunter-anime-alerts-v1') === '1';
    } catch {
      alertsEnabled = false;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get('list');
    if (code) {
      const data = extractList(window.location.href);
      if (data && data.ids.length > 0) pendingShare = data;
    }

    // Stamp the visit: remember the previous one first (drives the "Since your last visit"
    // strip), then record the current time so the next load compares against it.
    try {
      const raw = localStorage.getItem(LAST_VISIT_KEY);
      lastVisit = raw ? Number(raw) : null;
    } catch {
      lastVisit = null;
    }
  });

  // Persist the new visit timestamp exactly once per load (only depends on the stamp flag,
  // so backdating lastVisit for testing never overwrites the persisted value).
  $effect(() => {
    if (typeof window === 'undefined' || lastVisitStamp) return;
    lastVisitStamp = +now;
    try {
      localStorage.setItem(LAST_VISIT_KEY, String(lastVisitStamp));
    } catch {
      // ignore
    }
  });

  // Preview fetch: load media for the shared list so it can be browsed without applying.
  $effect(() => {
    const data = pendingShare;
    if (!data) return;
    sharedLoading = true;
    sharedError = null;
    loadWatchedMedia(data.ids)
      .then(async (list) => {
        if (data !== pendingShare) return; // stale check
        const ordered = data.ids
          .map((id) => list.find((m) => m.id === id))
          .filter((m): m is AniListMedia => m !== undefined);
        sharedMedia = await safeDescriptions(ordered);
        sharedLoading = false;
      })
      .catch((e) => {
        if (data !== pendingShare) return;
        sharedError = e instanceof Error ? e.message : String(e);
        sharedLoading = false;
      });
  });

  const END_MONTH: Record<AniListSeason, number> = { WINTER: 3, SPRING: 6, SUMMER: 9, FALL: 12 };
  const START_MONTH: Record<AniListSeason, number> = { WINTER: 1, SPRING: 4, SUMMER: 7, FALL: 10 };

  const ORDER: Record<string, number> = {
    RELEASING: 0,
    NOT_YET_RELEASED: 1,
    FINISHED: 2,
    HIATUS: 3,
    CANCELLED: 4,
  };

  function sortMedia(list: AniListMedia[]): AniListMedia[] {
    return [...list].sort(
      (a, b) =>
        (ORDER[a.status ?? ''] ?? 5) - (ORDER[b.status ?? ''] ?? 5) ||
        (b.popularity ?? 0) - (a.popularity ?? 0),
    );
  }

  $effect(() => {
    const id = ++requestId;
    void seasonReload;
    loading = true;
    error = null;
    loadingMore = false;
    loadMoreError = null;

    loadSeason(season.season, season.seasonYear)
      .then(async (page) => {
        if (id !== requestId) return;
        currentSeasonKey = `${season.seasonYear}|${season.season}`;
        seasonPageRef = 1;
        seasonHasMore = page.pageInfo.hasNextPage;
        media = sortMedia(await safeDescriptions(page.media));
        loading = false;
      })
      .catch((e) => {
        if (id !== requestId) return;
        seasonHasMore = false;
        error = e instanceof Error ? e.message : String(e);
        loading = false;
      });

    });

  /** Append the next season page when the sentinel scrolls into view. */
  async function loadMoreSeason(): Promise<void> {
    if (loadingMore || !seasonHasMore || loading || error) return;
    loadingMore = true;
    loadMoreError = null;

    const guard = `${season.seasonYear}|${season.season}`;
    const nextPage = seasonPageRef + 1;

    try {
      const page = await loadSeasonPage(season.season, season.seasonYear, nextPage);
      if (guard !== currentSeasonKey) return;
      const seen = new Set(media.map((m) => m.id));
      const additions = (await safeDescriptions(page.media)).filter((m) => !seen.has(m.id));
      media = [...media, ...additions];
      seasonPageRef = nextPage;
      seasonHasMore = page.pageInfo.hasNextPage;
    } catch (e) {
      if (guard !== currentSeasonKey) return;
      loadMoreError = e instanceof Error ? e.message : String(e);
    } finally {
      if (guard === currentSeasonKey) loadingMore = false;
    }
  }

  function scrollMore(node: HTMLElement) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMoreSeason();
      },
      { rootMargin: '600px' },
    );
    io.observe(node);
    return {
      destroy() {
        io.disconnect();
      },
    };
  }

  $effect(() => {
    const ids = $watchlist;
    // Always loaded (any tab): powers the Continue watching strip and Today badge.

    const reloadBumped = watchReload !== watchReloadRef;
    watchReloadRef = watchReload;

    const prev = watchedIdsRef;
    const added = ids.filter((id) => !prev.includes(id));
    const removed = prev.filter((id) => !ids.includes(id));
    watchedIdsRef = ids;

    const id = ++watchedRequestId;

    if (ids.length === 0) {
      watched = [];
      watchedError = null;
      watchedLoading = false;
      watchedLoaded = true;
      return;
    }

    // Clean add: fetch only the newly picked series and merge it in - no re-fetch, no flash.
    if (!reloadBumped && watchedLoaded && added.length === 1 && removed.length === 0) {
      watchedLoading = false;
      watchedError = null;
      fetchWatchedMediaRaw(added)
        .then(async (list) => {
          if (id !== watchedRequestId) return;
          const cleaned = await safeDescriptions(list);
          watched = [...watched.filter((m) => m.id !== added[0]), ...cleaned];
          saveWatchedMediaCache(ids, watched);
        })
        .catch((e) => {
          if (id !== watchedRequestId) return;
          watchedError = e instanceof Error ? e.message : String(e);
        });
      return;
    }

    // Clean remove: needs no fetch - watchingList/recommendations filter by current ids.
    if (!reloadBumped && watchedLoaded && added.length === 0 && removed.length === 1) {
      watchedError = null;
      saveWatchedMediaCache(ids, watched);
      return;
    }

    // Tab-switch re-run with no picks changed: nothing to do.
    if (!reloadBumped && watchedLoaded && added.length === 0 && removed.length === 0) return;

    watchedLoading = true;
    watchedError = null;
    loadWatchedMedia(ids)
      .then(async (list) => {
        if (id !== watchedRequestId) return;
        watched = await safeDescriptions(list);
        watchedLoaded = true;
        watchedLoading = false;
      })
      .catch((e) => {
        if (id !== watchedRequestId) return;
        watchedError = e instanceof Error ? e.message : String(e);
        watchedLoading = false;
      });
  });

  $effect(() => {
    const ids = $watchlist;
    // Always loaded (any tab): the dashboard airing lists need the schedule.
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

    if (ids.length === 0) {
      airings = [];
      calendarLoaded = true;
      return;
    }

    // Clean add: only the added series' schedule is fetched and merged - no full re-pagination.
    if (!reloadBumped && calendarLoaded && added.length === 1 && removed.length === 0) {
      fetchAiringSchedulesRaw(added, from, to)
        .then(async (list) => {
          if (id !== calendarRequestId) return;
          const mediaMap = new Map(
            (await safeDescriptions(list.map((a) => a.media))).map((m) => [m.id, m]),
          );
          const merged = list.map((a) => ({ ...a, media: mediaMap.get(a.media.id) ?? a.media }));
          airings = [...airings.filter((a) => a.media.id !== added[0]), ...merged];
          saveAiringCalendarCache(ids, from, airings);
        })
        .catch(() => {
          if (id !== calendarRequestId) return;
        });
      return;
    }

    // No picks changed (tab/now re-run) or a removal (filtered out via activeAirings): skip.
    if (!reloadBumped && calendarLoaded && added.length === 0 && removed.length <= 1) return;

    loadAiringCalendar(ids, from, to)
      .then(async (list) => {
        if (id !== calendarRequestId) return;
        const mediaMap = new Map(
          (await safeDescriptions(list.map((a) => a.media))).map((m) => [m.id, m]),
        );
        airings = list.map((a) => ({ ...a, media: mediaMap.get(a.media.id) ?? a.media }));
        calendarLoaded = true;
      })
      .catch(() => {
        if (id !== calendarRequestId) return;
      });
  });

  const countdown = $derived(seasonCountdown());
  const watchedSet = $derived(new Set($watchlist));

  /** Total number of episodes (from the series listing or the next scheduled one). */
  function totalEpisodes(m: AniListMedia): number {
    return m.episodes ?? m.nextAiringEpisode?.episode ?? Number.POSITIVE_INFINITY;
  }

  /** True if the media is a movie or a singular 1-episode release (e.g. 1-ep OVA/special). */
  function isSingleEpisode(m: AniListMedia): boolean {
    return m.format === 'MOVIE' || totalEpisodes(m) === 1;
  }

  /** Returns site URL to open a season page for the anime's start date, or undefined if no date. */
  function seasonPageUrl(m: AniListMedia): string | undefined {
    if (!m.startDate?.year) return;
    const seasonMap: Record<string, string> = {
      WINTER: 'winter',
      SPRING: 'spring',
      SUMMER: 'summer',
      FALL: 'fall',
    };
    const season = m.startDate.season ? seasonMap[m.startDate.season] : 'winter';
    return `/anime/season/${season}/${m.startDate.year}`;
  }

  /** Highest episode you can log as watched: the total for finished shows, but for
      currently-airing shows it's capped at what has already aired (nextAiringEpisode is
      the upcoming one, so subtract one). */
  function maxCatchUp(m: AniListMedia): number {
    if (m.status === 'RELEASING' && m.nextAiringEpisode) {
      return m.nextAiringEpisode.episode - 1;
    }
    return totalEpisodes(m);
  }

  function isToday(secs: number): boolean {
    const d = new Date(secs * 1000);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }

  function airTime(secs: number): string {
    return new Date(secs * 1000).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  /** Label + absolute time for a single schedule entry, relative to the live clock. */
  function airingLabel(a: AniListAiringSchedule): { text: string; at: string } {
    const at = new Date(a.airingAt * 1000);
    const atStr = at.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    const mins = Math.round((a.airingAt * 1000 - +now) / 60000);
    if (mins >= 0) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return { text: h > 0 ? `Ep ${a.episode} in ${h}h ${m}m` : `Ep ${a.episode} in ${m}m`, at: atStr };
    }
    return { text: `Aired ${at.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`, at: atStr };
  }

  /** Episodes for series still on the list (removed picks drop out here). */
  const activeAirings = $derived(airings.filter((a) => watchedSet.has(a.media.id)));

  /** Episodes airing today (past or upcoming), from the schedule data, sorted by time. */
  const todayAirings = $derived(
    activeAirings.filter((a) => isToday(a.airingAt)).sort((a, b) => a.airingAt - b.airingAt),
  );

  /** Episodes airing over the next 6 days after today (today is shown in its own list),
      sorted by time. Powers the dashboard "Next 6 days" list. */
  const weekAirings = $derived(
    activeAirings
      .filter((a) => {
        if (isToday(a.airingAt)) return false;
        const diff = a.airingAt * 1000 - +now;
        return diff > 0 && diff <= 6 * 24 * 60 * 60 * 1000;
      })
      .sort((a, b) => a.airingAt - b.airingAt),
  );

  function airingDay(a: AniListAiringSchedule): string {
    return new Date(a.airingAt * 1000).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  /** Episodes that aired since the visitor's previous visit and they haven't logged yet,
      for shows still on the list. Sorted oldest first so the strip reads chronologically. */
  const missedSinceVisit = $derived(
    lastVisit === null
      ? []
      : activeAirings
          .filter((a) => a.airingAt * 1000 >= lastVisit && a.airingAt * 1000 < +now)
          .filter((a) => (progressMap[a.media.id] ?? 0) < a.episode)
          .sort((a, b) => a.airingAt - b.airingAt),
  );

  /** Whether the missed-episodes banner is expanded on the dashboard. */
  let missedOpen = $state(false);

  /** Missed episodes grouped by show, episode numbers in airing order, for the dropdown. */
  const missedByShow = $derived(() => {
    const map = new Map<number, { m: AniListMedia; eps: number[] }>();
    for (const a of missedSinceVisit) {
      const entry = map.get(a.media.id);
      if (entry) entry.eps.push(a.episode);
      else map.set(a.media.id, { m: a.media, eps: [a.episode] });
    }
    return [...map.values()];
  });

  /** Next-6-days episodes grouped by calendar date so the list reads per day. */
  const weekGroups = $derived(
    weekAirings.reduce(
      (groups, a) => {
        const key = airingDay(a);
        (groups[key] ??= []).push(a);
        return groups;
      },
      {} as Record<string, AniListAiringSchedule[]>,
    ),
  );

  /** Watchlist entries kept in pick order. */
  const watchingList = $derived(
    [...$watchlist]
      .map((id) => watched.find((m) => m.id === id))
      .filter((m): m is AniListMedia => m !== undefined),
  );

  /** Shows that are currently airing, have been started (progress > 0), and are not caught up yet (behind latest aired episode).
      Powers the dashboard "Continue watching" strip. */
  const continueWatching = $derived(
    watchingList
      .filter((m) => {
        if (m.status !== 'RELEASING') return false;
        const seen = progressMap[m.id] ?? 0;
        if (seen <= 0) return false;
        const cap = maxCatchUp(m);
        return seen < cap;
      })
      .sort((a, b) => {
        const airA = a.nextAiringEpisode?.airingAt ?? Number.POSITIVE_INFINITY;
        const airB = b.nextAiringEpisode?.airingAt ?? Number.POSITIVE_INFINITY;
        return (
          airA - airB ||
          ((progressMap[b.id] ?? 0) - (progressMap[a.id] ?? 0)) ||
          (b.popularity ?? 0) - (a.popularity ?? 0)
        );
      }),
  );

  /** Backlog items on the watchlist that have not started watching yet (0 episodes watched) and have already aired (status !== 'NOT_YET_RELEASED'). */
  const startedWatching = $derived(
    watchingList
      .filter((m) => {
        if (m.status === 'NOT_YET_RELEASED') return false;
        const seen = progressMap[m.id] ?? 0;
        return seen === 0;
      })
      .sort((a, b) => {
        return (b.popularity ?? 0) - (a.popularity ?? 0);
      }),
  );

  /* ---- Dashboard insights (all scoped to the current list) ---- */

  /** Total episodes logged across the list. */
  const dashboardEpsWatched = $derived(
    watchingList.reduce((sum, m) => sum + (progressMap[m.id] ?? 0), 0),
  );

  /** Average AniList score across listed shows that have one rated. */
  const dashboardAvgScore = $derived(
    (() => {
      const rated = watchingList.filter((m) => m.averageScore != null && m.averageScore > 0);
      if (rated.length === 0) return null;
      return Math.round(rated.reduce((s, m) => s + (m.averageScore ?? 0), 0) / rated.length);
    })(),
  );

  /** Minimal full-media record built from a relation node so the detail popup can open
      instantly; the full record replaces it as soon as the fetch resolves. */
  function draftFromNode(n: AniListRelationNode): AniListMedia {
    return {
      id: n.id,
      idMal: null,
      title: n.title,
      coverImage: {
        extraLarge: n.coverImage?.large ?? null,
        large: n.coverImage?.large ?? null,
        color: n.coverImage?.color ?? null,
      },
      bannerImage: null,
      description: null,
      format: n.format,
      episodes: null,
      duration: null,
      status: n.status,
      averageScore: n.averageScore,
      popularity: n.popularity,
      genres: [],
      studios: { nodes: [] },
      startDate: n.startDate ?? { year: null, month: null, day: null },
      endDate: null,
      nextAiringEpisode: null,
      trailer: null,
      source: null,
      isAdult: false,
    };
  }

  async function openRecommended(n: AniListRelationNode): Promise<void> {
    // Draft opens instantly from the relation node; the upgrade effect replaces it with a
    // full record (incl. franchise relations) once loaded.
    selected = draftFromNode(n);
  }

  /** Whether the user has personally watched every episode of a show. */
  function isCompletedByMe(m: AniListMedia): boolean {
    const total = totalEpisodes(m);
    return total !== Number.POSITIVE_INFINITY && (progressMap[m.id] ?? 0) >= total;
  }

  type FinishedGroup = { key: string; label: string; items: AniListMedia[] };

  const FINISHED_SEASON_ORDER: Record<string, number> = { SPRING: 0, SUMMER: 1, FALL: 2, WINTER: 3 };

  function seasonOfMonth(month: number | null): AniListSeason | null {
    if (!month) return null;
    if (month <= 3) return 'WINTER';
    if (month <= 6) return 'SPRING';
    if (month <= 9) return 'SUMMER';
    return 'FALL';
  }

  /** Finished shows grouped by broadcast season (derived from startDate), newest first. */
  const finishedGroups = $derived(
    (() => {
      const groups = new Map<string, AniListMedia[]>();
      const orderKeys: string[] = [];
      for (const m of watchingList) {
        if (m.status !== 'FINISHED') continue;
        const seasonOf = seasonOfMonth(m.startDate?.month ?? null);
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
        key === 'unknown'
          ? 'Unknown season'
          : seasonLabel(key.split('|')[1] as AniListSeason, Number(key.split('|')[0]));
      return orderKeys
        .sort((a, b) => numeric(b) - numeric(a))
        .map((key) => ({ key, label: label(key), items: groups.get(key) ?? [] }));
    })(),
  );

  /** Currently-airing shows (RELEASING), always rendered first in the airing view. */
  const airingList = $derived(watchingList.filter((m) => m.status === 'RELEASING'));

  /** Every other non-finished show, grouped by their upcoming broadcast season, soonest first. */
  const upcomingGroups = $derived(
    (() => {
      const groups = new Map<string, AniListMedia[]>();
      const orderKeys: string[] = [];
      for (const m of watchingList) {
        if (m.status === 'FINISHED' || m.status === 'RELEASING') continue;
        const seasonOf = seasonOfMonth(m.startDate?.month ?? null);
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
        key === 'unknown'
          ? 'Unknown season'
          : seasonLabel(key.split('|')[1] as AniListSeason, Number(key.split('|')[0]));
      return orderKeys
        .filter((key) => (groups.get(key) ?? []).length > 0)
        .sort((a, b) => numeric(a) - numeric(b))
        .map((key) => ({ key, label: label(key), items: groups.get(key) ?? [] }));
    })(),
  );

  /** Finished groups plus every non-finished show, for the flat My List view. */
  const restOfList = $derived(watchingList.filter((m) => m.status !== 'FINISHED'));

  /** Shared list grouped by broadcast season (derived from startDate), newest first. */
  /** Shared list grouped by broadcast season (FALL→SUMMER→SPRING→WINTER within a year,
      most recent year first), derived from startDate. */
  const sharedGroups = $derived(
    (() => {
      const groups = new Map<string, AniListMedia[]>();
      const orderKeys: string[] = [];
      for (const m of sharedMedia) {
        const seasonOf = seasonOfMonth(m.startDate?.month ?? null);
        const year = m.startDate?.year ?? null;
        const key = seasonOf && year ? `${year}|${seasonOf}` : 'unknown';
        if (!orderKeys.includes(key)) orderKeys.push(key);
        groups.set(key, [...(groups.get(key) ?? []), m]);
      }
      const ANIME_SEASON_ORDER: Record<string, number> = { FALL: 0, SUMMER: 1, SPRING: 2, WINTER: 3 };
      const yearKey = (key: string) => (key === 'unknown' ? Number.NEGATIVE_INFINITY : Number(key.split('|')[0]));
      const seasonKey = (key: string) => (key === 'unknown' ? 4 : ANIME_SEASON_ORDER[key.split('|')[1]] ?? 4);
      const label = (key: string) =>
        key === 'unknown'
          ? 'Unknown season'
          : seasonLabel(key.split('|')[1] as AniListSeason, Number(key.split('|')[0]));
      return orderKeys
        .sort((a, b) => yearKey(b) - yearKey(a) || seasonKey(a) - seasonKey(b))
        .map((key) => ({ key, label: label(key), items: groups.get(key) ?? [] }));
    })(),
  );

  /** Season chip currently selected in the shared-list filter ('all' = show every season). */
  let sharedSeasonFilter = $state<'all' | string>('all');

  /** Status filter for My List: only catching-up (airing) or only finished shows. */
  type ListFilter = 'airing' | 'finished';
  let myFilter = $state<ListFilter>('airing');

  /** Season chip currently selected in the My List sidebar ('all' = show every season). */
  let mySeason = $state<'all' | string>('all');

  /** Finished-season groups narrowed by the sidebar selection. */
  const myFilteredFinished = $derived(
    mySeason === 'all' ? finishedGroups : finishedGroups.filter((g) => g.key === mySeason),
  );

  /** When a season is selected, only that season's group is shown (still as a list). */
  const sharedFilteredGroups = $derived(
    sharedSeasonFilter === 'all' ? sharedGroups : sharedGroups.filter((g) => g.key === sharedSeasonFilter),
  );

  /** Contextual season timeline stat: countdown for active, short labels for future/past,
    with the absolute end date surfaced as a tooltip. Short, stable-width values keep the
    stat grid from reflowing when switching seasons. */
  function seasonCountdown(): { phase: string; label: string; value: string; range: string } {
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
  }

  function selectedTitle(m: AniListMedia): string {
    return m.title.english ?? mainTitle(m);
  }

  /** Dominant-color backdrop shown while the cover image is still loading. */
  function coverGradient(color: string | null): string {
    if (!color) {
      return 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(11,10,14,0) 70%)';
    }
    return `linear-gradient(180deg, ${color}14 0%, ${color}55 45%, #0b0a0e 92%)`;
  }

  function retryWatched() {
    clearWatchedCache($watchlist);
    watchReload++;
  }

  function retryCalendar() {
    const from = Math.floor((Date.now() - CALENDAR_BACK_MS) / 1000);
    clearCalendarCache($watchlist, from);
    calendarReload++;
  }

  /** Bump the season reload counter, which the season effect reads, to force a re-fetch. */
  function refetchSeason() {
    clearSeasonCache(season.season, season.seasonYear);
    seasonReload++;
  }

  /** Refresh button: busts the cache for the current view and re-fetches it. */
  function refreshCurrent() {
    if (tab === 'season') {
      refetchSeason();
    } else if (tab === 'watching') {
      retryWatched();
    } else {
      retryCalendar();
    }
  }

  /* ---- Today-airing browser notifications ---- */

  /** Request notification permission when the user toggles the bell. */
  async function toggleAlerts() {
    if (!('Notification' in window)) return;
    if (alertsEnabled) {
      alertsEnabled = false;
      persistAlerts();
      return;
    }
    const p = Notification.requestPermission ? await Notification.requestPermission() : undefined;
    if (p !== 'granted') return;
    alertsEnabled = true;
    persistAlerts();
    checkAiringAlerts(true);
  }

  function persistAlerts() {
    try {
      localStorage.setItem('nexhunter-anime-alerts-v1', alertsEnabled ? '1' : '0');
    } catch {
      // ignore
    }
  }

  /** Notify once per episode/day for episodes airing within the next two hours
      (or, on first enable, a summary of everything airing today). */
  function checkAiringAlerts(force = false) {
    if (!alertsEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;
    if (airings.length === 0 || todayAirings.length === 0) return;

    const today = new Date();
    const dayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const storageKey = `nexhunter-anime-notified-${dayKey}`;

    let notified = new Set<string>();
    try {
      notified = new Set(JSON.parse(localStorage.getItem(storageKey) ?? '[]'));
    } catch {
      // ignore
    }

    const notify = (tag: string, title: string, body: string) => {
      try {
        new Notification(title, { body, tag });
      } catch {
        // ignore
      }
      notified.add(tag);
    };

    if (force) {
      const upcoming = todayAirings.filter((a) => a.airingAt * 1000 >= +now);
      if (upcoming.length > 0) {
        const count = upcoming.length;
        const first = upcoming[0];
        const last = upcoming[upcoming.length - 1] ?? upcoming[0];
        const from = airTime(first.airingAt);
        const to = airTime(last.airingAt);
        const names = upcoming
          .slice(0, 3)
          .map((a) => selectedTitle(a.media))
          .join(', ');
        notify(
          `today-${dayKey}`,
          `${count} episode${count === 1 ? '' : 's'} airing today from your shows`,
          `${names}${upcoming.length > 3 ? '…' : ''}${from === to ? '' : ` - first ${from}, last ${to}`}`,
        );
      }
      return;
    }

    const leadMin = 120;
    for (const a of todayAirings) {
      const mins = Math.round((a.airingAt * 1000 - +now) / 60000);
      if (mins < 0 || mins > leadMin) continue;
      const tag = `ep-${a.id}-${dayKey}`;
      if (notified.has(tag)) continue;
      notify(
        tag,
        `${selectedTitle(a.media)}`,
        `Episode ${a.episode} airs at ${airTime(a.airingAt)} - in ${mins} min`,
      );
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify([...notified]));
    } catch {
      // ignore
    }
  }

  /* ---- Share / import ---- */

  /** Shows on the list that aired in the chosen season (used for season-scoped sharing). */
  const scopedShareMedia = $derived(
    watched.filter((m) => {
      const { year, month } = m.startDate ?? {};
      return (
        year === shareSeason.seasonYear &&
        month != null &&
        seasonOfMonth(month) === shareSeason.season
      );
    }),
  );

  const scopedShareIds = $derived(scopedShareMedia.map((m) => m.id));

  function buildShareUrl(): string {
    const ids = shareScope === 'all' ? $watchlist : scopedShareIds;
    const prog: ProgressMap = {};
    for (const id of ids) {
      const seen = $progress[id] ?? 0;
      if (seen > 0) prog[id] = seen;
    }
    return serializeShareUrl(ids, prog, shareName.trim() || undefined);
  }

  async function copyShareLink() {
    const url = buildShareUrl();
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    shareCopied = true;
    setTimeout(() => (shareCopied = false), 2000);
  }

  function clearShareParam() {
    const url = new URL(window.location.href);
    if (url.searchParams.has('list')) {
      url.searchParams.delete('list');
      window.history.replaceState({}, '', url);
    }
  }

  function applyShare(data: SharedList) {
    applySharedList(data);
    pendingShare = null;
    importOpen = false;
    importText = '';
    importError = null;
    clearShareParam();
    retryWatched();
    retryCalendar();
  }

  function confirmShare() {
    if (pendingShare) applyShare(pendingShare);
  }

  /** Add the shared list to the current list instead of replacing it. */
  function mergeShare() {
    if (!pendingShare) return;
    const currentIds = new Set($watchlist);
    const mergedIds = [...$watchlist];
    for (const id of pendingShare.ids) {
      if (!currentIds.has(id)) mergedIds.push(id);
    }
    applySharedList({ ids: mergedIds, progress: { ...$progress, ...pendingShare.progress } });
    pendingShare = null;
    importOpen = false;
    clearShareParam();
    retryWatched();
    retryCalendar();
  }

  function dismissShare() {
    pendingShare = null;
    clearShareParam();
  }

  function runImport() {
    const data = extractList(importText);
    if (!data || data.ids.length === 0) {
      importError = 'Could not read a valid list from that. Paste a share link like https://…/?list=210031,184951:12';
      return;
    }
    applyShare(data);
  }

</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Escape') selected = null;
  }}
/>

<section class="space-y-4">
  {#snippet listRow(m: AniListMedia)}
    {@const s = statusLabel(m.status)}
    {@const air = formatAiring(m)}
    {@const title = selectedTitle(m)}
    {@const rel = relationSummary(m, watchedSet)}
    <div
      class="schedule-row"
      role="button"
      tabindex="0"
      aria-label={`View details for ${title}`}
      onclick={() => (selected = m)}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selected = m;
        }
      }}
    >
      <div
        class="w-[3px] self-stretch shrink-0 rounded-sm"
        style="background: {rel.isContinuation ? 'var(--la-accent)' : 'transparent'};"
        title={rel.label ?? undefined}
      ></div>
      <img
        class="schedule-cover"
        style="background: {coverGradient(m.coverImage.color)};"
        src={m.coverImage.extraLarge ?? m.coverImage.large}
        alt=""
        loading="lazy"
      />
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium leading-tight line-clamp-1">{title}</div>
        <div class="text-xs mt-0.5 flex items-center gap-2" style="color: var(--la-text-muted);">
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
          {#if (progressMap[m.id] ?? 0) > 0}
            <span class="badge b-progress shrink-0" title="Episodes you've watched">
              <span class="tabular-nums">{progressMap[m.id] ?? 0}</span>
              {#if totalEpisodes(m)}<span class="opacity-70">/{totalEpisodes(m)}</span>{/if}
            </span>
          {/if}
        </div>
      </div>
      {#if m.averageScore}
        <span class="score-badge shrink-0">{m.averageScore}</span>
      {/if}
      {#if !isCompletedByMe(m) && m.status !== 'NOT_YET_RELEASED'}
        <button
          class="btn shrink-0 px-2"
          title="Mark another episode watched"
          aria-label={`Mark episode ${(progressMap[m.id] ?? 0) + 1} of ${title} watched`}
          onclick={(e) => {
            e.stopPropagation();
            advanceProgress(m.id);
          }}
        >
          +1
        </button>
      {/if}

    </div>
  {/snippet}

  {#snippet sharedCard(m: AniListMedia)}
    {@const s = statusLabel(m.status)}
    {@const title = selectedTitle(m)}
    {@const sp = pendingShare?.progress ?? {}}
    {@const seen = sp[m.id] ?? 0}
    {@const inMyList = watchedSet.has(m.id)}
    {@const total = totalEpisodes(m)}
    {@const pct = total && Number.isFinite(total) && total > 0 ? Math.min(100, Math.round((seen / total) * 100)) : 0}

    <div
      class="anime-card group"
      role="button"
      tabindex="0"
      aria-label={`View details for ${title}`}
      onclick={() => (selected = m)}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selected = m;
        }
      }}
    >
      <div class="relative aspect-[2/3] overflow-hidden" style="background: {coverGradient(m.coverImage.color)};">
        <img
          class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          src={m.coverImage.extraLarge ?? m.coverImage.large}
          alt={title}
          loading="lazy"
        />

        <span class="badge {s.className} absolute left-1.5 top-1.5">{s.text}</span>

        {#if m.status === 'FINISHED' && m.averageScore}
          <span
            class="score-badge absolute left-1.5 top-9"
            title={`Average score on AniList: ${m.averageScore}`}
          >
            {m.averageScore}
          </span>
        {/if}

        {#if seen > 0}
          <span
            class="badge b-progress absolute bottom-2 right-1.5 z-10"
            title={`${seen} of ${total ?? '?'} episodes watched from the shared list`}
          >
            <span class="tabular-nums">{seen}</span>
            {#if total}<span class="opacity-70">/{total}</span>{/if}
          </span>
        {/if}

        {#if seen > 0}
          <div class="absolute inset-x-0 bottom-0 h-1 bg-black/50">
            <div class="h-full" style="width: {pct}%; background: var(--la-accent);"></div>
          </div>
        {/if}

        <button
          class="watch-toggle"
          class:on={inMyList}
          title={inMyList ? 'On your list - tap to remove' : 'Add to your list'}
          aria-label={`${inMyList ? 'Remove' : 'Add'} ${title} ${inMyList ? 'from' : 'to'} your list`}
          onclick={(e) => {
            e.stopPropagation();
            toggleWatch(m.id);
            if (!inMyList && seen > 0) setProgress(m.id, seen);
          }}
        >
          {inMyList ? '✓' : '+'}
        </button>
      </div>

      <div class="p-2.5 space-y-1.5">
        <div class="text-sm font-medium leading-tight line-clamp-2">{title}</div>
        <div class="text-[11px] line-clamp-1" style="color: var(--la-text-muted);">
          {studioNames(m)}
        </div>
        <div class="flex flex-wrap gap-1">
          {#each m.genres.slice(0, 3) as g}
            <span class="tag">{g}</span>
          {/each}
        </div>
      </div>
    </div>
  {/snippet}

  <!-- NAV TABS -->
  <nav
    bind:this={navRef}
    class="sticky top-14 z-30 border-b flex gap-1 flex-wrap items-center -mt-8 -mx-8 px-8"
    style="border-color: rgba(255,255,255,0.12);"
  >
    <button class="tab" class:active={tab === 'dashboard'} onclick={() => setTab('dashboard')}>
      Dashboard
    </button>
    <button class="tab" class:active={!pendingShare && tab === 'season'} onclick={() => setTab('season')}>
      Seasons
    </button>
    <button class="tab" class:active={tab === 'recommendations'} onclick={() => setTab('recommendations')}>
      Get Started
    </button>
    <button class="tab" class:active={tab === 'backlog'} onclick={() => setTab('backlog')}>
      Backlog ({startedWatching.length})
    </button>
    <button class="tab" class:active={tab === 'watching'} onclick={() => setTab('watching')}>
      My List ({$watchlist.length})
    </button>

<div class="flex items-center gap-1 ml-auto">
      {#if alertsSupported}
        <button
          class="util-btn"
          class:on={alertsEnabled}
          onclick={toggleAlerts}
          data-tip={alertsEnabled ? 'Turn off airing alerts' : 'Ask for a notification when something airs today'}
          aria-label={alertsEnabled ? 'Turn off airing alerts' : 'Turn on airing alerts'}
        >
          <Bell size={15} />
        </button>
      {/if}
      <button
        class="util-btn"
        class:on={shareOpen}
        onclick={() => {
          if (!shareName.trim()) {
            try {
              shareName = localStorage.getItem('nexhunters-anime-infographic-name') ?? '';
            } catch {
              shareName = '';
            }
          }
          shareOpen = true;
        }}
        data-tip={shareOpen ? 'Close share options' : 'Open share options - full list or one season'}
        aria-label="Open share options - full list or one season"
      >
        <Link size={15} />
      </button>
      <button
        class="util-btn"
        class:on={importOpen}
        onclick={() => (importOpen = !importOpen)}
        data-tip={importOpen ? 'Close import' : 'Import a list from a share link'}
        aria-label="Import a list from a share link"
      >
        <Download size={15} />
      </button>
      <button
        class="util-btn"
        class:on={infographicOpen}
        onclick={() => (infographicOpen = !infographicOpen)}
        data-tip={infographicOpen ? 'Close infographic' : 'Open your season infographic card'}
        aria-label="Open your season infographic card"
      >
        <ImageDown size={15} />
      </button>
      <button
        class="util-btn"
        onclick={refreshCurrent}
        data-tip="Clear cached data and fetch this view fresh"
        aria-label="Refresh the current view"
      >
        <RefreshCw size={15} />
      </button>
    </div>
  </nav>

  {#if pendingShare}
    <!-- SHARED LIST VIEW -->
    <div class="card px-4 py-3 flex items-center gap-3">
      <div>
        <div class="text-xs uppercase tracking-widest" style="color: var(--la-text-muted);">
          Shared List
        </div>
        <div class="la-heading text-lg font-bold la-gold-text">
          {pendingShare.ids.length} show{pendingShare.ids.length === 1 ? '' : 's'}
          {#if pendingShare.from}
            <span class="text-sm font-normal">- shared by {pendingShare.from}</span>
          {/if}
        </div>
      </div>
      <div class="text-xs ml-auto" style="color: var(--la-text-muted);">
        Take a look below - add individual shows, merge the list, or replace your whole list.
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <div class="text-xs mr-auto" style="color: var(--la-text-muted);">
        {#if sharedMedia.length > 0}
          {sharedMedia.filter((m) => (pendingShare?.progress[m.id] ?? 0) > 0).length} of {sharedMedia.length} started
        {/if}
      </div>
      <button
        class="btn"
        onclick={mergeShare}
        title="Keep your current list and add any shared shows you don't have"
      >
        Merge into my list
      </button>
      <button
        class="btn"
        onclick={confirmShare}
        title="Replace your entire list with this one"
      >
        Replace my list
      </button>
      <button class="btn" onclick={dismissShare}>Dismiss</button>
    </div>

    {#if sharedLoading}
      <div class="anime-grid">
        {#each Array(6) as _, i}
          <div class="space-y-1.5" style="cursor: default;">
            <div class="aspect-[2/3] skeleton rounded-sm"></div>
            <div class="h-3.5 w-3/4 skeleton rounded"></div>
            <div class="h-2.5 w-1/2 skeleton rounded"></div>
          </div>
        {/each}
      </div>
    {:else if sharedError}
      <div class="card p-6 text-center space-y-3">
        <div class="text-[#a29e96]">Could not load the shared list.</div>
        <div class="text-xs" style="color: var(--la-red);">{sharedError}</div>
        <button class="btn" onclick={confirmShare}>Apply anyway</button>
        <button class="btn" onclick={dismissShare}>Dismiss</button>
      </div>
    {:else if sharedMedia.length === 0}
      <div class="card p-6 text-center">
        <div class="text-[#a29e96]">No titles could be loaded from this list.</div>
      </div>
    {:else}
      <div class="grid gap-6" class:sidebar-layout={sharedGroups.length > 1}>
        <!-- SEASON SIDEBAR -->
        {#if sharedGroups.length > 1}
          <aside
            class="lg:sticky lg:self-start"
            style="top: calc(3.5rem + {navHeight}px);"
          >
            <div class="card p-3">
              <div class="text-xs uppercase tracking-widest px-2 pb-2" style="color: var(--la-text-muted);">
                Seasons
              </div>
              <nav class="flex gap-1 lg:flex-col">
                <button
                  class="filter-chip"
                  class:active={sharedSeasonFilter === 'all'}
                  onclick={() => (sharedSeasonFilter = 'all')}
                >
                  <span>All</span>
                  <span class="filter-chip-count">{sharedMedia.length}</span>
                </button>
                {#each sharedGroups as g (g.key)}
                  <button
                    class="filter-chip"
                    class:active={sharedSeasonFilter === g.key}
                    onclick={() => (sharedSeasonFilter = g.key)}
                  >
                    <span>{g.label}</span>
                    <span class="filter-chip-count">{g.items.length}</span>
                  </button>
                {/each}
              </nav>
            </div>
          </aside>
        {/if}

        <!-- SEASON CONTENT -->
        <div class="space-y-4">
          {#each sharedFilteredGroups as group (group.key)}
            <div class="space-y-2">
              <div class="flex items-baseline gap-2">
                <h3 class="la-heading text-base font-bold">{group.label}</h3>
                <span class="text-xs" style="color: var(--la-text-muted);">{group.items.length}</span>
              </div>
              <div class="anime-grid">
                {#each group.items as m (m.id)}
                  {@render sharedCard(m)}
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {:else}

  {#if importOpen}
    <div class="card px-4 py-3 space-y-2">
      <div class="text-xs" style="color: var(--la-text-muted);">
        Paste a share link to replace your current list.
      </div>
      <div class="flex flex-wrap gap-2">
        <input
          class="input flex-1 min-w-48"
          placeholder="https://…/?list=210031,184951:12,161645:24"
          bind:value={importText}
          onkeydown={(e) => {
            if (e.key === 'Enter') runImport();
          }}
        />
        <button class="btn" onclick={runImport}>Apply</button>
      </div>
      {#if importError}
        <div class="text-xs" style="color: var(--la-red);">{importError}</div>
      {/if}
    </div>
  {/if}

  {#if tab === 'dashboard'}
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
          No shows picked yet - open the Season tab and tap <span class="la-gold-text">+</span> on anything you're
          watching.
        </div>
      </div>
    {:else}
      <!-- INSIGHT TILES -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
        <StatCard label="On List" value={watchingList.length} />
        <StatCard label="Episodes Watched" value={dashboardEpsWatched} />
        <StatCard label="Avg Score" value={dashboardAvgScore ?? '—'} />
      </div>

      <!-- SINCE YOUR LAST VISIT (collapsible summary banner) -->
      {#if missedSinceVisit.length > 0}
        <div class="card border overflow-hidden" style="border-color: rgba(74,222,128,0.25);">
          <button
            class="w-full px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-left"
            onclick={() => (missedOpen = !missedOpen)}
            aria-expanded={missedOpen}
          >
            <ChevronRight
              size={15}
              style="transition: transform 0.15s;"
              class="shrink-0 {missedOpen ? 'rotate-90' : ''}"
              color="var(--la-green-bright)"
            />
            <span class="text-xs uppercase tracking-widest shrink-0" style="color: var(--la-text-muted);">
              Since your last visit
            </span>
            <span class="text-[11px] tabular-nums ml-auto whitespace-nowrap" style="color: var(--la-green-bright);">
              Missed {missedSinceVisit.length} episode{missedSinceVisit.length === 1 ? '' : 's'}
            </span>
          </button>
          {#if missedOpen}
            <div class="px-4 pb-3 border-t" style="border-color: var(--la-border);">
              <div class="space-y-1 pt-2">
                {#each missedByShow() as entry (entry.m.id)}
                  {@const m = entry.m}
                  {@const eps = entry.eps}
                  <div
                    class="schedule-row"
                    role="button"
                    tabindex="0"
                    aria-label={`Open ${selectedTitle(m)}`}
                    onclick={() => (selected = m)}
                    onkeydown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selected = m;
                      }
                    }}
                  >
                    <img
                      class="schedule-cover"
                      style="background: {coverGradient(m.coverImage.color)};"
                      src={m.coverImage.extraLarge ?? m.coverImage.large}
                      alt=""
                      loading="lazy"
                    />
                    <div class="flex-1 min-w-0">
                      <div class="text-[13px] font-medium leading-tight line-clamp-1">{selectedTitle(m)}</div>
                      <div class="text-[11px] mt-0.5 tabular-nums" style="color: var(--la-text-muted);">
                        {eps.length} episode{eps.length === 1 ? '' : 's'} missed - Ep{' '}
                        {eps.join(', ')}
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <!-- STARTED WATCHING -->
      {#if continueWatching.length > 0}
        <div class="space-y-2">
          <div class="flex flex-col gap-0.5">
            <div class="text-xs uppercase tracking-widest" style="color: var(--la-text-muted);">
              Started Watching
            </div>
             <div class="text-[11px]" style="color: var(--la-text-faint);">
               Track episodes that have been watched for currently airing shows
             </div>
          </div>
          <div class="flex gap-3 snap-x overflow-x-auto pb-1">
            {#each continueWatching as m (m.id)}
              {@const seen = progressMap[m.id] ?? 0}
              {@const total = totalEpisodes(m)}
              {@const pct = total === Number.POSITIVE_INFINITY ? 0 : Math.min(100, Math.round((seen / total) * 100))}
              <div
                class="card shrink-0 w-64 flex gap-3 p-2 cursor-pointer snap-start"
                role="button"
                tabindex="0"
                aria-label={`Open ${selectedTitle(m)}`}
                onclick={() => (selected = m)}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selected = m;
                  }
                }}
              >
                <img
                  class="w-10 h-14 shrink-0 rounded-sm object-cover"
                  style="background: {coverGradient(m.coverImage.color)};"
                  src={m.coverImage.extraLarge ?? m.coverImage.large}
                  alt=""
                  loading="lazy"
                />
                <div class="min-w-0 flex-1">
                  <div class="text-[13px] font-medium leading-tight line-clamp-1">{selectedTitle(m)}</div>
                  <div class="text-[11px] mt-0.5 tabular-nums" style="color: var(--la-text-muted);">
                    Ep {seen}
                    {#if total !== Number.POSITIVE_INFINITY} / {total}{/if}
                    {#if m.nextAiringEpisode}
                      · next {m.nextAiringEpisode.episode}
                    {/if}
                  </div>
                  <div class="mt-1.5 h-1 rounded-full overflow-hidden" style="background: rgba(255,255,255,0.08);">
                    <div class="h-full rounded-full" style="width: {pct}%; background: var(--la-accent);"></div>
                  </div>
                  <div class="flex items-center gap-2 mt-1.5">
                    <span class="badge {statusLabel(m.status).className}">{statusLabel(m.status).text}</span>
                    <button
                      class="btn shrink-0 ml-auto px-2 py-0.5 text-[11px]"
                      title="Mark another episode watched"
                      aria-label={`Mark episode ${seen + 1} of ${selectedTitle(m)} watched`}
                      onclick={(e) => {
                        e.stopPropagation();
                        advanceProgress(m.id);
                      }}
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>
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
              {@const label = airingLabel(a)}
              {@const aired = a.episode}
              {@const seen = progressMap[m.id] ?? 0}
              {@const caughtUp = seen >= aired}
              <div
                class="schedule-row"
                role="button"
                tabindex="0"
                aria-label={`Open ${selectedTitle(m)}`}
                onclick={() => (selected = m)}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selected = m;
                  }
                }}
              >
                <img
                  class="schedule-cover"
                  style="background: {coverGradient(m.coverImage.color)};"
                  src={m.coverImage.extraLarge ?? m.coverImage.large}
                  alt=""
                  loading="lazy"
                />
<div class="flex-1 min-w-0">
                  <div class="text-sm font-medium leading-tight line-clamp-1">{selectedTitle(m)}</div>
                  <div class="text-xs mt-0.5 flex items-center flex-wrap gap-x-3" style="color: var(--la-text-muted);">
                    <span class="tabular-nums">{label.text}</span>
                    <span class="tabular-nums">{label.at}</span>
                    <span class="badge {statusLabel(m.status).className} shrink-0">{statusLabel(m.status).text}</span>
                    {#if !caughtUp}
                      <span class="badge shrink-0" style="background: rgba(214,100,74,0.15); border-color: rgba(214,100,74,0.5); color: #e89080;">
                        {#if seen === 0}
                          Not started
                        {:else}
                          {aired - seen} episode{aired - seen === 1 ? '' : 's'} behind
                        {/if}
                      </span>
                    {/if}
                  </div>
                </div>
                <button
                  class="btn shrink-0 px-2 py-0.5 text-[11px] flex items-center justify-center gap-1 w-16"
                  class:disabled={caughtUp || markingIds[m.id]}
                  disabled={caughtUp || markingIds[m.id]}
                  title={caughtUp
                    ? `You're caught up on episode ${aired}`
                    : markingIds[m.id]
                      ? `Marking episode ${seen + 1} watched…`
                      : `Mark episode ${seen + 1} watched`}
                  aria-label={caughtUp
                    ? `Caught up - seen episode ${aired} of ${selectedTitle(m)}`
                    : `Mark episode ${seen + 1} of ${selectedTitle(m)} watched`}
                  onclick={(e) => {
                    e.stopPropagation();
                    advanceProgress(m.id);
                    flashMarked(m.id);
                  }}
                >
                  {#if markingIds[m.id]}
                    <span class="spinner" aria-hidden="true"></span>
                  {:else}
                    Watched
                  {/if}
                </button>
              </div>
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
              <div class="text-xs uppercase tracking-widest pt-1 first:pt-0" style="color: var(--la-text-muted);">
                {day}
              </div>
              {#each list as a (a.airingAt)}
                {@const m = a.media}
                {@const label = airingLabel(a)}
                {@const aired = a.episode}
                {@const seen = progressMap[m.id] ?? 0}
                {@const caughtUp = seen >= aired}
                <div
                  class="schedule-row"
                  role="button"
                  tabindex="0"
                  aria-label={`Open ${selectedTitle(m)}`}
                  onclick={() => (selected = m)}
                  onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selected = m;
                    }
                  }}
                >
                  <img
                    class="schedule-cover"
                    style="background: {coverGradient(m.coverImage.color)};"
                    src={m.coverImage.extraLarge ?? m.coverImage.large}
                    alt=""
                    loading="lazy"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium leading-tight line-clamp-1">{selectedTitle(m)}</div>
                    <div class="text-xs mt-0.5 flex items-center flex-wrap gap-x-3" style="color: var(--la-text-muted);">
                      <span class="tabular-nums">{label.text}</span>
                      <span class="tabular-nums">{label.at}</span>
                      <span class="badge {statusLabel(m.status).className} shrink-0">{statusLabel(m.status).text}</span>
                      {#if !caughtUp}
                        <span class="badge shrink-0" style="background: rgba(214,100,74,0.15); border-color: rgba(214,100,74,0.5); color: #e89080;">
                          {#if seen === 0}
                            Not started
                          {:else}
                            {aired - seen} episode{aired - seen === 1 ? '' : 's'} behind
                          {/if}
                        </span>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  {:else if tab === 'season'}
    <div bind:this={seasonPickerSentinel} class="h-px" aria-hidden="true"></div>
    <!-- SEASON CONTROLS (sticky under the site header and nav bar) -->
    <!-- SEASON CONTROLS (sticky under the site header and nav bar; butts out to
        the container edges while affixed) -->
    <div
      class="card py-3 flex flex-wrap items-center gap-x-5 gap-y-2 sticky z-30"
      class:affixed={seasonPickerStuck}
      class:w-full={!seasonPickerStuck}
      class:-mx-8={seasonPickerStuck}
      class:px-8={seasonPickerStuck}
      class:px-4={!seasonPickerStuck}
      style="top: calc(3.5rem + {navHeight}px);"
    >
      <div>
        <div class="text-xs uppercase tracking-widest" style="color: var(--la-text-muted);">
          Season
        </div>
        <div class="la-heading text-lg font-bold la-gold-text">
          {seasonLabel(season.season, season.seasonYear)}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button class="btn" onclick={() => (season = shiftSeason(season.season, season.seasonYear, -1))}>
          ← Prev
        </button>
        <button class="btn" onclick={() => (season = currentSeason())}>
          Current
        </button>
        <button class="btn" onclick={() => (season = shiftSeason(season.season, season.seasonYear, 1))}>
          Next →
        </button>
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
    {:else if error}
      <div class="card p-6 text-center space-y-3">
        <div class="text-[#a29e96]">Could not load season data.</div>
        <div class="text-xs" style="color: var(--la-red);">{error}</div>
        <button
          class="btn"
          onclick={refetchSeason}
        >
          Retry
        </button>
      </div>
    {:else if media.length === 0}
      <div class="card p-6 text-center">
        <div class="text-[#a29e96]">No titles found for this season.</div>
      </div>
    {:else}
      <div class="anime-grid">
        {#each media as m (m.id)}
          {@const s = statusLabel(m.status)}
          {@const air = formatAiring(m)}
          {@const title = selectedTitle(m)}
          {@const isWatched = watchedSet.has(m.id)}
          {@const rel = relationSummary(m, watchedSet)}

          <div
            class="anime-card group"
            role="button"
            tabindex="0"
            aria-label={`View details for ${title}`}
            onclick={() => (selected = m)}
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selected = m;
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
                <span class="badge b-cont absolute left-1.5 top-9" title={rel.label ?? 'Continuing franchise'}>
                  Continuing
                </span>
              {/if}

              <button
                class="watch-toggle"
                class:on={isWatched}
                title={isWatched ? 'Remove from your shows' : 'Add to your shows'}
                aria-label={isWatched ? `Remove ${title} from your shows` : `Add ${title} to your shows`}
                onclick={(e) => {
                  e.stopPropagation();
                  toggleWatch(m.id);
                }}
              >
                {isWatched ? '✓' : '+'}
              </button>

              {#if air.text}
                <div
                  class="absolute inset-x-0 bottom-0 px-2 py-1 text-[10px] font-medium text-left"
                  title={air.at ? `Airs ${air.at}` : undefined}
                  style="color: var(--la-accent-bright); background: linear-gradient(to top, rgba(11,10,14,0.95), rgba(11,10,14,0.35), transparent);"
                >
                  {air.text}
                </div>
              {/if}
            </div>

            <div class="p-2.5 space-y-1.5">
              <div class="text-sm font-medium leading-tight line-clamp-2">{title}</div>
              <div class="text-[11px] line-clamp-1" style="color: var(--la-text-muted);">
                {studioNames(m)}
              </div>
              <div class="flex flex-wrap gap-1">
                {#each m.genres.slice(0, 3) as g}
                  <span class="tag">{g}</span>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- LAZY-LOAD SENTINEL -->
      <div use:scrollMore class="h-2" aria-hidden="true"></div>
      {#if loadingMore}
        <div class="text-center text-xs py-4" style="color: var(--la-text-muted);">
          Loading more…
        </div>
      {:else if loadMoreError}
        <div class="flex items-center justify-center gap-3 py-4">
          <div class="text-xs" style="color: var(--la-red);">Could not load more.</div>
          <button class="btn" onclick={loadMoreSeason}>Retry</button>
        </div>
      {:else if !seasonHasMore}
        <div class="text-center text-xs py-4" style="color: var(--la-text-faint);">
          You've reached the end of this season.
        </div>
      {:else if media.length > 50}
        <div class="text-center text-xs py-4" style="color: var(--la-text-faint);">
          Scroll for more titles…
        </div>
      {/if}
    {/if}
  {:else if tab === 'recommendations'}
    <div class="h-px" aria-hidden="true"></div>
    <div class="card px-4 py-3 flex items-center justify-between gap-3">
      <div>
        <div class="text-xs uppercase tracking-widest" style="color: var(--la-text-muted);">
          Get Started Watching
        </div>
        <div class="la-heading text-lg font-bold la-gold-text">
          Recommended for You
        </div>
      </div>
      <div class="flex items-center gap-3">
        {#if topGenres.length > 0}
          <div class="text-xs hidden sm:flex flex-wrap gap-1 items-center max-w-md justify-end">
            <span style="color: var(--la-text-muted);">Based on:</span>
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
        <div class="text-[#a29e96]">
          Add some shows to your list first so we can learn your favorite genres and recommend anime for you to get started watching!
        </div>
        <button class="btn" onclick={() => setTab('season')}>Browse Seasons</button>
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
        <div class="text-[#a29e96]">Could not load recommendations.</div>
        <div class="text-xs" style="color: var(--la-red);">{recommendedError}</div>
        <button class="btn" onclick={loadRecommendations}>Retry</button>
      </div>
    {:else if recommendedMedia.length === 0}
      <div class="card p-6 text-center">
        <div class="text-[#a29e96]">No recommendations found matching your favorite genres.</div>
      </div>
    {:else}
      <div class="anime-grid">
        {#each recommendedMedia as m (m.id)}
          {@const s = statusLabel(m.status)}
          {@const air = formatAiring(m)}
          {@const title = selectedTitle(m)}
          {@const isWatched = watchedSet.has(m.id)}
          {@const rel = relationSummary(m, watchedSet)}

          <div
            class="anime-card group"
            role="button"
            tabindex="0"
            aria-label={`View details for ${title}`}
            onclick={() => (selected = m)}
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selected = m;
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
                <span class="badge b-cont absolute left-1.5 top-9" title={rel.label ?? 'Continuing franchise'}>
                  Continuing
                </span>
              {/if}

              <button
                class="watch-toggle"
                class:on={isWatched}
                title={isWatched ? 'Remove from your shows' : 'Add to your shows'}
                aria-label={isWatched ? `Remove ${title} from your shows` : `Add ${title} to your shows`}
                onclick={(e) => {
                  e.stopPropagation();
                  toggleWatch(m.id);
                }}
              >
                {isWatched ? '✓' : '+'}
              </button>

              {#if air.text}
                <div
                  class="absolute inset-x-0 bottom-0 px-2 py-1 text-[10px] font-medium text-left"
                  title={air.at ? `Airs ${air.at}` : undefined}
                  style="color: var(--la-accent-bright); background: linear-gradient(to top, rgba(11,10,14,0.95), rgba(11,10,14,0.35), transparent);"
                >
                  {air.text}
                </div>
              {/if}
            </div>

            <div class="p-2.5 space-y-1.5">
              <div class="text-sm font-medium leading-tight line-clamp-2">{title}</div>
              <div class="text-[11px] line-clamp-1" style="color: var(--la-text-muted);">
                {studioNames(m)}
              </div>
              <div class="flex flex-wrap gap-1">
                {#each m.genres.slice(0, 3) as g}
                  <span class="tag">{g}</span>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- LAZY-LOAD SENTINEL -->
      <div use:scrollMoreRecommendations class="h-2" aria-hidden="true"></div>
      {#if loadingMoreRecommendations}
        <div class="text-center text-xs py-4" style="color: var(--la-text-muted);">
          Loading more recommendations…
        </div>
      {:else if loadMoreRecommendationsError}
        <div class="flex items-center justify-center gap-3 py-4">
          <div class="text-xs" style="color: var(--la-red);">Could not load more.</div>
          <button class="btn" onclick={loadMoreRecommendations}>Retry</button>
        </div>
      {:else if !recommendationsHasMore && recommendedMedia.length > 0}
        <div class="text-center text-xs py-4" style="color: var(--la-text-faint);">
          You've reached the end of these recommendations. Hit Refresh to pull a new batch!
        </div>
      {:else if recommendedMedia.length > 0}
        <div class="text-center text-xs py-4" style="color: var(--la-text-faint);">
          Scroll for more recommendations…
        </div>
      {/if}
    {/if}
  {:else if tab === 'backlog'}
    <div class="h-px" aria-hidden="true"></div>
    <div class="card px-4 py-3 flex items-center justify-between gap-3">
      <div>
        <div class="text-xs uppercase tracking-widest" style="color: var(--la-text-muted);">
          Your Backlog
        </div>
        <div class="la-heading text-lg font-bold la-gold-text">
          Unstarted Shows ({startedWatching.length})
        </div>
      </div>
    </div>

    {#if startedWatching.length === 0}
      <div class="card p-8 text-center space-y-3">
        <div class="text-[#a29e96]">
          Your backlog is empty! All shows on your list have already been started.
        </div>
        <button class="btn" onclick={() => setTab('recommendations')}>Get Recommendations</button>
      </div>
    {:else}
      <div class="anime-grid">
        {#each startedWatching as m (m.id)}
          {@const s = statusLabel(m.status)}
          {@const air = formatAiring(m)}
          {@const title = selectedTitle(m)}
          {@const isWatched = watchedSet.has(m.id)}
          {@const rel = relationSummary(m, watchedSet)}

          <div
            class="anime-card group"
            role="button"
            tabindex="0"
            aria-label={`View details for ${title}`}
            onclick={() => (selected = m)}
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selected = m;
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
                <span class="badge b-cont absolute left-1.5 top-9" title={rel.label ?? 'Continuing franchise'}>
                  Continuing
                </span>
              {/if}

              <button
                class="watch-toggle"
                class:on={isWatched}
                title={isWatched ? 'Remove from your shows' : 'Add to your shows'}
                aria-label={isWatched ? `Remove ${title} from your shows` : `Add ${title} to your shows`}
                onclick={(e) => {
                  e.stopPropagation();
                  toggleWatch(m.id);
                }}
              >
                {isWatched ? '✓' : '+'}
              </button>

              <button
                class="absolute bottom-2 left-2 right-2 btn text-xs py-1 z-10 transition hover:bg-[var(--la-accent)] hover:text-black hover:border-[var(--la-accent)]"
                style="background: rgba(11,10,14,0.9); border-color: var(--la-accent); color: var(--la-accent-bright);"
                title={isSingleEpisode(m) ? 'Mark as watched' : 'Started watching (mark episode 1 watched)'}
                onclick={(e) => {
                  e.stopPropagation();
                  if (isSingleEpisode(m)) {
                    setProgress(m.id, 1);
                  } else {
                    advanceProgress(m.id);
                  }
                }}
              >
                {isSingleEpisode(m) ? 'Mark as Watched' : 'Started Watching (+1)'}
              </button>
            </div>

            <div class="p-2.5 space-y-1.5">
              <div class="text-sm font-medium leading-tight line-clamp-2">{title}</div>
              <div class="text-[11px] line-clamp-1" style="color: var(--la-text-muted);">
                {studioNames(m)}
              </div>
              <div class="flex flex-wrap gap-1">
                {#each m.genres.slice(0, 3) as g}
                  <span class="tag">{g}</span>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {:else}
    <!-- MY LIST -->
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
        <div class="text-[#a29e96]">Could not load your shows.</div>
        <div class="text-xs" style="color: var(--la-red);">{watchedError}</div>
        <button class="btn" onclick={retryWatched}>Retry</button>
      </div>
    {:else if watchingList.length === 0}
      <div class="card p-6 text-center">
        <div class="text-[#a29e96]">
          No shows picked yet - open the Season tab and tap <span class="la-gold-text">+</span> on anything you're
          watching.
        </div>
      </div>
    {:else}
      <!-- FLAT STATUS FILTER -->
      <div class="flex flex-wrap items-center gap-2">
        {#each [
          { key: 'airing' as ListFilter, label: 'Airing & Upcoming', count: airingList.length + upcomingGroups.reduce((n, g) => n + g.items.length, 0) },
          { key: 'finished' as ListFilter, label: 'Finished', count: watchingList.filter((m) => m.status === 'FINISHED').length },
        ] as f (f.key)}
          <button
            class="filter-chip"
            class:active={myFilter === f.key}
            onclick={() => (myFilter = f.key)}
          >
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
              <div class="text-xs uppercase tracking-widest px-2 pb-2" style="color: var(--la-text-muted);">
                Seasons
              </div>
              <nav class="flex gap-1 lg:flex-col">
                <button
                  class="filter-chip"
                  class:active={mySeason === 'all'}
                  onclick={() => (mySeason = 'all')}
                >
                  <span>All</span>
                  <span class="filter-chip-count">{finishedGroups.reduce((n, g) => n + g.items.length, 0)}</span>
                </button>
                {#each finishedGroups as g (g.key)}
                  <button
                    class="filter-chip"
                    class:active={mySeason === g.key}
                    onclick={() => (mySeason = g.key)}
                  >
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
              <!-- AIRING first -->
              {#if airingList.length > 0}
                <div class="space-y-1">
                  <div class="flex items-baseline gap-2">
                    <h3 class="la-heading text-base font-bold">Airing</h3>
                    <span class="text-xs" style="color: var(--la-text-muted);">{airingList.length}</span>
                  </div>
                  <div class="space-y-2">
                    {#each airingList as m (m.id)}
                      {@render listRow(m)}
                    {/each}
                  </div>
                </div>
              {/if}

              <!-- UPCOMING grouped by broadcast season -->
              {#if upcomingGroups.length > 0}
                {#each upcomingGroups as g (g.key)}
                  {#if g.items.length > 0}
                    <div class="space-y-1">
                      <div class="flex items-baseline gap-2">
                        <h3 class="la-heading text-base font-bold">{g.label}</h3>
                        <span class="text-xs" style="color: var(--la-text-muted);">{g.items.length}</span>
                      </div>
                      <div class="space-y-2">
                        {#each g.items as m (m.id)}
                          {@render listRow(m)}
                        {/each}
                      </div>
                    </div>
                  {/if}
                {/each}
              {/if}
            {:else}
              <div class="card p-6 text-center">
                <div class="text-[#a29e96]">
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
                      <span class="text-xs" style="color: var(--la-text-muted);">{g.items.length}</span>
                    </div>
                    <div class="space-y-2">
                      {#each g.items as m (m.id)}
                        {@render listRow(m)}
                      {/each}
                    </div>
                  </div>
                {/if}
              {/each}
            {:else}
              <div class="card p-6 text-center">
                <div class="text-[#a29e96]">No finished shows on your list yet.</div>
              </div>
            {/if}
          {/if}
        </div>
      </div>
    {/if}
  {/if}
  {/if}
</section>

  {#snippet sharePreviewRow(m: AniListMedia)}
    {@const title = selectedTitle(m)}
    {@const total = totalEpisodes(m)}
    {@const seen = $progress[m.id] ?? 0}
    <div class="flex items-center gap-3">
      <img
        class="w-9 h-12 shrink-0 rounded-sm object-cover"
        style="background: {coverGradient(m.coverImage.color)};"
        src={m.coverImage.extraLarge ?? m.coverImage.large}
        alt=""
        loading="lazy"
      />
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium leading-tight line-clamp-1">{title}</div>
        <div class="text-xs mt-0.5 flex items-center gap-2" style="color: var(--la-text-muted);">
          <span class="badge {statusLabel(m.status).className} shrink-0">{statusLabel(m.status).text}</span>
          {#if seen > 0}
            <span class="badge b-progress shrink-0 tabular-nums" title="Episodes you've watched">
              {seen}
              {#if total}<span class="opacity-70">/{total}</span>{/if}
            </span>
          {/if}
        </div>
      </div>
      {#if m.averageScore}
        <span class="score-badge shrink-0">{m.averageScore}</span>
      {/if}
    </div>
  {/snippet}

{#if selected}
  <div
    use:portal
    class="fixed inset-0 z-[9999] overflow-y-auto"
    style="background: rgba(0,0,0,0.78); backdrop-filter: blur(4px); overscroll-behavior: contain;"
  >
    <div
      class="flex min-h-full items-center justify-center p-4"
      role="presentation"
      onclick={(e) => {
        if (e.target === e.currentTarget) selected = null;
      }}
    >
      <div class="card w-full max-w-2xl my-6 flex flex-col max-h-[90vh]" role="dialog" aria-modal="true">
        <!-- BANNER -->
        {#if selected.bannerImage}
          <div class="relative h-40 sm:h-52 shrink-0">
            <img
              class="h-full w-full object-cover"
              style="background: {coverGradient(selected.coverImage.color)};"
              src={selected.bannerImage}
              alt=""
            />
            <div class="absolute inset-0" style="background: linear-gradient(to top, var(--la-panel), transparent);"></div>
          </div>
        {/if}

        <!-- CONTENT -->
        <div class="px-5 pt-6 pb-4 space-y-4 overflow-y-auto flex-1 min-h-0">
          <!-- HEADER -->
          <div class="flex gap-4">
            {#if selected.bannerImage}
              <img
                class="w-24 h-36 rounded-sm object-cover border shrink-0"
                style="background: {coverGradient(selected.coverImage.color)}; border-color: var(--la-border-strong); box-shadow: 0 8px 24px rgba(0,0,0,0.6);"
                src={selected.coverImage.extraLarge ?? selected.coverImage.large}
                alt=""
              />
            {:else}
              <img
                class="w-24 h-36 rounded-sm object-cover border shrink-0"
                style="background: {coverGradient(selected.coverImage.color)}; border-color: var(--la-border);"
                src={selected.coverImage.extraLarge ?? selected.coverImage.large}
                alt=""
              />
            {/if}

            <div class="min-w-0 pt-1">
              <h2 class="la-heading text-2xl font-bold leading-tight">
                {selected.title.english ?? mainTitle(selected)}
              </h2>
              {#if selected.title.romaji && selected.title.romaji !== (selected.title.english ?? mainTitle(selected))}
                <div class="text-sm mt-0.5" style="color: var(--la-text-muted);">
                  {selected.title.romaji}
                </div>
              {/if}
              {#if selected.title.native}
                <div class="text-xs mt-0.5" style="color: var(--la-text-faint);">
                  {selected.title.native}
                </div>
              {/if}
            </div>
          </div>

          <!-- META -->
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span style="color: var(--la-text-muted);">
              {formatLabel(selected.format)}
              {#if selected.episodes} · {selected.episodes} eps{/if}
              {#if selected.duration} · {selected.duration}m{/if}
            </span>
            <span style="color: var(--la-text-muted);">
              {selected.startDate?.year ? dateLabel(selected.startDate) : '-'}
              {#if selected.endDate?.year}
                → {dateLabel(selected.endDate)}
              {/if}
            </span>
            <span style="color: var(--la-text-muted);">
              Score: <span class="la-gold-text font-semibold">{selected.averageScore ?? '-'}</span>
              · Popularity: {selected.popularity?.toLocaleString() ?? '-'}
            </span>
            <span style="color: var(--la-text-muted);">Studio: {studioNames(selected)}</span>
            <span style="color: var(--la-text-muted);">Source: {sourceLabel(selected.source)}</span>
            </div>

            <!-- SEASON -->
            {#if seasonPageUrl(selected)}
              <div class="mt-2">
                <button
                  class="btn px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
                  onclick={() => navigate(seasonPageUrl(selected))}
                >
                  <CalendarIcon size={14} />
                  View Season
                </button>
              </div>
            {/if}

            <!-- AIRING -->
          {#if detailPending}
            <div class="text-xs" style="color: var(--la-text-faint);">
              Loading full details…
            </div>
          {/if}
          {#if selected.nextAiringEpisode}
            {@const air = formatAiring(selected)}
            <div class="text-xs font-semibold" style="color: var(--la-accent-bright);">
              {air.text}
              {#if air.at}· airs {air.at}{/if}
            </div>
          {/if}

          <!-- PREQUELS & SEQUELS -->
          {#if selectedRelations.length > 0}
            <div class="space-y-1.5">
              <div class="text-xs uppercase tracking-widest" style="color: var(--la-text-muted);">
                Prequels & Sequels
              </div>
              <div class="space-y-2">
                {#each selectedRelations as e (e.node.id)}
                  {@const n = e.node}
                  {@const rn = statusLabel(n.status)}
                  {@const rTitle = n.title.english ?? n.title.romaji}
                  {@const isPrequel = e.relationType === 'PREQUEL'}
                  {@const relSeen = progressMap[n.id] ?? 0}
                  {@const relInList = watchedSet.has(n.id)}
                  <button
                    class="schedule-row w-full text-left"
                    onclick={() => openRecommended(n)}
                  >
                    <img
                      class="schedule-cover"
                      style="background: {coverGradient(n.coverImage?.color ?? null)};"
                      src={n.coverImage?.large ?? ''}
                      alt=""
                      loading="lazy"
                    />
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium leading-tight line-clamp-1">{rTitle}</div>
                      <div class="text-xs mt-0.5 flex items-center gap-2" style="color: var(--la-text-muted);">
                        <span class="la-gold-text shrink-0">{isPrequel ? 'Prequel' : 'Sequel'}</span>
                        <span class="badge {rn.className} shrink-0">{rn.text}</span>
                        {#if isPrequel && (n.startDate?.year ?? 0) > 0}
                          <span class="line-clamp-1">({n.startDate.year})</span>
                        {/if}
                        {#if relSeen > 0}
                          <span class="badge b-progress shrink-0" title="Episodes you've watched">
                            {relSeen}
                          </span>
                        {/if}
                        {#if relInList}
                          <span class="la-gold-text shrink-0" title="On your list">✓</span>
                        {/if}
                      </div>
                    </div>
                    {#if n.averageScore}
                      <span class="score-badge shrink-0">{n.averageScore}</span>
                    {/if}
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <!-- PROGRESS -->
          {#if watchedSet.has(selected.id)}
            {@const seen = progressMap[selected.id] ?? 0}
            {@const total = totalEpisodes(selected)}
            {@const cap = maxCatchUp(selected)}
            {@const atCap = cap !== Number.POSITIVE_INFINITY && seen >= cap}
            {@const pct = total === Number.POSITIVE_INFINITY ? 0 : Math.min(100, Math.round((seen / total) * 100))}
            <div class="space-y-1.5">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs uppercase tracking-widest" style="color: var(--la-text-muted);">
                  Progress
                </span>
                <span class="text-sm font-semibold tabular-nums">
                  {seen}
                  {#if total !== Number.POSITIVE_INFINITY}<span class="opacity-60">/ {total}</span>{/if}
                </span>
                <button
                  class="btn px-2 py-0.5"
                  disabled={atCap}
                  title={atCap
                    ? cap === 0
                      ? 'Nothing has aired yet'
                      : `Caught up to the latest aired episode${selected.status === 'RELEASING' ? ' so far' : ''}`
                    : 'Mark one more episode watched'}
                  onclick={() => setProgress(selected.id, Math.min(seen + 1, cap))}
                >
                  +1
                </button>
                <button class="btn px-2 py-0.5" title="Undo one episode" onclick={() => setProgress(selected.id, seen - 1)}>
                  −1
                </button>
                 {#if !atCap && cap !== Number.POSITIVE_INFINITY && seen !== cap}
                    <button
                      class="btn px-2 py-0.5"
                      title={isSingleEpisode(selected) ? 'Mark as watched' : selected.status === 'FINISHED' ? 'Mark all remaining episodes as watched' : 'Catch up fully'}
                      onclick={() => setProgress(selected.id, cap)}
                    >
                      {isSingleEpisode(selected) ? 'Mark as watched' : selected.status === 'FINISHED' ? 'Mark all watched' : 'Catch up'}
                    </button>
                 {/if}
              </div>
              {#if total !== Number.POSITIVE_INFINITY}
                <div class="h-1 rounded-full overflow-hidden" style="background: rgba(255,255,255,0.08);">
                  <div
                    class="h-full rounded-full transition-all"
                    style="width: {pct}%; background: var(--la-accent);"
                  ></div>
                </div>
              {/if}
            </div>
          {/if}

          <!-- GENRES -->
          {#if selected.genres.length > 0}
            <div class="flex flex-wrap gap-1.5">
              {#each selected.genres as g}
                <span class="tag">{g}</span>
              {/each}
            </div>
          {/if}

          <!-- SYNOPSIS -->
          {#if selected.descriptionHtml}
            <div
              class="text-sm leading-relaxed whitespace-pre-line [&_a]:text-[#e8c987] [&_a]:underline"
              style="color: #d5d1c9;"
            >
              {@html selected.descriptionHtml}
            </div>
          {/if}

          <!-- TRAILER -->
          {#if selected.trailer?.site === 'youtube' && selected.trailer.id}
            <div class="aspect-video overflow-hidden rounded-sm border" style="border-color: var(--la-border);">
              <iframe
                class="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${selected.trailer.id}`}
                title="Trailer"
                loading="lazy"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
              ></iframe>
            </div>
          {/if}
        </div>

        <!-- FOOTER CONTROLS -->
        <div
          class="px-5 py-3 border-t flex flex-wrap items-center gap-2 shrink-0"
          style="border-color: var(--la-border);"
        >
          <button
            class="btn"
            class:on={watchedSet.has(selected.id)}
            style={watchedSet.has(selected.id) ? 'color: var(--la-accent-bright); border-color: var(--la-accent);' : ''}
            title={watchedSet.has(selected.id) ? 'Remove from your shows' : 'Add to your shows'}
            onclick={() => toggleWatch(selected.id)}
          >
            {watchedSet.has(selected.id) ? '✓ Watching' : '+ Watch'}
          </button>
          <a
            class="btn"
            href={`https://anilist.co/anime/${selected.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open on AniList ↗
          </a>
          {#if selected.idMal}
            <a
              class="btn"
              href={`https://myanimelist.net/anime/${selected.idMal}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              MyAnimeList ↗
            </a>
          {/if}
          <button class="btn ml-auto" onclick={() => (selected = null)}>Close</button>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if infographicOpen}
  <AnimeInfographic
    media={watched}
    progress={$progress}
    onclose={() => (infographicOpen = false)}
  />
{/if}

{#if shareOpen}
  <div
    use:portal
    class="fixed inset-0 z-[9999] overflow-y-auto"
    style="background: rgba(0,0,0,0.78); backdrop-filter: blur(4px); overscroll-behavior: contain;"
  >
    <div
      class="flex min-h-full items-start justify-center p-4"
      role="presentation"
      onclick={(e) => {
        if (e.target === e.currentTarget) shareOpen = false;
      }}
      onkeydown={(e) => {
        if (e.key === 'Escape') shareOpen = false;
      }}
    >
      <div class="card w-full max-w-lg my-4 flex flex-col" role="dialog" aria-modal="true">
        <!-- TOP BAR -->
        <div class="flex items-center gap-2 px-5 pt-4 pb-3">
          <div class="text-xs uppercase tracking-widest" style="color: var(--la-text-muted);">
            Share your list
          </div>
          <button
            class="util-btn ml-auto"
            onclick={() => {
              shareOpen = false;
              shareCopied = false;
            }}
            data-tip="Close"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <!-- SCOPE: full list or one season -->
        <div class="flex gap-2 px-5 pb-3">
          <button
            class="scope-chip flex-1"
            class:active={shareScope === 'all'}
            onclick={() => {
              shareScope = 'all';
              shareCopied = false;
            }}
          >
            <span class="scope-chip-title">Full list</span>
            <span class="scope-chip-count">{$watchlist.length} shows</span>
          </button>
          <button
            class="scope-chip flex-1"
            class:active={shareScope === 'season'}
            onclick={() => {
              shareScope = 'season';
              shareCopied = false;
            }}
          >
            <span class="scope-chip-title">One season</span>
            <span class="scope-chip-count">{scopedShareMedia.length} shows</span>
          </button>
        </div>

        <!-- SEASON PICKER (only relevant when scoping to a season) -->
        {#if shareScope === 'season'}
          <div class="card border overflow-hidden px-2 py-1.5 flex items-center justify-between gap-2 mx-5 mb-3">
            <button
              class="util-btn"
              onclick={() => (shareSeason = shiftSeason(shareSeason.season, shareSeason.seasonYear, -1))}
              data-tip="Previous season"
              aria-label="Previous season"
            >
              <ChevronLeft size={15} />
            </button>
            <div class="text-xs uppercase tracking-widest la-gold-text">
              {seasonLabel(shareSeason.season, shareSeason.seasonYear)}
            </div>
            <button
              class="util-btn"
              onclick={() => (shareSeason = shiftSeason(shareSeason.season, shareSeason.seasonYear, 1))}
              data-tip="Next season"
              aria-label="Next season"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <!-- PREVIEW -->
          <div class="mx-5 mb-3 max-h-56 overflow-y-auto space-y-2 pr-1" style="overscroll-behavior: contain;">
            {#if scopedShareMedia.length === 0}
              <div class="text-sm py-2" style="color: var(--la-text-muted);">
                No shows from {seasonLabel(shareSeason.season, shareSeason.seasonYear)} on your list yet.
              </div>
            {:else}
              {#each scopedShareMedia as m (m.id)}
                {@render sharePreviewRow(m)}
              {/each}
            {/if}
          </div>
        {/if}

        {#if shareCopied}
          <div class="px-5 pb-2 text-xs" style="color: var(--la-green-bright);">Share link copied to clipboard</div>
        {/if}

        <!-- NAME (baked into the code so recipients can't swap it by editing the URL) -->
        <div class="px-5 pb-3">
          <label class="block text-xs uppercase tracking-widest pb-1.5" for="shareNameInput" style="color: var(--la-text-muted);">
            Your name
          </label>
          <input
            id="shareNameInput"
            type="text"
            maxlength="40"
            placeholder="Optional - shown to whoever imports your list"
            class="input w-full"
            bind:value={shareName}
            oninput={() => (shareCopied = false)}
          />
        </div>

        <!-- COPY -->
        <div class="px-5 pb-5 pt-1">
          <button class="btn w-full" onclick={copyShareLink}>
            Copy share link
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}