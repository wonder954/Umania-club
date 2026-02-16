/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            keyframes: {
                // 🔥 炎アニメーション
                flame: {
                    "0%, 100%": { transform: "rotate(-5deg) scale(1)" },
                    "50%": { transform: "rotate(5deg) scale(1.1)" },
                },

                // 💰 コイン揺れ
                coin: {
                    "0%": { transform: "rotate(0deg) translateY(0)" },
                    "25%": { transform: "rotate(-10deg) translateY(-2px)" },
                    "50%": { transform: "rotate(10deg) translateY(1px)" },
                    "75%": { transform: "rotate(-6deg) translateY(-1px)" },
                    "100%": { transform: "rotate(0deg) translateY(0)" },
                },

                // 🟣 レース結果の軽い揺れ
                result: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-2px)" },
                },

                // ✨ 光の粒子（float）
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
};