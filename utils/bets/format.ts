// utils/bets/format.ts

import { Bet } from "@/types/bet";

export function formatBetStructure(bet: Bet) {
    const { type, mode, numbers, formation, axis, wings, trifectaNagashi } = bet;

    // 通常買い
    if (mode === null) {
        if (type === "馬単") {
            return {
                buyType: "通常",
                rows: [{ label: "1着 → 2着", values: numbers }],
            };
        }

        if (type === "3連単") {
            return {
                buyType: "通常",
                rows: [{ label: "1着 → 2着 → 3着", values: numbers }],
            };
        }

        return { buyType: "通常", rows: [{ label: "", values: numbers }] };
    }

    // 単勝・複勝
    if (type === "単勝" || type === "複勝") {
        return { buyType: "通常", rows: [{ label: "", values: numbers }] };
    }

    // BOX
    if (mode === "box") {
        return {
            buyType: "BOX",
            rows: [{ label: "BOX", values: bet.box ?? numbers }],
        };
    }

    // 3連単流し（特殊）
    if (type === "3連単" && trifectaNagashi) {
        const { pattern, first, second, third, wings } = trifectaNagashi;

        const rows = [];

        if (pattern.includes("1")) rows.push({ label: "1着", values: first ? [first] : [] });
        if (pattern.includes("2")) rows.push({ label: "2着", values: second ? [second] : [] });
        if (pattern.includes("3")) rows.push({ label: "3着", values: third ? [third] : [] });

        rows.push({ label: "相手", values: wings });

        return { buyType: "流し", rows };
    }

    // 通常の流し（馬連・馬単・ワイド・3連複）
    if (mode === "nagashi") {
        return {
            buyType: "流し",
            rows: [
                { label: "軸", values: axis ?? [] },
                { label: "相手", values: wings ?? [] },
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
                    { label: "3着", values: third },
                ],
            };
        }

        if (type === "3連複") {
            return {
                buyType: "フォーメーション",
                rows: [
                    { label: "1頭目", values: first },
                    { label: "2頭目", values: second },
                    { label: "3頭目", values: third },
                ],
            };
        }

        return {
            buyType: "フォーメーション",
            rows: [
                { label: "1頭目", values: first },
                { label: "2頭目", values: second },
            ],
        };
    }

    // fallback
    return { buyType: "通常", rows: [{ label: "", values: numbers }] };
}