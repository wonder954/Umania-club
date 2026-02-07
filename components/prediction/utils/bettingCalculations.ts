/**
 * 馬券点数計算ユーティリティ
 * 
 * 各種馬券の点数（組み合わせ数）を計算する関数群です。
 * 数学的な組み合わせ計算を行い、購入点数を正確に算出します。
 */

import { BetType, InputMode, Bet, TrifectaPattern } from "@/types/bet";
import { expandFormation } from "@/utils/expandFormation";
import { expandNagashi } from "@/utils/expandNagashi";

/**
 * ボックス・通常選択の点数を計算
 * 
 * 選択した馬の頭数から、組み合わせ数を計算します。
 * 
 * 計算式の説明:
 * - 単勝/複勝: n (選択した頭数そのまま)
 * - 馬連/ワイド: nC2 = n × (n-1) / 2 (2頭の組み合わせ)
 * - 馬単: nP2 = n × (n-1) (2頭の順列)
 * - 3連複: nC3 = n × (n-1) × (n-2) / 6 (3頭の組み合わせ)
 * - 3連単: nP3 = n × (n-1) × (n-2) (3頭の順列)
 * 
 * @param betType - 馬券の種類
 * @param selectedCount - 選択した馬の頭数
 * @returns 購入点数
 */
export function calculateBoxPoints(betType: BetType, selectedCount: number): number {
    const n = selectedCount;

    // 最小選択数に満たない場合は0点
    if (betType === "単勝" || betType === "複勝") {
        return n; // 1頭から購入可能
    }

    if (betType === "馬連" || betType === "ワイド") {
        // 2頭の組み合わせ (nC2)
        return n >= 2 ? (n * (n - 1)) / 2 : 0;
    }

    if (betType === "馬単") {
        // 2頭の順列 (nP2)
        return n >= 2 ? n * (n - 1) : 0;
    }

    if (betType === "3連複") {
        // 3頭の組み合わせ (nC3)
        return n >= 3 ? (n * (n - 1) * (n - 2)) / 6 : 0;
    }

    if (betType === "3連単") {
        // 3頭の順列 (nP3)
        return n >= 3 ? n * (n - 1) * (n - 2) : 0;
    }

    return 0;
}

/**
 * 3連単流しの点数を計算
 * 
 * 固定する着順と流す馬の組み合わせから点数を計算します。
 * 
 * パターン別の計算式:
 * - 1着固定 (1→◯→◯): n × (n-1) (2着・3着を流す)
 * - 2着固定 (◯→2→◯): n × (n-1) (1着・3着を流す)
 * - 3着固定 (◯→◯→3): n × (n-1) (1着・2着を流す)
 * - 1・2着固定 (1→2→◯): n (3着のみ流す)
 * - 1・3着固定 (1→◯→3): n (2着のみ流す)
 * - 2・3着固定 (◯→2→3): n (1着のみ流す)
 * 
 * @param pattern - 流しのパターン
 * @param first - 1着固定馬
 * @param second - 2着固定馬
 * @param third - 3着固定馬
 * @param wingsCount - 流す馬の頭数
 * @returns 購入点数
 */
export function calculateTrifectaNagashiPoints(
    pattern: TrifectaPattern,
    first: number | null,
    second: number | null,
    third: number | null,
    wingsCount: number
): number {
    const n = wingsCount;

    // 必須の固定馬が選択されていない場合は0点
    if (pattern === "1" && !first) return 0;
    if (pattern === "2" && !second) return 0;
    if (pattern === "3" && !third) return 0;
    if (pattern === "12" && (!first || !second)) return 0;
    if (pattern === "13" && (!first || !third)) return 0;
    if (pattern === "23" && (!second || !third)) return 0;

    // 流す馬がいない場合は0点
    if (n === 0) return 0;

    switch (pattern) {
        case "1": // 1着固定
        case "2": // 2着固定
        case "3": // 3着固定
            // 残り2つの着順に流す: n × (n-1)
            return n * (n - 1);

        case "12": // 1・2着固定
        case "13": // 1・3着固定
        case "23": // 2・3着固定
            // 残り1つの着順に流す: n
            return n;

        default:
            return 0;
    }
}

/**
 * 現在の入力状態から購入点数を計算
 * 
 * 入力方式に応じて適切な計算方法を選択します。
 * フォーメーションと流しは実際に展開して点数を数えます。
 * 
 * @param betType - 馬券の種類
 * @param inputMode - 入力方式
 * @param state - 入力状態
 * @returns 購入点数
 */
export function calculateCurrentPoints(
    betType: BetType,
    inputMode: InputMode,
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
    // ボックス・通常選択の場合
    if (inputMode === "box" || inputMode === "normal") {
        return calculateBoxPoints(betType, state.boxSelected.length);
    }

    // フォーメーション・流しは実際に展開して点数を数える
    // 一時的なBetオブジェクトを作成して展開関数に渡す
    const tempBet: Bet = {
        id: "temp",
        type: betType,
        mode: inputMode,
        isMulti: state.isMulti,
        points: 0,
        numbers: [],
    };

    // フォーメーションの場合
    if (inputMode === "formation") {
        tempBet.formation = state.formation;
        return expandFormation(tempBet).length;
    }

    // 流しの場合
    if (inputMode === "nagashi") {
        if (betType === "3連単") {
            // 3連単流し専用の処理
            tempBet.trifectaNagashi = state.trifectaNagashi;
        } else {
            // 通常の流し
            tempBet.axis = state.axis;
            tempBet.wings = state.wings;
        }
        return expandNagashi(tempBet).length;
    }

    return 0;
}