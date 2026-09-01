<script lang="ts">
    import { logApi } from "$lib/api/planner";
    import { planner } from "$lib/stores/planner";

    function formatTime(iso: string) {
        return new Date(iso).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    const recent = $derived([...($planner.tapLog ?? [])].reverse());

    const clearAll = () => {
        if ($planner.tapLog?.length && confirm("Clear the entire log?")) {
            logApi.clearTaps();
        }
    };
</script>

<section class="space-y-4">
    {#if !$planner.tapLog?.length}
        <div class="card p-6 text-center">
            <div class="text-muted">
                No successes logged yet. Use the +1 buttons on the Honing and
                Karma pages.
            </div>
        </div>
    {:else}
        <!-- RECENT SUCCESSES -->
        <div class="card">
            <div class="card-header justify-between">
                <h2>Recent Successes</h2>
                <button class="btn-danger" onclick={clearAll}>Clear All</button>
            </div>

            <div
                class="grid grid-cols-[60px_minmax(0,1fr)_70px_90px_80px] gap-3 px-4 py-2 text-xs uppercase tracking-widest text-muted border-b bg-bg-secondary"
                style="border-color: var(--border);"
            >
                <div>Time</div>
                <div>Track</div>
                <div class="text-right">Level</div>
                <div class="text-right">Artisan %</div>
                <div class="text-right">Undo</div>
            </div>

            {#each recent as entry (entry.id)}
                <div
                    class="grid grid-cols-[60px_minmax(0,1fr)_70px_90px_80px] gap-3 items-center px-4 py-2 border-b last:border-b-0"
                    style="border-color: var(--border);"
                >
                    <div class="text-xs text-faint tabular-nums">
                        {formatTime(entry.timestamp)}
                    </div>

                    <div class="capitalize text-sm truncate">
                        {entry.trackLabel}
                    </div>

                    <div class="text-right text-sm tabular-nums">
                        {entry.level}
                    </div>

                    <div class="text-right text-sm tabular-nums">
                        {entry.artisan !== null ? `${entry.artisan}%` : "-"}
                    </div>

                    <button
                        class="btn-danger justify-self-end text-xs"
                        onclick={() => logApi.removeTap(entry.id)}
                    >
                        Undo
                    </button>
                </div>
            {/each}
        </div>
    {/if}
</section>
