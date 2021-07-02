const { DefinePlugin } = require("webpack");
const getPort = require("get-port");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { resolve } = require("path");
const { WebpackPluginServe } = require("webpack-plugin-serve");

module.exports = (_, argv) => ({
    watch: argv.mode === "development",
    entry: {
        main: argv.mode === "development" ? [
            "webpack-plugin-serve/client",
            "./src/index.tsx"
        ] : "./src/index.tsx"
    },
    output: {
        filename: argv.mode === "development" ? "[name].js" : "[contenthash].js"
    },
    plugins: [
        new DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(argv.mode === "development" ? "development" : "production")
            }
        }),
        new HtmlWebpackPlugin({
            template: resolve("./public/index.html")
        }),
        new WebpackPluginServe({
            static: resolve("./dist"),
            port: getPort()
        })
    ],
    optimization: {
        splitChunks: {
            chunks: "all"
        }
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.css$/i,
                use: [
                    "style-loader",
                    "css-loader",
                    "postcss-loader"
                ],
            }
        ]
    }
});
