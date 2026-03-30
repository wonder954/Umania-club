/**
 * 馬券点数計算ユーティリティ（統合版）
 *
 * - BOX（nC2, nC3, nP2, nP3）
 * - 通常買い（単勝/複勝/馬連/ワイド/馬単/三連単/三連複）
 * - フォーメーション（展開して数える）
 * - 流し（展開して数える）
 * - 3連単流し（パターン別）
 *
 * プレビュー（calculatePointsFromState）と
 * 保存時（calculatePointsForBet）の両方をここで一元管理する。
 */

import { Bet, BetType, InputMode, TrifectaPattern } from "@/types/bet";
import { expandFormation } from "@/utils/expandFormation";
import { expandNagashi } from "@/utils/expandNagashi";

/* -------------------------------------------------------
 * ① BOX の純粋計算（nC2 / nC3 / nP2 / nP3）
 * ----------------------------------------------------- */
export function calculateBoxPointsPure(type: BetType, n: number): number {
    if (type === "馬連" || type === "ワイド") {
        return n >= 2 ? (n * (n - 1)) / 2 : 0; // nC2
    }
    if (type === "馬単") {
        return n >= 2 ? n * (n - 1) : 0; // nP2
    }
    if (type === "3連複") {
        return n >= 3 ? (n * (n - 1) * (n - 2)) / 6 : 0; // nC3
    }
    if (type === "3連単") {
        return n >= 3 ? n * (n - 1) * (n - 2) : 0; // nP3
    }
    return n; // 単勝・複勝
}

/* -------------------------------------------------------
 * ② 通常買い（1点買い）の点数計算
 * ----------------------------------------------------- */
export function calculateNormalPoints(
    type: BetType,
    selectedCount: number,
    formation?: { first: number[]; second: number[]; third: number[] }
): number {
    if (type === "単勝" || type === "複勝") {
        return selectedCount;
    }

    if (type === "馬単") {
        if (formation?.first.length !== 1 || formation?.second.length !== 1) return 0;
        if (formation.first[0] === formation.second[0]) return 0;
        return 1;
    }

    if (type === "3連単") {
        if (
            formation?.first.length !== 1 ||
            formation?.second.length !== 1 ||
            formation?.third.length !== 1
        ) return 0;

        const nums = [formation.first[0], formation.second[0], formation.third[0]];
        if (new Set(nums).size !== 3) return 0;
        return 1;
    }

    if (type === "馬連" || type === "ワイド") {
        return selectedCount === 2 ? 1 : 0;
    }

    if (type === "3連複") {
        return selectedCount === 3 ? 1 : 0;
    }

    return 0;
}

/* -------------------------------------------------------
 * ③ 3連単流しの点数計算（パターン別）
 * ----------------------------------------------------- */
export function calculateTrifectaNagashiPoints(
    pattern: TrifectaPattern,
    first: number | null,
    second: number | null,
    third: number | null,
    wingsCount: number
): number {
    const n = wingsCount;

    if (pattern === "1" && !first) return 0;
    if (pattern === "2" && !second) return 0;
    if (pattern === "3" && !third) return 0;
    if (pattern === "12" && (!first || !second)) return 0;
    if (pattern === "13" && (!first || !third)) return 0;
    if (pattern === "23" && (!second || !third)) return 0;

    if (n === 0) return 0;

    switch (pattern) {
        case "1":
        case "2":
        case "3":
            return n * (n - 1); // 2着・3着を流す
        case "12":
        case "13":
        case "23":
            return n; // 残り1着を流す
        default:
            return 0;
    }
}

/* -------------------------------------------------------
 * ④ プレビュー用：state から点数を計算
 * ----------------------------------------------------- */
export function calculatePointsFromState(
    type: BetType,
    mode: InputMode | null,
    state: {
        boxSelected: number[];
        formation: { first: number[]; second: number[]; third: number[] };
        axis: number[];
        wings: number[];
        trifectaNagashi: {
            pattern: TrifectaPattern;
            first: number | null;
            second: number | null;
            third: number | null;
            wings: number[];
        };
        isMulti: boolean;
    }
): number {
    if (mode === null) {
        if (type === "馬単" || type === "3連単") {
            return calculateNormalPoints(type, 0, state.formation);
        }
        return calculateNormalPoints(type, state.boxSelected.length);
    }

    if (mode === "box") {
        return calculateBoxPointsPure(type, state.boxSelected.length);
    }

    const tempBet: Bet = {
        id: "temp",
        type,
        mode,
        isMulti: state.isMulti,
        points: 0,
        numbers: [],
    };

    if (mode === "formation") {
        tempBet.formation = state.formation;
        return expandFormation(tempBet).length;
    }

    if (mode === "nagashi") {
        if (type === "3連単") {
            tempBet.trifectaNagashi = state.trifectaNagashi;
        } else {
            tempBet.axis = state.axis;
            tempBet.wings = state.wings;
        }
        return expandNagashi(tempBet).length;
    }

    return 0;
}

/* -------------------------------------------------------
 * ⑤ 保存用：Bet から点数を計算
 * ----------------------------------------------------- */
export function calculatePointsForBet(bet: Bet): number {
    if (bet.mode === "box") {
        return calculateBoxPointsPure(bet.type, bet.numbers.length);
    }

    if (bet.mode === "formation") {
        return expandFormation(bet).length;
    }

    if (bet.mode === "nagashi") {
        return expandNagashi(bet).length;
    }

    // 通常買い
    return calculateNormalPoints(
        bet.type,
        bet.numbers.length,
        bet.formation
    );
}