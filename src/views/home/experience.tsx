import React from "react";
import Divider from "../../components/divider";
import Link from "../../components/Link";

function JobListing({ title, time, company, children }: { title: string; time: string; company: string; children: any; }) {
    return (
        <li className="py-4">
            <div className="flex space-x-3">
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <h3 className="text-md">{title}</h3>
                        <p className="text-sm text-gray-500">{time}</p>
                    </div>
                    <p className="text-sm text-gray-500">{company}</p>
                </div>
            </div>
            <div>
                <ul className="w-9/12 ml-5 mt-4 list-disc list-outside space-y-2 text-gray-500">
                    {children}
                </ul>
            </div>
        </li>
    );
};

export default function HomeExperience() {
    return (
        <div>
            <Divider title="Experience" />
            <ul className="divide-y divide-gray-200">
                <JobListing title="Software Engineer" company="Evive Health LLC" time="August 2019 - Present">
                    <li>
                        Python, Java, C#, and TypeScript development
                    </li>
                    <li>
                        Introduced TypeScript into the backend development process
                    </li>
                    <li>
                        Assisted in introducing AWS CloudFormation for orchestration
                    </li>
                    <li>
                        Assisted in designing and implementing serverless architecture
                    </li>
                    <li>
                        Assisted in lifting internal tooling from Rackspace to AWS
                    </li>
                    <li>
                        Assisted in implementing GoCD into the development flow
                    </li>
                    <li>
                        Assisted in implementing a modern accessibility friendly frontend
                    </li>
                    <li>
                        Assisted in developing and designing <Link href="https://evive.care">Evive Care</Link> to consolidate and provide the capability to search for COVID-19 testing sites at a State/County level
                    </li>
                </JobListing>
                <JobListing title="Jr. Software Engineer" company="WiserTogether Inc" time="November 2015 - July 2019">
                    <li>
                        Python, PHP, Java, and TypeScript development
                    </li>
                    <li>
                        Introduced TypeScript into the frontend development process
                    </li>
                    <li>
                        Assisted in containerization of backend services from OpenShift to Aurora Apache
                    </li>
                    <li>
                        Retooled build from to move from Travis to Jenkins
                    </li>
                    <li>
                        Assisted in designing and implementing a public facing API service
                    </li>
                    <li>
                        Developed and managed a Cordova based mobile application for an iOS and Android version of mywiserhealth.com
                    </li>
                    <li>
                        Assisted in migration from Adobe's analytics platform to a private hosted Matomo
                    </li>
                </JobListing>
                <JobListing title="Software Engineer Intern" company="Continuum Managed Services LLC" time="January 2014 - December 2014">
                    <li>
                        PHP, and JavaScript development
                    </li>
                    <li>
                        Assisted in design, and creation of the Continuum Cloud Console (C3) and Sync247
                    </li>
                    <li>
                        Worked on expanding C3 to include other cloud providers while assisting other intern team members in learning RESTFUL API development processes
                    </li>
                </JobListing>
            </ul>
        </div>
    );
};
