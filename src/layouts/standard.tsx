import { Outlet } from "react-router";
import "react-social-icons/github";
import "react-social-icons/linkedin";
import "./standard.css";

function Standard() {
  return (
    <>
      <main className="flex w-full gap-x-8 items-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <main className="flex-1 min-w-4xl min-h-lvh">
          <div className="overflow-hidden">
            <Outlet />
          </div>
        </main>
      </main>
    </>
  );
}

export default Standard;
