module.exports = {
    purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    darkMode: "media",
    theme: {
        fontFamily: {
            sans: ["Oxygen"],
            title: ["Dancing Script"]
        },
        extend: {
            colors: {
                header: "#ffffff",
                background: "#e5e5e5",
                "blue-dianne": {
                    50: "#f4f6f6",
                    100: "#e9edee",
                    200: "#c9d1d4",
                    300: "#a8b5ba",
                    400: "#677e87",
                    500: "#264653",
                    600: "#223f4b",
                    700: "#1d353e",
                    800: "#172a32",
                    900: "#132229"
                },
                "puerto-rico": {
                    50: "#f5fcfb",
                    100: "#eaf9f8",
                    200: "#cbf1ec",
                    300: "#ace9e1",
                    400: "#6ed8cb",
                    500: "#30c7b4",
                    600: "#2bb3a2",
                    700: "#249587",
                    800: "#1d776c",
                    900: "#186258"
                },
                "mercury": {
                    50: "#fefefe",
                    100: "#fcfcfc",
                    200: "#f9f9f9",
                    300: "#f5f5f5",
                    400: "#ededed",
                    500: "#e5e5e5",
                    600: "#cecece",
                    700: "#acacac",
                    800: "#898989",
                    900: "#707070"
                }
            }
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
