"use client";
import React from "react";
import { Horse } from "@/types/horse";
import NumberButton from "@/components/prediction/ui/NumberButton";

type Props = {
    horses: { number?: number | string; name: string }[];
    selected: number[];
    onChange: (nums: number[]) => void;
    allowedNumbers?: number[];
    maxCount?: number;
};

export default function BoxBaseSelector({
    horses,
    selected,
    onChange,
    allowedNumbers,
    maxCount
}: Props) {
    // ★ 印を打った馬だけに絞る
    const candidates = allowedNumbers
        ? horses.filter(h => allowedNumbers.includes(Number(h.number)))
        : horses;

    const toggle = (numStr: number | string) => {
        const num = Number(numStr);
        if (isNaN(num)) return;

        if (selected.includes(num)) {
            onChange(selected.filter(n => n !== num));
        } else {
            // 最大数チェック
            if (maxCount && selected.length >= maxCount) {
                return;
            }
            onChange([...selected, num].sort((a, b) => a - b));
        }
    };

    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-2 mb-4">
            {candidates.map(h => {
                const num = Number(h.number);
                // candidatesでフィルタリング済みなのでdisabledチェックは不要（または印なしは除外されている）

                return (
                    <NumberButton
                        key={h.number}
                        num={num}
                        name={h.name}
                        selected={selected.includes(num)}
                        color="blue"
                        onClick={() => toggle(h.number!)}
                    />
                );
            })}
        </div>
    );
}
