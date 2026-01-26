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
};

export default function FormationSelector({
    horses,
    formation,
    onChange,
    allowedNumbers,
    selectedType
}: Props) {
    const toggle = (key: keyof Formation, numStr: number | string) => {
        const num = Number(numStr);
        if (isNaN(num)) return;

        const list = formation[key];

        const updated =
            list.includes(num)
                ? list.filter(n => n !== num)
                : [...list, num].sort((a, b) => a - b);

        onChange({ ...formation, [key]: updated });
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