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

<div class="rounded-full overflow-hidden" style="height: {height}; background: var(--bg-tertiary);">
  <div
    class="h-full rounded-full transition-all"
    style="width: {Math.min(100, Math.max(0, percent))}%; background: var(--accent);"
  ></div>
</div>
