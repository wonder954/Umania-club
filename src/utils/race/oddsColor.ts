// utils/oddsColor.ts

// --- スマホ用（背景＋文字色） ---
export function mobileOddsColor(odds: number | null) {
    if (odds == null) return "bg-slate-100/60 text-slate-500";

    if (odds <= 10) return "text-red-700 font-bold";
    if (odds <= 100) return "text-black font-bold";

    return "text-black";
}

// --- PC 用（文字色のみ） ---
export function pcOddsColor(odds: number | null) {
    if (odds == null) return "text-slate-500";

    if (odds <= 10) return "text-red-600/80 font-bold";
    if (odds <= 100) return "text-black font-bold";

    return "text-black";
}