import { expandTickets } from "./expand";
import { isHitSingleTicket } from "./hit";
import { calculatePayout } from "./payout";
import type { Bet } from "@/types/bet";
import type { RaceResult } from "@/types/race";

export function judgeHit(bet: Bet, result: RaceResult) {
    // 着順を馬番だけの配列に変換
    const order = result.order.map(o => o.number);

    // 買い目を1点ずつ展開（単勝・馬連・フォーメーションなど全対応）
    const tickets = expandTickets(bet);

    // 当たり券だけ抽出
    const hitTickets = tickets.filter(t =>
        isHitSingleTicket(t.type, t.numbers, order)
    );

    // 不的中
    if (hitTickets.length === 0) {
        return {
            isHit: false,
            hitTickets: [],
            payout: 0,
            totalPoints: bet.points ?? 0
        };
    }

    // 払戻金計算
    const payout = calculatePayout(hitTickets, result.payout);

    return {
        isHit: true,
        hitTickets,
        payout,
        totalPoints: bet.points ?? 0
    };
}