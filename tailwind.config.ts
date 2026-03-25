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
        // ===== 枠番色 =====
        "bg-white", "bg-black",
        "bg-red-600", "bg-blue-600", "bg-yellow-400",
        "bg-green-600", "bg-orange-500", "bg-pink-500",
        "border-slate-300",

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
        "border-l-blue-900",
        "border-l-red-700",
        "border-l-green-700",
        "border-l-amber-700",
        "border-l-amber-600",
        "border-l-amber-500",
        "border-l-gray-300",

        // isWeak 用（必要なら）
        "bg-blue-900/50",
        "bg-red-700/50",
        "bg-green-700/50",
        "bg-amber-700/50",
        "bg-amber-600/50",
        "bg-amber-500/50",

        // --- PC 用（カードUI） ---
        "bg-red-100 text-red-700",
        "bg-blue-100 text-blue-700",
        "bg-green-100 text-green-700",
        "bg-slate-100 text-slate-700",

        // --- スマホ用（カード UI）
        "bg-red-200", "text-red-800",
        "bg-blue-200", "text-blue-800",
        "bg-green-200", "text-green-800",
        "bg-slate-200", "text-slate-700",
        "bg-slate-100", "text-slate-400",

        //Oddsカラー（PC)
        "text-slate-500",
        "text-red-600/80 font-bold",
        "text-black font-bold",

        //Oddsカラー(スマホ)
        "bg-slate-100/60 text-slate-500",
        "text-red-700 font-bold",
        "text-black font-bold",
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
    darkMode: "class",
};