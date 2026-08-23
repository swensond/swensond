<script lang="ts">
  type Props = {
    label: string;
    value: string | number;
    highlight?: "red" | "green";
  };

  let { label, value, highlight }: Props = $props();
</script>

<div class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
  <div class="text-xs text-zinc-500 mb-1 uppercase tracking-wide">
    {label}
  </div>

  <div class="text-2xl font-bold tabular-nums text-zinc-900" class:text-red-600={highlight === "red"} class:text-green-600={highlight === "green"}>
    {value}
  </div>
</div>
