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

<header class="flex items-start gap-5">
    <img
        src="/avatar.png"
        alt=""
        width="72"
        height="72"
        class="mt-1 size-16 shrink-0 rounded-full border border-line bg-white sm:size-[72px] print:hidden"
    />
    <div>
        <h1 class="font-serif text-4xl font-semibold tracking-tight sm:text-5xl print:text-[24pt]">David Swenson</h1>
        <p class="mt-1 text-lg text-muted">Senior Software Engineer in Boston, MA</p>
        <ul class="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem] print:mt-1">
            {#if contact}
                <li class="hidden print:block"><a class="link" href="mailto:{contact.email}">{contact.email}</a></li>
                <li class="hidden print:block">{contact.phone}</li>
            {/if}
            <li><a class="link" href="https://www.linkedin.com/in/swensond/" target="_blank" rel="noopener">linkedin.com/in/swensond</a></li>
            <li><a class="link" href="https://github.com/swensond" target="_blank" rel="noopener">github.com/swensond</a></li>
            <li class="print:hidden"><button type="button" class="link cursor-pointer" onclick={() => window.print()}>Save as PDF</button></li>
        </ul>
    </div>
</header>

<p class="mt-10 text-lg leading-relaxed text-ink-soft print:mt-4 print:text-base print:leading-normal">
    Senior software engineer with 10+ years of experience designing and building cloud-native
    applications for healthcare, SaaS, and nonprofit organizations. Hands-on across the stack in
    TypeScript, Python, Java, and C#, with deep experience in serverless and microservice
    architectures on AWS. Takes systems from design to production, with a record of leading cloud
    migrations, modernizing legacy platforms, building CI/CD pipelines, and mentoring engineers.
    Seasoned remote engineer who has led team-wide adoption of AI-assisted development.
</p>

<section class="mt-16 print:mt-6" aria-labelledby="experience">
    <h2 id="experience" class="section-title">Experience</h2>
    <ol class="mt-8 space-y-12 print:mt-3 print:space-y-4">
        {#each experience as job}
            <li>
                <div class="keep-with-next flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 class="font-serif text-xl font-semibold print:text-[12pt]">{job.company}</h3>
                    <span class="text-[0.95rem] text-muted">{job.location}</span>
                </div>
                <ol class="timeline mt-4 print:mt-1">
                    {#each job.roles as role}
                        <li class="role" class:current={role.dates.endsWith("Present")}>
                            <div class="keep-with-next flex flex-wrap items-baseline justify-between gap-x-4">
                                <h4 class="font-semibold">{role.title}</h4>
                                <span class="text-[0.95rem] whitespace-nowrap text-muted tabular-nums">{role.dates}</span>
                            </div>
                            <ul class="mt-2 list-disc space-y-1.5 pl-5 text-ink-soft marker:text-muted print:mt-1 print:space-y-0.5">
                                {#each role.bullets as bullet}
                                    <li>{bullet}</li>
                                {/each}
                            </ul>
                        </li>
                    {/each}
                </ol>
            </li>
        {/each}
    </ol>
</section>

<section class="mt-16 print:mt-6" aria-labelledby="skills">
    <h2 id="skills" class="section-title">Skills</h2>
    <dl class="mt-6 grid gap-x-8 sm:grid-cols-[10rem_1fr] sm:gap-y-3 print:mt-3 print:grid-cols-[9rem_1fr] print:gap-y-1">
        {#each skills as group}
            <dt class="font-semibold">{group.category}</dt>
            <dd class="mb-3 text-ink-soft sm:mb-0 print:mb-0">{group.items.join(", ")}</dd>
        {/each}
    </dl>
</section>

<section class="mt-16 print:mt-6" aria-labelledby="education">
    <h2 id="education" class="section-title">Education</h2>
    <div class="mt-6 flex flex-wrap items-baseline justify-between gap-x-4 print:mt-3">
        <h3 class="font-serif text-xl font-semibold print:text-[12pt]">Wentworth Institute of Technology</h3>
        <span class="text-[0.95rem] text-muted tabular-nums">2011 – 2015</span>
    </div>
    <p class="mt-1 text-ink-soft">B.S. Computer Networking, Boston, MA</p>
</section>
