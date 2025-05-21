module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            ["module-resolver", {
                alias: {
                    "stream": "readable-stream",
                    "crypto": "react-native-crypto",
                    "events": "events",
                    "buffer": "buffer",
                    "process": "process",
                },
                extensions: ['.js', '.jsx', '.ts', '.tsx', '.svg'],
            }],
        ]
    };
};