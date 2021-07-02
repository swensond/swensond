import { lazy, Suspense } from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Header from "./components/header";

const Home = lazy(() => import("./views/home"));
const Resume = lazy(() => import("./views/resume"));

export default function App() {
    return (
        <Router>
            <Header />
            <main className="max-w-7xl mx-auto mb-4 px-2 sm:px-4 lg:px-8 mt-10">
                <Suspense fallback={<>Loading...</>}>
                    <Switch>
                        <Route exact path="/resume" component={Resume} />
                        <Route exact path="/" component={Home} />
                    </Switch>
                </Suspense>
            </main>
        </Router>
    );
}
