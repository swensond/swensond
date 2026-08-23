<script lang="ts">
  import { raidApi, rosterApi } from "$lib/api/planner";
  import { raids } from "$lib/data/raids";
  import { characterWeeklyGold } from "$lib/helpers/gold";

  import { planner } from "$lib/stores/planner";

  let assigningCharId: string | null = $state(null);

  const openAssign = (id: string) => (assigningCharId = id);
  const closeAssign = () => (assigningCharId = null);
</script>

<!-- TOP ROSTER PAGE CONTENT -->
<section class="space-y-3">
  <div class="flex justify-end">
    <button
      class="btn-primary"
      disabled={$planner.roster.length >= 6}
      onclick={() => rosterApi.addCharacter()}
    >
      Add Character ({$planner.roster.length}/6)
    </button>
  </div>

  {#if $planner.roster.length === 0}
    <div class="card p-6 text-center">
      <div class="text-[#a29e96]">No characters yet.</div>
    </div>
  {:else}
    {#each $planner.roster as char (char.id)}
      <div class="card">
        <div class="card-header">
          <input
            class="name-input"
            value={char.name}
            oninput={(e) =>
              rosterApi.updateCharacter(char.id, {
                name: e.currentTarget.value,
              })}
          />

          <div class="text-sm tabular-nums">
            {characterWeeklyGold(char).toLocaleString()} g
          </div>

          <button class="btn" onclick={() => openAssign(char.id)}>
            Edit Raids
          </button>

          <button
            class="btn-danger"
            onclick={() => rosterApi.removeCharacter(char.id)}
          >
            Remove
          </button>
        </div>

        <div class="grid grid-cols-3 gap-px bg-[#060509]">
          {#each [0, 1, 2] as slot}
            {@const raidId = char.assignedRaids[slot]}
            {@const raid = raidId
              ? raids.find((r) => r.id === raidId)
              : null}

            {#if raid}
              <label class="raid-slot">
                <input
                  type="checkbox"
                  checked={($planner.completedRaids[char.id] ?? []).includes(raidId)}
                  onchange={() => raidApi.toggleCompletedRaid(char.id, raidId)}
                />
                <div>
                  <div class="text-xs font-medium">{raid.name}</div>
                  <div class="text-xs text-[#a29e96]">
                    {raid.rewardGold.toLocaleString()}g
                  </div>
                </div>
              </label>
            {:else}
              <div class="empty-slot">Empty slot</div>
            {/if}
          {/each}
        </div>
      </div>
    {/each}
  {/if}
</section>

<!-- MODAL -->
{#if assigningCharId !== null}
  {@const char = $planner.roster.find((c) => c.id === assigningCharId)}

  {#if char}
    <div
      class="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
      role="button"
      tabindex="0"
      onclick={(e) => e.target === e.currentTarget && closeAssign()}
      onkeydown={(e) => {
        if (
          e.target === e.currentTarget &&
          (e.key === "Enter" || e.key === " ")
        ) {
          closeAssign();
        }
      }}
    >
      <div class="card w-full max-w-lg">
        <div
          class="card-header justify-between"
        >
          <div>
            <div class="font-semibold">Assign Raids — {char.name}</div>
            <div class="text-xs text-[#a29e96]">
              {char.assignedRaids.length} / 3 slots
            </div>
          </div>

          <button class="btn" onclick={closeAssign}> Close </button>
        </div>

        <div class="p-4 grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto">
          {#each raids as raid}
            {@const assigned = char.assignedRaids.includes(raid.id)}
            {@const atCap = char.assignedRaids.length >= 3 && !assigned}

            <label class="raid-slot" class:opacity-50={atCap}>
              <input
                type="checkbox"
                checked={assigned}
                disabled={atCap}
                onchange={() => rosterApi.toggleAssignedRaid(char.id, raid.id)}
              />

              <div>
                <div class="text-sm font-medium">{raid.name}</div>
                <div class="text-xs text-[#a29e96]">
                  {raid.rewardGold.toLocaleString()}g
                </div>
              </div>
            </label>
          {/each}
        </div>
      </div>
    </div>
  {/if}
{/if}
