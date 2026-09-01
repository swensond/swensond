<script lang="ts">
  import { raidApi, rosterApi } from "$lib/api/planner";
  import { raids } from "$lib/data/raids";
  import {
    countGoldEarners,
    isGoldEarner,
    MAX_GOLD_EARNERS,
  } from "$lib/helpers/character";
  import { characterGoldBreakdown } from "$lib/helpers/gold";

  import { planner } from "$lib/stores/planner";

  let assigningCharId: string | null = $state(null);

  const openAssign = (id: string) => (assigningCharId = id);
  const closeAssign = () => (assigningCharId = null);
</script>

<!-- TOP ROSTER PAGE CONTENT -->
<section class="space-y-3">
  <div class="flex justify-end items-center gap-4">
    <span class="text-xs text-muted">
      Gold Earners: {countGoldEarners($planner.roster)} / {MAX_GOLD_EARNERS}
    </span>

    <button class="btn-primary" onclick={() => rosterApi.addCharacter()}>
      Add Character ({$planner.roster.length})
    </button>
  </div>

  {#if $planner.roster.length === 0}
    <div class="card p-6 text-center">
      <div class="text-muted">No characters yet.</div>
    </div>
  {:else}
    {#each $planner.roster as char (char.id)}
      {@const gold = characterGoldBreakdown(char)}
      {@const earner = isGoldEarner(char)}
      <div class="card" class:opacity-70={!earner}>
        <div class="card-header">
          <input
            class="name-input"
            value={char.name}
            oninput={(e) =>
              rosterApi.updateCharacter(char.id, {
                name: e.currentTarget.value,
              })}
          />

          <label
            class="flex items-center gap-1 text-xs whitespace-nowrap"
            title="Gold earners earn raid gold - a roster can have at most 6"
          >
            <input
              type="checkbox"
              checked={earner}
              onchange={() => rosterApi.toggleGoldEarner(char.id)}
            />
            <span class={earner ? "text-accent" : "text-faint"}>
              Gold Earner
            </span>
          </label>

          <label
            class="flex items-center gap-1 text-xs text-faint"
            title="Item level - used to auto-suggest runnable raids"
          >
            <span>ilvl</span>
            <input
              class="input w-20 px-2 py-1 text-xs"
              type="number"
              min="0"
              step="10"
              placeholder="-"
              value={char.itemLevel ?? ""}
              oninput={(e) =>
                rosterApi.updateCharacter(char.id, {
                  itemLevel: Number(e.currentTarget.value) || undefined,
                })}
            />
          </label>

          <div class="flex items-center gap-2" title="Tradable / Total weekly gold">
            <span class="text-sm tabular-nums text-accent">
              {gold.tradable.toLocaleString()}g
            </span>
            <span class="text-xs text-faint">/</span>
            <span class="text-sm tabular-nums text-muted">
              {gold.total.toLocaleString()}g
            </span>
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

        <div class="grid grid-cols-3 gap-px bg-border">
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
                  <div class="text-xs text-muted">
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
      class="fixed inset-0 bg-[rgba(15,23,42,0.5)] flex items-center justify-center p-4"
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
            <div class="font-semibold">Assign Raids - {char.name}</div>
            <div class="text-xs text-muted">
              {char.assignedRaids.length} / 3 slots
              {#if char.itemLevel}
                · ilvl {char.itemLevel.toLocaleString()}
              {/if}
            </div>
          </div>
        </div>

        <div class="p-4 grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto">
          {#if !isGoldEarner(char)}
            <div
              class="col-span-2 rounded-md px-3 py-2 text-xs"
              style="background: var(--red-light); color: var(--red);"
            >
              {char.name} is not marked as a Gold Earner - assigned raids won't
              earn gold. Mark them as an earner on their roster card (max{" "}
              {MAX_GOLD_EARNERS} per roster).
            </div>
          {/if}

          {#each raids as raid}
            {@const assigned = char.assignedRaids.includes(raid.id)}
            {@const atCap = char.assignedRaids.length >= 3 && !assigned}
            {@const locked =
              !!char.itemLevel && raid.minItemLevel > char.itemLevel}

            <label class="raid-slot" class:opacity-50={atCap}>
              <input
                type="checkbox"
                checked={assigned}
                disabled={atCap}
                onchange={() => rosterApi.toggleAssignedRaid(char.id, raid.id)}
              />

              <div>
                <div class="text-sm font-medium">{raid.name}</div>
                <div class="text-xs">
                  {#if locked}
                    <span class="text-amber">
                      Requires {raid.minItemLevel.toLocaleString()}
                    </span>
                  {:else}
                    <span class="text-muted">
                      {raid.rewardGold.toLocaleString()}g
                    </span>
                  {/if}
                </div>
              </div>
            </label>
          {/each}
        </div>

        <div
          class="flex gap-2 p-4 border-t"
          style="border-color: var(--border);"
        >
          <button
            class="btn-primary flex-1"
            disabled={!char.itemLevel}
            title={
              char.itemLevel
                ? "Fill the slots with the highest-gold raids this ilvl can run"
                : "Set the character's ilvl first"
            }
            onclick={() => rosterApi.autoAssignRaids(char.id)}
          >
            Auto-fill Best
          </button>

          <button class="btn-secondary flex-1" onclick={closeAssign}>
            Close
          </button>
        </div>
      </div>
    </div>
  {/if}
{/if}

<svelte:window
  onkeydown={(e) => {
    if (e.key === "Escape" && assigningCharId !== null) closeAssign();
  }}
/>
