<script lang="ts">
  import { portal } from '$lib/actions/portal';
  import type { Snippet } from 'svelte';

  let {
    open = $bindable(false),
    maxWidth = '32rem',
    children,
  }: {
    open: boolean;
    maxWidth?: string;
    children: Snippet;
  } = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') open = false;
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    use:portal
    class="fixed inset-0 z-[9999] overflow-y-auto"
    style="background: rgba(0,0,0,0.78); backdrop-filter: blur(4px); overscroll-behavior: contain;"
  >
    <div
      class="flex min-h-full items-center justify-center p-4"
      role="presentation"
      onclick={(e) => {
        if (e.target === e.currentTarget) open = false;
      }}
    >
      <div class="card w-full my-6 flex flex-col max-h-[90vh]" style="max-width: {maxWidth};" role="dialog" aria-modal="true">
        {@render children()}
      </div>
    </div>
  </div>
{/if}
