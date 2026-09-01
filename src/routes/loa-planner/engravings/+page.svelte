<script>
    import { plannerApi } from "$lib/api/planner";
    import NumberInput from "$lib/components/NumberInput.svelte";
    import { displayEngravingCost } from "$lib/derived/planner";
    import { planner } from "$lib/stores/planner";
</script>

<section class="space-y-4">
    <div class="flex justify-end">
        <button
            class="btn btn-primary"
            onclick={() =>
                plannerApi.addEngraving({
                    id: crypto.randomUUID(),
                    name: "New Engraving",
                    booksOwned: 0,
                    booksRequired: 20,
                    pricePerBook: 0,
                })}
        >
            Add Engraving
        </button>
    </div>

    {#if $planner.engravings.length === 0}
        <div class="card p-6 text-center">
            <div class="text-muted">No engravings yet.</div>
        </div>
    {:else}
        {#each $planner.engravings as engraving (engraving.id)}
            <div
                class="card"
            >
                <!-- HEADER -->
                <div
                    class="card-header justify-between"
                >
                    <input
                        class="font-medium text bg-transparent outline-none w-full"
                        value={engraving.name}
                        oninput={(e) =>
                            plannerApi.updateEngraving(engraving.id, {
                                name: e.currentTarget.value,
                            })}
                    />

                    <button
                        class="btn-danger ml-3"
                        onclick={() => plannerApi.removeEngraving(engraving.id)}
                    >
                        Remove
                    </button>
                </div>

                <!-- BODY -->
                <div class="px-4 py-3 bg-bg-secondary">
                    <div class="grid grid-cols-4 gap-4 items-stretch">
                        <!-- OWNED -->
                        <div class="flex flex-col justify-between h-16">
                            <div class="text-xs text-muted">Owned</div>
                            <NumberInput
                                value={engraving.booksOwned}
                                onchange={(v) =>
                                    plannerApi.updateEngraving(engraving.id, {
                                        booksOwned: Math.min(
                                            20,
                                            Math.max(0, v),
                                        ),
                                    })}
                            />
                        </div>

                        <!-- REQUIRED -->
                        <div class="flex flex-col justify-between h-16">
                            <div class="text-xs text-muted">Required</div>
                            <NumberInput
                                value={engraving.booksRequired}
                                onchange={(v) =>
                                    plannerApi.updateEngraving(engraving.id, {
                                        booksRequired: Math.min(
                                            20,
                                            Math.max(0, v),
                                        ),
                                    })}
                            />
                        </div>

                        <!-- MISSING -->
                        <div class="flex flex-col justify-between h-16">
                            <div class="text-xs text-muted">Missing</div>
                            <div
                                class="flex items-center justify-end h-9 font-medium tabular-nums"
                            >
                                {Math.max(
                                    0,
                                    engraving.booksRequired -
                                        engraving.booksOwned,
                                ).toLocaleString()}
                            </div>
                        </div>

                        <!-- PRICE -->
                        <div class="flex flex-col justify-between h-16">
                            <div class="text-xs text-muted">Price</div>
                            <div class="flex items-center h-9">
                                <input
                                    class="input-compact w-full"
                                    type="number"
                                    step="0.01"
                                    value={engraving.pricePerBook}
                                    oninput={(e) =>
                                        plannerApi.updateEngraving(
                                            engraving.id,
                                            {
                                                pricePerBook: Number(
                                                    e.currentTarget.value,
                                                ),
                                            },
                                        )}
                                />
                            </div>
                        </div>
                    </div>

                    <!-- COST -->
                    <div class="mt-3 flex justify-end">
                        <div
                            class="text-sm font-semibold tabular-nums text"
                        >
                            {(
                                Math.max(
                                    0,
                                    engraving.booksRequired -
                                        engraving.booksOwned,
                                ) * engraving.pricePerBook
                            ).toLocaleString()}g
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    {/if}

    <!-- TOTAL -->
    <div class="mt-4 flex justify-end">
        <div
            class="card px-4 py-3 min-w-55"
        >
            <div class="text-xs text-muted mb-1">Total Engraving Cost</div>

            <div class="text-lg font-semibold text tabular-nums">
                {$displayEngravingCost.toLocaleString()}g
            </div>
        </div>
    </div>
</section>
