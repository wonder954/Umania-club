// utils/expandNagashi.ts

import { expandTrifectaNagashi, perm6 } from "./expandTrifectaNagashi";
import { BetType } from "@/types/bet";

export type TrifectaPattern = "1" | "2" | "3" | "12" | "13" | "23";

export type TrifectaNagashiInput = {
    pattern: TrifectaPattern;
    first: number | null;
    second: number | null;
    third: number | null;
    wings: number[];
};

export type NagashiBet = {
    type: BetType;
    axis?: number[];
    wings?: number[];
    isMulti?: boolean;
    trifectaNagashi?: TrifectaNagashiInput;
};

/**
 * 2頭の券が有効かチェック
 */
function isValidTicket2(a: number, b: number): boolean {
    return a !== b;
}

/**
 * 3頭の券が有効かチェック
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

export function expandNagashi(bet: NagashiBet): number[][] {
    const { type, axis = [], wings = [], isMulti, trifectaNagashi } = bet;

    // -------------------------
    // 3連単流し(特殊パターン)
    // -------------------------
    if (type === "3連単" && trifectaNagashi) {
        const base = expandTrifectaNagashi(trifectaNagashi);

        if (!isMulti) return base;

        // マルチの場合は全順列を追加
        const allPermutations = base.flatMap(perm6);
        return uniqueByKey(allPermutations);
    }

    // -------------------------
    // 馬連流し
    // -------------------------
    if (type === "馬連") {
        if (axis.length !== 1 || wings.length === 0) return [];

        const result: number[][] = [];

        for (const w of wings) {
            // ★ 重複チェック
            if (isValidTicket2(axis[0], w)) {
                const combo = [axis[0], w].sort((a, b) => a - b);
                result.push(combo);
            }
        }

        return uniqueByKey(result);
    }

    // -------------------------
    // ワイド流し
    // -------------------------
    if (type === "ワイド") {
        if (axis.length !== 1 || wings.length === 0) return [];

        const result: number[][] = [];

        for (const w of wings) {
            // ★ 重複チェック
            if (isValidTicket2(axis[0], w)) {
                const combo = [axis[0], w].sort((a, b) => a - b);
                result.push(combo);
            }
        }

        return uniqueByKey(result);
    }

    // -------------------------
    // 馬単流し
    // -------------------------
    if (type === "馬単") {
        if (axis.length !== 1 || wings.length === 0) return [];

        const result: number[][] = [];

        for (const w of wings) {
            // ★ 重複チェック
            if (isValidTicket2(axis[0], w)) {
                result.push([axis[0], w]);
            }
        }

        if (!isMulti) return result;

        // マルチの場合は逆転も追加
        const allPermutations: number[][] = [];
        for (const [a, b] of result) {
            allPermutations.push([a, b]);
            allPermutations.push([b, a]);
        }

        return uniqueByKey(allPermutations);
    }

    // -------------------------
    // 3連複流し
    // -------------------------
    if (type === "3連複") {
        if (axis.length === 0 || wings.length === 0) return [];

        const result: number[][] = [];

        // 軸1頭 → 相手から2頭選ぶ
        if (axis.length === 1) {
            for (let i = 0; i < wings.length; i++) {
                for (let j = i + 1; j < wings.length; j++) {
                    const a = axis[0];
                    const b = wings[i];
                    const c = wings[j];

                    // ★ 重複チェック
                    if (isValidTicket3(a, b, c)) {
                        const combo = [a, b, c].sort((a, b) => a - b);
                        result.push(combo);
                    }
                }
            }
            return uniqueByKey(result);
        }

        // 軸2頭 → 相手から1頭選ぶ
        if (axis.length === 2) {
            for (const w of wings) {
                const a = axis[0];
                const b = axis[1];
                const c = w;

                // ★ 重複チェック
                if (isValidTicket3(a, b, c)) {
                    const combo = [a, b, c].sort((a, b) => a - b);
                    result.push(combo);
                }
            }
            return uniqueByKey(result);
        }

        return [];
    }

    return [];
}