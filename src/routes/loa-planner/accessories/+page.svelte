<script lang="ts">
    import { plannerApi } from "$lib/api/planner";
    import NumberInput from "$lib/components/NumberInput.svelte";
    import { displayAccessoriesCost } from "$lib/derived/planner";
    import { planner } from "$lib/stores/planner";

    const rowGrid = "grid grid-cols-[minmax(0,1fr)_80px_180px] gap-3 items-center";
</script>

<section class="space-y-4">
    {#if $planner.accessories.length === 0}
        <div class="card p-6 text-center">
            <div class="text-muted">No accessories configured.</div>
        </div>
    {:else}
        <div class="card">
            <!-- HEADER -->
            <div class="card-header justify-between">
                <h2>Accessories</h2>
                <div class="text-xs text-muted">
                    {$planner.accessories.filter((a) => a.owned).length}
                    /
                    {$planner.accessories.length} owned
                </div>
            </div>

            <!-- COLUMN LABELS -->
            <div
                class="{rowGrid} px-4 py-2 text-xs uppercase tracking-widest text-muted border-b bg-bg-secondary"
                style="border-color: var(--border);"
            >
                <div>Name</div>
                <div class="justify-self-center">Owned</div>
                <div class="text-right">Gold Cost</div>
            </div>

            <!-- ROWS -->
            {#each $planner.accessories as accessory (accessory.slot)}
                <div
                    class="{rowGrid} px-4 py-2.5 border-b last:border-b-0 transition"
                    class:opacity-50={accessory.owned}
                    style="border-color: var(--border);"
                >
                    <input
                        class="name-input !text-sm"
                        value={accessory.label}
                        oninput={(e) =>
                            plannerApi.updateAccessory(accessory.slot, {
                                label: e.currentTarget.value,
                            })}
                    />

                    <label
                        class="justify-self-center flex items-center cursor-pointer select-none"
                    >
                        <input
                            type="checkbox"
                            checked={accessory.owned}
                            onchange={(e) =>
                                plannerApi.updateAccessory(accessory.slot, {
                                    owned: e.currentTarget.checked,
                                })}
                        />
                    </label>

                    <NumberInput
                        value={accessory.goldCost}
                        onchange={(v) =>
                            plannerApi.updateAccessory(accessory.slot, {
                                goldCost: Math.max(0, v),
                            })}
                    />
                </div>
            {/each}
        </div>
    {/if}

    <!-- TOTAL -->
    <div class="flex justify-end">
        <div class="card px-4 py-3 min-w-55">
            <div class="text-xs text-muted mb-1">Total Accessories Cost</div>
            <div class="text-lg font-semibold text tabular-nums">
                {$displayAccessoriesCost.toLocaleString()}g
            </div>
        </div>
    </div>
</section>
