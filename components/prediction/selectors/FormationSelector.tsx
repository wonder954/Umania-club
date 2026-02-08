"use client";
import React from "react";
import NumberButton from "@/components/prediction/ui/NumberButton";
import { Horse } from "@/types/horse";
import {
    toggleMulti,
    toggleSingle
} from "@/components/prediction/utils/toggle";

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

    // ★ 印ありだけ表示する（本来の仕様）
    const candidates = allowedNumbers
        ? horses.filter(h => allowedNumbers.includes(Number(h.number)))
        : horses;

    const toggle = (key: keyof Formation, num: number) => {
        const list = formation[key];

        const next = isSingleMode
            ? [toggleSingle(list[0] ?? null, num)].filter(Boolean)
            : toggleMulti(list, num);

        onChange({ ...formation, [key]: next });
    };

    const renderRow = (label: string, key: keyof Formation) => (
        <div className="mb-4">
            <p className="font-bold mb-2">{label}</p>
            <div className="grid grid-cols-6 gap-2">

                {/* ★ candidates.map に変更 */}
                {candidates.map(h => {
                    const num = Number(h.number);

                    return (
                        <NumberButton
                            key={num}
                            num={num}
                            name={h.name}
                            selected={formation[key].includes(num)}
                            color="blue"
                            onClick={() => toggle(key, num)}
                        />
                    );
                })}
            </div>
        </div>
    );

    const labelFirst =
        selectedType === "馬連" || selectedType === "ワイド"
            ? "1頭目"
            : selectedType === "馬単"
                ? "1着"
                : selectedType === "3連複"
                    ? "1列目"
                    : "1着";

    const labelSecond =
        selectedType === "馬連" || selectedType === "ワイド"
            ? "2頭目"
            : selectedType === "馬単"
                ? "2着"
                : selectedType === "3連複"
                    ? "2列目"
                    : "2着";

    const labelThird =
        selectedType === "3連複" ? "3列目" : "3着";

    return (
        <div className="space-y-4">
            {renderRow(labelFirst, "first")}
            {renderRow(labelSecond, "second")}
            {(selectedType === "3連複" || selectedType === "3連単") &&
                renderRow(labelThird, "third")}
        </div>
    );
}