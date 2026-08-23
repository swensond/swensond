<script lang="ts">
    import { plannerApi } from "$lib/api/planner";
    import NumberInput from "$lib/components/NumberInput.svelte";
    import { displayMaterialCost, materialPlans } from "$lib/derived/planner";
    
    // Helper to calculate total owned including boxes
    function calculateTotalAvailable(material) {
        return material.owned + (material.boxes?.reduce((sum, box) => sum + (box.owned * box.size), 0) || 0);
    }
</script>

<section class="space-y-4">
    <div class="space-y-2">
        {#each $materialPlans as material (material.id)}
            {@const totalOwned = calculateTotalAvailable(material)}
            {@const progress =
                material.required === 0
                    ? 100
                    : Math.min(100, (totalOwned / material.required) * 100)}

            <div
                class="bg-white border border-zinc-100 rounded-xl overflow-hidden"
            >
                <!-- HEADER -->
                <div class="px-4 py-3 flex items-center gap-3">
                    <img
                        src={material.icon}
                        class="w-5 h-5 shrink-0"
                        alt={material.name}
                    />

                    <div class="flex-1 min-w-0">
                        <div class="font-medium text-zinc-900 truncate">
                            {material.name}
                        </div>

                        <div
                            class="mt-1 h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden"
                        >
                            <div
                                class="h-full bg-emerald-500"
                                style={`width: ${progress}%`}></div>
                        </div>
                    </div>
                </div>

                <!-- CONTROLS -->
                <div class="px-4 py-3 bg-zinc-50 border-t border-zinc-100">
                    <div class="grid grid-cols-4 gap-4 items-stretch">
                        <!-- REQUIRED -->
                        <div class="flex flex-col justify-between h-16">
                            <div class="text-xs text-zinc-500">Required</div>
                            <NumberInput
                                value={material.required}
                                onchange={(v) =>
                                    plannerApi.updateMaterial(material.id, {
                                        required: v,
                                    })}
                            />
                        </div>

                        <!-- OWNED -->
                        <div class="flex flex-col justify-between h-16">
                            <div class="text-xs text-zinc-500">Owned</div>
                            <div class="flex items-center justify-end h-9 font-medium tabular-nums">
                                {calculateTotalAvailable(material).toLocaleString()}
                            </div>
                        </div>

                        <!-- MISSING -->
                        <div class="flex flex-col justify-between h-16">
                            <div class="text-xs text-zinc-500">Missing</div>
                            <div
                                class="flex items-center justify-end h-9 font-medium tabular-nums"
                            >
                                {Math.max(0, material.required - totalOwned).toLocaleString()}
                            </div>
                        </div>

                        <!-- MARKET -->
                        <div class="flex flex-col justify-between h-16">
                            <div class="text-xs text-zinc-500">Market</div>

                            <div class="flex flex-col gap-2">
                                <!-- SELECT OPTION -->
                                {#if material.pricingOptions?.length}
                                    {@const selected =
                                        material.pricing ??
                                        material.pricingOptions[0]}

                                    <!-- SINGLE ROW: select + input -->
                                    <div class="flex items-center gap-2">
                                        <select
                                            class="input-compact w-full"
                                            value={selected.label}
                                            onchange={(e) => {
                                                const opt =
                                                    material.pricingOptions?.find(
                                                        (o) =>
                                                            o.label ===
                                                            e.currentTarget
                                                                .value,
                                                    );

                                                if (!opt) return;

                                                plannerApi.updateMaterial(
                                                    material.id,
                                                    {
                                                        pricing: opt,
                                                    },
                                                );
                                            }}
                                        >
                                            {#each material.pricingOptions as opt}
                                                <option value={opt.label}>
                                                    {opt.label}
                                                </option>
                                            {/each}
                                        </select>

                                        <!-- PRICE INPUT -->
                                        <input
                                            class="input-compact text-xs w-24 text-right tabular-nums"
                                            type="number"
                                            value={selected.marketPrice}
                                            onchange={(e) =>
                                                plannerApi.updatePricingField(
                                                    material.id,
                                                    "marketPrice",
                                                    Number(
                                                        e.currentTarget.value,
                                                    ),
                                                )}
                                        />
                                    </div>
                                {:else if material.pricing}
                                    <!-- SINGLE PRICING MODE -->
                                    <input
                                        class="input-compact text-xs w-full"
                                        type="number"
                                        value={material.pricing.marketPrice}
                                        onchange={(e) =>
                                            plannerApi.updatePricingField(
                                                material.id,
                                                "marketPrice",
                                                Number(e.currentTarget.value),
                                            )}
                                    />
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- BREAKDOWN -->
                {#if material.pricingOptions?.length && material.breakdown?.length}
                    <div class="px-4 pb-3 bg-white border-t border-zinc-100">
                        <div class="text-xs text-zinc-500 mb-2">
                            Optimal Purchase Plan
                        </div>

                        {#each material.breakdown as b}
                            <div
                                class="flex justify-between text-sm py-1 tabular-nums"
                            >
                                <div class="flex gap-2">
                                    <span class="font-medium">{b.qty}×</span>
                                    <span>{b.label}</span>
                                </div>

                                <div class:opacity-60={b.remainderFill}>
                                    {(b.qty * b.price).toLocaleString()}g
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/each}
    </div>

    <!-- TOTAL -->
    <div class="mt-4 flex justify-end">
        <div
            class="bg-white border border-zinc-200 rounded-xl px-4 py-3 min-w-55"
        >
            <div class="text-xs text-zinc-500 mb-1">Total Material Cost</div>

            <div class="text-lg font-semibold text-zinc-900 tabular-nums">
                {$displayMaterialCost.toLocaleString()}g
            </div>
        </div>
    </div>
</section>
