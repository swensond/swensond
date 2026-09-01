<script lang="ts">
  import { toPng } from 'html-to-image';
  import { Check, ChevronLeft, ChevronRight, Copy, Download, X } from '@lucide/svelte';
  import { currentSeason, seasonLabel, shiftSeason } from '$lib/api/anilist';
  import type { AniListMedia, AniListSeason } from '$lib/types/anime';
  import type { ProgressMap } from '$lib/stores/watchlist';
  import { computeInfographic, type InfographicStats } from '$lib/utils/infographic';
  import { portal } from '$lib/actions/portal';

  interface Props {
    media: AniListMedia[];
    progress: ProgressMap;
    onclose: () => void;
  }

  let { media, progress, onclose }: Props = $props();

  const NAME_KEY = 'anime-watch-tool-infographic-name';
  const THEME_KEY = 'anime-watch-tool-infographic-theme';

  type ThemeKey = 'midnight' | 'paper';

  const THEMES: Record<
    ThemeKey,
    {
      label: string;
      pad: number;
      tokens: Record<string, string>;
      statBg: string;
      barBg: string;
    }
  > = {
    midnight: {
      label: 'Midnight',
      pad: 48,
      statBg: 'rgba(255,255,255,0.04)',
      barBg: 'rgba(255,255,255,0.08)',
      tokens: {
        '--inf-bg': '#0b0a0e',
        '--inf-panel': 'rgba(255,255,255,0.03)',
        '--inf-border': 'rgba(255,255,255,0.12)',
        '--inf-text': '#f2efe9',
        '--inf-muted': '#a29e96',
        '--inf-accent': '#d0a75a',
        '--inf-accent-bright': '#e8c987',
        '--inf-green': '#8fce46',
        '--inf-heading': 'EB Garamond, Georgia, serif',
      },
    },
    paper: {
      label: 'Paper',
      pad: 48,
      statBg: 'rgba(120,90,25,0.06)',
      barBg: 'rgba(120,90,25,0.12)',
      tokens: {
        '--inf-bg': '#f7f3ea',
        '--inf-panel': '#fffdf8',
        '--inf-border': 'rgba(90,70,30,0.25)',
        '--inf-text': '#201a10',
        '--inf-muted': '#5f5648',
        '--inf-accent': '#8a5f15',
        '--inf-accent-bright': '#6e4a0e',
        '--inf-green': '#3f7a0f',
        '--inf-heading': 'EB Garamond, Georgia, serif',
      },
    },
  };

  let name = $state('');
  let theme = $state<ThemeKey>('midnight');
  const season = $state(currentSeason());
  let exporting = $state(false);
  let copied = $state(false);
  let exportError = $state<string | null>(null);
  let captureEl: HTMLDivElement | null = $state(null);

  // ---- Persist name + theme so exports and share links stay consistent. ----

  $effect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(NAME_KEY);
      if (saved) name = saved;
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === 'midnight' || savedTheme === 'paper') theme = savedTheme;
    } catch {
      /* storage unavailable - defaults are fine */
    }
  });

  $effect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(NAME_KEY, name);
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  });

  /** Shows that aired in the selected season (the card is scoped to this picker). */
  const scopedMedia = $derived(
    media.filter((m) => {
      const { year, month } = m.startDate ?? {};
      return (
        year === season.seasonYear &&
        month != null &&
        seasonOfMonth(month) === season.season
      );
    }),
  );

  function seasonOfMonth(month: number): AniListSeason | null {
    if (month <= 3) return 'WINTER';
    if (month <= 6) return 'SPRING';
    if (month <= 9) return 'SUMMER';
    return 'FALL';
  }

  const stats: InfographicStats = $derived(computeInfographic(scopedMedia, progress));

  const themed = $derived(THEMES[theme]);

  function selectedTitle(m: AniListMedia): string {
    return m.title.english ?? m.title.romaji ?? m.title.native ?? 'Untitled';
  }

  function coverUrl(m: AniListMedia): string | null {
    return m.coverImage.extraLarge ?? m.coverImage.large;
  }

  async function exportPng() {
    exporting = true;
    exportError = null;
    try {
      // Wait a tick so the browser paints the final layout (images, fonts, bars).
      await new Promise((r) => setTimeout(r, 60));
      const el = captureEl;
      if (!el) throw new Error('Could not find export area');
      const pad = themed.pad;
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        canvasWidth: el.offsetWidth + pad * 2,
        canvasHeight: el.offsetHeight + pad * 2,
      });
      const link = document.createElement('a');
      link.download = `anime-watch-tool-anime-${season.season.toLowerCase()}-${season.seasonYear}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      exportError = e instanceof Error ? e.message : String(e);
    } finally {
      exporting = false;
    }
  }

  async function copyPng() {
    copied = true;
    exportError = null;
    try {
      await new Promise((r) => setTimeout(r, 60));
      const el = captureEl;
      if (!el) throw new Error('Could not find export area');
      const pad = themed.pad;
      const blob = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        canvasWidth: el.offsetWidth + pad * 2,
        canvasHeight: el.offsetHeight + pad * 2,
      }).then((url) => fetch(url).then((r) => r.blob()));
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setTimeout(() => (copied = false), 2000);
    } catch (e) {
      exportError = e instanceof Error ? e.message : String(e);
      copied = false;
    }
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Escape') onclose();
  }}
/>

<div
  use:portal
  class="fixed inset-0 z-[9998] overflow-y-auto"
  style="background: rgba(0,0,0,0.78); backdrop-filter: blur(4px); overscroll-behavior: contain;"
>
  <div class="min-h-full w-full flex items-start justify-center p-4 md:p-8">
    <div class="w-full max-w-3xl">
      <!-- CONTROLS -->
      <div class="card inf-tooltips px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
        <!-- SEASON PICKER (matches the share modal) -->
        <div class="card border overflow-hidden px-1 flex items-center justify-between gap-1 shrink-0">
          <button
            class="util-btn"
            onclick={() => {
              const s = shiftSeason(season.season, season.seasonYear, -1);
              season.season = s.season;
              season.seasonYear = s.seasonYear;
            }}
            data-tip="Previous season"
            aria-label="Previous season"
          >
            <ChevronLeft size={20} />
          </button>
          <div
            class="text-base uppercase tracking-widest la-gold-text tabular-nums cursor-pointer px-2 select-none"
            title="Back to the current season"
            role="button"
            tabindex="0"
            onclick={() => {
              const s = currentSeason();
              season.season = s.season;
              season.seasonYear = s.seasonYear;
            }}
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const s = currentSeason();
                season.season = s.season;
                season.seasonYear = s.seasonYear;
              }
            }}
          >
            {seasonLabel(season.season, season.seasonYear)}
          </div>
          <button
            class="util-btn"
            onclick={() => {
              const s = shiftSeason(season.season, season.seasonYear, 1);
              season.season = s.season;
              season.seasonYear = s.seasonYear;
            }}
            data-tip="Next season"
            aria-label="Next season"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div class="flex items-center gap-2 ml-auto">
          <label class="flex flex-col gap-1">
            <span class="text-[10px] uppercase tracking-widest" style="color: var(--text-muted);">Name</span>
            <input
              id="infographic-name"
              class="rounded-sm border px-2 py-1 text-sm outline-none w-36"
              style="color: var(--text); border-color: var(--border); background: var(--bg);"
              placeholder="e.g. David"
              bind:value={name}
              maxlength="24"
            />
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-[10px] uppercase tracking-widest" style="color: var(--text-muted);">Theme</span>
            <select
              class="rounded-sm border px-2 py-1 text-sm outline-none w-28"
              style="color: var(--text); border-color: var(--border); background: var(--bg);"
              bind:value={theme}
            >
              {#each Object.entries(THEMES) as [key, t] (key)}
                <option value={key}>{t.label}</option>
              {/each}
            </select>
          </label>
        </div>

        <div class="flex items-center gap-1 ml-auto">
          <button
            class="util-btn"
            class:on={copied}
            onclick={copyPng}
            data-tip="Copy the infographic image"
            aria-label="Copy the infographic image"
          >
            {#if copied}
              <Check size={15} />
            {:else}
              <Copy size={15} />
            {/if}
          </button>
          <button
            class="util-btn"
            class:on={exporting}
            onclick={exportPng}
            disabled={exporting}
            data-tip="Export the infographic as a PNG"
            aria-label="Export the infographic as a PNG"
          >
            <Download size={15} />
          </button>
          <button class="util-btn" onclick={onclose} data-tip="Close" aria-label="Close">
            <X size={15} />
          </button>
        </div>
      </div>

      {#if exportError}
        <div class="card p-3 mb-3 text-xs" style="color: var(--la-red);">{exportError}</div>
      {/if}

      <!-- EXPORT AREA: the card keeps full width; html-to-image gets transparent margins via canvasWidth/Height. -->
      <div>
        <div
          bind:this={captureEl}
          class="w-full rounded-lg overflow-hidden shadow-2xl"
          style="background: var(--inf-bg); border: 1px solid var(--inf-border); color: var(--inf-text); font-family: Inter, sans-serif;
            {Object.entries(themed.tokens).map(([k, v]) => `${k}: ${v};`).join(' ')}"
          role="img"
          aria-label="Anime season infographic"
        >
          <div style="padding: 32px;">
            <!-- HEAD -->
            <div class="flex items-end justify-between border-b pb-4" style="border-color: var(--inf-border);">
              <div style="min-width: 0;">
                <div class="text-[10px] uppercase tracking-[0.25em]" style="color: var(--inf-muted);">
                  {name ? `${name}'s` : 'Your'} · Anime
                </div>
                <div class="font-bold la-heading" style="font-family: var(--inf-heading); font-size: 28px; line-height: 1.2; white-space: nowrap;">
                  {seasonLabel(season.season, season.seasonYear)}
                </div>
              </div>
            </div>

            <!-- STAT GRID -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div class="rounded-md px-4 py-3" style="background: {themed.statBg};">
                <div class="text-[10px] uppercase tracking-widest" style="color: var(--inf-muted);">On list</div>
                <div class="text-2xl font-bold tabular-nums" style="color: var(--inf-accent-bright);">{stats.listSize}</div>
              </div>
              <div class="rounded-md px-4 py-3" style="background: {themed.statBg};">
                <div class="text-[10px] uppercase tracking-widest" style="color: var(--inf-muted);">Episodes watched</div>
                <div class="text-2xl font-bold tabular-nums" style="color: var(--inf-accent-bright);">{stats.episodesWatched}</div>
              </div>
              <div class="rounded-md px-4 py-3" style="background: {themed.statBg};">
                <div class="text-[10px] uppercase tracking-widest" style="color: var(--inf-muted);">Completed</div>
                <div class="text-2xl font-bold tabular-nums" style="color: var(--inf-green, #8fce46);">{stats.completed}</div>
              </div>
              <div class="rounded-md px-4 py-3" style="background: {themed.statBg};">
                <div class="text-[10px] uppercase tracking-widest" style="color: var(--inf-muted);">Avg score</div>
                <div class="text-2xl font-bold tabular-nums" style="color: var(--inf-accent-bright);">
                  {stats.avgScore ?? '—'}
                </div>
              </div>
            </div>

            <!-- GENRES -->
            {#if stats.genres.length > 0}
              <div class="mt-6">
                <div class="text-[10px] uppercase tracking-widest mb-2" style="color: var(--inf-muted);">
                  Top genres
                </div>
                <div class="space-y-1.5">
                  {#each stats.genres as g (g.genre)}
                    <div class="flex items-center gap-2">
                      <div class="text-xs w-24 shrink-0 truncate" style="color: var(--inf-text);">{g.genre}</div>
                      <div class="flex-1 h-2 rounded-full overflow-hidden" style="background: {themed.barBg};">
                        <div class="h-full rounded-full" style="width: {g.share}%; background: var(--inf-accent);"></div>
                      </div>
                      <div class="text-xs tabular-nums w-8 text-right" style="color: var(--inf-muted);">{g.share}%</div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            </div>

          <!-- FOOTER COVERS -->
          <div class="flex" style="background: var(--inf-panel); border-top: 1px solid var(--inf-border);">
            {#each scopedMedia.slice(0, 8) as m (m.id)}
              {#if coverUrl(m)}
                <img
                  class="object-cover"
                  style="width: calc(100% / {Math.min(scopedMedia.length, 8)}); height: 96px;"
                  src={coverUrl(m)}
                  alt={selectedTitle(m)}
                  loading="lazy"
                />
              {/if}
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>