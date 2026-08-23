<script>
    import { karmaTracks, planner } from "$lib/stores/planner";
    import { plannerApi } from "$lib/api/planner";
    import { getTrackTotal } from "$lib/helpers/karma";
    import { displayKarmaCost } from "$lib/derived/planner";
</script>

<section class="space-y-4">
    <div class="space-y-2">
        {#each karmaTracks as track}
            {@const current = $planner.karma[track.key].currentLevel}
            {@const target = $planner.karma[track.key].targetLevel}

            <div
                class="bg-white border border-zinc-100 rounded-xl overflow-hidden"
            >
                <!-- HEADER -->
                <div class="px-4 py-3 flex items-center justify-between">
                    <div class="font-medium text-zinc-900">
                        {track.label}
                    </div>
                </div>

                <!-- CONTROLS -->
                <div class="px-4 py-3 bg-zinc-50 border-t border-zinc-100">
                    <div class="grid grid-cols-3 gap-4 items-stretch">
                        <!-- CURRENT -->
                        <div class="flex flex-col justify-between h-16">
                            <div class="text-xs text-zinc-500">Current</div>
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
                            <div class="text-xs text-zinc-500">Target</div>
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
                            <div class="text-xs text-zinc-500">Cost</div>

                            <div
                                class="flex items-center justify-end h-9 font-medium tabular-nums text-zinc-900"
                            >
                                {getTrackTotal(
                                    current,
                                    target,
                                ).toLocaleString()}g
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {/each}

        <!-- TOTAL -->
        <div class="mt-4 flex justify-end">
            <div
                class="bg-white border border-zinc-200 rounded-xl px-4 py-3 min-w-55"
            >
                <div class="text-xs text-zinc-500 mb-1">
                    Total Ark Passive Cost
                </div>

                <div class="text-lg font-semibold text-zinc-900 tabular-nums">
                    {$displayKarmaCost.toLocaleString()}g
                </div>
            </div>
        </div>
    </div>
</section>
