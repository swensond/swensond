<script lang="ts">
import type { Lightbox } from '$lib/lightbox-state.svelte';

let { lightbox }: { lightbox: Lightbox } = $props();
</script>

<!-- Backdrop clicks and Close dismiss; Escape works natively. Arrow keys, Home/End, the
     Previous/Next buttons, thumbnails, and horizontal swipes page through the shots. -->
<dialog
  bind:this={lightbox.element}
  class="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-ink backdrop:bg-[#0f0f0e]/95 backdrop:backdrop-blur-sm"
  aria-label={lightbox.active ? `${lightbox.active.title} screenshots` : undefined}
  onclick={(event) => {
    if (event.target === event.currentTarget || (event.target as HTMLElement).dataset.backdrop !== undefined) {
      lightbox.close();
    }
  }}
  onkeydown={(event) => {
    if (lightbox.handleKey(event.key)) {
      event.preventDefault();
    }
  }}
  onpointerdown={(event) => lightbox.beginSwipe(event.pointerType, event.clientX)}
  onpointerup={(event) => lightbox.endSwipe(event.clientX)}
  onclose={() => lightbox.close()}
>
  {#if lightbox.active}
    {@const active = lightbox.active}
    {@const shot = lightbox.shot}
    <div class="flex h-full flex-col">
      <div class="flex items-center justify-between gap-4 border-b border-line px-4 py-3 font-mono text-[0.8125rem] sm:px-8">
        <span class="truncate text-muted"><span class="text-accent">{active.number}</span> — {active.slug}</span>
        <div class="flex items-center gap-4">
          {#if lightbox.multi}
            <span class="text-muted tabular-nums" aria-live="polite">{active.index + 1} / {lightbox.count}</span>
          {/if}
          <button
            type="button"
            class="flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-line px-3.5 hover:border-accent hover:text-accent"
            onclick={() => lightbox.close()}
          >close <kbd class="text-muted">esc</kbd></button>
        </div>
      </div>

      <figure class="flex min-h-0 flex-1 flex-col">
        <div class="relative flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8" data-backdrop>
          {#if lightbox.multi}
            <button
              type="button"
              aria-label="Previous screenshot"
              class="absolute left-4 z-10 hidden size-11 cursor-pointer items-center justify-center rounded-[10px] border border-line bg-surface font-mono hover:border-accent hover:text-accent sm:flex lg:left-8"
              onclick={() => lightbox.prev()}
            >←</button>
          {/if}
          {#key shot.src}
            <img
              src={shot.src}
              width={shot.width}
              height={shot.height}
              alt={shot.caption ?? `Screenshot of ${active.title}`}
              draggable="false"
              class="max-h-full w-auto max-w-full rounded-[14px] border border-line object-contain select-none {lightbox.multi ? 'sm:max-w-[calc(100%-8rem)]' : ''}"
            />
          {/key}
          {#if lightbox.multi}
            <button
              type="button"
              aria-label="Next screenshot"
              class="absolute right-4 z-10 hidden size-11 cursor-pointer items-center justify-center rounded-[10px] border border-line bg-surface font-mono hover:border-accent hover:text-accent sm:flex lg:right-8"
              onclick={() => lightbox.next()}
            >→</button>
          {/if}
        </div>

        <figcaption class="border-t-[3px] border-ink px-4 pt-4 pb-5 sm:px-8">
          <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <span class="text-xl font-bold tracking-[-0.03em]">{active.title}</span>
            {#if shot.caption}<span class="text-ink-soft">{shot.caption}</span>{/if}
          </div>
          {#if lightbox.multi}
            <div class="mt-4 flex gap-2 overflow-x-auto">
              {#each active.shots as image, i}
                <button
                  type="button"
                  aria-label="Show screenshot {i + 1}"
                  aria-current={i === active.index ? 'true' : undefined}
                  class="shrink-0 cursor-pointer overflow-hidden rounded-md border-2 {i === active.index ? 'border-accent' : 'border-transparent opacity-50 hover:opacity-100'}"
                  onclick={() => lightbox.goTo(i)}
                >
                  <img src={image.src} alt="" class="h-14 w-auto object-cover object-top" />
                </button>
              {/each}
            </div>
          {/if}
        </figcaption>
      </figure>
    </div>
  {/if}
</dialog>
