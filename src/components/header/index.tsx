import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
    return (
        <header className="bg-header shadow-lg">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="space-x-auto">
                    <Link to="/" className="text-3xl font-title font-bold leading-tight text-gray-900 select-none">
                        David Swenson
                    </Link>
                </div>
            </div>
        </header>
    );
};
