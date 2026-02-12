/**
 * 馬券タイプ選択ボタングループ
 * 
 * 7種類の馬券タイプを選択するためのボタン群です。
 * スマホでは自動改行されるレスポンシブな設計です。
 */

import React from "react";
import { BetType } from "@/types/bet";
import { BET_TYPES } from "../utils/bettingFormConstants";

interface BetTypeSelectorProps {
    /** 現在選択されている馬券タイプ */
    selectedType: BetType;
    /** 馬券タイプが変更されたときのコールバック */
    onChange: (type: BetType) => void;
}

/**
 * 馬券タイプ選択ボタングループコンポーネント
 * 
 * アクセシビリティ:
 * - role="group"とaria-labelで用途を明示
 * - 各ボタンにaria-pressed属性で選択状態を示す
 */
export function BetTypeSelector({ selectedType, onChange }: BetTypeSelectorProps) {
    return (
        <div
            role="group"
            aria-label="馬券タイプ選択"
            className="flex flex-wrap gap-2 mb-4"
        >
            {BET_TYPES.map((type) => {
                const isSelected = selectedType === type;

                return (
                    <button
                        key={type}
                        onClick={() => onChange(type)}
                        aria-pressed={isSelected}
                        className={`
                            px-3 py-1 rounded-full text-sm whitespace-nowrap
                            transition shadow-sm
                            ${isSelected
                                ? "bg-blue-500/80 text-white font-bold"
                                : "bg-white/70 backdrop-blur-sm border border-white/40 text-slate-700 hover:bg-white/90"
                            }
                        `}
                    >
                        {type}
                    </button>
                );
            })}
        </div>
    );
}

/**
 * 入力方式選択ボタングループ
 * 
 * ボックス、フォーメーション、流しの3つの入力方式を選択します。
 * 単勝・複勝の場合は表示されません。
 */

import { InputMode } from "@/types/bet";
import { INPUT_MODE_LABELS } from "../utils/bettingFormConstants";

interface InputModeSelectorProps {
    /** 利用可能な入力方式のリスト */
    availableModes: readonly (InputMode | null)[];
    /** 現在選択されている入力方式（null = 通常買い） */
    selectedMode: InputMode | null;
    /** 入力方式が変更されたときのコールバック */
    onChange: (mode: InputMode | null) => void;
}

/**
 * 入力方式選択ボタングループコンポーネント
 * 
 * トグル動作：
 * - ボタンをクリックするとその買い方が選択される
 * - 再度クリックすると選択解除され、通常買い（null）に戻る
 */
export function InputModeSelector({
    availableModes,
    selectedMode,
    onChange,
}: InputModeSelectorProps) {
    if (availableModes.length <= 1) return null;

    return (
        <div role="group" aria-label="入力方式選択" className="flex flex-wrap gap-2 mb-4">
            {availableModes.map((mode) => {
                if (mode === null) return null;

                const isSelected = selectedMode === mode;

                return (
                    <button
                        key={mode}
                        onClick={() => onChange(isSelected ? null : mode)}
                        aria-pressed={isSelected}
                        className={`
                            px-3 py-1 rounded-full text-sm transition shadow-sm
                            ${isSelected
                                ? "bg-green-500/80 text-white font-bold"
                                : "bg-white/70 backdrop-blur-sm border border-white/40 text-slate-700 hover:bg-white/90"
                            }
                        `}
                    >
                        {INPUT_MODE_LABELS[mode]}
                    </button>
                );
            })}
        </div>
    );
}

/**
 * マルチチェックボックス
 * 
 * 馬単と3連単のフォーメーション・流しで使用可能な
 * マルチ機能の有効/無効を切り替えます。
 */

interface MultiCheckboxProps {
    /** マルチが有効かどうか */
    checked: boolean;
    /** チェック状態が変更されたときのコールバック */
    onChange: (checked: boolean) => void;
}

/**
 * マルチチェックボックスコンポーネント
 * 
 * マルチとは:
 * 複数の組み合わせを1つの馬券として扱う購入方法です。
 * 例えば「1-2-3」と「1-2-4」を別々に買わず、まとめて買うことができます。
 */
export function MultiCheckbox({ checked, onChange }: MultiCheckboxProps) {
    return (
        <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="
                    w-4 h-4 
                    text-blue-600/80 
                    rounded 
                    focus:ring-blue-300
                "
                aria-label="マルチにする"
            />
            <span className="text-sm font-bold text-slate-700">マルチにする</span>
        </label>
    );
}

/**
 * 点数表示・追加ボタン
 * 
 * 現在の入力内容から計算された点数を表示し、
 * 馬券を追加するボタンを提供します。
 */

interface PointsDisplayProps {
    /** 購入点数 */
    points: number;
    /** 馬券タイプ */
    betType: BetType;
    /** 入力方式（null = 通常買い） */
    inputMode: InputMode | null;
    /** 「追加する」ボタンのクリックハンドラ */
    onAdd: () => void;
    /** 馬券追加が無効かどうか */
    disabled?: boolean;
}

/**
 * 点数表示と追加ボタンコンポーネント
 * 
 * 購入点数の情報と「追加する」ボタンを表示します。
 */
export function PointsDisplay({
    points,
    betType,
    inputMode,
    onAdd,
    disabled = false
}: PointsDisplayProps) {
    const isDisabled = disabled || points === 0;

    return (
        <div
            className="
                flex justify-between items-center 
                bg-white/70 backdrop-blur-sm 
                p-3 rounded-xl 
                border border-white/40 shadow-sm
            "
        >
            <div className="text-sm">
                <span className="font-bold text-lg text-blue-600">{points}</span>{" "}
                <span className="text-slate-700">点</span>
                <span className="text-slate-500 text-xs ml-2">
                    （{betType} / {inputMode ? INPUT_MODE_LABELS[inputMode] : "通常"}）
                </span>
            </div>

            <button
                onClick={onAdd}
                disabled={isDisabled}
                aria-label="馬券を追加"
                className={`
                    px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm
                    ${isDisabled
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                        : "bg-blue-500/80 text-white hover:bg-blue-500/90"
                    }
                `}
            >
                追加する
            </button>
        </div>
    );
}