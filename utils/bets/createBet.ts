/**
 * 馬券オブジェクト作成ユーティリティ（統合版）
 *
 * 役割：
 * - 入力状態から Bet オブジェクトを生成する
 * - 点数計算は bettingCalculations.ts に委譲する
 */

import { Bet } from "@/types/bet";
import { expandFormation } from "@/utils/expandFormation";
import { expandNagashi } from "@/utils/expandNagashi";
import { BettingInputState } from "@/components/prediction/hooks/useBettingInput";
import { calculatePointsForBet } from "@/utils/bets/bettingCalculations";

/* -------------------------------------------------------
 * ユニークID生成
 * ----------------------------------------------------- */
function generateBetId(): string {
    return Math.random().toString(36).substr(2, 9);
}

/* -------------------------------------------------------
 * 配列コピー（安全版）
 * ----------------------------------------------------- */
function safeArrayCopy<T>(arr: T[] | undefined | null): T[] {
    return arr ? [...arr] : [];
}

/* -------------------------------------------------------
 * 単勝・複勝の複数 Bet 生成
 * ----------------------------------------------------- */
export function createBetsFromInput(state: BettingInputState): Bet[] {
    if (
        state.inputMode === null &&
        (state.selectedType === "単勝" || state.selectedType === "複勝")
    ) {
        return state.boxSelected.map((number) => {
            const bet: Bet = {
                id: generateBetId(),
                type: state.selectedType,
                mode: null,
                isMulti: false,
                numbers: [number],
                points: 1, // 単勝・複勝は1点固定
            };
            return bet;
        });
    }

    // それ以外は1つの Bet を生成
    return [createBetFromInput(state)];
}

/* -------------------------------------------------------
 * メイン：入力状態から Bet を生成
 * ----------------------------------------------------- */
export function createBetFromInput(state: BettingInputState): Bet {
    const bet: Bet = {
        id: generateBetId(),
        type: state.selectedType,
        mode: state.inputMode,
        isMulti: state.isMulti,
        numbers: [],
        points: 0, // 後で計算
    };

    // 通常買い
    if (state.inputMode === null) {
        setNormalBetData(bet, state);
    }
    // ボックス
    else if (state.inputMode === "box") {
        setBoxBetData(bet, state);
    }
    // フォーメーション
    else if (state.inputMode === "formation") {
        setFormationBetData(bet, state);
    }
    // 流し
    else if (state.inputMode === "nagashi") {
        setNagashiBetData(bet, state);
    }

    // 🔥 最後に点数を一括計算（統合ポイント）
    bet.points = calculatePointsForBet(bet);

    return bet;
}

/* -------------------------------------------------------
 * 通常買い
 * ----------------------------------------------------- */
function setNormalBetData(bet: Bet, state: BettingInputState): void {
    if (bet.type === "馬単") {
        const f = state.formation.first[0];
        const s = state.formation.second[0];
        bet.numbers = f !== undefined && s !== undefined ? [f, s] : [];
        return;
    }

    if (bet.type === "3連単") {
        const f = state.formation.first[0];
        const s = state.formation.second[0];
        const t = state.formation.third[0];
        bet.numbers = f && s && t ? [f, s, t] : [];
        return;
    }

    // 単勝・複勝・馬連・ワイド・三連複
    bet.numbers = [...state.boxSelected];
}

/* -------------------------------------------------------
 * ボックス
 * ----------------------------------------------------- */
function setBoxBetData(bet: Bet, state: BettingInputState): void {
    bet.box = [...state.boxSelected];
    bet.numbers = [...state.boxSelected];
}

/* -------------------------------------------------------
 * フォーメーション
 * ----------------------------------------------------- */
function setFormationBetData(bet: Bet, state: BettingInputState): void {
    bet.formation = {
        first: safeArrayCopy(state.formation.first),
        second: safeArrayCopy(state.formation.second),
        third: safeArrayCopy(state.formation.third),
    };

    // 表示用に使用馬番号一覧を保存
    const all = [
        ...state.formation.first,
        ...state.formation.second,
        ...state.formation.third,
    ];
    bet.numbers = Array.from(new Set(all)).sort((a, b) => a - b);
}

/* -------------------------------------------------------
 * 流し
 * ----------------------------------------------------- */
function setNagashiBetData(bet: Bet, state: BettingInputState): void {
    if (state.selectedType === "3連単") {
        bet.trifectaNagashi = {
            pattern: state.trifectaNagashi.pattern,
            first: state.trifectaNagashi.first,
            second: state.trifectaNagashi.second,
            third: state.trifectaNagashi.third,
            wings: safeArrayCopy(state.trifectaNagashi.wings),
        };
    } else {
        bet.axis = safeArrayCopy(state.axis);
        bet.wings = safeArrayCopy(state.wings);
    }

    // numbers は展開後の代表値ではなく、使用馬一覧にする
    const all = [
        ...(bet.axis ?? []),
        ...(bet.wings ?? []),
        ...(bet.trifectaNagashi?.wings ?? []),
    ];
    bet.numbers = Array.from(new Set(all)).sort((a, b) => a - b);
}

/* -------------------------------------------------------
 * Bet の有効性チェック
 * ----------------------------------------------------- */
export function isBetValid(bet: Bet): boolean {
    return bet.points > 0;
}