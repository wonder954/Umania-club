"use client";
import React from "react";

type Props = {
    horses: { number?: number | string; name: string }[];
    selected: number[];
    onChange: (nums: number[]) => void;
    allowedNumbers?: number[];
};

export default function BoxSelector({ horses, selected, onChange, allowedNumbers }: Props) {
    const toggle = (numStr: number | string) => {
        const num = Number(numStr);
        if (isNaN(num)) return;

        if (selected.includes(num)) {
            onChange(selected.filter(n => n !== num));
        } else {
            onChange([...selected, num].sort((a, b) => a - b));
        }
    };

    return (
        <div className="grid grid-cols-6 gap-2 mb-4">
            {horses.map(h => {
                const num = Number(h.number);

                const disabled =
                    !h.number ||
                    (allowedNumbers && !allowedNumbers.includes(num));

                return (
                    <button
                        key={h.number}
                        type="button"
                        onClick={() => toggle(h.number!)}
                        disabled={disabled}
                        className={`
              aspect-square rounded flex items-center justify-center font-mono font-bold text-lg
              ${selected.includes(num)
                                ? "bg-blue-500 text-white shadow-inner"
                                : "bg-white border text-gray-700 hover:bg-gray-100"}
              ${disabled ? "opacity-40 cursor-not-allowed" : ""}
            `}
                    >
                        {h.number || "-"}
                    </button>
                );
            })}
        </div>
    );
}