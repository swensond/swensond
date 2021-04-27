import React from "react";

export default function Link({ children, href }: { children: any; href: string; }) {
    return (
        <a href={href} target="_blank" rel="noreferrer" className="text-puerto-rico-700 hover:underline hover:text-blue-dianne-900">
            {children}
        </a>
    );
};
