<script lang="ts">
    import { plannerApi } from "$lib/api/planner";
    import NumberInput from "$lib/components/NumberInput.svelte";
    import { planner } from "$lib/stores/planner";
    
    // Get materials that have been added to the planner
    const materials = $derived($planner.materials);
    
    function calculateTotalAvailable(material) {
        return material.owned + (material.boxes?.reduce((sum, box) => sum + (box.owned * box.size), 0) || 0);
    }
    
    // Function to add a new box type for a specific material
    function addBoxType(materialId: string) {
        plannerApi.updateMaterial(materialId, {
            boxes: [
                ...(($planner.materials.find(m => m.id === materialId)?.boxes || [])),
                {
                    label: "New Bag",
                    size: 1,
                    owned: 0
                }
            ]
        });
    }
    
    // Function to remove a box type from a specific material
    function removeBoxType(materialId: string, index: number) {
        const material = $planner.materials.find(m => m.id === materialId);
        if (!material || !material.boxes) return;
        
        const newBoxes = [...material.boxes];
        newBoxes.splice(index, 1);
        
        plannerApi.updateMaterial(materialId, {
            boxes: newBoxes
        });
    }
    
    // Function to update box details
    function updateBoxDetail(materialId: string, index: number, field: string, value: any) {
        const material = $planner.materials.find(m => m.id === materialId);
        if (!material || !material.boxes) return;
        
        plannerApi.updateMaterial(materialId, {
            boxes: material.boxes.map((box, i) => 
                i === index ? { ...box, [field]: value } : box
            )
        });
    }
</script>

<div class="space-y-6">
    <div class="bg-white border border-zinc-100 rounded-xl p-4">
        <h2 class="text-lg font-semibold text-zinc-900 mb-3">Owned Materials Management</h2>
        <p class="text-sm text-zinc-600 mb-4">
            Manage your owned materials. Define multiple bags and track how many you own.
            This helps calculate actual material amounts from bagged inventory.
        </p>
        
        <div class="space-y-6">
            {#each materials as material (material.id)}
                <div class="border border-zinc-200 rounded-lg p-4">
                    <div class="flex items-center gap-3 mb-4">
                        <img
                            src={material.icon}
                            class="w-8 h-8"
                            alt={material.name}
                        />
                        <span class="font-medium text-xl">{material.name}</span>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <!-- Base Owned Section -->
                        <div class="border border-zinc-200 rounded-lg p-4 lg:col-span-1">
                            <h3 class="text-md font-medium text-zinc-900 mb-3">Base Owned</h3>
                            <div class="flex items-center gap-3">
                                <NumberInput
                                    id={`base-owned-${material.id}`}
                                    value={material.owned}
                                    onchange={(v) =>
                                        plannerApi.updateMaterial(material.id, {
                                            owned: v,
                                        })}
                                    class="w-full max-w-xs"
                                />
                            </div>
                        </div>
                        
                        <!-- Bags Section -->
                        <div class="border border-zinc-200 rounded-lg p-4 lg:col-span-3">
                            <div class="flex justify-between items-center mb-3">
                                <h3 class="text-md font-medium text-zinc-900">Bags</h3>
                                <button
                                    onclick={() => addBoxType(material.id)}
                                    class="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Bag
                                </button>
                            </div>
                            
                            {#if material.boxes?.length}
                                <div class="space-y-3">
                                    {#each material.boxes as box, index}
                                        <div class="flex flex-wrap items-center gap-3 p-3 bg-zinc-50 rounded-lg">
                                            <div class="flex-1 min-w-[120px]">
                                                <label class="block text-xs font-medium text-zinc-500 mb-1">Label</label>
                                            <input
                                                type="text"
                                                value={box.label}
                                                oninput={(e) => updateBoxDetail(material.id, index, 'label', (e.target as HTMLInputElement).value)}
                                                class="w-full border border-zinc-300 rounded px-2 py-1 text-sm"
                                            />
                                            </div>
                                            
                                            <div class="flex-1 min-w-[80px]">
                                                <label class="block text-xs font-medium text-zinc-500 mb-1">Size</label>
                                                <NumberInput
                                                    value={box.size}
                                                    onchange={(v) => updateBoxDetail(material.id, index, 'size', v)}
                                                    class="w-full"
                                                />
                                            </div>
                                            
                                            <div class="flex-1 min-w-[80px]">
                                                <label class="block text-xs font-medium text-zinc-500 mb-1">Owned</label>
                                                <NumberInput
                                                    value={box.owned}
                                                    onchange={(v) => updateBoxDetail(material.id, index, 'owned', v)}
                                                    class="w-full"
                                                />
                                            </div>
                                            
                                            <button
                                                onclick={() => removeBoxType(material.id, index)}
                                                class="text-red-500 hover:text-red-700 p-1"
                                                title="Remove bag"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    {/each}
                                </div>
                            {:else}
                                <p class="text-sm text-zinc-500 italic">No bags defined</p>
                            {/if}
                        </div>
                    </div>
                    
                    <!-- Total Available -->
                    <div class="mt-4 pt-3 border-t border-zinc-200">
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-zinc-700">Total Owned:</span>
                            <span class="font-semibold text-lg">{calculateTotalAvailable(material).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
    
    <div class="bg-white border border-zinc-100 rounded-xl p-4">
        <h3 class="text-md font-semibold text-zinc-900 mb-2">Quick Actions</h3>
        <div class="flex flex-wrap gap-3">
            <button
                class="btn-secondary"
                onclick={() => {
                    $planner.materials.forEach(material => {
                        plannerApi.updateMaterial(material.id, {
                            owned: 0,
                            boxes: undefined,
                        });
                    });
                }}
            >
                Reset All Owned
            </button>
        </div>
    </div>
</div>
