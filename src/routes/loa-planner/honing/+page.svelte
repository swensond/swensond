<script>
    import { plannerApi } from "$lib/api/planner";
    import { displayHoningCost } from "$lib/derived/planner";
    import { calculateHoningCost } from "$lib/helpers/honing";
    import { armorPieces, modes, planner } from "$lib/stores/planner";

</script>

<section class="space-y-6">
    <!-- ===================== -->
    <!-- WEAPON -->
    <!-- ===================== -->
    <div class="card">
        <div class="card-header">
            <h2 class="text-sm font-semibold text-zinc-700">Weapon</h2>
        </div>

        <!-- HEADER -->
        <div class="grid grid-cols-4 px-4 py-2 text-xs text-zinc-500">
            <div>Mode</div>
            <div>Current</div>
            <div>Target</div>
            <div class="text-right">Cost</div>
        </div>

        <!-- ROWS -->
        <div class="px-2 pb-2 space-y-1">
            {#each modes as mode}
                <div
                    class="grid grid-cols-4 px-3 py-3 items-center gap-3 rounded-lg hover:bg-zinc-50 transition"
                >
                    <div class="capitalize text-sm text-zinc-800">
                        {mode}
                    </div>

                    <input
                        class="input-compact"
                        value={$planner.weapon[mode].currentLevel}
                        oninput={(e) =>
                            plannerApi.updateWeapon(mode, {
                                currentLevel: Number(e.currentTarget.value),
                            })}
                    />

                    <input
                        class="input-compact"
                        value={$planner.weapon[mode].targetLevel}
                        oninput={(e) =>
                            plannerApi.updateWeapon(mode, {
                                targetLevel: Number(e.currentTarget.value),
                            })}
                    />

                    <div class="text-right font-medium tabular-nums">
                        {calculateHoningCost(
                            "weapon",
                            $planner.weapon[mode].currentLevel,
                            $planner.weapon[mode].targetLevel,
                            mode,
                        ).toLocaleString()}g
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <!-- ===================== -->
    <!-- ARMOR -->
    <!-- ===================== -->
    <div>
        <h2 class="text-lg font-semibold mb-3 text-zinc-900">Armor</h2>

        {#each armorPieces as piece}
            <div class="card mb-4">
                <div class="card-header">
                    <h3 class="text-sm font-semibold capitalize text-zinc-700">
                        {piece}
                    </h3>
                </div>

                <!-- HEADER -->
                <div class="grid grid-cols-4 px-4 py-2 text-xs text-zinc-500">
                    <div>Mode</div>
                    <div>Current</div>
                    <div>Target</div>
                    <div class="text-right">Cost</div>
                </div>

                <!-- ROWS -->
                <div class="px-2 pb-2 space-y-1">
                    {#each modes as mode}
                        <div
                            class="grid grid-cols-4 px-3 py-3 items-center gap-3 rounded-lg hover:bg-zinc-50 transition"
                        >
                            <div class="capitalize text-sm text-zinc-800">
                                {mode}
                            </div>

                            <input
                                class="input-compact"
                                value={$planner.armor[piece][mode].currentLevel}
                                oninput={(e) =>
                                    plannerApi.updateArmorPiece(piece, mode, {
                                        currentLevel: Number(
                                            e.currentTarget.value,
                                        ),
                                    })}
                            />

                            <input
                                class="input-compact"
                                value={$planner.armor[piece][mode].targetLevel}
                                oninput={(e) =>
                                    plannerApi.updateArmorPiece(piece, mode, {
                                        targetLevel: Number(
                                            e.currentTarget.value,
                                        ),
                                    })}
                            />

                            <div class="text-right font-medium tabular-nums">
                                {calculateHoningCost(
                                    "armor",
                                    $planner.armor[piece][mode].currentLevel,
                                    $planner.armor[piece][mode].targetLevel,
                                    mode,
                                ).toLocaleString()}g
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>

    <!-- TOTAL -->
    <div class="mt-4 flex justify-end">
        <div
            class="bg-white border border-zinc-200 rounded-xl px-4 py-3 min-w-55"
        >
            <div class="text-xs text-zinc-500 mb-1">Total Honing Cost</div>

            <div class="text-lg font-semibold text-zinc-900 tabular-nums">
                {$displayHoningCost.toLocaleString()}g
            </div>
        </div>
    </div>
</section>
