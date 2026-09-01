<script lang="ts">
  import { plans } from "$lib/stores/plans";
  import { plansApi, progressionApi } from "$lib/api/planner";

  let planName = $state("");
  let fileInput: HTMLInputElement;

  function save() {
    if (!planName.trim()) return;
    plansApi.save(planName);
    planName = "";
  }

  function handleImport(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (file) plansApi.import(file);
    input.value = "";
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
</script>

<div class="flex flex-col gap-3">
  <!-- Save current state -->
  <div class="flex gap-2">
    <input
      class="input flex-1"
      type="text"
      placeholder="Plan name..."
      bind:value={planName}
      onkeydown={(e) => e.key === "Enter" && save()}
    />
    <button class="btn-primary" onclick={save} disabled={!planName.trim()}>
      Save
    </button>
  </div>

  <!-- Saved plans list -->
  {#if $plans.length === 0}
    <p class="text-xs text-[#a29e96]">No saved plans yet.</p>
  {:else}
    <div class="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
      {#each $plans as plan (plan.id)}
        <div
          class="rounded-md border p-3"
          style="border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.03);"
        >
          <div class="flex justify-between items-start gap-2">
            <div class="min-w-0">
              <div class="font-semibold text-sm truncate">{plan.name}</div>
              <div class="text-xs text-[#a29e96]">
                Saved {formatDate(plan.savedAt)}
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-1 mt-2">
            <button
              class="btn text-xs px-2 py-1"
              onclick={() => {
                if (
                  confirm(
                    `Load "${plan.name}"? Your current planner will be replaced.`,
                  )
                ) {
                  plansApi.load(plan.id);
                }
              }}
            >
              Load
            </button>

            <button
              class="btn text-xs px-2 py-1"
              onclick={() => {
                if (
                  confirm(
                    `Overwrite "${plan.name}" with your current planner state?`,
                  )
                ) {
                  plansApi.update(plan.id);
                }
              }}
            >
              Overwrite
            </button>

            <button
              class="btn text-xs px-2 py-1"
              onclick={() => {
                const name = prompt("Rename plan", plan.name);
                if (name) plansApi.rename(plan.id, name);
              }}
            >
              Rename
            </button>

            <button
              class="btn text-xs px-2 py-1"
              onclick={() => plansApi.export(plan.id)}
            >
              Export
            </button>

            <button
              class="btn text-xs px-2 py-1"
              onclick={() => {
                if (confirm(`Delete "${plan.name}"?`)) {
                  plansApi.delete(plan.id);
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Import / Presets -->
  <div class="flex gap-2 pt-1" style="border-top: 1px solid rgba(255,255,255,0.12);">
    <input
      bind:this={fileInput}
      type="file"
      accept="application/json,.json"
      class="hidden"
      onchange={handleImport}
    />

    <button class="btn-secondary flex-1 mt-2" onclick={() => fileInput.click()}>
      Import Plan
    </button>

    <button
      class="btn-secondary flex-1 mt-2"
      onclick={() => {
        if (
          confirm(
            "Replace your current planner with the Chronomancer preset?",
          )
        ) {
          progressionApi.prefillChronomancer();
        }
      }}
    >
      Chronomancer
    </button>
  </div>

</div>
