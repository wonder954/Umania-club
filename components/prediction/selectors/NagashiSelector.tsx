"use client";
import React from "react";
import NumberButton from "@/components/prediction/ui/NumberButton";
import {
    toggleSingle,
    toggleMulti
} from "@/components/prediction/utils/toggle";

type Props = {
    horses: { number?: number | string; name: string }[];
    axis: number[];
    wings: number[];
    onChangeAxis: (nums: number[]) => void;
    onChangeWings: (nums: number[]) => void;
    allowedNumbers?: number[];
};

export default function NagashiSelector({
    horses,
    axis,
    wings,
    onChangeAxis,
    onChangeWings,
    allowedNumbers
}: Props) {

    // ★ 軸：印ありだけ
    const axisCandidates = allowedNumbers
        ? horses.filter(h => allowedNumbers.includes(Number(h.number)))
        : horses;

    // ★ 相手：全馬
    const wingCandidates = horses;

    // 軸（単一選択）
    const toggleAxis = (num: number) => {
        const next = toggleSingle(axis[0] ?? null, num);
        onChangeAxis(next ? [next] : []);
    };

    // 相手（複数選択）
    const toggleWing = (num: number) => {
        onChangeWings(toggleMulti(wings, num));
    };

    return (
        <div className="space-y-4">

            {/* 軸（単一選択） */}
            <div>
                <p className="font-bold mb-2">軸</p>
                <div className="grid grid-cols-6 gap-2">
                    {axisCandidates.map(h => {
                        const num = Number(h.number);
                        return (
                            <NumberButton
                                key={num}
                                num={num}
                                name={h.name}
                                selected={axis.includes(num)}
                                color="red"
                                onClick={() => toggleAxis(num)}
                            />
                        );
                    })}
                </div>
            </div>

            {/* 相手（複数選択） */}
            <div>
                <p className="font-bold mb-2">相手</p>
                <div className="grid grid-cols-6 gap-2">
                    {wingCandidates.map(h => {
                        const num = Number(h.number);
                        return (
                            <NumberButton
                                key={num}
                                num={num}
                                name={h.name}
                                selected={wings.includes(num)}
                                color="blue"
                                onClick={() => toggleWing(num)}
                            />
                        );
                    })}
                </div>
            </div>

        </div>
    );
}