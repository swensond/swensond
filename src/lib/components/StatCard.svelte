<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    label,
    value,
    valueClass = '',
    children,
  }: {
    label: string;
    value?: string | number;
    valueClass?: string;
    children?: Snippet;
  } = $props();
</script>

<div class="stat-card">
  <div class="stat-label">{label}</div>
  {#if value !== undefined}
    <div class="stat-value {valueClass}">{value}</div>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</div>
