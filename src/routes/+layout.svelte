<script>
    import "./layout.css";

    import ArtisanPrompt from "$lib/components/ArtisanPrompt.svelte";

    let { children } = $props();

    const navLinks = [
        { href: "/loa-planner/", label: "LOA Planner" },
        { href: "/anime/", label: "Anime" },
    ];

    /** Active for a section: any sub-route of href counts (root must match exactly) */
    function isActive(pathname, href) {
        const base = href.replace(/\/+$/, "");

        return base === "" ? pathname === "/" : pathname === base || pathname.startsWith(`${base}/`);
    }

    import { page } from "$app/stores";
</script>

<div class="min-h-screen flex flex-col">
    <!-- Header - full width, compact integrated bar -->
    <header
        class="sticky top-0 z-40 w-full border-b overflow-hidden"
        style="background: rgba(14, 12, 18, 0.9); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-color: rgba(255,255,255,0.12);"
    >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center gap-3 h-14">
                <!-- Logo -->
                <a href="/" class="shrink-0 flex items-center gap-3 group">
                    <img
                        class="h-24 w-auto object-contain object-top -mt-3 -mb-14 transition group-hover:brightness-110"
                        src="/avatar.png"
                        alt="nexhunter"
                    />
                    <h1 class="la-heading text-lg font-bold leading-none">
                        Nexhunter
                    </h1>
                </a>

                <!-- Nav -->
                <nav class="ml-auto self-stretch">
                    <ul class="flex h-full gap-1">
                        {#each navLinks as link}
                            <li class="h-full flex">
                                <a
                                    href={link.href}
                                    class="h-full flex items-center px-4 text-sm font-medium transition aria-[current=page]:text-[#e8c987] aria-[current=page]:bg-[rgba(208,167,90,0.07)] hover:text-[#e8c987] hover:bg-[rgba(255,255,255,0.04)] border-x border-transparent hover:border-[rgba(255,255,255,0.12)] aria-[current=page]:border-[rgba(208,167,90,0.5)]"
                                    style="color: #a29e96;"
                                    aria-current={isActive($page.url.pathname, link.href)
                                        ? "page"
                                        : undefined}
                                >
                                    {link.label}
                                </a>
                            </li>
                        {/each}
                    </ul>
                </nav>
            </div>
        </div>
    </header>

    <!-- Content - centered, max width limited -->
    <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
            class="rounded-sm border p-8"
            style="background: rgba(14, 12, 18, 0.82); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-color: rgba(255,255,255,0.12);"
        >
            {@render children()}
        </div>
    </main>

    <!-- Global modals - outside the backdrop-filtered panel so
         fixed positioning is relative to the viewport -->
    <ArtisanPrompt />
</div>
