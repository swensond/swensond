<script>
    import "./layout.css";

    let { children } = $props();

    const navLinks = [{ href: "/loa-planner/", label: "LOA Planner" }];

    import { page } from "$app/stores";
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Header -->
    <header
        class="bg-white border border-zinc-200 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-8 pb-0 mb-6 overflow-hidden"
    >
        <div class="flex flex-col md:flex-row items-center gap-8">
            <div class="shrink-0 relative">
                <div
                    class="absolute inset-0 rounded-full bg-white/10 blur-xl scale-110"
                ></div>
                <div
                    class="relative rounded-full p-0.5 bg-linear-to-br from-zinc-200 via-zinc-100 to-zinc-300"
                >
                    <div
                        class="w-48 h-48 rounded-full overflow-hidden flex items-center justify-center"
                    >
                        <img
                            class="h-full w-auto object-contain scale-110 translate-y-[20%]"
                            src="/avatar.png"
                            alt="nexhunter"
                        />
                    </div>
                </div>
            </div>
            <div class="flex-1 text-center md:text-left">
                <h1 class="text-4xl font-bold mb-2">
                    Nex<span class="text-slate-500">hunter</span>
                </h1>
            </div>
        </div>

        <!-- Nav -->
        <nav class="mt-6 -mx-8 border-t border-zinc-100">
            <ul class="flex h-12 gap-1 px-8 -mx-8">
                {#each navLinks as link}
                    <li class="h-full flex">
                        <a
                            href={link.href}
                            class="h-full flex items-center px-4 text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition border-x border-transparent hover:border-zinc-200 aria-[current=page]:bg-zinc-100 aria-[current=page]:border-zinc-200 aria-[current=page]:text-zinc-900"
                            aria-current={$page.url.pathname === link.href
                                ? "page"
                                : undefined}
                        >
                            {link.label}
                        </a>
                    </li>
                {/each}
            </ul>
        </nav>
    </header>

    <!-- Content -->
    <main
        class="bg-white border border-zinc-200 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-8"
    >
        {@render children()}
    </main>
</div>
