import type { BetType } from "@/types/bet";
import type { Payout, PayoutItem } from "@/types/race";

export function calculatePayout(
    hitTickets: { type: BetType; numbers: number[] }[],
    payout: Payout
): number {
    let total = 0;

    for (const ticket of hitTickets) {
        const { type, numbers } = ticket;

        // 馬券種ごとに対応する payout 配列を取得
        let list: PayoutItem[] | undefined;

        switch (type) {
            case "単勝":
                list = payout.win;
                break;
            case "複勝":
                list = payout.place;
                break;
            case "馬連":
                list = payout.quinella;
                break;
            case "ワイド":
                list = payout.wide;
                break;
            case "馬単":
                list = payout.exacta;
                break;
            case "3連複":
                list = payout.trio;
                break;
            case "3連単":
                list = payout.trifecta;
                break;
        }

        if (!list) continue;

        // 払戻金アイテムと照合
        const match = list.find((item) => {
            // 順序なし（馬連・ワイド・3連複）
            if (type === "馬連" || type === "ワイド" || type === "3連複") {
                return (
                    [...item.numbers].sort().join("-") ===
                    [...numbers].sort().join("-")
                );
            }

            // 順序あり（単勝・複勝・馬単・3連単）
            return item.numbers.join("-") === numbers.join("-");
        });

        if (match) {
            total += match.amount; // ← PayoutItem.amount を加算
        }
    }

    return total;
}