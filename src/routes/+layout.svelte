<script>
    import "./layout.css";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { Envelope, MapPin } from "@steeze-ui/heroicons";
    import { page } from "$app/stores";
    // @ts-ignore
    import SocialIcons from "@rodneylab/svelte-social-icons";

    import ArtisanPrompt from "$lib/components/ArtisanPrompt.svelte";

    let { children } = $props();

    /** The anime app is a full-page dark section: render it chrome-free. */
    const isAnime = $derived($page.url.pathname.startsWith('/anime'));
</script>

{#if isAnime}
    {@render children()}
{:else}
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Section Navigation -->
    <nav
        class="flex flex-wrap items-center gap-1 bg-white border border-zinc-200 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-2 mb-6"
        aria-label="Primary"
    >
        <a
            href="/"
            class="px-4 py-2 rounded-xl text-sm font-semibold transition"
            class:nav-link-active={$page.url.pathname === '/'}
            class:nav-link-inactive={$page.url.pathname !== '/'}
        >Resume</a>
        <a
            href="/projects/"
            class="px-4 py-2 rounded-xl text-sm font-semibold transition"
            class:nav-link-active={$page.url.pathname.startsWith('/projects')}
            class:nav-link-inactive={!$page.url.pathname.startsWith('/projects')}
        >Projects</a>
    </nav>

    <!-- Header Section - Contact Information Only -->
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
        <div class="flex flex-col md:flex-row items-center gap-8">
            <!-- Profile Image -->
            <div class="shrink-0 relative">
                <div
                    class="absolute inset-0 rounded-full bg-white/5 blur-xl scale-110"
                ></div>
                <div
                    class="relative rounded-full p-0.5 bg-linear-to-br from-zinc-600 via-zinc-400 to-zinc-700"
                >
                    <img
                        class="w-48 h-48 rounded-full bg-zinc-950"
                        src="/avatar.png"
                        alt="David Swenson"
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
{/if}
