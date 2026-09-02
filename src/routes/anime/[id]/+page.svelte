<script lang="ts">
  import { getContext } from 'svelte';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import {
    dateLabel,
    formatAiring,
    formatLabel,
    loadMediaById,
    loadMediaByGenres,
    mainTitle,
    seasonLabel,
    sourceLabel,
    statusLabel,
    studioNames,
  } from '$lib/api/anilist';
  import { safeDescriptions } from '$lib/utils/html';
  import { progress, watchlist, toggleWatch, setProgress, advanceProgress } from '$lib/stores/watchlist';
  import type {
    AniListMedia,
    AniListRelationEdge,
    AniListSeason,
  } from '$lib/types/anime';

  const id = $derived(Number($page.params.id));

  let media = $state<AniListMedia | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  $effect(() => {
    const currentId = id;
    if (!Number.isFinite(currentId)) return;
    let cancelled = false;
    loading = true;
    error = null;
    loadMediaById(currentId)
      .then(async (m) => {
        if (cancelled) return;
        media = (await safeDescriptions([m]))[0];
        loading = false;
      })
      .catch((e) => {
        if (cancelled) return;
        error = e instanceof Error ? e.message : String(e);
        loading = false;
      });
    return () => { cancelled = true; };
  });

  let similar = $state<AniListMedia[]>([]);
  let similarLoading = $state(false);

  $effect(() => {
    const m = media;
    const inList = $watchlist;
    if (!m || m.genres.length === 0) { similar = []; similarLoading = false; return; }
    let cancelled = false;
    similarLoading = true;
    loadMediaByGenres(m.genres, 1)
      .then(async (pageData) => {
        if (cancelled) return;
        const notInList = pageData.media.filter((c) => c.id !== m.id && !inList.includes(c.id));
        const shuffled = [...notInList].sort(() => Math.random() - 0.5);
        similar = (await safeDescriptions(shuffled)).slice(0, 5);
        similarLoading = false;
      })
      .catch(() => { if (!cancelled) { similar = []; similarLoading = false; } });
    return () => { cancelled = true; };
  });

  const watchedSet = $derived(new Set($watchlist));
  const progressMap = $derived($progress);

  const selectedRelations = $derived(
    media
      ? (media.relations?.edges ?? [])
          .filter((e): e is AniListRelationEdge =>
            e.node.type === 'ANIME' && (e.relationType === 'PREQUEL' || e.relationType === 'SEQUEL'))
          .sort((a, b) => {
            const rank = { PREQUEL: 0, SEQUEL: 1 } as Record<string, number>;
            return (rank[a.relationType ?? ''] ?? 2) - (rank[b.relationType ?? ''] ?? 2);
          })
      : [],
  );

  function totalEpisodes(m: AniListMedia): number {
    return m.episodes ?? m.nextAiringEpisode?.episode ?? Number.POSITIVE_INFINITY;
  }

  function maxCatchUp(m: AniListMedia): number {
    if (m.status === 'RELEASING' && m.nextAiringEpisode) return m.nextAiringEpisode.episode - 1;
    return totalEpisodes(m);
  }

  function isSingleEpisode(m: AniListMedia): boolean {
    return m.format === 'MOVIE' || totalEpisodes(m) === 1;
  }

  function coverGradient(color: string | null): string {
    if (!color) return 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(11,10,14,0) 70%)';
    return `linear-gradient(180deg, ${color}14 0%, ${color}55 45%, #0b0a0e 92%)`;
  }

  function seasonSlugOf(m: AniListMedia): AniListSeason | null {
    const month = m.startDate?.month ?? null;
    if (!month) return null;
    if (month <= 3) return 'WINTER';
    if (month <= 6) return 'SPRING';
    if (month <= 9) return 'SUMMER';
    return 'FALL';
  }

  function seasonPageUrl(m: AniListMedia): string | undefined {
    if (!m.startDate?.year) return;
    const seasonMap: Record<AniListSeason, string> = { WINTER: 'winter', SPRING: 'spring', SUMMER: 'summer', FALL: 'fall' };
    const season = seasonSlugOf(m);
    if (!season) return undefined;
    return `/anime/seasons/${m.startDate.year}/${seasonMap[season]}/`;
  }
</script>

<svelte:head>
  <title>{media ? (media.title.english ?? mainTitle(media)) : 'Anime'}</title>
</svelte:head>

{#if loading}
  <div class="card p-8">
    <div class="flex gap-6">
      <div class="w-40 h-60 skeleton rounded-sm shrink-0"></div>
      <div class="flex-1 space-y-3">
        <div class="h-6 w-3/4 skeleton rounded"></div>
        <div class="h-4 w-1/2 skeleton rounded"></div>
        <div class="h-24 w-full skeleton rounded"></div>
        <div class="h-4 w-2/3 skeleton rounded"></div>
      </div>
    </div>
  </div>
{:else if error}
  <div class="card p-6 text-center space-y-3">
    <div style="color: var(--text-muted);">Could not load this anime.</div>
    <div class="text-xs" style="color: var(--red);">{error}</div>
    <a class="btn" href={`https://anilist.co/anime/${id}`} target="_blank" rel="noopener noreferrer">
      Open on AniList ↗
    </a>
  </div>
{:else if media}
  {@const m = media}
  {@const title = m.title.english ?? mainTitle(m)}
  {@const s = statusLabel(m.status)}
  {@const inList = watchedSet.has(m.id)}
  {@const seen = progressMap[m.id] ?? 0}
  {@const total = totalEpisodes(m)}
  {@const cap = maxCatchUp(m)}
  {@const atCap = cap !== Number.POSITIVE_INFINITY && seen >= cap}
  {@const pct = total === Number.POSITIVE_INFINITY ? 0 : Math.min(100, Math.round((seen / total) * 100))}
  {@const seasonUrl = seasonPageUrl(m)}
  {@const seasonName = seasonSlugOf(m)}
  {@const air = formatAiring(m)}

  <div class="card overflow-hidden -mx-8 -mt-4" style="border-top-left-radius: 0; border-top-right-radius: 0;">
    <!-- BANNER -->
    {#if m.bannerImage}
      <div class="relative h-40 sm:h-56 lg:h-64">
        <img class="h-full w-full object-cover" style="background: {coverGradient(m.coverImage.color)};"
          src={m.bannerImage} alt="" />
        <div class="absolute inset-0" style="background: linear-gradient(to top, var(--panel), transparent);"></div>
      </div>
    {/if}

    <div class="p-5 sm:p-8">
      <div class="lg:grid lg:grid-cols-[280px_1fr] lg:gap-10">
        <!-- LEFT SIDEBAR -->
        <div class="lg:max-w-[280px]">
          <img class="w-full max-w-[220px] lg:max-w-none mx-auto lg:mx-0 rounded-sm object-cover border"
            style="background: {coverGradient(m.coverImage.color)}; border-color: var(--border); {m.bannerImage ? 'margin-top: -7rem; position: relative; z-index: 1; box-shadow: 0 12px 32px rgba(0,0,0,0.65);' : 'box-shadow: 0 8px 24px rgba(0,0,0,0.5);'}"
            src={m.coverImage.extraLarge ?? m.coverImage.large} alt={title} />

          <!-- QUICK FACTS -->
          <div class="mt-6 space-y-2.5 text-sm">
            <div class="flex justify-between items-center gap-4">
              <span class="text-xs uppercase tracking-widest shrink-0" style="color: var(--text-muted);">Status</span>
              <span class="badge {s.className} shrink-0">{s.text}</span>
            </div>
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-xs uppercase tracking-widest shrink-0" style="color: var(--text-muted);">Format</span>
              <span class="text-right tabular-nums" style="color: var(--text-secondary);">
                {formatLabel(m.format)}
                {#if m.episodes}· {m.episodes} eps{/if}
                {#if m.duration}· {m.duration}m{/if}
              </span>
            </div>
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-xs uppercase tracking-widest shrink-0" style="color: var(--text-muted);">Aired</span>
              <span class="text-right tabular-nums" style="color: var(--text-secondary);">
                {m.startDate?.year ? dateLabel(m.startDate) : '-'}
                {#if m.endDate?.year}→ {dateLabel(m.endDate)}{/if}
              </span>
            </div>
            {#if seasonUrl && seasonName}
              <div class="flex justify-between items-center gap-4">
                <span class="text-xs uppercase tracking-widest shrink-0" style="color: var(--text-muted);">Season</span>
                <a class="la-gold-text underline text-right" href={seasonUrl} title="Browse the season this aired in">
                  {seasonLabel(seasonName, m.startDate?.year ?? 0)}
                </a>
              </div>
            {/if}
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-xs uppercase tracking-widest shrink-0" style="color: var(--text-muted);">Score</span>
              <span class="text-right">
                <span class="la-gold-text font-semibold tabular-nums">{m.averageScore ?? '-'}</span>
                <span class="text-xs opacity-60">/100 · {m.popularity?.toLocaleString() ?? '-'} pop</span>
              </span>
            </div>
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-xs uppercase tracking-widest shrink-0" style="color: var(--text-muted);">Studio</span>
              <span class="text-right line-clamp-2" style="color: var(--text-secondary);">{studioNames(m)}</span>
            </div>
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-xs uppercase tracking-widest shrink-0" style="color: var(--text-muted);">Source</span>
              <span class="text-right" style="color: var(--text-secondary);">{sourceLabel(m.source)}</span>
            </div>
          </div>

          <!-- NEXT AIRING -->
          {#if m.nextAiringEpisode}
            <div class="mt-5 text-sm font-semibold" style="color: var(--accent-bright);">
              {air.text} {#if air.at}· airs {air.at}{/if}
            </div>
          {/if}

          <!-- GENRES -->
          {#if m.genres.length > 0}
            <div class="flex flex-wrap gap-1.5 mt-5">
              {#each m.genres as g}<span class="tag">{g}</span>{/each}
            </div>
          {/if}

          <!-- PROGRESS -->
          {#if inList}
            <div class="space-y-1.5 mt-5">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs uppercase tracking-widest" style="color: var(--text-muted);">Progress</span>
                <span class="text-sm font-semibold tabular-nums ml-auto">
                  {seen}{#if total !== Number.POSITIVE_INFINITY} <span class="opacity-60">/ {total}</span>{/if}
                </span>
              </div>
              <div class="flex items-center gap-1.5">
                <button class="btn flex-1 px-2 py-1 text-xs" disabled={atCap}
                  title={atCap ? 'Caught up' : 'Mark one more episode watched'}
                  onclick={() => setProgress(m.id, Math.min(seen + 1, cap))}>+1</button>
                <button class="btn px-2 py-1 text-xs" title="Undo one episode" onclick={() => setProgress(m.id, seen - 1)}>−1</button>
                {#if !atCap && cap !== Number.POSITIVE_INFINITY && seen !== cap}
                  <button class="btn flex-1 px-2 py-1 text-xs" onclick={() => setProgress(m.id, cap)}>
                    {isSingleEpisode(m) ? 'Mark watched' : m.status === 'FINISHED' ? 'All watched' : 'Catch up'}
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

          <!-- ACTIONS -->
          <div class="mt-6">
            <button
              class:watch-watching={inList}
              class:watch-primary={!inList}
              title={inList ? 'Remove from your shows' : 'Add to your shows'}
              onclick={() => toggleWatch(m.id)}>
              {inList ? '✓ Watching' : '+ Watch'}
            </button>
            <div class="flex items-center justify-center gap-4 mt-3 text-xs">
              <a class="la-gold-text underline underline-offset-2 hover:brightness-125 hover:opacity-100 transition" href={`https://anilist.co/anime/${m.id}`} target="_blank" rel="noopener noreferrer">AniList ↗</a>
              {#if m.idMal}
                <span class="opacity-30" aria-hidden="true">·</span>
                <a class="la-gold-text underline underline-offset-2 hover:brightness-125 hover:opacity-100 transition" href={`https://myanimelist.net/anime/${m.idMal}`} target="_blank" rel="noopener noreferrer">MyAnimeList ↗</a>
              {/if}
            </div>
          </div>
        </div>

        <!-- RIGHT MAIN COLUMN -->
        <div class="mt-6 lg:mt-0">
          <h1 class="la-heading text-3xl font-bold leading-tight">{title}</h1>
          {#if m.title.romaji && m.title.romaji !== title}
            <div class="text-base mt-1" style="color: var(--text-muted);">{m.title.romaji}</div>
          {/if}
          {#if m.title.native}
            <div class="text-sm mt-0.5" style="color: var(--text-faint);">{m.title.native}</div>
          {/if}

          <!-- SYNOPSIS -->
          {#if m.descriptionHtml}
            <div class="mt-6 max-w-prose">
              <div class="text-xs uppercase tracking-widest mb-2" style="color: var(--text-muted);">Synopsis</div>
              <div class="text-[15px] leading-relaxed whitespace-pre-line [&_a]:text-[var(--accent)] [&_a]:underline"
                style="color: var(--text-secondary);">
                {@html m.descriptionHtml}
              </div>
            </div>
          {/if}

          <!-- TRAILER -->
          {#if m.trailer?.site === 'youtube' && m.trailer.id}
            <div class="mt-8 max-w-2xl">
              <div class="text-xs uppercase tracking-widest mb-2" style="color: var(--text-muted);">Trailer</div>
              <div class="aspect-video overflow-hidden rounded-sm border" style="border-color: var(--border);">
                <iframe class="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${m.trailer.id}`}
                  title="Trailer" loading="lazy" frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen></iframe>
              </div>
            </div>
          {/if}

          <!-- PREQUELS & SEQUELS -->
          {#if selectedRelations.length > 0}
            <div class="mt-8">
              <div class="text-xs uppercase tracking-widest mb-2" style="color: var(--text-muted);">Prequels & Sequels</div>
              <div class="grid sm:grid-cols-2 gap-2">
                {#each selectedRelations as e (e.node.id)}
                  {@const n = e.node}
                  {@const rn = statusLabel(n.status)}
                  {@const rTitle = n.title.english ?? n.title.romaji}
                  {@const relSeen = progressMap[n.id] ?? 0}
                  {@const relInList = watchedSet.has(n.id)}
                  <a class="schedule-row" href={`/anime/${n.id}/`}>
                    <img class="schedule-cover" style="background: {coverGradient(n.coverImage?.color ?? null)};"
                      src={n.coverImage?.large ?? ''} alt="" loading="lazy" />
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium leading-tight line-clamp-1">{rTitle}</div>
                      <div class="text-xs mt-0.5 flex items-center gap-2" style="color: var(--text-muted);">
                        <span class="la-gold-text">{e.relationType === 'PREQUEL' ? 'Prequel' : 'Sequel'}</span>
                        <span class="badge {rn.className}">{rn.text}</span>
                        {#if relSeen > 0}<span class="badge b-progress">{relSeen}ep</span>{/if}
                        {#if relInList}<span class="la-gold-text">✓</span>{/if}
                      </div>
                    </div>
                    {#if n.averageScore}<span class="score-badge shrink-0">{n.averageScore}</span>{/if}
                  </a>
                {/each}
              </div>
            </div>
          {/if}

          <!-- SIMILAR -->
          {#if similar.length > 0 || similarLoading}
            <div class="mt-8">
              <div class="text-xs uppercase tracking-widest mb-2" style="color: var(--text-muted);">
                You Might Also Like
              </div>
              {#if similarLoading}
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {#each Array(5) as _, i}
                    <div class="aspect-[2/3] skeleton rounded-sm"></div>
                  {/each}
                </div>
              {:else}
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {#each similar as s (s.id)}
                    {@const sTitle = s.title.english ?? s.title.romaji ?? mainTitle(s)}
                    <a href={`/anime/${s.id}/`} class="group block overflow-hidden rounded-sm border transition"
                      style="border-color: var(--border); background: var(--panel);">
                      <div class="relative aspect-[2/3]" style="background: {coverGradient(s.coverImage.color)};">
                        <img class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          src={s.coverImage.extraLarge ?? s.coverImage.large} alt={sTitle} loading="lazy" />
                        {#if s.averageScore}
                          <span class="score-badge absolute right-1.5 top-1.5">{s.averageScore}</span>
                        {/if}
                      </div>
                      <div class="p-2 space-y-1">
                        <div class="text-sm font-medium leading-tight line-clamp-2">{sTitle}</div>
                        <div class="text-[11px] line-clamp-1" style="color: var(--text-muted);">
                          {studioNames(s)}
                        </div>
                      </div>
                    </a>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}