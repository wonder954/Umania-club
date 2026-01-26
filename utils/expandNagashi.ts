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

export function expandNagashi(bet: NagashiBet): number[][] {
    const { type, axis = [], wings = [], isMulti, trifectaNagashi } = bet;

    // 3連単流し（特殊）
    if (type === "3連単" && trifectaNagashi) {
        const base = expandTrifectaNagashi(trifectaNagashi);
        return isMulti ? base.flatMap(perm6) : base;
    }

    // 馬連（軸1 × 相手）
    if (type === "馬連") {
        if (axis.length !== 1) return [];
        return wings.map((w) => [axis[0], w].sort((a, b) => a - b));
    }

    // 馬単（軸1 → 相手）
    if (type === "馬単") {
        if (axis.length !== 1) return [];
        const base = wings.map((w) => [axis[0], w]);
        if (!isMulti) return base;
        return [...base, ...wings.map((w) => [w, axis[0]])];
    }

    // 3連複（軸1〜2頭）
    if (type === "3連複") {
        if (axis.length === 0) return [];

        const results: number[][] = [];

        // 軸1頭 → 相手から2頭選ぶ
        if (axis.length === 1) {
            for (let i = 0; i < wings.length; i++) {
                for (let j = i + 1; j < wings.length; j++) {
                    results.push([axis[0], wings[i], wings[j]].sort((a, b) => a - b));
                }
            }
            return results;
        }

        // 軸2頭 → 相手から1頭選ぶ
        if (axis.length === 2) {
            return wings.map((w) =>
                [axis[0], axis[1], w].sort((a, b) => a - b)
            );
        }

        return [];
    }

    return [];
}