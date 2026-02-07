// utils/bets/format.ts

import { Bet } from "@/types/bet";

export function formatBetStructure(bet: Bet) {
    const { type, mode, numbers, formation } = bet;

    // 通常買い（mode === null）
    if (mode === null) {
        // 馬単: 順番を表示
        if (type === "馬単") {
            return {
                buyType: "通常",
                rows: [
                    { label: "1着 → 2着", values: numbers },
                ],
            };
        }

        // 三連単: 順番を表示
        if (type === "3連単") {
            return {
                buyType: "通常",
                rows: [
                    { label: "1着 → 2着 → 3着", values: numbers },
                ],
            };
        }

        // その他: 通常表示
        return {
            buyType: "通常",
            rows: [{ label: "", values: numbers }],
        };
    }

    // 単勝・複勝
    if (type === "単勝" || type === "複勝") {
        return {
            buyType: "通常",
            rows: [
                { label: "", values: numbers },
            ],
        };
    }

    // BOX
    if (mode === "box") {
        return {
            buyType: "BOX",
            rows: [
                { label: "BOX", values: numbers },
            ],
        };
    }

    // 流し
    if (mode === "nagashi") {
        return {
            buyType: "流し",
            rows: [
                { label: "軸", values: [numbers[0]] },
                { label: "相手", values: numbers.slice(1) },
            ],
        };
    }

    // フォーメーション
    if (mode === "formation" && formation) {
        const { first, second, third } = formation;

        if (type === "3連単") {
            return {
                buyType: "フォーメーション",
                rows: [
                    { label: "1着", values: first },
                    { label: "2着", values: second },
                    { label: "3着", values: third ?? [] },
                ],
            };
        }

        if (type === "3連複") {
            return {
                buyType: "フォーメーション",
                rows: [
                    { label: "1頭目", values: first },
                    { label: "2頭目", values: second },
                    { label: "3頭目", values: third ?? [] },
                ],
            };
        }

        if (["馬単", "馬連", "ワイド"].includes(type)) {
            return {
                buyType: "フォーメーション",
                rows: [
                    { label: "1頭目", values: first },
                    { label: "2頭目", values: second },
                ],
            };
        }
    }

    // fallback
    return {
        buyType: "通常",
        rows: [{ label: "", values: numbers }],
    };
}