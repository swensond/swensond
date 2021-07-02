export default function ResumeView() {
    return (
        <>
            <div className="relative">
                <h2 className="text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                    Resume
                </h2>
                <div className="mt-10 space-y-20">
                    <div>
                        <h3 className="font-bold text-2xl">
                            Education
                        </h3>
                        <div className="grid grid-rows-2">
                            <div className="row-span-1 grid grid-cols-12">
                                <div className="col-span-8">
                                    Wentworth Institute of Technology
                                </div>
                                <div className="col-span-4 text-right">
                                    2011 - 2015
                                </div>
                            </div>
                            <div className="row-span-1 font-extralight tracking-tight">
                                Bachelor of Science Computer Networking
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-2xl">
                            Experience
                        </h3>
                        <div className="space-y-10">
                        <div className="space-y-2">
                                <div className="grid grid-cols-12">
                                    <div className="col-span-8">
                                        Evive Health LLC.
                                    </div>
                                    <div className="col-span-4 text-right">
                                        July 2021 - Present
                                    </div>
                                </div>
                                <div className="font-extralight tracking-tight">
                                    Software Engineer 2
                                </div>
                                <div>
                                    <ul className="list-disc list-outside ml-5">
                                        <li>Python, Java, C#, and TypeScript development</li>
                                        <li>Assisted in introducing ephemeral GoCD agents into the build process</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="grid grid-cols-12">
                                    <div className="col-span-8">
                                        Evive Health LLC.
                                    </div>
                                    <div className="col-span-4 text-right">
                                        August 2019 - July 2021
                                    </div>
                                </div>
                                <div className="font-extralight tracking-tight">
                                    Software Engineer
                                </div>
                                <div>
                                    <ul className="list-disc list-outside ml-5">
                                        <li>Python, Java, C#, and TypeScript development</li>
                                        <li>Introduced TypeScript into the backend development process</li>
                                        <li>Assisted in introducing AWS CloudFormation for orchestration</li>
                                        <li>Assisted in designing and implementing serverless architecture</li>
                                        <li>Assisted in lifting internal tooling from Rackspace to AWS</li>
                                        <li>Assisted in implementing GoCD into the development flow</li>
                                        <li>Assisted in implementing a modern accessibility friendly frontend</li>
                                        <li>Assisted in developing and designing <a href="https://evive.care/" rel="noreferrer" target="_blank" className="text-aquamarine-500 hover:text-aquamarine-800 hover:underline">Evive Care</a> to consolidate and provide the capability to search for COVID-19 testing sites at a State/County level</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="grid grid-cols-12">
                                    <div className="col-span-8">
                                        WiserTogether Inc.
                                    </div>
                                    <div className="col-span-4 text-right">
                                        November 2015 - July 2019
                                    </div>
                                </div>
                                <div className="font-extralight tracking-tight">
                                    Jr. Software Engineer
                                </div>
                                <div>
                                    <ul className="list-disc list-outside ml-5">
                                        <li>Python, PHP, Java, and TypeScript development</li>
                                        <li>Introduced TypeScript into the frontend development process</li>
                                        <li>Assisted in containerization of backend services from OpenShift to Aurora Apache</li>
                                        <li>Retooled build process to move from Travis to Jenkins</li>
                                        <li>Assisted in designing and implementing a public facing API service</li>
                                        <li>Developed and managed a Cordova based mobile application for an iOS and Android version of mywiserhealth.com</li>
                                        <li>Assisted in migration from Adobe's analytics platform to a privately hosted instance of Matomo</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="grid grid-cols-12">
                                    <div className="col-span-8">
                                        Continuum Managed Services LLC.
                                    </div>
                                    <div className="col-span-4 text-right">
                                        January 2014 - December 2014
                                    </div>
                                </div>
                                <div className="font-extralight tracking-tight">
                                    Software Engineer Intern
                                </div>
                                <div>
                                    <ul className="list-disc list-outside ml-5">
                                        <li>PHP and JavaScript development</li>
                                        <li>Assisted in design, and creation of the Continuum Cloud Console (C3) and Sync247</li>
                                        <li>Worked on expanding C3 to include other cloud providers while assisting other intern team members in learning RESTFUL API development processes</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
