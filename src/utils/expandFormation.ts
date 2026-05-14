// utils/expandFormation.ts

export type Formation = {
    first: number[];
    second: number[];
    third?: number[];
};

export type FormationBet = {
    type: string;
    mode: string | null;  // null を許容
    isMulti?: boolean;
    formation?: Formation;
};

/**
 * 2頭の券が有効かチェック(同じ馬がいないか)
 */
function isValidTicket2(a: number, b: number): boolean {
    return a !== b;
}

/**
 * 3頭の券が有効かチェック(同じ馬がいないか)
 */
function isValidTicket3(a: number, b: number, c: number): boolean {
    return a !== b && b !== c && a !== c;
}

/**
 * 配列を文字列キーに変換して一意化
 */
function uniqueByKey(tickets: number[][]): number[][] {
    const seen = new Set<string>();
    const result: number[][] = [];

    for (const ticket of tickets) {
        const key = ticket.join('-');
        if (!seen.has(key)) {
            seen.add(key);
            result.push(ticket);
        }
    }

    return result;
}

export function expandFormation(bet: FormationBet): number[][] {
    if (!bet.formation) return [];

    const { type, formation, isMulti } = bet;
    const { first, second, third } = formation;

    // フォーメーション対象外の買い方は即 return []
    if (!["馬連", "馬単", "ワイド", "3連複", "3連単"].includes(type)) {
        return [];
    }

    // -------------------------
    // 3連単フォーメーション
    // -------------------------
    if (type === "3連単") {
        if (!first.length || !second.length || !third?.length) return [];

        const result: number[][] = [];

        for (const f of first) {
            for (const s of second) {
                for (const t of third) {
                    // ★ 重複チェック
                    if (isValidTicket3(f, s, t)) {
                        result.push([f, s, t]);
                    }
                }
            }
        }

        // マルチの場合は全順列を追加
        if (isMulti) {
            const allPermutations: number[][] = [];
            for (const [a, b, c] of result) {
                allPermutations.push([a, b, c]);
                allPermutations.push([a, c, b]);
                allPermutations.push([b, a, c]);
                allPermutations.push([b, c, a]);
                allPermutations.push([c, a, b]);
                allPermutations.push([c, b, a]);
            }
            return uniqueByKey(allPermutations);
        }

        return result;
    }

    // -------------------------
    // 3連複フォーメーション
    // -------------------------
    if (type === "3連複") {
        if (!first.length || !second.length || !third?.length) return [];

        const result: number[][] = [];

        for (const f of first) {
            for (const s of second) {
                for (const t of third) {
                    // ★ 重複チェック
                    if (isValidTicket3(f, s, t)) {
                        const combo = [f, s, t].sort((a, b) => a - b);
                        result.push(combo);
                    }
                }
            }
        }

        return uniqueByKey(result);
    }

    // -------------------------
    // 馬単フォーメーション
    // -------------------------
    if (type === "馬単") {
        if (!first.length || !second.length) return [];

        const result: number[][] = [];

        for (const f of first) {
            for (const s of second) {
                // ★ 重複チェック
                if (isValidTicket2(f, s)) {
                    result.push([f, s]);
                }
            }
        }

        // マルチの場合は逆転も追加
        if (isMulti) {
            const allPermutations: number[][] = [];
            for (const [a, b] of result) {
                allPermutations.push([a, b]);
                allPermutations.push([b, a]);
            }
            return uniqueByKey(allPermutations);
        }

        return result;
    }

    // -------------------------
    // 馬連フォーメーション
    // -------------------------
    if (type === "馬連") {
        if (!first.length || !second.length) return [];

        const result: number[][] = [];

        for (const f of first) {
            for (const s of second) {
                // ★ 重複チェック
                if (isValidTicket2(f, s)) {
                    const combo = [f, s].sort((a, b) => a - b);
                    result.push(combo);
                }
            }
        }

        return uniqueByKey(result);
    }

    // -------------------------
    // ワイドフォーメーション
    // -------------------------
    if (type === "ワイド") {
        if (!first.length || !second.length) return [];

        const result: number[][] = [];

        for (const f of first) {
            for (const s of second) {
                // ★ 重複チェック
                if (isValidTicket2(f, s)) {
                    const combo = [f, s].sort((a, b) => a - b);
                    result.push(combo);
                }
            }
        }

        return uniqueByKey(result);
    }

    return [];
}