<script lang="ts">
    import { onMount } from "svelte";

    const experience = [
        {
            company: "Global Unity Impact",
            location: "Remote",
            roles: [
                {
                    title: "Senior Software Engineer",
                    dates: "Mar 2023 – Present",
                    bullets: [
                        "Own the architecture and development of a full-stack platform supporting nonprofit operations, built on React, TypeScript, Bun, Hono, and MongoDB.",
                        "Designed the platform's REST API layer in TypeScript with Hono, establishing type-safe, maintainable patterns for backend services.",
                        "Own the MongoDB data layer end to end, from schema design and indexing strategy to query performance and operational reliability.",
                        "Led adoption of AI-assisted development across the team, integrating a range of coding assistants and LLMs into daily workflows to speed up delivery and strengthen code review.",
                    ],
                },
            ],
        },
        {
            company: "Evive Health",
            location: "Remote",
            roles: [
                {
                    title: "Senior Software Engineer",
                    dates: "Jan 2022 – Mar 2023",
                    bullets: [
                        "Designed and deployed a cross-service auditing layer that enforced data integrity across the microservice platform and became a core reliability safeguard.",
                        "Engineered an automated messaging system that replaced manual communication workflows, removing a bottleneck as the platform scaled.",
                        "Led development of a demo sales site for myevive.com to prototype product direction, shaping UX decisions for the core product.",
                        "Built and maintained production microservices and web applications across Python, Java, C#, and TypeScript on AWS and PostgreSQL.",
                    ],
                },
                {
                    title: "Software Engineer II",
                    dates: "Jul 2021 – Jan 2022",
                    bullets: [
                        "Designed and built an external authentication service that lets partners generate access tokens and call APIs on behalf of end users, enabling partner integrations.",
                        "Migrated internal authentication to Auth0, strengthening security and improving scalability.",
                        "Mentored an intern from onboarding through production launch, guiding the design and build of a serverless medical code mapping API.",
                        "Cut CI/CD build times by introducing ephemeral GoCD agents, speeding up automated testing and deployment.",
                    ],
                },
                {
                    title: "Software Engineer",
                    dates: "Aug 2019 – Jun 2021",
                    bullets: [
                        "Launched Evive Care in response to COVID-19: a real-time search tool for state and county testing sites, used by thousands of employees.",
                        "Led the migration of internal tooling from Rackspace to AWS, improving infrastructure management and performance.",
                        "Established infrastructure as code with AWS CloudFormation, standardizing and automating environment provisioning.",
                        "Architected serverless services on AWS Lambda, improving scalability while reducing operational overhead and infrastructure cost.",
                        "Built the CI/CD foundation for the engineering team by integrating GoCD into the development pipeline.",
                        "Championed TypeScript for backend development, improving type safety and long-term maintainability.",
                        "Drove company-wide adoption of an accessible frontend framework, raising WCAG compliance across the product.",
                    ],
                },
            ],
        },
        {
            company: "WiserTogether",
            location: "Boston, MA",
            roles: [
                {
                    title: "Software Engineer",
                    dates: "Apr 2018 – Jul 2019",
                    bullets: [
                        "Built and owned the Cordova-based iOS and Android app for mywiserhealth.com, maintaining feature parity across platforms.",
                        "Migrated analytics from Adobe to self-hosted Matomo, bringing user data in-house for stronger privacy and control.",
                    ],
                },
                {
                    title: "Junior Software Engineer",
                    dates: "Dec 2015 – Mar 2018",
                    bullets: [
                        "Designed and implemented a public-facing API with an emphasis on security, scalability, and clear developer documentation.",
                        "Containerized backend services and migrated infrastructure from OpenShift to Apache Aurora.",
                        "Introduced TypeScript to the frontend codebase and moved CI from Travis CI to Jenkins.",
                    ],
                },
            ],
        },
        {
            company: "Continuum Managed Services",
            location: "Boston, MA",
            roles: [
                {
                    title: "Software Engineering Intern",
                    dates: "Jan 2014 – Dec 2014",
                    bullets: [
                        "Shipped features for the Continuum Cloud Console (C3) and Sync247 in PHP and JavaScript, including integrations with additional cloud providers.",
                        "Helped fellow interns get up to speed on RESTful API development.",
                    ],
                },
            ],
        },
    ];

    const skills = [
        { category: "Languages", items: ["TypeScript", "JavaScript", "Python", "Java", "C#", "PHP", "SQL"] },
        { category: "Frontend", items: ["React", "Svelte", "Tailwind CSS", "HTML", "CSS", "Accessibility (WCAG)"] },
        { category: "Backend", items: ["Node.js", "Bun", "Hono", "REST APIs", "Microservices", "Serverless", "Auth0"] },
        { category: "Data", items: ["MongoDB", "PostgreSQL", "MySQL", "DynamoDB", "Cloudflare Workers KV", "Redis", "Memcached"] },
        { category: "Cloud & DevOps", items: ["AWS", "Lambda", "ECS", "CloudFormation", "Cloudflare Workers", "Docker", "GitHub Actions", "GoCD", "Jenkins", "Travis CI"] },
        { category: "Testing", items: ["Vitest", "Jest", "Pytest"] },
        { category: "AI tooling", items: ["AI coding assistants", "LLM workflows", "Local LLMs"] },
    ];

    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const toMonths = (d: string) => {
        if (d === "Present") {
            const now = new Date();
            return now.getFullYear() * 12 + now.getMonth();
        }
        const [mon, year] = d.split(" ");
        return Number(year) * 12 + MONTHS.indexOf(mon);
    };
    function tenure(dates: string) {
        const [start, end] = dates.split(" – ");
        const total = toMonths(end) - toMonths(start);
        const y = Math.floor(total / 12);
        const m = total % 12;
        return [y && `${y}y`, m && `${m}m`].filter(Boolean).join(" ");
    }

    const roles = experience.flatMap((job) =>
        job.roles.map((role) => ({
            ...role,
            company: job.company,
            location: job.location,
            year: role.dates.match(/\d{4}/)?.[0],
            current: role.dates.endsWith("Present"),
            tenure: tenure(role.dates),
        })),
    );

    const description =
        "David Swenson is a Boston-based senior software engineer with 10+ years of experience building cloud-native applications, backend services, and CI/CD pipelines on AWS.";

    // Email and phone go on the printed resume only. They are stored as shifted
    // char codes so neither the served HTML nor the JS bundle contains a harvestable
    // string; they are decoded client-side into elements that only print shows.
    const decode = (codes: number[]) => String.fromCharCode(...codes.map((c) => c - 3));
    const EMAIL = [103, 100, 121, 108, 103, 67, 118, 122, 104, 113, 118, 114, 113, 103, 49, 102, 114, 112];
    const PHONE = [43, 56, 51, 59, 44, 35, 56, 58, 60, 48, 57, 60, 59, 51];
    let contact = $state<{ email: string; phone: string } | null>(null);

    // Browsers name the saved PDF after document.title, so swap in a submittable filename.
    let pageTitle = "";
    function beforePrint() {
        pageTitle = document.title;
        document.title = "David Swenson Resume";
    }
    function afterPrint() {
        document.title = pageTitle;
    }

    onMount(() => {
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

<header class="border-t-[3px] border-ink pt-10 sm:pt-14 print:border-0 print:pt-0">
    <h1 class="text-[clamp(3.25rem,11.5vw,9.125rem)] leading-[0.88] font-bold tracking-[-0.06em] print:text-[24pt] print:tracking-tight">David Swenson</h1>
    <div class="mt-10 grid gap-8 sm:mt-14 lg:grid-cols-12 lg:gap-6 print:mt-1 print:block">
        <div class="flex flex-col gap-4 lg:col-span-3 print:gap-1">
            <img
                src="/avatar.png"
                alt=""
                width="80"
                height="80"
                class="size-16 rounded-[18px] bg-ink sm:size-20 print:hidden"
            />
            <p class="text-lg leading-snug font-semibold print:text-base">
                Senior Software Engineer<br />
                <span class="font-mono text-sm font-normal text-muted">Boston, MA · 10+ yrs</span>
            </p>
            <ul class="flex flex-col gap-2 print:flex-row print:flex-wrap print:gap-x-5">
                {#if contact}
                    <li class="hidden print:block"><a href="mailto:{contact.email}">{contact.email}</a></li>
                    <li class="hidden print:block">{contact.phone}</li>
                {/if}
                <li><a class="link-button" href="https://www.linkedin.com/in/swensond/" target="_blank" rel="noopener">linkedin/swensond <span class="text-accent print:hidden" aria-hidden="true">↗</span></a></li>
                <li><a class="link-button" href="https://github.com/swensond" target="_blank" rel="noopener">github/swensond <span class="text-accent print:hidden" aria-hidden="true">↗</span></a></li>
                <li class="print:hidden">
                    <button type="button" class="link-button w-full cursor-pointer border-0 bg-accent text-paper" onclick={() => window.print()}>save-as.pdf <span aria-hidden="true">↓</span></button>
                </li>
            </ul>
        </div>
        <p class="text-2xl leading-tight tracking-[-0.02em] sm:text-[2rem] sm:leading-[1.25] lg:col-span-9 print:mt-4 print:text-base print:leading-normal print:tracking-normal">
            Ten-plus years designing and building cloud-native applications for healthcare, SaaS, and
            nonprofit organizations. I take systems from design to production — <span class="text-accent">cloud migrations,
            legacy modernization, CI/CD pipelines</span> — and mentor the engineers around me.
        </p>
    </div>
</header>

<section class="mt-20 sm:mt-28 print:mt-6" aria-labelledby="experience">
    <div class="section-head keep-with-next">
        <h2 id="experience" class="section-title">Experience</h2>
        <span class="section-count">01 / 03</span>
    </div>
    <ol>
        {#each roles as role}
            <li class="grid gap-4 border-b border-line py-8 sm:py-9 lg:grid-cols-12 lg:gap-6 print:block print:border-0 print:py-2">
                <span class="text-5xl leading-[0.85] font-bold tracking-[-0.05em] tabular-nums lg:col-span-2 lg:text-6xl print:hidden {role.current ? 'text-accent' : ''}">{role.year}</span>
                <div class="keep-with-next flex flex-col gap-2 lg:col-span-3 print:flex-row print:flex-wrap print:items-baseline print:gap-x-3 print:gap-y-0">
                    <h3 class="text-xl leading-tight font-semibold tracking-[-0.01em] print:text-[11pt]">{role.title}</h3>
                    <span>{role.company}</span>
                    <span class="font-mono text-xs text-muted print:ml-auto print:font-sans print:text-[inherit]">{role.dates}</span>
                    <span class="self-start rounded-md bg-surface px-2 py-0.5 font-mono text-xs text-ink-soft print:hidden">{role.tenure} · {role.location}</span>
                </div>
                <ul class="flex list-disc flex-col gap-2 pl-[18px] text-[0.9375rem] leading-relaxed text-ink-soft marker:text-muted lg:col-span-7 print:mt-1 print:gap-0.5 print:leading-snug">
                    {#each role.bullets as bullet}
                        <li>{bullet}</li>
                    {/each}
                </ul>
            </li>
        {/each}
    </ol>
</section>

<section class="mt-20 sm:mt-24 print:mt-6" aria-labelledby="skills">
    <div class="section-head keep-with-next">
        <h2 id="skills" class="section-title">Stack</h2>
        <span class="section-count">02 / 03</span>
    </div>
    <dl>
        {#each skills as group}
            <div class="grid gap-3 border-b border-line py-4 lg:grid-cols-12 lg:items-center lg:gap-6 print:grid-cols-[9rem_1fr] print:gap-x-4 print:border-0 print:py-0.5">
                <dt class="font-mono text-[0.8125rem] text-muted lg:col-span-3 print:font-sans print:font-semibold print:text-ink">{group.category}</dt>
                <dd class="flex flex-wrap gap-2 lg:col-span-9 print:block">
                    {#each group.items as item, i}
                        <span class="chip">{item}</span><span class="hidden print:inline">{i < group.items.length - 1 ? ", " : ""}</span>
                    {/each}
                </dd>
            </div>
        {/each}
    </dl>
</section>

<section class="mt-20 sm:mt-24 print:mt-6" aria-labelledby="education">
    <div class="section-head keep-with-next">
        <h2 id="education" class="section-title">Education</h2>
        <span class="section-count">03 / 03</span>
    </div>
    <div class="grid gap-4 py-9 lg:grid-cols-12 lg:gap-6 print:py-2">
        <span class="text-5xl leading-[0.85] font-bold tracking-[-0.05em] text-[#5e5c57] lg:col-span-2 lg:text-6xl print:hidden">2011</span>
        <div class="lg:col-span-10">
            <h3 class="text-xl font-semibold print:text-[11pt]">Wentworth Institute of Technology</h3>
            <p class="mt-1.5 text-muted">B.S. Computer Networking · 2011 – 2015 · Boston, MA</p>
        </div>
    </div>
</section>
