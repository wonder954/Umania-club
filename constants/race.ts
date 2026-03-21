import type { RacePayout } from "@/lib/race/types";

// 枠番の色
export const frameColors: Record<string, string> = {
    "1": "bg-white text-black border border-slate-300",
    "2": "bg-black text-white",
    "3": "bg-red-600 text-white",
    "4": "bg-blue-600 text-white",
    "5": "bg-yellow-400 text-black",
    "6": "bg-green-600 text-white",
    "7": "bg-orange-500 text-white",
    "8": "bg-pink-500 text-white",
};

// 券種の日本語名
export const payoutLabels: Record<keyof RacePayout, string> = {
    win: "単勝",
    place: "複勝",
    bracket: "枠連",
    quinella: "馬連",
    wide: "ワイド",
    exacta: "馬単",
    trio: "3連複",
    trifecta: "3連単",
};