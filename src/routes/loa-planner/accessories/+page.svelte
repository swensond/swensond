<script lang="ts">
    import { plannerApi } from "$lib/api/planner";
    import NumberInput from "$lib/components/NumberInput.svelte";
    import { displayAccessoriesCost } from "$lib/derived/planner";
    import { planner } from "$lib/stores/planner";
    import goldIcon from "$lib/assets/gold.png";
</script>

<section class="space-y-4">
    {#if $planner.accessories.length === 0}
        <div class="card p-6 text-center">
            <div class="text-zinc-500">No accessories configured.</div>
        </div>
    {:else}
        {#each $planner.accessories as accessory (accessory.slot)}
            <div class="bg-white border border-zinc-100 rounded-xl overflow-hidden">
                <div class="px-4 py-3 flex items-center justify-between bg-zinc-50 border-b border-zinc-100">
                    <div>
                        <input
                            class="font-medium text-zinc-900 bg-transparent outline-none w-full"
                            value={accessory.label}
                            oninput={(e) =>
                                plannerApi.updateAccessory(accessory.slot, {
                                    label: e.currentTarget.value,
                                })}
                        />
                        <div class="text-xs text-zinc-400 capitalize">{accessory.slot}</div>
                    </div>

                    <label class="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={accessory.owned}
                            onchange={(e) =>
                                plannerApi.updateAccessory(accessory.slot, {
                                    owned: e.currentTarget.checked,
                                })}
                            class="w-4 h-4 rounded accent-indigo-600"
                        />
                        <span class="text-sm text-zinc-600">Owned</span>
                    </label>
                </div>

                <div class="px-4 py-3 bg-zinc-50">
                    <div class="flex items-center gap-2">
                        <img src={goldIcon} alt="Gold" class="w-5 h-5" />
                        <div class="text-xs text-zinc-500">Gold Cost</div>
                    </div>
                    <div class="mt-1">
                        <NumberInput
                            value={accessory.goldCost}
                            onchange={(v) =>
                                plannerApi.updateAccessory(accessory.slot, {
                                    goldCost: Math.max(0, v),
                                })}
                        />
                    </div>


                </div>
            </div>
        {/each}
    {/if}

    <!-- TOTAL -->
    <div class="mt-4 flex justify-end">
        <div class="bg-white border border-zinc-200 rounded-xl px-4 py-3 min-w-55">
            <div class="text-xs text-zinc-500 mb-1">Total Accessories Cost</div>
            <div class="text-lg font-semibold text-zinc-900 tabular-nums">
                {$displayAccessoriesCost.toLocaleString()}g
            </div>
        </div>
    </div>
</section>