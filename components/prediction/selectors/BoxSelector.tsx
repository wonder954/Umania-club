"use client";
import React from "react";
import NumberButton from "@/components/prediction/ui/NumberButton";
import { toggleMultiWithLimit } from "@/components/prediction/utils/toggle";

type Props = {
    horses: { number?: number | string; name: string }[];
    selected: number[];
    onChange: (nums: number[]) => void;
    allowedNumbers?: number[];
    maxCount?: number;
};

export default function BoxSelector({
    horses,
    selected,
    onChange,
    allowedNumbers,
    maxCount
}: Props) {

    // ★ 印を打った馬だけに絞る（これが本来の仕様）
    const candidates = allowedNumbers
        ? horses.filter(h => allowedNumbers.includes(Number(h.number)))
        : horses;

    return (
        <div className="grid grid-cols-6 gap-2 mb-4">
            {candidates.map(h => {
                const num = Number(h.number);

                return (
                    <NumberButton
                        key={num}
                        num={num}
                        name={h.name}
                        selected={selected.includes(num)}
                        color="blue"
                        onClick={() => {
                            onChange(
                                maxCount
                                    ? toggleMultiWithLimit(selected, num, maxCount)
                                    : toggleMultiWithLimit(selected, num, Infinity)
                            );
                        }}
                    />
                );
            })}
        </div>
    );
}