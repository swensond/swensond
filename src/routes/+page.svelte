<script>
    // Component data - excluding contact information
    let experiences = [
        {
            company: "Global Unity Impact",
            period: "March 2023 - Present",
            location: "Millbury, MA",
            title: "Senior Software Engineer (Volunteer)",
            achievements: [
                "Architected and shipped full-stack web applications with React, TypeScript, and MongoDB, enabling a scalable platform serving nonprofit operations.",
                "Designed and implemented RESTful APIs using TypeScript, Node.js, and MongoDB, ensuring type safety and maintainable backend services.",
                "Built interactive UI components with React and TypeScript, improving user engagement and application performance.",
                "Managed MongoDB databases for data storage and retrieval, optimizing query performance, indexing strategies, and operational reliability.",
                "Accelerated development velocity by integrating AI coding tools (Qwen, GitHub Copilot), reducing boilerplate time and improving code review quality."
            ]
        },
        {
            company: "Evive Health LLC.",
            period: "January 2022 - March 2023",
            location: "Chicago, IL",
            title: "Senior Software Engineer",
            achievements: [
                "Built and maintained production microservices and web applications using Python, Java, C#, TypeScript, PostgreSQL, and AWS.",
                "Engineered an automated messaging system that eliminated manual communication bottlenecks, improving platform responsiveness at scale.",
                "Led development of a demo sales site to explore strategic product iterations for myevive.com, directly informing user experience decisions.",
                "Designed and deployed a cross-microservice auditing layer that enforced data integrity and became a critical reliability pillar across the platform."
            ]
        },
        {
            company: "Evive Health LLC.",
            period: "July 2021 - January 2022",
            location: "Chicago, IL",
            title: "Software Engineer II",
            achievements: [
                "Owned cross-platform application development in Python, Java, C#, and TypeScript, spanning backend services and customer-facing interfaces.",
                "Integrated ephemeral GoCD agents into CI/CD pipelines, reducing build times and accelerating automated testing and deployment workflows.",
                "Mentored an intern from onboarding to production — guiding the full design and build of a serverless medical code mapping API that shipped to production.",
                "Built an external authentication service enabling partners to generate access tokens for API calls on behalf of end users.",
                "Migrated the internal authentication system to Auth0, strengthening security posture and improving system scalability."
            ]
        },
        {
            company: "Evive Health LLC.",
            period: "August 2019 - June 2021",
            location: "Chicago, IL",
            title: "Software Engineer",
            achievements: [
                "Introduced TypeScript into backend development, improving code consistency, type safety, and long-term maintainability.",
                "Implemented AWS CloudFormation and infrastructure-as-code practices, standardizing and automating environment provisioning.",
                "Architected AWS Lambda–based serverless solutions that improved scalability while reducing operational overhead and infrastructure costs.",
                "Led the migration of internal tooling from Rackspace to AWS, improving infrastructure management and system performance.",
                "Integrated GoCD into the development pipeline, establishing robust continuous integration and deployment workflows.",
                "Drove company-wide adoption of an accessibility-compliant frontend framework, raising WCAG compliance and modernizing the user experience.",
                "Launched Evive Care in response to the COVID-19 pandemic, delivering a real-time search platform for state and county testing sites used by thousands of employees."
            ]
        },
        {
            company: "WiserTogether Inc.",
            period: "April 2018 - July 2019",
            location: "Boston, MA",
            title: "Software Engineer",
            achievements: [
                "Built and maintained a Cordova-based mobile application for iOS and Android, delivering feature parity across platforms for mywiserhealth.com.",
                "Migrated analytics infrastructure from Adobe to a self-hosted Matomo instance, improving data privacy and organizational control over user analytics."
            ]
        },
        {
            company: "WiserTogether Inc.",
            period: "December 2015 - March 2018",
            location: "Boston, MA",
            title: "Jr. Software Engineer",
            achievements: [
                "Developed and maintained applications using Python, PHP, Java, and TypeScript across backend services and frontend interfaces.",
                "Introduced TypeScript to the frontend codebase, improving code maintainability and enabling scalable feature development.",
                "Containerized backend services and migrated infrastructure from OpenShift to Aurora Apache, improving system performance and scalability.",
                "Transitioned the build pipeline from Travis CI to Jenkins, streamlining continuous integration and deployment workflows.",
                "Designed and implemented a public-facing API service, ensuring security, scalability, and developer-friendly documentation."
            ]
        },
        {
            company: "Continuum Managed Services, LLC",
            period: "January 2014 - December 2014",
            location: "Boston, MA",
            title: "Software Engineer Intern",
            achievements: [
                "Developed and maintained Continuum Cloud Console (C3) and Sync247 platforms using PHP and JavaScript, delivering key features to production.",
                "Expanded C3 integrations with additional cloud providers, broadening platform capabilities and customer options.",
                "Supported fellow interns in mastering RESTful API development, contributing to team growth and knowledge sharing."
            ]
        }
    ];
    
    let skills = {
        languages: "Python, Java, C#, TypeScript, JavaScript, PHP, SQL",
        frontend: "React, Tailwind CSS, HTML5, CSS3, Accessibility Standards (WCAG)",
        backend: "Node.js, Bun, RESTful APIs, Auth0, Serverless Architecture, Microservices",
        databases: "MongoDB, PostgreSQL, MySQL",
        cloudDevOps: "AWS, CloudFormation, Docker, CI/CD, GoCD, Jenkins, Travis CI, GitHub Actions, Rackspace",
        testing: "Vitest, Jest, Pytest",
        aiTools: "GitHub Copilot, Qwen"
    };
    
    let education = {
        institution: "Wentworth Institute of Technology",
        location: "Boston, MA",
        period: "2011 - 2015",
        degree: "Bachelor of Science in Computer Networking"
    };
</script>

<div class="resume-container">
    <!-- Summary Section -->
    <section class="mb-10">
        <h3 class="font-bold text-2xl">Summary</h3>
        <p class="font-extralight tracking-tight leading-relaxed mt-4">
            Senior Software Engineer with 10+ years of experience designing cloud-native applications,
            distributed systems, and developer platforms. Proven record leading AWS migrations, modernizing
            legacy systems, mentoring engineers, and delivering production software across healthcare, SaaS,
            and nonprofit sectors. Expert in full-stack development with Python, Java, C#,
            TypeScript, JavaScript, Node.js, and React, with deep experience building scalable backend services, CI/CD
            pipelines, serverless architectures, and microservice-based systems.
        </p>
    </section>

    <!-- Experience Section -->
    <section class="mb-10">
        <h3 class="font-bold text-2xl">Experience</h3>
        <div class="space-y-10 mt-6">
            {#each experiences as exp}
                <div class="space-y-2">
                    <div class="grid grid-cols-12">
                        <div class="col-span-8">{exp.company}</div>
                        <div class="col-span-4 text-right">
                            {exp.period}
                        </div>
                    </div>
                    <div class="font-extralight text-sm text-gray-400">{exp.location}</div>
                    <div class="font-extralight tracking-tight">
                        {exp.title}
                    </div>
                    <div>
                        <ul class="list-disc list-outside ml-5 space-y-2">
                            {#each exp.achievements as achievement}
                                <li>{achievement}</li>
                            {/each}
                        </ul>
                    </div>
                </div>
            {/each}
        </div>
    </section>

    <!-- Skills Section -->
    <section class="mb-10">
        <h3 class="font-bold text-2xl">Skills</h3>
        <div class="space-y-4 mt-4">
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 font-extralight tracking-tight">
                    <span class="font-bold mr-2">Languages:</span>
                    {skills.languages}
                </div>
            </div>
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 font-extralight tracking-tight">
                    <span class="font-bold mr-2">Frontend:</span>
                    {skills.frontend}
                </div>
            </div>
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 font-extralight tracking-tight">
                    <span class="font-bold mr-2">Backend:</span>
                    {skills.backend}
                </div>
            </div>
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 font-extralight tracking-tight">
                    <span class="font-bold mr-2">Databases:</span>
                    {skills.databases}
                </div>
            </div>
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 font-extralight tracking-tight">
                    <span class="font-bold mr-2">Cloud & DevOps:</span>
                    {skills.cloudDevOps}
                </div>
            </div>
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 font-extralight tracking-tight">
                    <span class="font-bold mr-2">Testing:</span>
                    {skills.testing}
                </div>
            </div>
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 font-extralight tracking-tight">
                    <span class="font-bold mr-2">AI Tools:</span>
                    {skills.aiTools}
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
                <div class="font-extralight text-sm text-gray-400">{education.location}</div>
                <div class="font-extralight tracking-tight">
                    {education.degree}
                </div>
            </div>
        </div>
    </section>
</div>
