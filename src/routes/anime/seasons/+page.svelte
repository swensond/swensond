<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { currentSeason } from '$lib/api/anilist';

  onMount(() => {
    const s = currentSeason();
    const seasonMap: Record<string, string> = { WINTER: 'winter', SPRING: 'spring', SUMMER: 'summer', FALL: 'fall' };
    goto(`/anime/seasons/${s.seasonYear}/${seasonMap[s.season]}/`, { replaceState: true });
  });
</script>

<div class="card p-6 text-center">
  <div class="text-[#a29e96]">Loading seasons…</div>
</div>

<svelte:head>
  <title>Seasons</title>
</svelte:head>
