import { render } from "react-dom";
import App from "./app";
import "tailwindcss/tailwind.css"

if (module.hot) {
    module.hot.accept();
}

(() => {
    render(
        <App />,
        document.getElementById("root")
    );
})();
