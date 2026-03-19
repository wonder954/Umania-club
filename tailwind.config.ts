/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],

    safelist: [
        // G1〜G3
        "bg-blue-900",
        "bg-red-700",
        "bg-green-700",

        // JG1〜JG3
        "bg-amber-700",
        "bg-amber-600",
        "bg-amber-500",

        // OP
        "bg-gray-300",
        "text-gray-800",

        // text
        "text-white",
        "text-white/90",

        // border
        "border-blue-900",
        "border-red-700",
        "border-green-700",
        "border-amber-700",
        "border-amber-600",
        "border-amber-500",
        "border-gray-300",

        // isWeak 用（必要なら）
        "bg-blue-900/50",
        "bg-red-700/50",
        "bg-green-700/50",
        "bg-amber-700/50",
        "bg-amber-600/50",
        "bg-amber-500/50",
    ],

    theme: {
        extend: {
            keyframes: {
                flame: {
                    "0%, 100%": { transform: "rotate(-5deg) scale(1)" },
                    "50%": { transform: "rotate(5deg) scale(1.1)" },
                },
                coin: {
                    "0%": { transform: "rotate(0deg) translateY(0)" },
                    "25%": { transform: "rotate(-10deg) translateY(-2px)" },
                    "50%": { transform: "rotate(10deg) translateY(1px)" },
                    "75%": { transform: "rotate(-6deg) translateY(-1px)" },
                    "100%": { transform: "rotate(0deg) translateY(0)" },
                },
                result: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-2px)" },
                },
                float: {
                    "0%": { transform: "translateY(0) scale(1)", opacity: "0.7" },
                    "50%": { transform: "translateY(-40px) scale(1.3)", opacity: "1" },
                    "100%": { transform: "translateY(0) scale(1)", opacity: "0.7" },
                },
            },
            animation: {
                flame: "flame 1.2s ease-in-out infinite",
                coin: "coin 0.9s ease-in-out infinite",
                result: "result 1.8s ease-in-out infinite",
                float: "float 4s ease-in-out infinite",
            },
        },
    },
    plugins: [],
    darkMode: false,
};