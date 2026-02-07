"use client";
import React from "react";
import { Horse } from "@/types/horse";

type Formation = {
    first: number[];
    second: number[];
    third: number[];
};

type BetType = "単勝" | "複勝" | "馬連" | "馬単" | "ワイド" | "3連複" | "3連単";

type Props = {
    horses: Horse[];
    formation: Formation;
    onChange: (f: Formation) => void;
    allowedNumbers?: number[];
    selectedType: BetType;
    /** 単数選択モード（通常買い用: 各着に1頭のみ） */
    isSingleMode?: boolean;
};

export default function FormationSelector({
    horses,
    formation,
    onChange,
    allowedNumbers,
    selectedType,
    isSingleMode = false
}: Props) {
    const toggle = (key: keyof Formation, numStr: number | string) => {
        const num = Number(numStr);
        if (isNaN(num)) return;

        const list = formation[key];

        // 既に選択されている場合 → 解除
        if (list.includes(num)) {
            onChange({ ...formation, [key]: list.filter(n => n !== num) });
            return;
        }

        // 未選択の場合
        if (isSingleMode) {
            // 単数モード: 既存の選択を置き換え（1頭のみ）
            onChange({ ...formation, [key]: [num] });
        } else {
            // 通常（フォーメーション）: 追加
            onChange({ ...formation, [key]: [...list, num].sort((a, b) => a - b) });
        }
    };

    const renderRow = (label: string, key: keyof Formation) => (
        <div className="mb-4">
            <p className="font-bold mb-2">{label}</p>
            <div className="grid grid-cols-6 gap-2">
                {horses.map(h => {
                    const num = Number(h.number);

                    const disabled =
                        !h.number ||
                        (allowedNumbers && !allowedNumbers.includes(num));

                    return (
                        <button
                            key={h.number}
                            type="button"
                            onClick={() => toggle(key, h.number!)}
                            disabled={disabled}
                            className={`
                                aspect-square rounded flex items-center justify-center font-mono font-bold text-lg
                                ${formation[key].includes(num)
                                    ? "bg-blue-500 text-white shadow-inner"
                                    : "bg-white border text-gray-700 hover:bg-gray-100"}
                                ${disabled ? "opacity-40 cursor-not-allowed" : ""}
                            `}
                        >
                            {h.number}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    // ★ ラベルを買い目タイプごとに切り替える
    const labelFirst =
        selectedType === "馬連" || selectedType === "ワイド"
            ? "1頭目"
            : selectedType === "馬単"
                ? "1着"
                : selectedType === "3連複"
                    ? "1列目"
                    : "1着"; // 3連単

    const labelSecond =
        selectedType === "馬連" || selectedType === "ワイド"
            ? "2頭目"
            : selectedType === "馬単"
                ? "2着"
                : selectedType === "3連複"
                    ? "2列目"
                    : "2着"; // 3連単

    const labelThird =
        selectedType === "3連複"
            ? "3列目"
            : "3着"; // 3連単

    return (
        <div className="space-y-4">
            {/* 1段目 */}
            {renderRow(labelFirst, "first")}

            {/* 2段目 */}
            {renderRow(labelSecond, "second")}

            {/* 3段目（3連複・3連単のみ） */}
            {(selectedType === "3連複" || selectedType === "3連単") &&
                renderRow(labelThird, "third")}
        </div>
    );
}