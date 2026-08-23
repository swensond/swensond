<script lang="ts">
  // --------------------
  // Props
  // --------------------
  let { children } = $props();

  // --------------------
  // Imports
  // --------------------
  import "./page.css";

  import { page } from "$app/state";

  import {
    displayFundingGap,
    displayProjectedGold,
    weeklyIncome,
    weeksRemaining,
  } from "$lib/derived/planner";

  import { planner } from "$lib/stores/planner";

  import { plannerApi, progressionApi } from "$lib/api/planner";

  // --------------------
  // Tabs (UI config)
  // --------------------
  const tabs = [
    { href: "/loa-planner", label: "Roster" },
    { href: "/loa-planner/materials", label: "Materials" },
    { href: "/loa-planner/owned-materials", label: "Owned Materials" },
    { href: "/loa-planner/honing", label: "Honing" },
    { href: "/loa-planner/karma", label: "Karma" },
    { href: "/loa-planner/engravings", label: "Engravings" },
    { href: "/loa-planner/accessories", label: "Accessories" },
  ];

  // --------------------
  // State
  // --------------------
  let goldInput = $state(0);
  let now = $state(new Date());
  let nextReset = $state(nextWednesdayReset());

  // --------------------
  // Effects
  // --------------------
  $effect(() => {
    const t = setInterval(() => {
      now = new Date();
      nextReset = nextWednesdayReset();
    }, 60_000);

    return () => clearInterval(t);
  });

  // --------------------
  // Helpers
  // --------------------
  function nextWednesdayReset(): Date {
    const ET = 5 * 60 * 60 * 1000;
    const nowMs = Date.now();
    const nowET = nowMs - ET;

    const d = new Date(nowET);

    const daysUntil = (3 - d.getUTCDay() + 7) % 7 || 7;

    const midnightET =
      nowET +
      daysUntil * 86_400_000 -
      (d.getUTCHours() * 3_600_000 +
        d.getUTCMinutes() * 60_000 +
        d.getUTCSeconds() * 1_000 +
        d.getUTCMilliseconds());

    return new Date(midnightET + 6 * 3_600_000 + ET);
  }

  let contentEl: HTMLElement;

  let raf1: number;
  let raf2: number;
  let timeout: number;

  $effect(() => {
    page.url; // trigger on navigation

    // cancel previous runs if user clicks quickly
    cancelAnimationFrame(raf1);
    cancelAnimationFrame(raf2);
    clearTimeout(timeout);

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        // wait one more tick to let layout stabilize
        timeout = window.setTimeout(() => {
          contentEl?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }, 0);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(timeout);
    };
  });
</script>

<div class="space-y-6">
  <h1 class="la-heading text-4xl font-bold la-gold-text">Lost Ark Planner</h1>
  <!-- TOP -->
  <div class="grid lg:grid-cols-3 gap-4">
    <!-- GOLD -->
    <div class="card p-5">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-sm font-semibold text-[#a29e96] uppercase">
            Gold Management
          </h2>
          <p class="text-xs text-[#a29e96] mt-1">Current available gold</p>
        </div>

        <div class="text-3xl font-bold">
          {$planner.currentGold.toLocaleString()}
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <input class="input w-full" type="number" bind:value={goldInput} />

        <div class="flex gap-2">
          <button
            class="btn"
            onclick={() => plannerApi.addGold(Number(goldInput))}
          >
            Add
          </button>

          <button
            class="btn"
            onclick={() => plannerApi.spendGold(Number(goldInput))}
          >
            Spend
          </button>

          <button
            class="btn-primary"
            onclick={() => plannerApi.setGold(Number(goldInput))}
          >
            Set
          </button>
        </div>
      </div>
    </div>

    <!-- RELEASE -->
    <div class="card p-5">
      <h2 class="text-sm font-semibold text-[#a29e96] uppercase">
        Release Target
      </h2>

      <input
        type="date"
        class="input mt-3"
        value={$planner.releaseDate}
        onchange={(e) => plannerApi.setReleaseDate(e.currentTarget.value)}
      />
    </div>

    <!-- PRESETS -->
    <div class="card p-5">
      <h2 class="text-sm font-semibold text-[#a29e96] uppercase">Presets</h2>

      <button
        class="btn-secondary w-full mt-4"
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

  <!-- STATS -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="stat-card">
      <div class="stat-label">Weekly Income</div>
      <div class="stat-value">{$weeklyIncome.toLocaleString()}</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Weeks Left</div>
      <div class="stat-value">{$weeksRemaining}</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Gold At Release</div>
      <div class="stat-value">{$displayProjectedGold.toLocaleString()}</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">
        {$displayFundingGap > 0 ? "Still Needed" : "Surplus"}
      </div>

      <div
        class="stat-value"
        class:stat-value-red={$displayFundingGap > 0}
        class:stat-value-green={$displayFundingGap <= 0}
      >
        {Math.abs($displayFundingGap).toLocaleString()}
      </div>
    </div>
  </div>

  <nav bind:this={contentEl} class="border-b flex gap-1" style="border-color: rgba(255,255,255,0.12);">
    {#each tabs as tab}
      {@const path = page.url.pathname.replace(/\/$/, "")}
      {@const active = path === tab.href}

      <a
        href={tab.href}
        class="tab"
        class:tab-active={active}
        aria-current={active ? "page" : undefined}
      >
        {tab.label}
      </a>
    {/each}
  </nav>

  {@render children()}
</div>
