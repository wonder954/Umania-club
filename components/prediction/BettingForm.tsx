"use client";

/**
 * 馬券購入フォームコンポーネント（リファクタリング版）
 * 
 * このコンポーネントは競馬の馬券を作成・管理するためのUIを提供します。
 * 
 * 主な機能:
 * 1. 7種類の馬券タイプ選択（単勝、複勝、馬連、馬単、ワイド、3連複、3連単）
 * 2. 3種類の入力方式（ボックス、フォーメーション、流し）
 * 3. マルチ馬券の作成
 * 4. 購入点数の自動計算
 * 5. 馬券の追加・削除
 * 
 * リファクタリングのポイント:
 * - 責務を明確に分離（状態管理、計算、UI）
 * - カスタムフックで状態管理をカプセル化
 * - 計算ロジックを純粋関数として分離
 * - UIコンポーネントを小さく分割
 * - 型安全性の向上
 * - テスト容易性の向上
 */

import React, { useMemo } from "react";
import { Bet } from "@/types/bet";
import { Horse } from "@/types/horse";

// 状態管理フック
import { useBettingInput } from "@/components/prediction/hooks/useBettingInput";

// 定数
import { AVAILABLE_MODES, isMultiAvailable } from "@/components/prediction/utils/bettingFormConstants";

// 計算ロジック
import { calculateCurrentPoints } from "@/components/prediction/utils/bettingCalculations";

// 馬券作成ロジック
import { createBetFromInput, isBetValid } from "@/components/prediction/utils/createBet";

// UIコンポーネント
import {
    BetTypeSelector,
    InputModeSelector,
    MultiCheckbox,
    PointsDisplay,
} from "@/components/prediction/components/BettingFormComponents";
import { BettingSelector } from "@/components/prediction/selectors/BettingSelector";
import { BetList } from "@/components/prediction/components/BetList";

/**
 * コンポーネントのProps
 */
interface BettingFormProps {
    /** 出走馬のリスト */
    horses: { number?: number | string; name: string }[];
    /** 現在追加されている馬券のリスト */
    bets: Bet[];
    /** 馬券リストが変更されたときのコールバック */
    onChange: (bets: Bet[]) => void;
    /** 購入可能な馬番号のリスト（省略時は全馬購入可能） */
    allowedNumbers?: number[];
}

/**
 * 馬券購入フォームコンポーネント
 * 
 * 使用例:
 * ```tsx
 * <BettingForm
 *   horses={raceHorses}
 *   bets={currentBets}
 *   onChange={setBets}
 *   allowedNumbers={[1, 2, 3, 4, 5]}
 * />
 * ```
 */
export default function BettingForm({
    horses,
    bets,
    onChange,
    allowedNumbers,
}: BettingFormProps) {
    // ========================================
    // 状態管理
    // ========================================

    // 馬券入力状態を管理するカスタムフック
    const { state, actions } = useBettingInput();

    // ========================================
    // データの正規化
    // ========================================

    /**
     * 馬のリストを正規化
     * 
     * horses propsはnumber?型を持つため、確実にnumber型に変換します。
     * これにより、各セレクターコンポーネントで型の不一致エラーを防ぎます。
     */
    const normalizedHorses: Horse[] = useMemo(() => {
        return horses.map((h) => ({
            number: Number(h.number),
            name: h.name,
        }));
    }, [horses]);

    // ========================================
    // 点数計算
    // ========================================

    /**
     * 現在の入力状態から購入点数を計算
     * 
     * useMemoで最適化し、依存する値が変更された時のみ再計算します。
     * これにより、不要な再レンダリングを防ぎます。
     */
    const calculatedPoints = useMemo(() => {
        return calculateCurrentPoints(state.selectedType, state.inputMode, state);
    }, [
        state.selectedType,
        state.inputMode,
        state.boxSelected,
        state.formation,
        state.axis,
        state.wings,
        state.trifectaNagashi,
        state.isMulti,
    ]);

    // ========================================
    // イベントハンドラー
    // ========================================

    /**
     * 馬券を追加
     * 
     * 処理の流れ:
     * 1. 点数が0の場合は何もしない（バリデーション）
     * 2. 現在の入力状態からBetオブジェクトを作成
     * 3. 馬券リストに追加
     * 4. 入力フォームをリセット
     */
    const handleAddBet = () => {
        // バリデーション: 点数が0の場合は追加しない
        if (calculatedPoints === 0) {
            return;
        }

        // 入力状態からBetオブジェクトを作成
        const newBet = createBetFromInput(state);

        // 念のため、作成された馬券が有効かチェック
        if (!isBetValid(newBet)) {
            console.warn("無効な馬券が作成されました", newBet);
            return;
        }

        // 馬券リストに追加
        onChange([...bets, newBet]);

        // 入力フォームをリセット
        // 馬券タイプと入力方式は保持されます
        actions.resetInput();
    };

    /**
     * 馬券を削除
     * 
     * @param id - 削除する馬券のID
     */
    const handleRemoveBet = (id: string) => {
        onChange(bets.filter((bet) => bet.id !== id));
    };

    // ========================================
    // 条件判定
    // ========================================

    // 現在の設定でマルチが利用可能かどうか
    const multiAvailable = isMultiAvailable(state.selectedType, state.inputMode);

    // 現在選択されている馬券タイプで利用可能な入力方式
    const availableModes = AVAILABLE_MODES[state.selectedType];

    // ========================================
    // レンダリング
    // ========================================

    return (
        <div className="space-y-4">
            {/* ========================================
                馬券追加フォーム
                ======================================== */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-sm text-gray-700">買い目追加</h3>

                {/* 馬券タイプ選択ボタン群 */}
                <BetTypeSelector
                    selectedType={state.selectedType}
                    onChange={actions.setSelectedType}
                />

                {/* 入力方式選択ボタン群 */}
                <InputModeSelector
                    availableModes={availableModes}
                    selectedMode={state.inputMode}
                    onChange={actions.setInputMode}
                />

                {/* マルチチェックボックス */}
                {multiAvailable && (
                    <MultiCheckbox
                        checked={state.isMulti}
                        onChange={actions.setIsMulti}
                    />
                )}

                {/* 馬券入力セレクター */}
                <BettingSelector
                    betType={state.selectedType}
                    inputMode={state.inputMode}
                    horses={normalizedHorses}
                    allowedNumbers={allowedNumbers}
                    state={state}
                    onBoxChange={actions.setBoxSelected}
                    onFormationChange={actions.setFormation}
                    onNagashiChange={actions.handleNagashiChange}
                    onTrifectaNagashiChange={actions.setTrifectaNagashi}
                />

                {/* 点数表示・追加ボタン */}
                <PointsDisplay
                    points={calculatedPoints}
                    betType={state.selectedType}
                    inputMode={state.inputMode}
                    isMulti={state.isMulti}
                    onAdd={handleAddBet}
                />
            </div>

            {/* ========================================
                追加済み馬券リスト
                ======================================== */}
            <BetList bets={bets} onRemove={handleRemoveBet} />
        </div>
    );
}