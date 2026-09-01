<script>
    import { karmaTracks, planner } from "$lib/stores/planner";
    import { logApi, plannerApi } from "$lib/api/planner";
    import { requestArtisan } from "$lib/stores/artisan-prompt";
    import { getTrackTotal } from "$lib/helpers/karma";
    import { displayKarmaCost } from "$lib/derived/planner";

    async function tapKarma(key) {
        const label =
            karmaTracks.find((t) => t.key === key)?.label ?? key;

        const artisan = await requestArtisan(label);

        if (artisan !== undefined) logApi.logKarmaTap(key, artisan);
    }
</script>

<section class="space-y-4">
    <div class="space-y-2">
        {#each karmaTracks as track}
            {@const current = $planner.karma[track.key].currentLevel}
            {@const target = $planner.karma[track.key].targetLevel}

            <div
                class="card"
            >
                <!-- HEADER -->
                <div class="card-header justify-between">
                    <div class="font-medium text">
                        {track.label}
                    </div>
                </div>

                <!-- CONTROLS -->
                <div class="px-4 py-3 bg-bg-secondary border-t border-border">
                    <div class="grid grid-cols-4 gap-4 items-stretch">
                        <!-- CURRENT -->
                        <div class="flex flex-col justify-between h-16">
                            <div class="text-xs text-muted">Current</div>
                            <div class="flex items-center h-9">
                                <input
                                    class="input-compact w-full"
                                    value={current}
                                    oninput={(e) =>
                                        plannerApi.updateKarma(track.key, {
                                            currentLevel: Number(
                                                e.currentTarget.value,
                                            ),
                                        })}
                                />
                            </div>
                        </div>

                        <!-- TARGET -->
                        <div class="flex flex-col justify-between h-16">
                            <div class="text-xs text-muted">Target</div>
                            <div class="flex items-center h-9">
                                <input
                                    class="input-compact w-full"
                                    value={target}
                                    oninput={(e) =>
                                        plannerApi.updateKarma(track.key, {
                                            targetLevel: Number(
                                                e.currentTarget.value,
                                            ),
                                        })}
                                />
                            </div>
                        </div>

                        <!-- COST -->
                        <div
                            class="flex flex-col justify-between h-16 text-right"
                        >
                            <div class="text-xs text-muted">Cost</div>

                            <div
                                class="flex items-center justify-end h-9 font-medium tabular-nums text"
                            >
                                {getTrackTotal(
                                    current,
                                    target,
                                ).toLocaleString()}g
                            </div>
                        </div>

                        <!-- TAP -->
                        <div class="flex flex-col justify-between items-end h-16">
                            <div class="text-xs text-muted">Success</div>

                            <button
                                class="btn px-3 mb-[7px]"
                                onclick={() => tapKarma(track.key)}
                            >
                                +1
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/each}

        <!-- TOTAL -->
        <div class="mt-4 flex justify-end">
            <div
                class="card px-4 py-3 min-w-55"
            >
                <div class="text-xs text-muted mb-1">
                    Total Ark Passive Cost
                </div>

                <div class="text-lg font-semibold text tabular-nums">
                    {$displayKarmaCost.toLocaleString()}g
                </div>
            </div>
        </div>
    </div>
</section>
