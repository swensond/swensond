export type Role = {
    title: string;
    /** "Mar 2023 – Present", en dash separated. */
    dates: string;
    bullets: string[];
};

export type Employer = {
    company: string;
    location: string;
    roles: Role[];
};

/** A role with its employer flattened in and every field the template reads precomputed. */
export type RoleView = Role & {
    company: string;
    location: string;
    /** Start year, "2023". */
    year: string;
    /** True for an ongoing role, which drives the accent colour. */
    current: boolean;
    /** "1y 6m", empty when under a month. */
    tenure: string;
};

export type SkillGroup = {
    category: string;
    items: string[];
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Months since year zero. "Present" resolves against `now` so an ongoing role keeps counting up. */
export function toMonths(date: string, now: Date = new Date()): number {
    if (date === 'Present') {
        return now.getFullYear() * 12 + now.getMonth();
    }

    const [month, year] = date.split(' ');
    return Number(year) * 12 + MONTHS.indexOf(month);
}

/** "1y 6m". Drops the unit when it is zero, and returns "" when both are. */
export function tenure(dates: string, now: Date = new Date()): string {
    const [start, end] = dates.split(' – ');
    const total = toMonths(end, now) - toMonths(start, now);
    const years = Math.floor(total / 12);
    const months = total % 12;

    return [years && `${years}y`, months && `${months}m`].filter(Boolean).join(' ');
}

const CAREER: Employer[] = [
    {
        company: 'Global Unity Impact',
        location: 'Remote',
        roles: [
            {
                title: 'Senior Software Engineer',
                dates: 'Mar 2023 – Present',
                bullets: [
                    'Own the architecture and development of a full-stack platform supporting nonprofit operations, built on React, TypeScript, Bun, Hono, and MongoDB.',
                    "Designed the platform's REST API layer in TypeScript with Hono, establishing type-safe, maintainable patterns for backend services.",
                    'Run the MongoDB data layer end to end, from schema design and indexing strategy to query performance and operational reliability.',
                    "Led the team's adoption of AI-assisted development, integrating coding assistants and LLMs into daily workflows to speed up delivery and strengthen code review."
                ]
            }
        ]
    },
    {
        company: 'Evive Health',
        location: 'Remote',
        roles: [
            {
                title: 'Senior Software Engineer',
                dates: 'Jan 2022 – Mar 2023',
                bullets: [
                    'Designed and deployed a cross-service auditing layer that enforced data integrity across the microservice platform and became a core reliability safeguard.',
                    'Engineered an automated messaging system that replaced manual communication workflows, removing a bottleneck as the platform scaled.',
                    'Led development of a demo sales site for myevive.com that prototyped product direction and shaped UX decisions for the core product.',
                    'Built and maintained production microservices and web applications in Python, Java, C#, and TypeScript, running on AWS with PostgreSQL.'
                ]
            },
            {
                title: 'Software Engineer II',
                dates: 'Jul 2021 – Jan 2022',
                bullets: [
                    'Designed and built an external authentication service that let partners generate access tokens and call APIs on behalf of end users, enabling partner integrations.',
                    'Migrated internal authentication to Auth0, improving security and scalability.',
                    'Mentored an intern from onboarding through production launch, guiding the design and build of a serverless medical code mapping API.',
                    'Cut CI/CD build times by introducing ephemeral GoCD agents, speeding up automated testing and deployment.'
                ]
            },
            {
                title: 'Software Engineer',
                dates: 'Aug 2019 – Jun 2021',
                bullets: [
                    'Launched Evive Care in response to COVID-19: a real-time search tool for state and county testing sites, used by thousands of employees.',
                    'Led the migration of internal tooling from Rackspace to AWS and established infrastructure as code with CloudFormation, standardizing and automating environment provisioning.',
                    'Architected serverless services on AWS Lambda, improving scalability while reducing operational overhead and infrastructure cost.',
                    'Built the CI/CD foundation for the engineering team by integrating GoCD into the development pipeline.',
                    'Championed TypeScript for backend development, improving type safety and long-term maintainability.',
                    'Drove company-wide adoption of an accessible frontend framework, raising WCAG compliance across the product.'
                ]
            }
        ]
    },
    {
        company: 'WiserTogether',
        location: 'Boston, MA',
        roles: [
            {
                title: 'Software Engineer',
                dates: 'Apr 2018 – Jul 2019',
                bullets: [
                    'Built and owned the Cordova-based iOS and Android app for mywiserhealth.com, maintaining feature parity across platforms.',
                    'Migrated analytics from Adobe Analytics to self-hosted Matomo, bringing user data in-house for stronger privacy and control.'
                ]
            },
            {
                title: 'Junior Software Engineer',
                dates: 'Dec 2015 – Mar 2018',
                bullets: [
                    'Designed and implemented a public-facing API with an emphasis on security, scalability, and clear developer documentation.',
                    'Containerized backend services and migrated infrastructure from OpenShift to Apache Aurora.',
                    'Introduced TypeScript to the frontend codebase and moved CI from Travis CI to Jenkins.'
                ]
            }
        ]
    },
    {
        company: 'Continuum Managed Services',
        location: 'Boston, MA',
        roles: [
            {
                title: 'Software Engineering Intern',
                dates: 'Jan 2014 – Dec 2014',
                bullets: [
                    'Shipped features for the Continuum Cloud Console (C3) and Sync247 in PHP and JavaScript, including integrations with additional cloud providers.',
                    'Coached fellow interns on RESTful API development.'
                ]
            }
        ]
    }
];

export const skills: SkillGroup[] = [
    { category: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'Java', 'C#', 'PHP', 'SQL'] },
    { category: 'Frontend', items: ['React', 'Svelte', 'Tailwind CSS', 'HTML', 'CSS', 'Accessibility (WCAG)'] },
    { category: 'Backend', items: ['Node.js', 'Bun', 'Hono', 'REST APIs', 'Microservices', 'Serverless', 'Auth0'] },
    { category: 'Data', items: ['MongoDB', 'PostgreSQL', 'MySQL', 'DynamoDB', 'Cloudflare Workers KV', 'Redis', 'Memcached'] },
    { category: 'Cloud & DevOps', items: ['AWS', 'Lambda', 'ECS', 'CloudFormation', 'Cloudflare Workers', 'Docker', 'GitHub Actions', 'GoCD', 'Jenkins', 'Travis CI'] },
    { category: 'Testing', items: ['Vitest', 'Jest', 'Pytest'] },
    { category: 'AI Tooling', items: ['AI coding assistants', 'LLM workflows', 'Local LLMs'] }
];

export const education = {
    year: '2011',
    school: 'Wentworth Institute of Technology',
    degree: 'B.S. Computer Networking',
    dates: '2011 – 2015',
    location: 'Boston, MA'
};

/** Employers flattened to one role per entry, in resume order. */
export const roles: RoleView[] = CAREER.flatMap((employer) =>
    employer.roles.map((role) => ({
        ...role,
        company: employer.company,
        location: employer.location,
        year: role.dates.match(/\d{4}/)?.[0] ?? '',
        current: role.dates.endsWith('Present'),
        tenure: tenure(role.dates)
    }))
);
