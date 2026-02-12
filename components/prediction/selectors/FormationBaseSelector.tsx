"use client";
import React from "react";
import NumberButton from "@/components/prediction/ui/NumberButton";
import { Horse } from "@/types/horse";
import { toggleMulti, toggleSingle } from "@/components/prediction/utils/toggle";

type Formation = {
    first: number[];
    second: number[];
    third: number[];
};

type BetType =
    | "単勝"
    | "複勝"
    | "馬連"
    | "馬単"
    | "ワイド"
    | "3連複"
    | "3連単";

type Props = {
    horses: Horse[];
    formation: Formation;
    onChange: (f: Formation) => void;
    allowedNumbers?: number[];
    selectedType: BetType;
    isSingleMode?: boolean;
};

export default function FormationBaseSelector({
    horses,
    formation,
    onChange,
    allowedNumbers,
    selectedType,
    isSingleMode = false
}: Props) {
    // 印ありだけ表示
    const candidates = allowedNumbers
        ? horses.filter(h => allowedNumbers.includes(Number(h.number)))
        : horses;

    const toggle = (key: keyof Formation, num: number) => {
        const list = formation[key];
        const next = isSingleMode
            ? [toggleSingle(list[0] ?? null, num)].filter(
                (n): n is number => n !== null
            )
            : toggleMulti(list, num);

        onChange({ ...formation, [key]: next });
    };

    /** ラベル + グリッド（細田守 UI） */
    const renderRow = (label: string, key: keyof Formation) => (
        <div
            className="
                bg-white/60 backdrop-blur-sm 
                p-4 rounded-xl 
                border border-white/40 shadow-sm
            "
        >
            <p className="font-bold mb-3 text-slate-800 text-sm md:text-base">
                {label}
            </p>

            <div
                className="
                    grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] 
                    gap-2
                "
            >
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

    const getLabels = (): { first: string; second: string; third: string } => {
        switch (selectedType) {
            case "馬連":
            case "ワイド":
                return { first: "1頭目", second: "2頭目", third: "" };
            case "馬単":
                return { first: "1着", second: "2着", third: "" };
            case "3連複":
                return { first: "1列目", second: "2列目", third: "3列目" };
            case "3連単":
                return { first: "1着", second: "2着", third: "3着" };
            default:
                return { first: "1着", second: "2着", third: "3着" };
        }
    };

    const labels = getLabels();

    return (
        <div className="space-y-4">
            {renderRow(labels.first, "first")}
            {renderRow(labels.second, "second")}
            {(selectedType === "3連複" || selectedType === "3連単") &&
                renderRow(labels.third, "third")}
        </div>
    );
}