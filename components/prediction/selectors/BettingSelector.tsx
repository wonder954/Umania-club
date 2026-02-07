/**
 * 馬券入力セレクター統合コンポーネント
 * 
 * 馬券タイプと入力方式に応じて、適切な入力UIを表示します。
 * このコンポーネントが各種セレクター(BoxSelector, FormationSelector等)を
 * 条件に応じて切り替える責務を担います。
 */

import React from "react";
import { BetType, InputMode, NagashiSelectorValue } from "@/types/bet";
import { Horse } from "@/types/horse";
import BoxSelector from "./BoxSelector";
import FormationSelector from "./FormationSelector";
import TrifectaNagashiSelector from "./TrifectaNagashiSelector";
import UmatanSelector from "./UmatanSelector";
import UmarenSelector from "./UmarenSelector";
import SanrenpukuSelector from "./SanrenpukuSelector";
import { BettingInputState } from "../hooks/useBettingInput";

interface BettingSelectorProps {
    /** 馬券タイプ */
    betType: BetType;
    /** 入力方式 */
    inputMode: InputMode;
    /** 馬のリスト */
    horses: Horse[];
    /** 購入可能な馬番号のリスト（nullの場合は全馬購入可能） */
    allowedNumbers?: number[];
    /** 現在の入力状態 */
    state: BettingInputState;
    /** ボックス選択が変更されたときのコールバック */
    onBoxChange: (selected: number[]) => void;
    /** フォーメーションが変更されたときのコールバック */
    onFormationChange: (formation: {
        first: number[];
        second: number[];
        third: number[];
    }) => void;
    /** 流し（通常）が変更されたときのコールバック */
    onNagashiChange: (value: NagashiSelectorValue) => void;
    /** 3連単流しが変更されたときのコールバック */
    onTrifectaNagashiChange: (value: {
        pattern: "1" | "2" | "3" | "12" | "13" | "23";
        first: number | null;
        second: number | null;
        third: number | null;
        wings: number[];
    }) => void;
}

/**
 * 馬券入力セレクター統合コンポーネント
 * 
 * 処理の流れ:
 * 1. inputModeで大きく分岐（box/normal, nagashi, formation）
 * 2. nagashiの場合はbetTypeでさらに分岐
 * 3. 該当するセレクターコンポーネントをレンダリング
 * 
 * この設計により:
 * - 親コンポーネント(BettingForm)は条件分岐を気にしなくて良い
 * - 新しいセレクターの追加が容易
 * - テストが書きやすい
 */
export function BettingSelector({
    betType,
    inputMode,
    horses,
    allowedNumbers,
    state,
    onBoxChange,
    onFormationChange,
    onNagashiChange,
    onTrifectaNagashiChange,
}: BettingSelectorProps) {
    // ボックス・通常選択の場合
    if (inputMode === "box" || inputMode === "normal") {
        return (
            <BoxSelector
                horses={horses.map((h) => ({ number: h.number, name: h.name }))}
                selected={state.boxSelected}
                onChange={onBoxChange}
                allowedNumbers={allowedNumbers}
            />
        );
    }

    // フォーメーションの場合
    if (inputMode === "formation") {
        return (
            <FormationSelector
                horses={horses}
                formation={state.formation}
                onChange={onFormationChange}
                allowedNumbers={allowedNumbers}
                selectedType={betType}
            />
        );
    }

    // 流しの場合 - 馬券タイプごとに適切なセレクターを表示
    if (inputMode === "nagashi") {
        return renderNagashiSelector(
            betType,
            horses,
            allowedNumbers,
            onNagashiChange,
            onTrifectaNagashiChange
        );
    }

    // 想定外の入力方式の場合は何も表示しない
    return null;
}

/**
 * 流しセレクターをレンダリング
 * 
 * 馬券タイプに応じて適切な流しセレクターを返します。
 * 
 * @param betType - 馬券タイプ
 * @param horses - 馬のリスト
 * @param allowedNumbers - 購入可能な馬番号
 * @param onNagashiChange - 通常の流し変更コールバック
 * @param onTrifectaNagashiChange - 3連単流し変更コールバック
 */
function renderNagashiSelector(
    betType: BetType,
    horses: Horse[],
    allowedNumbers: number[] | undefined,
    onNagashiChange: (value: NagashiSelectorValue) => void,
    onTrifectaNagashiChange: (value: {
        pattern: "1" | "2" | "3" | "12" | "13" | "23";
        first: number | null;
        second: number | null;
        third: number | null;
        wings: number[];
    }) => void
): React.ReactNode {
    // 馬券タイプとセレクターのマッピング
    const selectorMap: Record<BetType, React.ReactNode> = {
        // 馬単: 1頭を軸にして他の馬に流す
        馬単: (
            <UmatanSelector
                horses={horses}
                allowedNumbers={allowedNumbers ?? []}
                onChange={onNagashiChange}
            />
        ),

        // 馬連: 1頭を軸にして他の馬に流す（着順不問）
        馬連: (
            <UmarenSelector
                horses={horses}
                allowedNumbers={allowedNumbers ?? []}
                onChange={onNagashiChange}
            />
        ),

        // ワイド: 馬連と同じセレクターを使用
        ワイド: (
            <UmarenSelector
                horses={horses}
                allowedNumbers={allowedNumbers ?? []}
                onChange={onNagashiChange}
            />
        ),

        // 3連複: 複数頭を軸にして他の馬に流す
        "3連複": (
            <SanrenpukuSelector
                horses={horses}
                allowedNumbers={allowedNumbers ?? []}
                onChange={onNagashiChange}
            />
        ),

        // 3連単: 専用の流しセレクター（1着固定、2着固定など複数パターン対応）
        "3連単": (
            <TrifectaNagashiSelector
                horses={horses}
                allowedNumbers={allowedNumbers ?? []}
                onChange={onTrifectaNagashiChange}
            />
        ),

        // 単勝・複勝: 流しは使用しない
        単勝: null,
        複勝: null,
    };

    return selectorMap[betType];
}