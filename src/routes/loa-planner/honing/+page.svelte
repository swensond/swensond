<script>
    import { logApi, plannerApi } from "$lib/api/planner";
    import { requestArtisan } from "$lib/stores/artisan-prompt";
    import { displayHoningCost } from "$lib/derived/planner";
    import { calculateHoningCost } from "$lib/helpers/honing";
    import { armorPieces, modes, planner } from "$lib/stores/planner";

    const rowGrid =
        "grid grid-cols-[100px_1fr_1fr_110px_84px] gap-3 items-center";

    async function tapWeapon(mode) {
        const artisan =
            mode === "advanced"
                ? null
                : await requestArtisan(`Weapon · ${mode}`);

        if (artisan !== undefined) logApi.logWeaponTap(mode, artisan);
    }

    async function tapArmor(piece, mode) {
        const artisan =
            mode === "advanced"
                ? null
                : await requestArtisan(`${piece} · ${mode}`);

        if (artisan !== undefined) logApi.logArmorTap(piece, mode, artisan);
    }
</script>

<section class="space-y-6">
    <!-- ===================== -->
    <!-- WEAPON -->
    <!-- ===================== -->
    <div class="card">
        <div class="card-header">
            <h2 class="text-sm font-semibold text-[#a29e96]">Weapon</h2>
        </div>

        <!-- HEADER -->
        <div class="{rowGrid} px-4 py-2 text-xs text-[#a29e96]">
            <div>Mode</div>
            <div>Current</div>
            <div>Target</div>
            <div class="text-right">Cost</div>
            <div class="text-center">Success</div>
        </div>

        <!-- ROWS -->
        <div class="px-2 pb-2 space-y-1">
            {#each modes as mode}
                <div
                    class="{rowGrid} px-3 py-3 rounded-sm hover:bg-[rgba(255,255,255,0.05)] transition"
                >
                    <div class="capitalize text-sm text-[#f2efe9]">
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

                    <div class="flex flex-col items-center gap-0.5">
                        <button
                            class="btn px-3"
                            onclick={() => tapWeapon(mode)}
                        >
                            +1
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <!-- ===================== -->
    <!-- ARMOR -->
    <!-- ===================== -->
    <div>
        <h2 class="la-heading text-lg font-semibold mb-3 text-[#f2efe9]">Armor</h2>

        {#each armorPieces as piece}
            <div class="card mb-4">
                <div class="card-header">
                    <h3 class="text-sm font-semibold capitalize text-[#a29e96]">
                        {piece}
                    </h3>
                </div>

                <!-- HEADER -->
                <div class="{rowGrid} px-4 py-2 text-xs text-[#a29e96]">
                    <div>Mode</div>
                    <div>Current</div>
                    <div>Target</div>
                    <div class="text-right">Cost</div>
                    <div class="text-center">Success</div>
                </div>

                <!-- ROWS -->
                <div class="px-2 pb-2 space-y-1">
                    {#each modes as mode}
                        <div
                            class="{rowGrid} px-3 py-3 rounded-sm hover:bg-[rgba(255,255,255,0.05)] transition"
                        >
                            <div class="capitalize text-sm text-[#f2efe9]">
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

                            <div class="flex flex-col items-center gap-0.5">
                                <button
                                    class="btn px-3"
                                    onclick={() => tapArmor(piece, mode)}
                                >
                                    +1
                                </button>
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
            class="card px-4 py-3 min-w-55"
        >
            <div class="text-xs text-[#a29e96] mb-1">Total Honing Cost</div>

            <div class="text-lg font-semibold text-[#f2efe9] tabular-nums">
                {$displayHoningCost.toLocaleString()}g
            </div>
        </div>
    </div>
</section>
