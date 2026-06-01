import { DevicePhoneMobileIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/20/solid'
import { Link, Outlet } from 'react-router'
import { SocialIcon } from 'react-social-icons/component'
import 'react-social-icons/github'
import 'react-social-icons/linkedin'
import './resume.css'

const information = [
    {
        content: 'Millbury, MA',
        icon: MapPinIcon,
    },
    {
        content: 'david@swensond.com',
        icon: EnvelopeIcon,
    },
    {
        content: '(508) 579-6980',
        icon: DevicePhoneMobileIcon,
    },
]

function Resume() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header Section - Inline Profile */}
            <header className="bg-white rounded-2xl shadow-lg p-8 mb-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Profile Image */}
                    <div className="flex-shrink-0">
                        <img 
                            className="rounded-full w-48 h-48 shadow-lg" 
                            src="https://avatars.githubusercontent.com/u/1354954?v=4" 
                            alt="David Swenson" 
                        />
                    </div>
                    
                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl font-bold mb-2">
                            David <span className="text-slate-500">Swenson</span>
                        </h1>
                        
                        {/* Social Links */}
                        <div className="flex gap-6 justify-center md:justify-start my-4">
                            <Link to="https://github.com/swensond" target="_blank">
                                <SocialIcon network="github" />
                            </Link>
                            <Link to="https://www.linkedin.com/in/swensond/" target="_blank">
                                <SocialIcon network="linkedin" />
                            </Link>
                        </div>
                        
                        {/* Contact Information Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            {information.map((info) => (
                                <div key={info.content} className="flex items-center gap-3">
                                    <span className={`flex size-8 items-center justify-center rounded-full bg-slate-700`}>
                                        <info.icon aria-hidden="true" className="size-5 text-white" />
                                    </span>
                                    <p className="text-sm text-slate-600">{info.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - Experience & Education */}
            <main className="bg-white rounded-2xl shadow-lg p-8">
                <Outlet />
            </main>
        </div>
    )
}

export default Resume
