"use client";
import React from "react";

type Props = {
    horses: { number?: number | string; name: string }[];
    axis: number[];
    wings: number[];
    onChangeAxis: (nums: number[]) => void;
    onChangeWings: (nums: number[]) => void;
};

export default function NagashiSelector({
    horses,
    axis,
    wings,
    onChangeAxis,
    onChangeWings
}: Props) {

    // ★ 軸は単一選択
    const toggleAxis = (numStr: number | string) => {
        const num = Number(numStr);
        if (isNaN(num)) return;

        if (axis.includes(num)) {
            onChangeAxis([]);      // 解除
        } else {
            onChangeAxis([num]);   // 上書き
        }
    };

    // 相手は複数選択OK（今まで通り）
    const toggle = (list: number[], setter: (n: number[]) => void, numStr: number | string) => {
        const num = Number(numStr);
        if (isNaN(num)) return;

        if (list.includes(num)) {
            setter(list.filter(n => n !== num));
        } else {
            setter([...list, num].sort((a, b) => a - b));
        }
    };

    return (
        <div className="space-y-4">

            {/* 軸（単一選択） */}
            <div>
                <p className="font-bold mb-2">軸</p>
                <div className="grid grid-cols-6 gap-2">
                    {horses.map(h => (
                        <button
                            key={h.number}
                            type="button"
                            onClick={() => toggleAxis(h.number!)}   // ★ ここを変更
                            className={`
                                aspect-square rounded flex items-center justify-center font-mono font-bold text-lg
                                ${axis.includes(Number(h.number))
                                    ? "bg-red-500 text-white"
                                    : "bg-white border text-gray-700 hover:bg-gray-100"}
                            `}
                        >
                            {h.number}
                        </button>
                    ))}
                </div>
            </div>

            {/* 相手（複数選択） */}
            <div>
                <p className="font-bold mb-2">相手</p>
                <div className="grid grid-cols-6 gap-2">
                    {horses.map(h => (
                        <button
                            key={h.number}
                            type="button"
                            onClick={() => toggle(wings, onChangeWings, h.number!)}
                            className={`
                                aspect-square rounded flex items-center justify-center font-mono font-bold text-lg
                                ${wings.includes(Number(h.number))
                                    ? "bg-blue-500 text-white"
                                    : "bg-white border text-gray-700 hover:bg-gray-100"}
                            `}
                        >
                            {h.number}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
}