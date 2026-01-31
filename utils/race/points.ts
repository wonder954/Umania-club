import { expandTickets } from "./expand";
import type { Bet } from "@/types/bet";

export function countPoints(bet: Bet): number {
    const tickets = expandTickets(bet);

    const unique = new Set<string>();

    for (const t of tickets) {
        // 無効券（同じ馬が重複）を除外
        if (new Set(t.numbers).size !== t.numbers.length) continue;

        // 順序なしの馬券はソートして一意化
        let key = "";
        if (t.type === "馬連" || t.type === "ワイド" || t.type === "3連複") {
            key = `${t.type}:${[...t.numbers].sort().join("-")}`;
        } else {
            key = `${t.type}:${t.numbers.join("-")}`;
        }

        unique.add(key);
    }

    return unique.size;
}