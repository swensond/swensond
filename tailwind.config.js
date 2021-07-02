module.exports = {
    purge: {
        content: [
            "./src/**/*.{js,jsx,ts,tsx}",
            "./public/index.html"
        ]
    },
    darkMode: false,
    theme: {
        extend: {
            fontFamily: {
                header: ["Dancing Script"],
                body: ["Oxygen"]
            },
            colors: {
                raspberry: {
                    50: "#f1e1e5",
                    100: "#e4c3cc",
                    200: "#d8a4b4",
                    300: "#cd859d",
                    400: "#be6785",
                    500: "#9d556e",
                    600: "#7d4458",
                    700: "#5e3342",
                    800: "#41232e",
                    900: "#26151b",
                },
                apple_green: {
                    50: "#e2e7cc",
                    100: "#c6d191",
                    200: "#acb965",
                    300: "#95a057",
                    400: "#7e884a",
                    500: "#68703d",
                    600: "#525930",
                    700: "#3e4325",
                    800: "#2b2e19",
                    900: "#181a0e",
                },
                aquamarine: {
                    50: "#d2eae0",
                    100: "#a0d6c2",
                    200: "#6ac3a4",
                    300: "#5ca88e",
                    400: "#4e8e78",
                    500: "#407563",
                    600: "#335e4f",
                    700: "#26463b",
                    800: "#1b3129",
                    900: "#0f1c18",
                },
                persian_blue: {
                    50: "#e5e3f2",
                    100: "#ccc8e6",
                    200: "#b3addb",
                    300: "#9b92d1",
                    400: "#8477c9",
                    500: "#6d60b1",
                    600: "#574d8c",
                    700: "#413a6a",
                    800: "#2d2849",
                    900: "#1a172a",
                }
            }
        }
    },
    variants: {
        extend: {},
    },
    plugins: [
        require("@tailwindcss/forms"),
    ],
};
