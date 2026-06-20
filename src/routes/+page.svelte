<script>
    // Component data - excluding contact information
    let experiences = [
        {
            company: "Global Unity Impact",
            period: "March 2023 - Present",
            location: "Chicago, IL",
            title: "Senior Software Engineer",
            responsibilities: [
                "Architected and developing full-stack web applications with React, TypeScript, MongoDB, Bun, and Hono, enabling a scalable platform serving nonprofit operations.",
                "Designed and implemented RESTful APIs using TypeScript, Node.js, MongoDB, Bun, and Hono, ensuring type safety and maintainable backend services.",
                "Managed MongoDB databases for data storage and retrieval, optimizing query performance, indexing strategies, and operational reliability.",
                "Accelerated development velocity by integrating AI coding tools (Qwen, GitHub Copilot), reducing boilerplate time and improving code review quality.",
            ],
        },
        {
            company: "Evive Health LLC.",
            period: "January 2022 - March 2023",
            location: "Chicago, IL",
            title: "Senior Software Engineer",
            responsibilities: [
                "Built and maintained production microservices and web applications using Python, Java, C#, TypeScript, PostgreSQL, and AWS.",
                "Engineered an automated messaging system that eliminated manual communication bottlenecks, improving platform responsiveness at scale.",
                "Led development of a demo sales site to explore strategic product iterations for myevive.com, directly informing user experience decisions.",
                "Designed and deployed a cross-microservice auditing layer that enforced data integrity and became a critical reliability pillar across the platform.",
            ],
        },
        {
            company: "Evive Health LLC.",
            period: "July 2021 - January 2022",
            location: "Chicago, IL",
            title: "Software Engineer II",
            responsibilities: [
                "Owned cross-platform application development in Python, Java, C#, and TypeScript, spanning backend services and customer-facing interfaces.",
                "Integrated ephemeral GoCD agents into CI/CD pipelines, reducing build times and accelerating automated testing and deployment workflows.",
                "Mentored an intern from onboarding to production — guiding the full design and build of a serverless medical code mapping API that shipped to production.",
                "Built an external authentication service enabling partners to generate access tokens for API calls on behalf of end users.",
                "Migrated the internal authentication system to Auth0, strengthening security posture and improving system scalability.",
            ],
        },
        {
            company: "Evive Health LLC.",
            period: "August 2019 - June 2021",
            location: "Chicago, IL",
            title: "Software Engineer",
            responsibilities: [
                "Introduced TypeScript into backend development, improving code consistency, type safety, and long-term maintainability.",
                "Implemented AWS CloudFormation and infrastructure-as-code practices, standardizing and automating environment provisioning.",
                "Architected AWS Lambda–based serverless solutions that improved scalability while reducing operational overhead and infrastructure costs.",
                "Led the migration of internal tooling from Rackspace to AWS, improving infrastructure management and system performance.",
                "Integrated GoCD into the development pipeline, establishing robust continuous integration and deployment workflows.",
                "Drove company-wide adoption of an accessibility-compliant frontend framework, raising WCAG compliance and modernizing the user experience.",
                "Launched Evive Care in response to the COVID-19 pandemic, delivering a real-time search platform for state and county testing sites used by thousands of employees.",
            ],
        },
        {
            company: "WiserTogether Inc.",
            period: "April 2018 - July 2019",
            location: "Boston, MA",
            title: "Software Engineer",
            responsibilities: [
                "Built and maintained a Cordova-based mobile application for iOS and Android, delivering feature parity across platforms for mywiserhealth.com.",
                "Migrated analytics infrastructure from Adobe to a self-hosted Matomo instance, improving data privacy and organizational control over user analytics.",
            ],
        },
        {
            company: "WiserTogether Inc.",
            period: "December 2015 - March 2018",
            location: "Boston, MA",
            title: "Jr. Software Engineer",
            responsibilities: [
                "Developed and maintained applications using Python, PHP, Java, and TypeScript across backend services and frontend interfaces.",
                "Introduced TypeScript to the frontend codebase, improving code maintainability and enabling scalable feature development.",
                "Containerized backend services and migrated infrastructure from OpenShift to Aurora Apache, improving system performance and scalability.",
                "Transitioned the build pipeline from Travis CI to Jenkins, streamlining continuous integration and deployment workflows.",
                "Designed and implemented a public-facing API service, ensuring security, scalability, and developer-friendly documentation.",
            ],
        },
        {
            company: "Continuum Managed Services, LLC",
            period: "January 2014 - December 2014",
            location: "Boston, MA",
            title: "Software Engineer Intern",
            responsibilities: [
                "Developed and maintained Continuum Cloud Console (C3) and Sync247 platforms using PHP and JavaScript, delivering key features to production.",
                "Expanded C3 integrations with additional cloud providers, broadening platform capabilities and customer options.",
                "Supported fellow interns in mastering RESTful API development, contributing to team growth and knowledge sharing.",
            ],
        },
    ];

    let skills = {
        languages: "Python, Java, C#, TypeScript, JavaScript, PHP, SQL",
        frontend:
            "React, Tailwind CSS, HTML5, CSS3, Svelte, Accessibility Standards (WCAG)",
        backend:
            "Node.js, Bun, RESTful APIs, Auth0, Serverless Architecture, Microservices",
        databases: "MongoDB, PostgreSQL, MySQL, DynamoDB, Redis, Memcached",
        cloudDevOps:
            "AWS, CloudFormation, ECS, Lambda, Docker, CI/CD, GoCD, Jenkins, Travis CI, GitHub Actions, Rackspace",
        testing: "Vitest, Jest, Pytest",
        aiTools: "GitHub Copilot, Qwen, LM Studio",
    };

    let education = {
        institution: "Wentworth Institute of Technology",
        location: "Boston, MA",
        period: "2011 - 2015",
        degree: "Bachelor of Science in Computer Networking",
    };
</script>

<div class="resume-container">
    <!-- Summary Section -->
    <section class="mb-10">
        <h3 class="font-bold text-2xl">Summary</h3>
        <p class="tracking-tight leading-relaxed mt-4">
            Senior Software Engineer with 10+ years of experience designing
            cloud-native applications, distributed systems, and developer
            platforms. Proven record leading AWS migrations, modernizing legacy
            systems, mentoring engineers, and delivering production software
            across healthcare, SaaS, and nonprofit sectors. Expert in full-stack
            development with Python, Java, C#, TypeScript, JavaScript, Node.js,
            and React, with deep experience building scalable backend services,
            CI/CD pipelines, serverless architectures, and microservice-based
            systems.
        </p>
    </section>

    <!-- Experience Section -->
    <section class="mb-10">
        <h3 class="font-bold text-2xl">Experience</h3>
        <div class="space-y-8 mt-6">
            {#each experiences as exp}
                <div class="experience-entry space-y-2">
                    <!-- Company + Title -->
                    <div
                        class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1"
                    >
                        <div class="company-name font-medium text-white">
                            {exp.company}
                        </div>
                        <div class="job-title text-sm text-zinc-300">
                            {exp.title}
                        </div>
                    </div>

                    <!-- Location + Period -->
                    <div
                        class="flex flex-col sm:flex-row sm:justify-between gap-1"
                    >
                        <div class="text-sm text-zinc-400">
                            {exp.location}
                        </div>

                        <div class="text-sm text-zinc-400 whitespace-nowrap">
                            {exp.period}
                        </div>
                    </div>

                    <!-- responsibilities (kept zinc hierarchy) -->
                    <ul
                        class="list-disc list-outside ml-5 space-y-2 text-zinc-900"
                    >
                        {#each exp.responsibilities as responsibility}
                            <li>{responsibility}</li>
                        {/each}
                    </ul>
                </div>
            {/each}
        </div>
    </section>
    <!-- Skills Section -->
    <!-- Skills Section -->
    <section class="mb-10">
        <h3 class="font-bold text-2xl">Skills</h3>
        <div class="space-y-6 mt-4">
            <div class="skill-category">
                <div class="skill-category-title">Languages</div>
                <div class="skills-chips">
                    {#each skills.languages.split(", ") as language}
                        <span class="skill-chip">{language}</span>
                    {/each}
                </div>
            </div>

            <div class="skill-category">
                <div class="skill-category-title">Frontend</div>
                <div class="skills-chips">
                    {#each skills.frontend.split(", ") as frontend}
                        <span class="skill-chip">{frontend}</span>
                    {/each}
                </div>
            </div>

            <div class="skill-category">
                <div class="skill-category-title">Backend</div>
                <div class="skills-chips">
                    {#each skills.backend.split(", ") as backend}
                        <span class="skill-chip">{backend}</span>
                    {/each}
                </div>
            </div>

            <div class="skill-category">
                <div class="skill-category-title">Databases and Caching</div>
                <div class="skills-chips">
                    {#each skills.databases.split(", ") as database}
                        <span class="skill-chip">{database}</span>
                    {/each}
                </div>
            </div>

            <div class="skill-category">
                <div class="skill-category-title">Cloud & DevOps</div>
                <div class="skills-chips">
                    {#each skills.cloudDevOps.split(", ") as cloudDevOps}
                        <span class="skill-chip">{cloudDevOps}</span>
                    {/each}
                </div>
            </div>

            <div class="skill-category">
                <div class="skill-category-title">Testing</div>
                <div class="skills-chips">
                    {#each skills.testing.split(", ") as testing}
                        <span class="skill-chip">{testing}</span>
                    {/each}
                </div>
            </div>

            <div class="skill-category">
                <div class="skill-category-title">AI Tools</div>
                <div class="skills-chips">
                    {#each skills.aiTools.split(", ") as aiTool}
                        <span class="skill-chip">{aiTool}</span>
                    {/each}
                </div>
            </div>
        </div>
    </section>

    <!-- Education Section -->
    <section>
        <h3 class="font-bold text-2xl">Education</h3>
        <div class="space-y-10 mt-6">
            <div class="space-y-2">
                <div class="grid grid-cols-12">
                    <div class="col-span-8">
                        {education.institution}
                    </div>
                    <div class="col-span-4 text-right">{education.period}</div>
                </div>
                <div class="font-extralight text-sm text-gray-400">
                    {education.location}
                </div>
                <div class="font-extralight tracking-tight">
                    {education.degree}
                </div>
            </div>
        </div>
    </section>
</div>
