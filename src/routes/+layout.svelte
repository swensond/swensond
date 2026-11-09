<script>
    import "./layout.css";
    import { page } from "$app/stores";

    let { children } = $props();

    const links = [
        { href: "/", label: "Resume" },
        { href: "/projects/", label: "Projects" },
    ];
</script>

<div class="mx-auto flex max-w-[84rem] flex-col gap-4 px-4 pb-10 sm:px-8 lg:px-12 print:max-w-none print:gap-0 print:p-0">
    <header class="print:hidden">
        <nav class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-5 pb-1" aria-label="Primary">
            <!-- The resume page already leads with the name as its h1, so the wordmark would only repeat it. -->
            {#if $page.url.pathname !== "/"}
                <a href="/" class="display py-2.5 text-lg font-semibold">David Swenson</a>
            {/if}
            <div class="ml-auto flex flex-wrap items-center gap-2 text-[0.9375rem] font-medium">
                {#each links as link}
                    {@const current = $page.url.pathname === link.href}
                    <a
                        href={link.href}
                        class="flex min-h-11 items-center rounded-md px-[1.125rem] {current ? 'bg-ink text-paper hover:text-paper' : ''}"
                        aria-current={current ? "page" : undefined}
                    >{link.label}</a>
                {/each}
            </div>
        </nav>
    </header>

    <main class="flex flex-col gap-4 print:block">
        {@render children()}
    </main>
</div>
