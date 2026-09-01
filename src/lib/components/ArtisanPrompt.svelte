<script lang="ts">
    import { artisanRequest } from "$lib/stores/artisan-prompt";

    let inputEl: HTMLInputElement | undefined = $state();

    let value = $state("");

    const request = $derived($artisanRequest);

    $effect(() => {
        if ($artisanRequest) {
            value = "";
            inputEl?.focus();
        }
    });

    function submit() {
        if (!request) return;

        const raw = typeof value === "number" ? String(value) : value.trim();
        const parsed =
            raw === "" ? null : Math.min(100, Math.max(0, Number(raw) || 0));

        request.resolve(parsed);
    }

    function cancel() {
        request?.resolve(undefined);
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") cancel();
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if request}
    <div
        class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        role="presentation"
        onclick={(e) => e.target === e.currentTarget && cancel()}
    >
        <div class="card w-full max-w-xs" role="dialog" aria-modal="true">
            <div class="card-header justify-between gap-3">
                <div class="font-semibold whitespace-nowrap">Artisan %</div>
                <div class="text-xs text-[#a29e96] capitalize truncate">
                    {request.title}
                </div>
            </div>

            <div class="p-4 space-y-3">
                <div class="relative">
                    <input
                        bind:this={inputEl}
                        bind:value
                        class="input-compact w-full text-right tabular-nums text-lg pr-8"
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        placeholder="-"
                        onkeydown={(e) => e.key === "Enter" && submit()}
                    />
                    <span
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#a29e96] pointer-events-none"
                    >
                        %
                    </span>
                </div>

                <div class="text-xs text-[#a29e96]">
                    Current artisan energy (0–100%) after this success. Leave
                    blank to skip.
                </div>

                <div class="flex justify-end gap-2">
                    <button class="btn-secondary" onclick={cancel}>
                        Cancel
                    </button>
                    <button class="btn-primary" onclick={submit}>Save</button>
                </div>
            </div>
        </div>
    </div>
{/if}
