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
            <div class="text-[#a29e96]">No accessories configured.</div>
        </div>
    {:else}
        {#each $planner.accessories as accessory (accessory.slot)}
            <div class="card">
                <div class="card-header justify-between">
                    <div>
                        <input
                            class="font-medium text-[#f2efe9] bg-transparent outline-none w-full"
                            value={accessory.label}
                            oninput={(e) =>
                                plannerApi.updateAccessory(accessory.slot, {
                                    label: e.currentTarget.value,
                                })}
                        />
                        <div class="text-xs text-[#a29e96] capitalize">{accessory.slot}</div>
                    </div>

                    <label class="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={accessory.owned}
                            onchange={(e) =>
                                plannerApi.updateAccessory(accessory.slot, {
                                    owned: e.currentTarget.checked,
                                })}
                            class="w-4 h-4 rounded "
                        />
                        <span class="text-sm text-[#a29e96]">Owned</span>
                    </label>
                </div>

                <div class="px-4 py-3 bg-[rgba(255,255,255,0.02)]">
                    <div class="flex items-center gap-2">
                        <img src={goldIcon} alt="Gold" class="w-5 h-5" />
                        <div class="text-xs text-[#a29e96]">Gold Cost</div>
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
        <div class="card px-4 py-3 min-w-55">
            <div class="text-xs text-[#a29e96] mb-1">Total Accessories Cost</div>
            <div class="text-lg font-semibold text-[#f2efe9] tabular-nums">
                {$displayAccessoriesCost.toLocaleString()}g
            </div>
        </div>
    </div>
</section>