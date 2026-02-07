/**
 * 馬券入力状態管理カスタムフック
 * 
 * 馬券購入フォームの複雑な状態管理をカプセル化したカスタムフックです。
 * 状態の初期化、更新、リセットなどの操作を提供します。
 */

import { useState, useCallback } from "react";
import { BetType, InputMode, TrifectaPattern, NagashiSelectorValue } from "@/types/bet";
import { AVAILABLE_MODES } from "../utils/bettingFormConstants";

/**
 * 馬券入力状態の型定義
 */
export interface BettingInputState {
    // 基本設定
    selectedType: BetType;
    inputMode: InputMode;
    isMulti: boolean;

    // ボックス・通常選択
    boxSelected: number[];

    // フォーメーション
    formation: {
        first: number[];
        second: number[];
        third: number[];
    };

    // 流し（通常）
    axis: number[];
    wings: number[];

    // 3連単流し
    trifectaNagashi: {
        pattern: TrifectaPattern;
        first: number | null;
        second: number | null;
        third: number | null;
        wings: number[];
    };
}

/**
 * 初期状態を生成
 * 
 * すべての入力フィールドを空の状態で初期化します。
 */
function createInitialState(): BettingInputState {
    return {
        selectedType: "3連単",
        inputMode: "box",
        isMulti: false,
        boxSelected: [],
        formation: { first: [], second: [], third: [] },
        axis: [],
        wings: [],
        trifectaNagashi: {
            pattern: "1",
            first: null,
            second: null,
            third: null,
            wings: [],
        },
    };
}

/**
 * 馬券入力状態を管理するカスタムフック
 * 
 * 使用例:
 * ```tsx
 * const { state, actions } = useBettingInput();
 * 
 * // 馬券タイプを変更
 * actions.setSelectedType("馬連");
 * 
 * // ボックス選択を更新
 * actions.setBoxSelected([1, 2, 3]);
 * 
 * // すべての入力をリセット
 * actions.resetInput();
 * ```
 */
export function useBettingInput() {
    const [state, setState] = useState<BettingInputState>(createInitialState());

    /**
     * 馬券タイプを変更
     * 
     * タイプ変更時は入力方式も自動的に適切なものに変更されます。
     * また、マルチフラグもリセットされます。
     */
    const setSelectedType = useCallback((type: BetType) => {
        setState((prev) => ({
            ...prev,
            selectedType: type,
            inputMode: AVAILABLE_MODES[type][0], // その馬券タイプの最初の入力方式を選択
            isMulti: false, // マルチをリセット
        }));
    }, []);

    /**
     * 入力方式を変更
     * 
     * 方式変更時はマルチフラグもリセットされます。
     */
    const setInputMode = useCallback((mode: InputMode) => {
        setState((prev) => ({
            ...prev,
            inputMode: mode,
            isMulti: false, // マルチをリセット
        }));
    }, []);

    /**
     * マルチフラグを切り替え
     */
    const setIsMulti = useCallback((isMulti: boolean) => {
        setState((prev) => ({ ...prev, isMulti }));
    }, []);

    /**
     * ボックス選択を更新
     */
    const setBoxSelected = useCallback((selected: number[]) => {
        setState((prev) => ({ ...prev, boxSelected: selected }));
    }, []);

    /**
     * フォーメーションを更新
     */
    const setFormation = useCallback(
        (formation: { first: number[]; second: number[]; third: number[] }) => {
            setState((prev) => ({ ...prev, formation }));
        },
        []
    );

    /**
     * 流し（通常）の値を更新
     * 
     * NagashiSelectorから受け取った値を適切な形式に変換して保存します。
     * - 3連複の場合: 軸は複数選択可能（配列）
     * - 馬単・馬連の場合: 軸は1頭のみ（配列に変換）
     */
    const handleNagashiChange = useCallback((value: NagashiSelectorValue) => {
        setState((prev) => {
            // 軸の処理
            let axisArray: number[];
            if (Array.isArray(value.axis)) {
                // 3連複（複数軸）
                axisArray = value.axis;
            } else if (value.axis !== null && value.axis !== undefined) {
                // 馬単・馬連（単一軸）→配列化
                axisArray = [value.axis];
            } else {
                // 軸なし
                axisArray = [];
            }

            return {
                ...prev,
                axis: axisArray,
                wings: value.opponents,
            };
        });
    }, []);

    /**
     * 3連単流しの値を更新
     */
    const setTrifectaNagashi = useCallback(
        (nagashi: {
            pattern: TrifectaPattern;
            first: number | null;
            second: number | null;
            third: number | null;
            wings: number[];
        }) => {
            setState((prev) => ({ ...prev, trifectaNagashi: nagashi }));
        },
        []
    );

    /**
     * すべての入力をリセット
     * 
     * 馬券追加後や、ユーザーがリセットボタンを押した時に使用します。
     * 馬券タイプと入力方式は保持され、入力内容のみクリアされます。
     */
    const resetInput = useCallback(() => {
        setState((prev) => ({
            ...prev,
            boxSelected: [],
            formation: { first: [], second: [], third: [] },
            axis: [],
            wings: [],
            isMulti: false,
            trifectaNagashi: {
                pattern: "1",
                first: null,
                second: null,
                third: null,
                wings: [],
            },
        }));
    }, []);

    /**
     * すべての状態を完全にリセット
     * 
     * 馬券タイプと入力方式も含めて初期状態に戻します。
     */
    const resetAll = useCallback(() => {
        setState(createInitialState());
    }, []);

    return {
        state,
        actions: {
            setSelectedType,
            setInputMode,
            setIsMulti,
            setBoxSelected,
            setFormation,
            handleNagashiChange,
            setTrifectaNagashi,
            resetInput,
            resetAll,
        },
    };
}