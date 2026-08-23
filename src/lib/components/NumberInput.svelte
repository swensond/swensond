<script lang="ts">
  interface Props {
    id?: string;
    value: number;
    placeholder?: string;
    min?: number;
    max?: number;
    class?: string;
    onchange?: (value: number) => void;
  }

  let {
    value,
    placeholder = "",
    min,
    max,
    class: className = "",
    id,
    onchange,
  }: Props = $props();

  let focused = $state(false);

  function format(value: number) {
    return Number(value || 0).toLocaleString();
  }

  function parse(value: string) {
    return Number(value.replace(/,/g, "")) || 0;
  }

  function handleInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;

    let next = parse(input.value);

    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);

    onchange?.(next);
  }
</script>

<div class={`relative ${className}`}>
  <input
    id={id}
    type="text"
    value={focused ? value : format(value)}
    {placeholder}
    onfocus={() => (focused = true)}
    onblur={() => (focused = false)}
    oninput={handleInput}
    class="
      input-compact
      text-right
      tabular-nums
      pr-6
    "
  />
</div>
