<script lang="ts">
  let {
    percent,
    height = '0.25rem',
    label,
  }: {
    percent: number;
    height?: string;
    label?: string;
  } = $props();
</script>

<div class="rounded-full overflow-hidden" style="height: {height}; background: rgba(255,255,255,0.08);">
  <div
    class="h-full rounded-full transition-all"
    style="width: {Math.min(100, Math.max(0, percent))}%; background: var(--la-accent);"
  ></div>
</div>
