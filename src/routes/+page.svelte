<script lang="ts">
  import { education, roles, skills } from '$lib/content/career';
  import { projects } from '$lib/content/projects';
  import ProjectPanel from '$lib/project-panel.svelte';

  const description =
    'David Swenson is a Boston-based senior software engineer with 10+ years of experience building cloud-native applications, backend services, and CI/CD pipelines on AWS.';

  // Email and phone go on the printed resume only. They are stored as shifted
  // char codes so neither the served HTML nor the JS bundle contains a harvestable
  // string; they are decoded client-side into elements that only print shows.
  const decode = (codes: number[]) => String.fromCharCode(...codes.map((code) => code - 3));
  const EMAIL = [103, 100, 121, 108, 103, 67, 118, 122, 104, 113, 118, 114, 113, 103, 49, 102, 114, 112];
  const PHONE = [43, 56, 51, 59, 44, 35, 56, 58, 60, 48, 57, 60, 59, 51];
  let contact = $state<{ email: string; phone: string } | null>(null);

  // One role open at a time, the newest first. Clicking the open role closes it.
  // Print ignores this and shows every role, because the page is the submittable resume.
  let open = $state(0);

  // Browsers name the saved PDF after document.title, so swap in a submittable filename.
  let pageTitle = '';
  function beforePrint() {
    pageTitle = document.title;
    document.title = 'David Swenson Resume';
  }
  function afterPrint() {
    document.title = pageTitle;
  }

  $effect(() => {
    contact = { email: decode(EMAIL), phone: decode(PHONE) };
  });
</script>

<svelte:window onbeforeprint={beforePrint} onafterprint={afterPrint} />

<svelte:head>
    <title>David Swenson | Senior Software Engineer</title>
    <meta name="description" content={description} />
    <meta property="og:title" content="David Swenson | Senior Software Engineer" />
    <meta property="og:description" content={description} />
</svelte:head>

<header class="card flex flex-wrap items-end gap-x-12 gap-y-7 p-[clamp(1.5rem,3vw,2.75rem)] print:block print:p-0">
    <div class="flex min-w-0 flex-[3_1_35rem] flex-col gap-6 print:gap-1">
        <div class="flex flex-wrap items-center gap-4">
            <img
                src="/avatar.png"
                alt=""
                width="72"
                height="72"
                class="size-[4.5rem] rounded-[20px] bg-accent print:hidden"
            />
            <p class="text-[0.9375rem] leading-normal text-ink-soft print:text-base print:text-ink">
                Senior Software Engineer<br />
                Boston, MA · 10+ years
            </p>
        </div>
        <h1 class="display text-[clamp(2.75rem,6.2vw,5.75rem)] leading-[0.95] font-bold tracking-[-0.04em] print:text-[24pt] print:tracking-tight">David Swenson</h1>
    </div>
    <div class="flex min-w-0 flex-[1_1_22.5rem] flex-col gap-5 print:mt-3 print:gap-1">
        <p class="max-w-[45rem] text-[clamp(1.0625rem,1.35vw,1.1875rem)] leading-normal text-pretty text-ink-soft print:text-base print:text-ink">
            Ten-plus years designing and building cloud-native applications for healthcare, SaaS, and
            nonprofit organizations. I own systems from architecture to production — <span class="text-accent">cloud migrations,
            legacy modernization, CI/CD pipelines</span> — and mentor the engineers around me.
        </p>
        <ul class="flex flex-wrap gap-2 print:gap-x-5">
            {#if contact}
                <li class="hidden print:block"><a href="mailto:{contact.email}">{contact.email}</a></li>
                <li class="hidden print:block">{contact.phone}</li>
            {/if}
            <li><a class="pill-link" href="https://www.linkedin.com/in/swensond/" target="_blank" rel="noopener">LinkedIn</a></li>
            <li><a class="pill-link" href="https://github.com/swensond" target="_blank" rel="noopener">GitHub</a></li>
            <li class="print:hidden">
                <button type="button" class="pill-link cursor-pointer border-accent bg-accent font-semibold text-paper" onclick={() => window.print()}>Save as PDF</button>
            </li>
        </ul>
    </div>
</header>

<div class="flex flex-wrap gap-4 print:block">
    <section class="card flex min-w-0 flex-[2_1_35rem] flex-col p-3 print:mt-6" aria-labelledby="experience">
        <div class="section-head keep-with-next flex items-baseline justify-between gap-4 px-5 pt-5 pb-[1.125rem] print:px-0 print:pt-0">
            <h2 id="experience" class="display text-[1.75rem] leading-none font-semibold tracking-[-0.02em]">Experience</h2>
            <span class="text-sm text-muted print:hidden">2014 – Present</span>
        </div>
        <ol>
            {#each roles as role, i}
                {@const isOpen = open === i}
                <li class="border-t border-line print:border-0 print:py-1.5">
                    <h3>
                        <button
                            type="button"
                            class="flex min-h-16 w-full cursor-pointer items-center gap-4 px-5 py-3 text-left {isOpen ? '' : 'hover:bg-paper/40'} print:min-h-0 print:p-0 print:hover:bg-transparent"
                            aria-expanded={isOpen}
                            aria-controls="role-{i}"
                            onclick={() => (open = isOpen ? -1 : i)}
                        >
                            <span class="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-4 gap-y-0.5 print:gap-x-3">
                                <span class="w-40 shrink-0 text-sm font-normal text-muted tabular-nums print:order-last print:ml-auto print:w-auto print:text-[inherit]">{role.dates}</span>
                                <span class="flex min-w-[13.75rem] flex-1 flex-wrap items-baseline gap-x-3 print:flex-none">
                                    <span class="font-semibold print:text-[11pt]">{role.title}</span>
                                    <span class="text-[0.9375rem] font-normal text-muted print:text-[inherit]">{role.company} · {role.location}</span>
                                </span>
                            </span>
                            <span class="display w-7 shrink-0 text-center text-2xl leading-none print:hidden" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                        </button>
                    </h3>
                    <!-- Animates 0fr to 1fr so the height follows the content. The inner box turns
                         invisible once closed, which also takes it out of the accessibility tree.
                         Print forces every role open. -->
                    <div
                        id="role-{i}"
                        class="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none print:grid-rows-[1fr] {isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}"
                    >
                        <div class="min-h-0 overflow-hidden transition-[visibility] duration-300 motion-reduce:transition-none print:visible {isOpen ? 'visible' : 'invisible'}">
                            <ul class="flex list-disc flex-col gap-2 pr-16 pb-5 pl-[clamp(2.5rem,14vw,13.375rem)] text-[0.9375rem] leading-relaxed text-ink-soft marker:text-muted print:gap-0.5 print:p-0 print:pl-5 print:leading-snug">
                                {#each role.bullets as bullet}
                                    <li class="text-pretty">{bullet}</li>
                                {/each}
                            </ul>
                        </div>
                    </div>
                </li>
            {/each}
        </ol>
        <div class="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 border-t border-line px-5 pt-5 pb-3 print:border-0 print:p-0 print:pt-1.5">
            <span class="w-40 shrink-0 text-sm text-muted tabular-nums print:order-last print:ml-auto print:w-auto print:text-[inherit]">{education.dates}</span>
            <span class="flex min-w-[13.75rem] flex-1 flex-wrap items-baseline gap-x-3 print:flex-none">
                <span class="font-semibold print:text-[11pt]">{education.degree}</span>
                <span class="text-[0.9375rem] text-muted print:text-[inherit]">{education.school} · {education.location}</span>
            </span>
        </div>
    </section>

    <section class="card flex min-w-0 flex-[1_1_20rem] flex-col gap-5 p-8 print:mt-6 print:gap-0 print:p-0" aria-labelledby="skills">
        <h2 id="skills" class="section-head keep-with-next display text-[1.75rem] leading-none font-semibold tracking-[-0.02em] print:pb-0.5 print:text-[14pt]">Stack</h2>
        <dl class="flex flex-col gap-5 print:gap-0">
            {#each skills as group}
                <div class="flex flex-col gap-2 print:grid print:grid-cols-[9rem_1fr] print:gap-x-4 print:py-0.5">
                    <dt class="text-[0.8125rem] font-semibold tracking-[0.06em] text-muted uppercase print:text-[inherit] print:tracking-normal print:text-ink print:normal-case">{group.category}</dt>
                    <dd class="flex flex-wrap gap-1.5 print:block">
                        {#each group.items as item, i}
                            <span class="chip">{item}</span><span class="hidden print:inline">{i < group.items.length - 1 ? ', ' : ''}</span>
                        {/each}
                    </dd>
                </div>
            {/each}
        </dl>
    </section>
</div>

<section class="card flex flex-col gap-6 p-8 print:hidden" aria-labelledby="projects">
    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 id="projects" class="display text-[1.75rem] leading-none font-semibold tracking-[-0.02em]">Projects</h2>
        <a href="/projects/" class="flex min-h-11 items-center rounded-full bg-ink px-[1.125rem] text-[0.9375rem] font-medium text-paper hover:text-paper">All {projects.length} projects</a>
    </div>
    <ul class="grid grid-cols-[repeat(auto-fit,minmax(min(13.125rem,100%),1fr))] gap-x-4 gap-y-6">
        {#each projects as project}
            <li>
                <a href="/projects/#{project.slug}" class="flex flex-col gap-1.5">
                    <ProjectPanel {project} size="tile" />
                    <span class="display mt-1.5 text-lg font-semibold">{project.name}</span>
                    <span class="text-sm text-muted">{project.tagline}{project.wip ? ' · In progress' : ''}</span>
                </a>
            </li>
        {/each}
    </ul>
</section>

<footer class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-1 pt-2 text-sm text-muted print:hidden">
    <span>swensond.com</span>
    <span>Boston, MA</span>
</footer>
