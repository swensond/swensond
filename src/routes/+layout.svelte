<script>
    import "./layout.css";
    import { page } from "$app/stores";
    import ArtisanPrompt from "$lib/components/ArtisanPrompt.svelte";


    let { children } = $props();

    const isAnime = $derived($page.url.pathname.startsWith('/anime'));
    const isLOAPlanner = $derived($page.url.pathname.startsWith('/loa-planner'));
    const isHome = $derived($page.url.pathname === '/');

</script>

<div class="min-h-screen flex flex-col">
    <!-- Thin top header with inline navigation and avatar -->
    <header class="border-b border-zinc-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-14">
                <nav class="flex items-center gap-1" aria-label="Primary">
                    <a
                        href="/"
                        class="px-3 py-1.5 rounded-lg text-sm font-medium transition"
                        class:nav-link-active={$page.url.pathname === '/'}
                        class:nav-link-inactive={$page.url.pathname !== '/'}
                    >Resume</a>
                    <a
                        href="/projects/"
                        class="px-3 py-1.5 rounded-lg text-sm font-medium transition"
                        class:nav-link-active={$page.url.pathname.startsWith('/projects')}
                        class:nav-link-inactive={!$page.url.pathname.startsWith('/projects')}
                    >Projects</a>
                </nav>
                <div class="flex items-center gap-3 shrink-0">
                    <a href="/" class="text-sm font-semibold text-zinc-900 hover:text-zinc-600 transition">David Swenson</a>
                    <div class="relative rounded-full p-0.5 bg-gradient-to-br from-zinc-600 via-zinc-400 to-zinc-700">
                        <img
                            class="w-10 h-10 rounded-full bg-zinc-950"
                            src="/avatar.png"
                            alt="David Swenson"
                        />
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Content -->
    <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="rounded-sm border p-8" style="background: #ffffff; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-color: rgba(0,0,0,0.06);">
            {@render children()}
        </div>
    </main>

    <!-- Global modals -->
    <ArtisanPrompt />
</div>