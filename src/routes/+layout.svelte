<script>
    import "./layout.css";
    import { page } from "$app/stores";

    let { children } = $props();

    const links = [
        { href: "/", label: "Resume" },
        { href: "/projects/", label: "Projects" },
    ];
</script>

<header class="print:hidden">
    <nav class="mx-auto flex max-w-[44rem] items-center justify-between px-4 py-6 sm:px-6" aria-label="Primary">
        <a href="/" class="font-serif text-lg font-semibold">David Swenson</a>
        <div class="flex gap-6 text-[0.95rem]">
            {#each links as link}
                <a
                    href={link.href}
                    class="nav-link"
                    aria-current={$page.url.pathname === link.href ? "page" : undefined}
                >{link.label}</a>
            {/each}
        </div>
    </nav>
</header>

<main class="mx-auto max-w-[44rem] px-4 pt-6 pb-24 sm:px-6 sm:pt-10 print:max-w-none print:p-0">
    {@render children()}
</main>
