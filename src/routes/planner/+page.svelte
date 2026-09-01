<script lang="ts">
  import { planner } from "$lib/stores/planner";
  import {
    weeklyIncome,
    weeksRemaining,
    projectedGold,
  } from "$lib/stores/derived";
  import { totalMaterials, honingBrackets } from "$lib/data/honing";
  import goldIcon from "$lib/assets/gold.png";

  let goldInput = $state(0);
</script>

<div>
  <h1 class="text-4xl font-bold mb-8">Lost Ark Planner</h1>

  <div class="rounded-2xl border border-zinc-200 bg-white p-6 mb-8 shadow-sm">
    <h2 class="text-xl font-bold mb-4 text-zinc-900">Gold Controls</h2>

    <div class="flex gap-3 items-center">
      <input
        type="number"
        bind:value={goldInput}
        class="w-40 px-3 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
        placeholder="Enter gold"
      />

      <button
        class="px-4 py-2 rounded-lg border border-zinc-300 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 transition"
        onclick={() => planner.addGold(Number(goldInput))}
      >
        Add
      </button>

      <button
        class="px-4 py-2 rounded-lg border border-zinc-300 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 transition"
        onclick={() => planner.spendGold(Number(goldInput))}
      >
        Spend
      </button>

      <button
        class="px-4 py-2 rounded-lg border border-zinc-400 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 transition"
        onclick={() => planner.setGold(Number(goldInput))}
      >
        Set
      </button>
    </div>

    <div class="mt-3 text-sm text-zinc-500">
      Current:
      <span class="text-zinc-900 font-semibold">
        {$planner.currentGold.toLocaleString()}
      </span>
      gold
    </div>
  </div>
  <div class="grid md:grid-cols-4 gap-4 mb-8">
    <div class="rounded-2xl border border-zinc-800 p-6">
      <div class="text-zinc-400">Current Gold</div>

      <div class="text-3xl font-bold">
        {$planner.currentGold.toLocaleString()}
      </div>
    </div>

    <div class="rounded-2xl border border-zinc-800 p-6">
      <div class="text-zinc-400">Weekly Income</div>

      <div class="text-3xl font-bold">
        {$weeklyIncome.toLocaleString()}
      </div>
    </div>

    <div class="rounded-2xl border border-zinc-800 p-6">
      <div class="text-zinc-400">Weeks Remaining</div>

      <div class="text-3xl font-bold">
        {$weeksRemaining}
      </div>
    </div>

    <div class="rounded-2xl border border-zinc-800 p-6">
      <div class="text-zinc-400">Gold At Release</div>

      <div class="text-3xl font-bold">
        {$projectedGold.toLocaleString()}
      </div>
    </div>
  </div>

  <div class="overflow-x-auto">
    <h2 class="text-2xl font-bold mb-4">Material Totals</h2>
    <table
      class="min-w-full rounded-xl overflow-hidden border border-zinc-200 bg-white font-mono"
    >
      <thead>
        <tr class="bg-zinc-50 text-zinc-600 text-sm">
          <th class="py-3 px-4 text-left font-medium">Material</th>
          <th class="py-3 px-4 text-right font-medium">Amount</th>
          <th class="py-3 px-4 text-right font-medium">Price per Unit</th>
          <th class="py-3 px-4 text-right font-medium">Total Value</th>
        </tr>
      </thead>

      <tbody class="text-sm text-zinc-700">
        {#each Object.entries(totalMaterials) as [key, material] (key)}
          <tr class="border-t border-zinc-100 hover:bg-zinc-50 transition">
            <td class="py-3 px-4 flex items-center gap-2 text-zinc-900">
              <img src={material.icon} alt={key} class="w-6 h-6" />
              {key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (s) => s.toUpperCase())}
            </td>

            <td class="py-3 px-4 text-right tabular-nums">
              {material.amount.toLocaleString()}
            </td>

            <td class="py-3 px-4 text-right tabular-nums">
              {material.pricePerUnit.toLocaleString()} gold
            </td>

            <td
              class="py-3 px-4 text-right tabular-nums text-zinc-900 font-medium"
            >
              {(material.amount * material.pricePerUnit).toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )} gold
            </td>
          </tr>
        {/each}

        <tr class="border-t border-zinc-200 bg-zinc-50 font-semibold">
          <td class="py-3 px-4 flex items-center gap-2 text-zinc-900">
            <img src={goldIcon} alt="Gold" class="w-5 h-5" />
            Total Materials
          </td>

          <td></td>
          <td></td>

          <td class="py-3 px-4 text-right text-zinc-900 tabular-nums">
            {Object.values(totalMaterials)
              .reduce(
                (sum, material) =>
                  sum + material.amount * material.pricePerUnit,
                0,
              )
              .toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} gold
          </td>
        </tr>
      </tbody>
    </table>
    <div class="mt-6">
      <h3 class="text-xl font-bold mb-2">Honing Costs</h3>
      <table
        class="min-w-full rounded-xl overflow-hidden border border-zinc-200 bg-white font-mono mt-6"
      >
        <thead>
          <tr class="bg-zinc-50 text-zinc-600 text-sm">
            <th class="py-3 px-4 text-left font-medium">Bracket</th>
            <th class="py-3 px-4 text-right font-medium">Average Gold</th>
          </tr>
        </thead>

        <tbody class="text-sm text-zinc-700">
          {#each honingBrackets as bracket (bracket.from)}
            <tr class="border-t border-zinc-100 hover:bg-zinc-50 transition">
              <td class="py-3 px-4 text-zinc-900">
                Level {bracket.from} - {bracket.to}
              </td>

              <td class="py-3 px-4 text-right tabular-nums text-zinc-900">
                {bracket.averageGold.toLocaleString()} gold
              </td>
            </tr>
          {/each}

          <tr class="border-t border-zinc-200 bg-zinc-50 font-semibold">
            <td class="py-3 px-4 flex items-center gap-2 text-zinc-900">
              <img src={goldIcon} alt="Gold" class="w-5 h-5" />
              Total Honing Cost
            </td>

            <td class="py-3 px-4 text-right tabular-nums text-zinc-900">
              {honingBrackets
                .reduce((sum, bracket) => sum + bracket.averageGold, 0)
                .toLocaleString()} gold
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="mt-10">
    <h2 class="text-2xl font-bold mb-4 text-zinc-900">Roster</h2>

    <table
      class="min-w-full rounded-xl overflow-hidden border border-zinc-200 bg-white font-mono"
    >
      <thead>
        <tr class="bg-zinc-50 text-zinc-600 text-sm">
          <th class="py-3 px-4 text-left font-medium">Character</th>
          <th class="py-3 px-4 text-right font-medium">Weekly Gold</th>
        </tr>
      </thead>

      <tbody class="text-sm text-zinc-700">
        {#each $planner.roster as char (char.id)}
          <tr class="border-t border-zinc-100 hover:bg-zinc-50 transition">
            <!-- Name -->
            <td class="py-3 px-4 text-zinc-900">
              <input
                class="w-full bg-transparent outline-none text-zinc-900"
                value={char.name}
                oninput={(e) =>
                  planner.updateCharacter(char.id, {
                    name: e.currentTarget.value,
                  })}
              />
            </td>

            <!-- Weekly Gold -->
            <td class="py-3 px-4 text-right tabular-nums text-zinc-900">
              <input
                type="number"
                class="w-28 text-right bg-transparent outline-none text-zinc-900 tabular-nums"
                value={char.weeklyGold}
                oninput={(e) =>
                  planner.updateCharacter(char.id, {
                    weeklyGold: Number(e.currentTarget.value),
                  })}
              />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
