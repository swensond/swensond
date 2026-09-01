<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    message,
    children,
  }: {
    message?: string;
    children?: Snippet;
  } = $props();
</script>

<div class="card p-6 text-center">
  {#if message}
    <div class="text-muted">{message}</div>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</div>
