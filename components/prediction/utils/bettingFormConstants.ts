/**
 * 馬券購入フォームの型定義と定数
 * 
 * このファイルでは、馬券購入に関する型定義と定数を管理します。
 * 型を分離することで、コードの可読性と保守性が向上します。
 */

import { BetType, InputMode } from "@/types/bet";

/**
 * 利用可能な馬券の種類
 * 
 * 日本の競馬で一般的な7種類の馬券を定義しています。
 * 配列の順序は画面上のボタン表示順に対応します。
 */
export const BET_TYPES: readonly BetType[] = [
    "単勝",   // 1着を当てる
    "複勝",   // 3着以内を当てる
    "馬連",   // 2頭の着順不問（組み合わせ）
    "馬単",   // 2頭の着順を当てる
    "ワイド", // 3着以内に入る2頭を当てる
    "3連複", // 3頭の着順不問（組み合わせ）
    "3連単", // 3頭の着順を当てる
] as const;

/**
 * 各馬券タイプで利用可能な入力方式
 * 
 * - null: 通常選択（単勝・複勝・通常買い）
 * - box: ボックス（全組み合わせ）
 * - nagashi: 軸流し
 * - formation: フォーメーション
 * 
 * 単勝・複勝は通常選択のみ、それ以外は3つの方式が選択可能です。
 */
export const AVAILABLE_MODES: Record<BetType, readonly (InputMode | null)[]> = {
    "単勝": [null],
    "複勝": [null],
    "馬連": ["box", "nagashi", "formation"],
    "馬単": ["box", "nagashi", "formation"],
    "ワイド": ["box", "nagashi", "formation"],
    "3連複": ["box", "nagashi", "formation"],
    "3連単": ["box", "nagashi", "formation"],
} as const;

/**
 * 入力方式の日本語ラベル
 * 
 * UIに表示する際の日本語名を定義しています。
 * null（通常）はコンポーネント側で "通常" と表示するためここには含めません。
 */
export const INPUT_MODE_LABELS: Record<Exclude<InputMode, null>, string> = {
    box: "ボックス",
    nagashi: "流し",
    formation: "フォーメーション",
} as const;

/**
 * マルチ機能が利用可能な条件
 * 
 * 馬単と3連単のフォーメーション・流しでのみマルチが利用可能です。
 * 
 * @param betType - 馬券の種類
 * @param inputMode - 入力方式
 * @returns マルチが利用可能かどうか
 */
export function isMultiAvailable(betType: BetType, inputMode: InputMode | null): boolean {
    return (
        (betType === "3連単" && (inputMode === "formation" || inputMode === "nagashi")) ||
        (betType === "馬単" && (inputMode === "formation" || inputMode === "nagashi"))
    );
}