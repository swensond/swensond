import { CalendarIcon, DevicePhoneMobileIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/20/solid'
import { Link, Outlet } from 'react-router'
import { SocialIcon } from 'react-social-icons/component'
import 'react-social-icons/github'
import 'react-social-icons/linkedin'
import './resume.css'

const information = [
    {
        content: 'May 3rd, 1993',
        icon: CalendarIcon,
        iconBackground: 'bg-gray-600',
    },
    {
        content: 'Millbury, MA',
        icon: MapPinIcon,
        iconBackground: 'bg-green-600',
    },
    {
        content: 'david@swensond.com',
        icon: EnvelopeIcon,
        iconBackground: 'bg-sky-600',
    },
    {
        content: '(508) 579-6980',
        icon: DevicePhoneMobileIcon,
        iconBackground: 'bg-pink-600',
    },
]

function Resume() {
    return (
        <>
            <main className="flex w-full gap-x-8 items-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <aside className="sticky top-40 hidden w-96 shrink-0 lg:block self-start">
                    <div className="bg-white rounded-t-lg pt-36 pb-2">
                        <img className="rounded-full w-64 h-64 absolute -top-32 left-16 shadow" src="https://avatars.githubusercontent.com/u/1354954?v=4" alt="" />
                        <div className="text-5xl flex justify-center gap-x-1.5">
                            David <span className="text-slate-500">Swenson</span>
                        </div>
                        <div className="flex gap-x-8 justify-center my-8">
                            <Link to="https://github.com/swensond" target="_blank">
                                <SocialIcon network="github" />
                            </Link>
                            <Link to="https://www.linkedin.com/in/swensond/" target="_blank">
                                <SocialIcon network="linkedin" />
                            </Link>
                        </div>
                    </div>
                    <div className="overflow-hidden bg-gray-200 rounded-b-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flow-root">
                                <ul role="list" className="-mb-8">
                                    {information.map((info) => (
                                        <li>
                                            <div className="relative pb-8">
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className={`flex size-8 items-center justify-center rounded-full ${info.iconBackground}`}>
                                                            <info.icon aria-hidden="true" className="size-5 text-white" /></span>
                                                    </div>
                                                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                        <div>
                                                            <p className="text-sm text-gray-500">{info.content}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </aside>
                <main className="flex-1 min-w-4xl min-h-lvh">
                    <div className="overflow-hidden">
                        <Outlet />
                    </div>
                </main>
            </main>
        </>
    )
}

export default Resume

