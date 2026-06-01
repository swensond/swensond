import "./Resume.css";

function Resume() {
  return (
    <>
      <div className="mt-10 mb-10 space-y-20">
        <div className="text-white">
          <h3 className="font-bold text-2xl">Summary</h3>
          <p className="font-extralight tracking-tight leading-relaxed mt-4">
            Senior Software Engineer with over a decade of experience building scalable, 
            high-performance applications across diverse industries. Expert in full-stack 
            development with Python, Java, C#, TypeScript, and JavaScript. Proven track 
            record leading migrations to AWS, implementing CI/CD pipelines, and architecting 
            serverless solutions. Strong background in mentoring teams, modernizing legacy 
            systems, and delivering products that drive business impact.
          </p>
        </div>
      </div>
      <div className="mt-10 mb-10 space-y-20">
        <div className="text-white">
          <h3 className="font-bold text-2xl">Experience</h3>
          <div className="space-y-10">
            <div className="space-y-2">
              <div className="grid grid-cols-12">
                <div className="col-span-8">Evive Health LLC.</div>
                <div className="col-span-4 text-right">
                  January 2022 - March 2023
                </div>
              </div>
              <div className="font-extralight text-sm text-gray-400">Chicago, IL</div>
              <div className="font-extralight tracking-tight">
                Senior Software Engineer
              </div>
              <div>
                <ul className="list-disc list-outside ml-5">
                  <li>
                    Built and maintained production applications using Python, Java, C#, and TypeScript across backend services and frontend platforms.
                  </li>
                  <li>
                    Engineered an automated messaging system that streamlined complex communication workflows and improved platform responsiveness.
                  </li>
                  <li>
                    Led development of a demo sales site to explore strategic product iterations for myevive.com, directly informing user experience decisions.
                  </li>
                  <li>
                    Designed and deployed an auditing service that enforced data integrity across multiple microservices, significantly improving system reliability.
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12">
                <div className="col-span-8">Evive Health LLC.</div>
                <div className="col-span-4 text-right">
                  July 2021 - January 2022
                </div>
              </div>
              <div className="font-extralight text-sm text-gray-400">Chicago, IL</div>
              <div className="font-extralight tracking-tight">
                Software Engineer II
              </div>
              <div>
                <ul className="list-disc list-outside ml-5">
                  <li>
                    Developed and maintained cross-platform applications using Python, Java, C#, and TypeScript, delivering both backend services and frontend interfaces.
                  </li>
                  <li>
                    Integrated ephemeral GoCD agents into the CI/CD pipeline, reducing build times and accelerating deployment cycles.
                  </li>
                  <li>
                    Mentored an intern through the development of a RESTful API and serverless infrastructure, guiding their project into a production-ready medical code mapping service.
                  </li>
                  <li>
                    Built an external authentication service enabling partners to generate access tokens for API calls on behalf of end users.
                  </li>
                  <li>
                    Migrated the internal authentication system to Auth0, strengthening security posture and improving system scalability.
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12">
                <div className="col-span-8">Evive Health LLC.</div>
                <div className="col-span-4 text-right">
                  August 2019 - June 2021
                </div>
              </div>
              <div className="font-extralight text-sm text-gray-400">Chicago, IL</div>
              <div className="font-extralight tracking-tight">
                Software Engineer
              </div>
              <div>
                <ul className="list-disc list-outside ml-5">
                  <li>
                    Developed and maintained cross-platform applications using Python, Java, C#, and TypeScript across backend services and frontend interfaces.
                  </li>
                  <li>
                    Introduced TypeScript into backend development, improving code consistency, type safety, and long-term maintainability.
                  </li>
                  <li>
                    Implemented AWS CloudFormation for infrastructure orchestration, standardizing and automating environment provisioning.
                  </li>
                  <li>
                    Architected serverless solutions that optimized system scalability while reducing operational costs.
                  </li>
                  <li>
                    Led the migration of internal tooling from Rackspace to AWS, improving infrastructure management and system performance.
                  </li>
                  <li>
                    Integrated GoCD into the development pipeline, establishing robust continuous integration and deployment workflows.
                  </li>
                  <li>
                    Championed the adoption of a modern, accessibility-compliant frontend framework, improving user experience and meeting accessibility standards.
                  </li>
                  <li>
                    Developed Evive Care, a platform enabling real-time searches of state and county-level COVID-19 testing sites.
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12">
                <div className="col-span-8">WiserTogether Inc.</div>
                <div className="col-span-4 text-right">
                  April 2018 - July 2019
                </div>
              </div>
              <div className="font-extralight text-sm text-gray-400">Boston, MA</div>
              <div className="font-extralight tracking-tight">
                Software Engineer
              </div>
              <div>
                <ul className="list-disc list-outside ml-5">
                  <li>
                    Built and maintained a Cordova-based mobile application for iOS and Android, delivering feature parity across platforms for mywiserhealth.com.
                  </li>
                  <li>
                    Migrated analytics infrastructure from Adobe to a self-hosted Matomo instance, improving data privacy and organizational control over user analytics.
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12">
                <div className="col-span-8">WiserTogether Inc.</div>
                <div className="col-span-4 text-right">
                  December 2015 - March 2018
                </div>
              </div>
              <div className="font-extralight text-sm text-gray-400">Boston, MA</div>
              <div className="font-extralight tracking-tight">
                Jr. Software Engineer
              </div>
              <div>
                <ul className="list-disc list-outside ml-5">
                  <li>
                    Developed and maintained applications using Python, PHP, Java, and TypeScript across backend services and frontend interfaces.
                  </li>
                  <li>
                    Introduced TypeScript to the frontend codebase, improving code maintainability and enabling scalable feature development.
                  </li>
                  <li>
                    Containerized backend services and migrated infrastructure from OpenShift to Aurora Apache, improving system performance and scalability.
                  </li>
                  <li>
                    Transitioned the build pipeline from Travis CI to Jenkins, streamlining continuous integration and deployment workflows.
                  </li>
                  <li>
                    Designed and implemented a public-facing API service, ensuring security, scalability, and developer-friendly documentation.
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12">
                <div className="col-span-8">
                  Continuum Managed Services, LLC
                </div>
                <div className="col-span-4 text-right">
                  January 2014 - December 2014
                </div>
              </div>
              <div className="font-extralight text-sm text-gray-400">Boston, MA</div>
              <div className="font-extralight tracking-tight">
                Software Engineer Intern
              </div>
              <div>
                <ul className="list-disc list-outside ml-5">
                  <li>
                    Developed and maintained Continuum Cloud Console (C3) and Sync247 platforms using PHP and JavaScript, delivering key features to production.
                  </li>
                  <li>
                    Expanded C3 integrations with additional cloud providers, broadening platform capabilities and customer options.
                  </li>
                  <li>
                    Supported fellow interns in mastering RESTful API development, contributing to team growth and knowledge sharing.
                  </li>
                </ul>
              </div>
            </div>
          </div>
  
        </div>
      </div>
      <div className="mb-10 space-y-20">
        <div className="text-white">
          <h3 className="font-bold text-2xl">Skills</h3>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 font-extralight tracking-tight">
                <span className="font-bold mr-2">Languages:</span>
                Python, Java, C#, TypeScript, JavaScript, PHP
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 font-extralight tracking-tight">
                <span className="font-bold mr-2">Frontend:</span>
                React, Tailwind CSS, Accessibility Standards
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 font-extralight tracking-tight">
                <span className="font-bold mr-2">Backend:</span>
                RESTful APIs, Serverless Architecture, Auth0
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 font-extralight tracking-tight">
                <span className="font-bold mr-2">Cloud & DevOps:</span>
                AWS (CloudFormation), Docker, GoCD, Jenkins, Travis CI, Rackspace
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 font-extralight tracking-tight">
                <span className="font-bold mr-2">Mobile:</span>
                Cordova (iOS/Android)
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-10 space-y-20">
            <div className="text-white">
              <h3 className="font-bold text-2xl">Education</h3>
              <div className="space-y-10">
                <div className="space-y-2">
                  <div className="grid grid-cols-12">
                    <div className="col-span-8">
                      Wentworth Institute of Technology
                    </div>
                    <div className="col-span-4 text-right">2011 - 2015</div>
                  </div>
                  <div className="font-extralight text-sm text-gray-400">Boston, MA</div>
                  <div className="font-extralight tracking-tight">
                    Bachelor of Science in Computer Networking
                  </div>
                </div>
              </div>
            </div>
          </div>
    </>
  );
}

export default Resume;
