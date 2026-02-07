/**
 * 馬券オブジェクト作成ユーティリティ
 * 
 * 入力状態から実際のBetオブジェクトを生成する関数群です。
 * 各入力方式に応じて適切な形式のBetオブジェクトを作成します。
 */

import { Bet, BetType, InputMode } from "@/types/bet";
import { expandFormation } from "@/utils/expandFormation";
import { expandNagashi } from "@/utils/expandNagashi";
import { BettingInputState } from "../hooks/useBettingInput";

/**
 * ユニークなIDを生成
 * 
 * ランダムな文字列を生成して馬券のIDとして使用します。
 * Math.random()を使用した簡易的な実装です。
 * 
 * @returns ユニークなID文字列
 */
function generateBetId(): string {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * 配列を安全にコピー
 * 
 * undefined や null の場合は空配列を返します。
 * 
 * @param arr - コピーする配列
 * @returns コピーされた配列
 */
function safeArrayCopy<T>(arr: T[] | undefined | null): T[] {
    return arr ? [...arr] : [];
}

/**
 * 入力状態から新しい馬券オブジェクトを作成（複数対応）
 * 
 * 単勝・複勝の通常買いの場合、選択した馬ごとに別々のBetを生成します。
 * それ以外の場合は、従来通り1つのBetを生成します。
 * 
 * @param state - 現在の入力状態
 * @returns 作成されたBetオブジェクトの配列
 */
export function createBetsFromInput(state: BettingInputState): Bet[] {
    // 単勝・複勝の通常買い → 複数Bet生成
    if (state.inputMode === null &&
        (state.selectedType === "単勝" || state.selectedType === "複勝")) {
        return state.boxSelected.map(number => ({
            id: generateBetId(),
            type: state.selectedType,
            mode: null,
            points: 1,
            numbers: [number],
            isMulti: false,
        }));
    }

    // それ以外は従来通り1つ
    return [createBetFromInput(state)];
}

/**
 * 通常買いの馬券データを設定
 * 
 * - 馬単・三連単: formation から順番通りに numbers を設定（重複チェックあり）
 * - その他: boxSelected から numbers を設定
 * 
 * @param bet - 設定先のBetオブジェクト
 * @param state - 入力状態
 */
function setNormalBetData(bet: Bet, state: BettingInputState): void {
    // 馬単: 1着→2着の順番 + 重複チェック
    if (bet.type === "馬単") {
        const first = state.formation.first[0];
        const second = state.formation.second[0];

        if (first !== undefined && second !== undefined) {
            // 重複チェック（例: 4-4 は無効）
            if (first === second) {
                bet.numbers = [];
                bet.points = 0;
            } else {
                bet.numbers = [first, second];
                bet.points = 1;
            }
        } else {
            bet.numbers = [];
            bet.points = 0;
        }
        return;
    }

    // 三連単: 1着→2着→3着の順番 + 重複チェック
    if (bet.type === "3連単") {
        const first = state.formation.first[0];
        const second = state.formation.second[0];
        const third = state.formation.third[0];

        if (first !== undefined && second !== undefined && third !== undefined) {
            // 重複チェック（例: 4-4-4, 4-4-5 などは無効）
            const numbers = [first, second, third];
            const uniqueNumbers = new Set(numbers);

            if (uniqueNumbers.size === 3) {
                bet.numbers = numbers;
                bet.points = 1;
            } else {
                bet.numbers = [];
                bet.points = 0;
            }
        } else {
            bet.numbers = [];
            bet.points = 0;
        }
        return;
    }

    // その他（馬連・ワイド・三連複、または単勝・複勝）
    bet.numbers = [...state.boxSelected];
    bet.points = 1;
}

/**
 * 入力状態から新しい馬券オブジェクトを作成
 * 
 * この関数は以下の処理を行います:
 * 1. 基本的なBetオブジェクトを作成
 * 2. 入力方式に応じたデータを設定
 * 3. 組み合わせを展開して点数を計算
 * 4. 馬番号リストを設定
 * 
 * @param state - 現在の入力状態
 * @returns 作成されたBetオブジェクト
 */
export function createBetFromInput(state: BettingInputState): Bet {
    // 基本的なBetオブジェクトを作成
    const newBet: Bet = {
        id: generateBetId(),
        type: state.selectedType,
        mode: state.inputMode,  // null を許容
        isMulti: state.isMulti,
        points: 0,
        numbers: [],
    };

    // 通常買いの場合
    if (state.inputMode === null) {
        setNormalBetData(newBet, state);
    }
    // 入力方式に応じてデータを設定
    else if (state.inputMode === "box") {
        // ボックス・通常選択の場合
        setBoxBetData(newBet, state);
    } else if (state.inputMode === "formation") {
        // フォーメーションの場合
        setFormationBetData(newBet, state);
    } else if (state.inputMode === "nagashi") {
        // 流しの場合
        setNagashiBetData(newBet, state);
    }

    return newBet;
}

/**
 * ボックス・通常選択の馬券データを設定
 * 
 * 選択した馬番号をそのまま保存します。
 * 点数は選択した頭数と同じになります。
 * 
 * @param bet - 設定先のBetオブジェクト
 * @param state - 入力状態
 */
function setBoxBetData(bet: Bet, state: BettingInputState): void {
    bet.box = safeArrayCopy(state.boxSelected);
    bet.numbers = safeArrayCopy(state.boxSelected);
    bet.points = state.boxSelected.length;
}

/**
 * フォーメーションの馬券データを設定
 * 
 * 1着・2着・3着の候補をそれぞれ保存し、
 * 実際の組み合わせを展開して点数を計算します。
 * 
 * 例: 1着候補[1,2]、2着候補[3,4]、3着候補[5,6]
 * → 展開すると 1-3-5, 1-3-6, 1-4-5, 1-4-6, 2-3-5, 2-3-6, 2-4-5, 2-4-6 の8点
 * 
 * @param bet - 設定先のBetオブジェクト
 * @param state - 入力状態
 */
function setFormationBetData(bet: Bet, state: BettingInputState): void {
    // フォーメーションデータを保存
    bet.formation = {
        first: safeArrayCopy(state.formation.first),
        second: safeArrayCopy(state.formation.second),
        third: safeArrayCopy(state.formation.third),
    };

    // 組み合わせを展開
    const expanded = expandFormation(bet);
    bet.points = expanded.length;

    // 最初の組み合わせをnumbersに設定（表示用）
    // すべての組み合わせは展開関数で生成されるため、ここでは代表的な1つを保存
    bet.numbers = expanded[0] ?? [];

    // 使用している馬番号の一覧を保存（重複なし）
    const allNumbers = [
        ...state.formation.first,
        ...state.formation.second,
        ...(state.formation.third ?? []),
    ];
    bet.numbers = Array.from(new Set(allNumbers)).sort((a, b) => a - b);
}

/**
 * 流しの馬券データを設定
 * 
 * 3連単流しと通常の流しで処理を分岐します。
 * 組み合わせを展開して実際の点数を計算します。
 * 
 * 例（馬連流し）: 軸[1]、相手[2,3,4]
 * → 展開すると 1-2, 1-3, 1-4 の3点
 * 
 * @param bet - 設定先のBetオブジェクト
 * @param state - 入力状態
 */
function setNagashiBetData(bet: Bet, state: BettingInputState): void {
    if (state.selectedType === "3連単") {
        // 3連単流しの場合
        bet.trifectaNagashi = {
            pattern: state.trifectaNagashi.pattern,
            first: state.trifectaNagashi.first,
            second: state.trifectaNagashi.second,
            third: state.trifectaNagashi.third,
            wings: safeArrayCopy(state.trifectaNagashi.wings),
        };
    } else {
        // 通常の流しの場合（馬連、馬単、ワイド、3連複）
        bet.axis = safeArrayCopy(state.axis);
        bet.wings = safeArrayCopy(state.wings);
    }

    // 組み合わせを展開
    const expanded = expandNagashi(bet);
    bet.points = expanded.length;

    // 最初の組み合わせをnumbersに設定
    bet.numbers = expanded[0] ?? [];
}

/**
 * 馬券が有効かどうかを検証
 * 
 * 点数が0の場合は無効な馬券とみなします。
 * これは以下の場合に発生します:
 * - 馬が選択されていない
 * - 選択数が馬券タイプの最小要求数に満たない
 * - 流しで軸や相手が選択されていない
 * 
 * @param bet - 検証するBetオブジェクト
 * @returns 有効な馬券かどうか
 */
export function isBetValid(bet: Bet): boolean {
    return bet.points > 0;
}