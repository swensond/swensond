<script>
    import "./layout.css";
    import { page } from "$app/stores";

    let { children } = $props();

    const links = [
        { href: "/", label: "resume" },
        { href: "/projects/", label: "projects" },
    ];
</script>

<header class="print:hidden">
    <nav class="mx-auto flex max-w-[80rem] items-center justify-between px-4 py-6 font-mono text-sm sm:px-8 lg:px-20" aria-label="Primary">
        <a href="/">~/swensond</a>
        <div class="flex gap-6 sm:gap-10">
            {#each links as link}
                {@const current = $page.url.pathname === link.href}
                <a
                    href={link.href}
                    class="flex items-center gap-2 {current ? 'text-ink' : 'text-muted'}"
                    aria-current={current ? "page" : undefined}
                >{#if current}<span class="size-2 rounded-[2px] bg-accent"></span>{/if}{link.label}</a>
            {/each}
        </div>
    </nav>
</header>

<main class="mx-auto max-w-[80rem] px-4 pb-24 sm:px-8 lg:px-20 print:max-w-none print:p-0">
    {@render children()}
</main>
