<script lang="ts">
  import { raidApi } from "$lib/api/planner";
  import {
    weeklyIncome,
  } from "$lib/derived/planner";
  import { raids } from "$lib/data/raids";
  import { isGoldEarner, type Character } from "$lib/helpers/character";
  import { rosterWeeklyGold } from "$lib/helpers/gold";
  import {
    formatCountdown,
    nextWednesdayReset,
  } from "$lib/helpers/reset";
  import { planner } from "$lib/stores/planner";
  import StatCard from "$lib/components/StatCard.svelte";
  import ProgressBar from "$lib/components/ProgressBar.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";

  let now = $state(new Date());

  $effect(() => {
    const t = setInterval(() => (now = new Date()), 30_000);
    return () => clearInterval(t);
  });

  const raidMap = new Map(raids.map((r) => [r.id, r]));

  const earningRoster = $derived($planner.roster.filter(isGoldEarner));

  const totalAssigned = $derived(
    earningRoster.reduce((sum, c) => sum + c.assignedRaids.length, 0)
  );

  const totalCompleted = $derived(
    earningRoster.reduce(
      (sum, c) =>
        sum +
        (c.assignedRaids.filter((r) =>
          ($planner.completedRaids[c.id] ?? []).includes(r)
        ).length ?? 0),
      0
    )
  );

  const completedTradable = $derived(
    Object.entries($planner.completedRaids)
      .filter(([charId]) =>
        ($planner.roster as Character[]).some(
          (c) => c.id === charId && isGoldEarner(c)
        )
      )
      .flatMap(([, raidsDone]) => raidsDone)
      .reduce((sum, id) => sum + (raidMap.get(id)?.tradableGold ?? 0), 0)
  );

  const potentialTradable = $derived(rosterWeeklyGold($planner.roster));

  function charCompletedTradable(charId: string): number {
    return ($planner.completedRaids[charId] ?? []).reduce(
      (sum, id) => sum + (raidMap.get(id)?.tradableGold ?? 0),
      0
    );
  }
</script>

<section class="space-y-4">
  <!-- SUMMARY STATS -->
  <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
    <StatCard label="Reset In" value={formatCountdown(+nextWednesdayReset() - +now)} />
    <StatCard
      label="Raids Cleared"
      value={`${totalCompleted} / ${totalAssigned}`}
      valueClass={totalAssigned > 0 && totalCompleted >= totalAssigned ? 'stat-value-green' : ''}
    />
    <StatCard label="Tradable Earned">
      <div class="stat-value text-xl">
        {completedTradable.toLocaleString()}
        <span class="text-sm font-normal text-[#8a857c]">
          / {$weeklyIncome.toLocaleString()}g
        </span>
      </div>
    </StatCard>
  </div>

  <!-- PROGRESS BAR -->
  {#if totalAssigned > 0}
    {@const pct = Math.round((totalCompleted / totalAssigned) * 100)}
    <div class="card p-4">
      <div class="flex justify-between text-xs text-[#a29e96] mb-2">
        <span>Weekly progress</span>
        <span>{pct}%</span>
      </div>
      <ProgressBar {pct} />
    </div>
  {/if}

  <!-- EMPTY STATES -->
  {#if $planner.roster.length === 0}
    <EmptyState message="No characters yet - add some on the Roster tab." />
  {:else if totalAssigned === 0}
    <EmptyState message="No raids assigned - assign them via &quot;Edit Raids&quot; on the Roster tab." />
  {:else}
    <!-- PER-CHARACTER CHECKLISTS -->
    {#each earningRoster as char (char.id)}
      {#if char.assignedRaids.length > 0}
        {@const done = char.assignedRaids.filter((r) =>
          ($planner.completedRaids[char.id] ?? []).includes(r)
        )}

        <div class="card">
          <div class="card-header justify-between">
            <div class="font-semibold">{char.name}</div>
            <div class="flex items-center gap-3 text-xs">
              <span class="text-[#a29e96]">
                {done.length} / {char.assignedRaids.length} done
              </span>
              <span class="tabular-nums la-gold-text" title="Tradable gold earned this week">
                +{charCompletedTradable(char.id).toLocaleString()}g
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#060509]">
            {#each char.assignedRaids as raidId (raidId)}
              {@const raid = raidMap.get(raidId)}
              {@const isDone = ($planner.completedRaids[char.id] ?? []).includes(raidId)}

              <label class="raid-slot" style={isDone ? "background: rgba(74, 222, 128, 0.06);" : ""}>
                <input
                  type="checkbox"
                  checked={isDone}
                  onchange={() => raidApi.toggleCompletedRaid(char.id, raidId)}
                />

                {#if raid}
                  <div>
                    <div
                      class="text-xs font-medium"
                      style={isDone ? "color: var(--la-green);" : ""}
                    >
                      {raid.name}
                    </div>
                    <div class="text-xs text-[#a29e96]">
                      {raid.rewardGold.toLocaleString()}g reward
                      · {raid.tradableGold.toLocaleString()}g tradable
                    </div>
                  </div>
                {:else}
                  <div class="text-xs font-medium">{raidId}</div>
                {/if}
              </label>
            {/each}
          </div>
        </div>
      {/if}
    {/each}
  {/if}
</section>
