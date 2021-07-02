import { Link } from "react-router-dom"
import style from "./style.module.css";

const navigation = [
    { name: 'Home', href: "/" },
    { name: 'Resume', href: "/resume" }
];

export default function Header() {
    return (
        <nav className={`bg-aquamarine-400 h-40 ${style.header_background}`}>
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 h-full flex items-center">
                <div className="flex justify-between w-full h-16">
                    <div className="flex items-center px-2 lg:px-0">
                        <div className="flex-shrink-0 flex items-center select-none cursor-pointer font-header font-bold text-5xl text-white">
                            David Swenson
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="flex space-x-4">
                            {navigation.map((item) => (
                                <Link key={item.name} to={item.href} className="rounded-md py-2 px-3 text-sm font-medium text-white hover:bg-aquamarine-500">
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </nav >
    );
}
