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
    displayMarketShortfall,
    displayProjectedGold,
    weeklyIncome,
    weeksRemaining,
  } from "$lib/derived/planner";

  import { nextWednesdayReset } from "$lib/helpers/reset";

  import { planner } from "$lib/stores/planner";

  import { plannerApi } from "$lib/api/planner";
  import SavedPlans from "$lib/components/SavedPlans.svelte";
  import NumberInput from "$lib/components/NumberInput.svelte";
  import StatCard from "$lib/components/StatCard.svelte";
  import { portal } from "$lib/actions/portal";

  // --------------------
  // Tabs (UI config)
  // --------------------
  const tabs = [
    { href: "/loa-planner", label: "This Week" },
    { href: "/loa-planner/roster", label: "Roster" },
    { href: "/loa-planner/materials", label: "Materials" },
    { href: "/loa-planner/owned-materials", label: "Owned Materials" },
    { href: "/loa-planner/honing", label: "Honing" },
    { href: "/loa-planner/karma", label: "Karma" },
    { href: "/loa-planner/engravings", label: "Engravings" },
    { href: "/loa-planner/accessories", label: "Accessories" },
    { href: "/loa-planner/log", label: "Log" },
    { href: "/loa-planner/projection", label: "Projection" },
  ];

  // --------------------
  // State
  // --------------------
  let goldModal = $state<"add" | "spend" | "set" | null>(null);
  let goldModalAmount = $state(0);
  let goldModalNote = $state("");
  let plansOpen = $state(false);

  function openGoldModal(kind: "add" | "spend" | "set") {
    goldModalAmount = kind === "set" ? $planner.currentGold : 0;
    goldModalNote = "";
    goldModal = kind;
  }

  function confirmGoldModal() {
    const amount = Math.abs(Number(goldModalAmount) || 0);
    const note = goldModalNote.trim() || undefined;

    if (amount <= 0 || goldModal === null) {
      goldModal = null;
      return;
    }

    if (goldModal === "add") plannerApi.addGold(amount, note);
    else if (goldModal === "spend") plannerApi.spendGold(amount, note);
    else if (goldModal === "set") plannerApi.setGold(amount);

    goldModal = null;
  }
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
  <h1 class="text-4xl font-bold text-accent">Lost Ark Planner</h1>

  <!-- CONTROL BAR -->
  <div class="card px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
    <div class="flex items-center gap-2">
      <span
        class="text-lg font-bold tabular-nums text-accent"
        title="Tradable gold balance"
      >
        {$planner.currentGold.toLocaleString()}g
      </span>

      <button class="btn" onclick={() => openGoldModal("add")}>+ Add</button>
      <button class="btn" onclick={() => openGoldModal("spend")}>− Spend</button>
      <button class="btn" onclick={() => openGoldModal("set")}>= Set</button>
    </div>

    <div class="flex items-center gap-2 sm:border-l sm:pl-5 border-l border-border">
      <label class="text-xs text-muted" for="release-date">Release</label>

      <input
        id="release-date"
        type="date"
        class="input w-40"
        style="padding: 0.35rem 0.5rem;"
        value={$planner.releaseDate}
        onchange={(e) => plannerApi.setReleaseDate(e.currentTarget.value)}
      />
    </div>

    <div class="ml-auto sm:border-l sm:pl-5 border-l border-border">
      <button class="btn-secondary" onclick={() => (plansOpen = true)}>
        Plans
      </button>
    </div>
  </div>

  <!-- STATS -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard label="Weekly Income" value={$weeklyIncome.toLocaleString()} />

    <StatCard label="Weeks Left" value={$weeksRemaining} />

    <StatCard label="Gold At Release" value={$displayProjectedGold.toLocaleString()} />

    <StatCard
      label={$displayFundingGap > 0 ? "Still Needed" : "Surplus"}
      value={Math.abs($displayFundingGap).toLocaleString()}
      valueClass={$displayFundingGap > 0 ? "stat-value-red" : "stat-value-green"}
    >
      {#if $displayMarketShortfall > 0}
        <div
          class="text-xs mt-1 text-red"
          title="Market purchases (materials, engravings, accessories) can only use tradable gold - bound gold cannot cover them"
        >
          {$displayMarketShortfall.toLocaleString()}g market cost not covered by tradable gold
        </div>
      {/if}
    </StatCard>
  </div>

  <nav bind:this={contentEl} class="border-b flex gap-1" style="border-color: var(--border);">
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

<svelte:window
  onkeydown={(e) => {
    if (e.key !== "Escape") return;

    if (goldModal) goldModal = null;
    else if (plansOpen) plansOpen = false;
  }}
/>

{#if goldModal}
  <!-- Gold movement popup (ported to body so it centers on the browser viewport) -->
  <div use:portal>
    <div
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style="background: rgba(15, 23, 42, 0.5);"
      role="presentation"
      onclick={(e) => {
        if (e.target === e.currentTarget) goldModal = null;
      }}
    >
      <div class="card p-5 w-full max-w-sm" role="dialog" aria-modal="true">
      <h3 class="text-lg font-bold mb-1">
        {goldModal === "add"
          ? "Add Gold"
          : goldModal === "spend"
            ? "Spend Gold"
            : "Set Balance"}
      </h3>
      <p class="text-xs text-muted mb-4">
        {goldModal === "add"
          ? "Where did this gold come from?"
          : goldModal === "spend"
            ? "What was this gold spent on?"
            : "Enter your exact current tradable balance."}
      </p>

      <label class="block text-xs font-medium text-muted mb-1" for="gold-modal-amount">
        Amount
      </label>
      <div class="mb-3">
        <NumberInput
          id="gold-modal-amount"
          class="w-full"
          value={goldModalAmount}
          min={0}
          onchange={(v) => (goldModalAmount = v)}
          onkeydown={(e) => e.key === "Enter" && confirmGoldModal()}
        />
      </div>

      {#if goldModal !== "set"}
        <label class="block text-xs font-medium text-muted mb-1" for="gold-modal-note">
          {goldModal === "add" ? "Source" : "Purpose"}
        </label>
        <input
          id="gold-modal-note"
          class="input w-full mb-4"
          type="text"
          placeholder={goldModal === "add"
            ? "e.g. Weekly raids, bus carry..."
            : "e.g. Honing materials, accessory..."}
          bind:value={goldModalNote}
          onkeydown={(e) => e.key === "Enter" && confirmGoldModal()}
        />
      {:else}
        <div class="mb-4"></div>
      {/if}

      <div class="flex gap-2 justify-end">
        <button class="btn" onclick={() => (goldModal = null)}>
          Cancel
        </button>
        <button class="btn-primary" onclick={confirmGoldModal}>
          {goldModal === "add" ? "Add" : goldModal === "spend" ? "Spend" : "Set"}
        </button>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if plansOpen}
  <!-- Saved plans popup (ported to body so it centers on the browser viewport) -->
  <div use:portal>
    <div
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style="background: rgba(15, 23, 42, 0.5);"
      role="presentation"
      onclick={(e) => {
        if (e.target === e.currentTarget) plansOpen = false;
      }}
    >
      <div
        class="card p-5 w-full max-w-md max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-lg font-bold">Saved Plans</h3>
          <button class="btn" onclick={() => (plansOpen = false)}>
            Close
          </button>
        </div>

        <SavedPlans />
      </div>
    </div>
  </div>
{/if}
