// --- PC 用（背景つきバッジ） ---
export function pcPopularColor(popular: number | null) {
    if (popular === 1) return "bg-red-100 text-red-700";
    if (popular === 2) return "bg-blue-100 text-blue-700";
    if (popular === 3) return "bg-green-100 text-green-700";
    return "bg-slate-100 text-slate-700";
}

// --- スマホ用（カード UI） ---
export function mobilePopularColor(popular: number | null) {
    if (popular === 1) return "bg-red-200 text-red-800";
    if (popular === 2) return "bg-blue-200 text-blue-800";
    if (popular === 3) return "bg-green-200 text-green-800";
    if (popular != null) return "bg-slate-200 text-slate-700";
    return "bg-slate-100 text-slate-400";
}