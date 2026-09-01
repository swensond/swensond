<script lang="ts">
  import { goldProjection, weeklyIncome, displayTotalCost } from "$lib/derived/planner";
  import { planner } from "$lib/stores/planner";
  import { plannerApi } from "$lib/api/planner";
  import NumberInput from "$lib/components/NumberInput.svelte";

  const W = 900;
  const H = 420;
  const PAD = { top: 24, right: 24, bottom: 40, left: 80 };

  const fmt = (n: number) => Math.round(n).toLocaleString();

  function yFor(gold: number, maxGold: number): number {
    const innerH = H - PAD.top - PAD.bottom;
    return PAD.top + innerH * (1 - gold / maxGold);
  }

  function xFor(week: number, minWeek: number, maxWeek: number): number {
    const innerW = W - PAD.left - PAD.right;
    return PAD.left + innerW * ((week - minWeek) / (maxWeek - minWeek));
  }

  /** Open the native calendar on any click within a date input */
  function openPicker(e: Event) {
    (e.currentTarget as HTMLInputElement).showPicker?.();
  }

  // ---- Scheduled events ----
  let evLabel = $state("");
  let evDate = $state("");
  let evAmount = $state<number>(0);
  let evKind = $state<"tradable" | "bound">("tradable");

  const sortedEvents = $derived(
    [...($planner.events ?? [])].sort((a, b) =>
      a.date.localeCompare(b.date)
    )
  );

  const scheduledTotals = $derived.by(() => {
    let tradable = 0;
    let bound = 0;

    for (const e of $planner.events ?? []) {
      if ((e.kind ?? "tradable") === "bound") {
        bound += e.amount || 0;
      } else {
        tradable += e.amount || 0;
      }
    }

    return { tradable, bound };
  });

  function addEvent() {
    if (!evLabel.trim() || !evDate || !Number(evAmount)) return;

    plannerApi.addEvent({
      label: evLabel.trim(),
      date: evDate,
      amount: Number(evAmount),
      kind: evKind,
    });

    evLabel = "";
    evDate = "";
    evAmount = 0;
    evKind = "tradable";
  }

  $effect(() => {
    // touch store so chart updates
    void $goldProjection;
  });
</script>

<div class="space-y-4">
  <div class="card p-5">
    <h2 class="text-sm font-semibold text-[#a29e96] uppercase">
      Gold Over Time
    </h2>
    <p class="text-xs text-[#a29e96] mt-1 mb-4">
      Actual balance history (from your gold log) and projected gold vs.
      total required ({fmt($displayTotalCost)}g) · Weekly income {fmt($weeklyIncome)}g
      {#if scheduledTotals.tradable || scheduledTotals.bound}
        · Scheduled: {fmt(scheduledTotals.tradable)}g{scheduledTotals.bound
          ? ` + ${fmt(scheduledTotals.bound)}g bound`
          : ""}
      {/if}
    </p>

    {#if $goldProjection.threshold === 0}
      <p class="text-sm text-[#a29e96]">
        Set up honing targets or a release date to see a projection.
      </p>
    {:else}
      {@const { points, boundPoints, threshold, crossingWeek, maxPastWeeks, maxFutureWeeks } = $goldProjection}
      {@const maxGold =
        Math.max(
          threshold,
          ...points.map((p) => p.gold),
          ...boundPoints.map((p) => p.gold),
        ) * 1.08}
      {@const minWeek = -maxPastWeeks}

      <!-- Summary -->
      <div class="grid grid-cols-3 gap-3 mb-4">
        <div class="stat-card">
          <div class="stat-label">Required Gold</div>
          <div class="stat-value">{fmt(threshold)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Crosses Threshold</div>
          <div
            class="stat-value"
            class:stat-value-green={crossingWeek !== null}
            class:stat-value-red={crossingWeek === null}
          >
            {crossingWeek !== null ? `Week ${crossingWeek}` : "Never"}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Weekly Income</div>
          <div class="stat-value">{fmt($weeklyIncome)}</div>
        </div>
      </div>

      <svg viewBox="0 0 {W} {H}" class="w-full" role="img" aria-label="Gold over time chart">
        <!-- Gridlines -->
        {#each [0.25, 0.5, 0.75, 1] as frac (frac)}
          {@const gy = PAD.top + (H - PAD.top - PAD.bottom) * (1 - frac)}
          <line x1={PAD.left} x2={W - PAD.right} y1={gy} y2={gy} stroke="rgba(255,255,255,0.08)" stroke-width="1" />
          <text x={PAD.left - 8} y={gy + 4} text-anchor="end" font-size="11" fill="#a29e96">
            {fmt(maxGold * frac)}
          </text>
        {/each}

        <!-- X axis labels -->
        {#each points as p (p.week)}
          {@const total = maxPastWeeks + maxFutureWeeks}
          {#if total <= 16 || p.week % 2 === 0 || p.week === maxFutureWeeks}
            <text
              x={xFor(p.week, minWeek, maxFutureWeeks)}
              y={H - PAD.bottom + 18}
              text-anchor="middle"
              font-size="11"
              fill={p.week === 0 ? "#f0c14b" : "#a29e96"}
            >
              {p.week === 0 ? "Now" : p.week < 0 ? `-${-p.week}w` : `+${p.week}w`}
            </text>
          {/if}
        {/each}

        <!-- "Now" divider -->
        <line
          x1={xFor(0, minWeek, maxFutureWeeks)} x2={xFor(0, minWeek, maxFutureWeeks)}
          y1={PAD.top} y2={H - PAD.bottom}
          stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="3 3"
        />

        <!-- Threshold line -->
        <line
          x1={PAD.left} x2={W - PAD.right}
          y1={yFor(threshold, maxGold)} y2={yFor(threshold, maxGold)}
          stroke="#e05d5d" stroke-width="2" stroke-dasharray="6 4"
        />
        <text x={W - PAD.right} y={yFor(threshold, maxGold) - 8} text-anchor="end" font-size="11" fill="#e05d5d">
          Required: {fmt(threshold)}g
        </text>

        <!-- History line (solid) -->
        {#if maxPastWeeks > 0}
          {@const hist = points.filter((p) => p.week <= 0)}
          <polyline
            fill="none" stroke="#7db8e0" stroke-width="2.5" stroke-linejoin="round"
            points={hist.map((p) => `${xFor(p.week, minWeek, maxFutureWeeks)},${yFor(p.gold, maxGold)}`).join(" ")}
          />
        {/if}

        <!-- Projection line (dashed) -->
        {#if points.some((p) => p.week >= 0)}
          {@const fut = points.filter((p) => p.week >= 0)}
          <polyline
            fill="none" stroke="#f0c14b" stroke-width="2.5" stroke-linejoin="round"
            stroke-dasharray="8 5"
            points={fut.map((p) => `${xFor(p.week, minWeek, maxFutureWeeks)},${yFor(p.gold, maxGold)}`).join(" ")}
          />
        {/if}

        <!-- Roster-bound gold (scheduled bound events), dashed overlay -->
        {#if boundPoints.some((p) => p.gold > 0)}
          <polyline
            fill="none" stroke="#b48ce0" stroke-width="2" stroke-linejoin="round"
            stroke-dasharray="4 4"
            points={boundPoints.map((p) => `${xFor(p.week, minWeek, maxFutureWeeks)},${yFor(p.gold, maxGold)}`).join(" ")}
          />
        {/if}

        <!-- Crossing marker -->
        {#if crossingWeek !== null && crossingWeek <= maxFutureWeeks}
          {@const cx = xFor(crossingWeek, minWeek, maxFutureWeeks)}
          {@const cy = yFor(threshold, maxGold)}
          <circle cx={cx} cy={cy} r="6" fill="#7ddb8a" stroke="#0f1115" stroke-width="2" />
          <text x={cx} y={cy - 14} text-anchor="middle" font-size="12" font-weight="600" fill="#7ddb8a">
            Week {crossingWeek}
          </text>
        {/if}

        <!-- Now point -->
        <circle cx={xFor(0, minWeek, maxFutureWeeks)} cy={yFor(points.find((p) => p.week === 0)!.gold, maxGold)} r="4" fill="#fff" />
      </svg>

      <div class="flex flex-wrap gap-4 mt-2 text-xs text-[#a29e96]">
        <span><span style="color:#7db8e0;">━</span> Actual (gold log)</span>
        <span><span style="color:#f0c14b;">╌</span> Projected tradable</span>
        <span><span style="color:#b48ce0;">╌</span> Roster-bound (events)</span>
        <span><span style="color:#e05d5d;">╌</span> Required</span>
      </div>
    {/if}
  </div>

  <!-- SCHEDULED INCOME -->
  <div class="card p-5">
    <h2 class="text-sm font-semibold text-[#a29e96] uppercase">
      Scheduled Income
    </h2>
    <p class="text-xs text-[#a29e96] mt-1 mb-4">
      One-off gold (events, login rewards, carries) included in the projection.
    </p>

    <!-- Add form -->
    <div
      class="grid gap-2 items-center mb-4"
      style="grid-template-columns: minmax(120px, 1fr) auto auto auto auto;"
    >
      <input
        class="input"
        type="text"
        placeholder="Label (e.g. Event raid reward)"
        bind:value={evLabel}
        onkeydown={(e) => e.key === "Enter" && addEvent()}
      />

      <input
        class="input"
        type="date"
        bind:value={evDate}
        onclick={openPicker}
      />

      <NumberInput
        class="w-32"
        placeholder="Gold"
        value={evAmount}
        min={0}
        onchange={(v) => (evAmount = v)}
        onkeydown={(e) => e.key === "Enter" && addEvent()}
      />

      <select class="input" bind:value={evKind}>
        <option value="tradable">Tradable</option>
        <option value="bound">Bound</option>
      </select>

      <button
        class="btn-primary"
        onclick={addEvent}
        disabled={!evLabel.trim() || !evDate || !Number(evAmount)}
      >
        Add
      </button>
    </div>

    {#if sortedEvents.length === 0}
      <p class="text-xs text-[#a29e96]">No scheduled income yet.</p>
    {:else}
      <div class="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
        {#each sortedEvents as e (e.id)}
          <div
            class="grid gap-2 items-center rounded-md px-3 py-2"
            style="background: rgba(255,255,255,0.03); grid-template-columns: minmax(120px, 1fr) auto auto auto auto auto;"
          >
            <input
              class="input"
              type="text"
              value={e.label}
              onchange={(ev) =>
                plannerApi.updateEvent(e.id, {
                  label: ev.currentTarget.value,
                })}
            />

            <input
              class="input"
              type="date"
              value={e.date}
              onclick={openPicker}
              onchange={(ev) =>
                plannerApi.updateEvent(e.id, {
                  date: ev.currentTarget.value,
                })}
            />

            <NumberInput
              class="w-28"
              value={e.amount}
              min={0}
              onchange={(v) => plannerApi.updateEvent(e.id, { amount: v })}
            />

            <select
              class="input"
              value={e.kind ?? "tradable"}
              onchange={(ev) =>
                plannerApi.updateEvent(e.id, {
                  kind: ev.currentTarget.value as "tradable" | "bound",
                })}
            >
              <option value="tradable">Tradable</option>
              <option value="bound">Bound</option>
            </select>

            <button
              class="btn-secondary whitespace-nowrap"
              title="Add another occurrence of this event one week later"
              onclick={() => plannerApi.duplicateEventNextWeek(e.id)}
            >
              +1w
            </button>

            <button
              class="btn-danger-solid justify-self-end"
              onclick={() => plannerApi.removeEvent(e.id)}
            >
              Delete
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- GOLD LOG -->
  <div class="card p-5">
    <div class="flex justify-between items-center mb-3">
      <h2 class="text-sm font-semibold text-[#a29e96] uppercase">
        Gold Log
      </h2>
      {#if ($planner.goldLog ?? []).length > 0}
        <button
          class="btn text-xs px-2 py-1"
          onclick={() => {
            if (confirm("Clear the entire gold log? Balances are kept.")) {
              plannerApi.clearGoldLog();
            }
          }}
        >
          Clear Log
        </button>
      {/if}
    </div>

    {#if ($planner.goldLog ?? []).length === 0}
      <p class="text-xs text-[#a29e96]">
        No gold movements recorded yet. Every add/spend and raid clear is logged automatically.
      </p>
    {:else}
      <div class="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1">
        {#each [...$planner.goldLog!].reverse() as entry (entry.id)}
          <div
            class="flex justify-between items-center rounded-md px-3 py-2 text-sm"
            style="background: rgba(255,255,255,0.03);"
          >
            <div class="min-w-0">
              <span class={entry.amount >= 0 ? "text-green-400" : "text-red-400"}>
                {entry.amount >= 0 ? "+" : ""}{fmt(entry.amount)}g
              </span>
              <span class="text-[#a29e96] ml-2 truncate">{entry.note ?? ""}</span>
            </div>
            <div class="text-xs text-[#a29e96] whitespace-nowrap ml-3">
              {new Date(entry.timestamp).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
              · {fmt(entry.balanceAfter)}g
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>