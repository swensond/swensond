import React, { lazy, Suspense } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Header from "./components/header";

const HomeView = lazy(() => import("./views/home"));
const ProjectsView = lazy(() => import("./views/project"));

export default function App() {
    return (
        <BrowserRouter>
            <Header />
            <main>
                <div className="background xl:py-40" />
                <div className="bg-white max-w-7xl mx-auto py-6 xl:-mt-40 xl:mb-20 sm:px-6 lg:px-8">
                    <div className="px-4 py-4 sm:px-0">
                        <Suspense fallback={<>It all blew up ☹️</>}>
                            <Switch>
                                <Route path="/projects" component={ProjectsView} />
                                <Route path="/" exact={true} component={HomeView} />
                            </Switch>
                        </Suspense>
                    </div>
                </div>
            </main>
        </BrowserRouter>
    );
};
