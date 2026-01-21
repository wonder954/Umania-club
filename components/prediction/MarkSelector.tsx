"use client";
import { useState } from "react";


const MARKS = [
    { label: "◎", color: "text-red-600", value: "1" }, // value could be priority or just id
    { label: "○", color: "text-blue-600", value: "2" },
    { label: "▲", color: "text-green-600", value: "3" },
    { label: "△", color: "text-gray-600", value: "4" },
    { label: "☆", color: "text-yellow-500", value: "5" },
    // { label: "消", color: "text-gray-300", value: "0" } // Optional
];

type Props = {
    horses: { number?: number; name: string }[];
    value: Record<string, string>; // { horseNumber: mark }
    onChange: (value: Record<string, string>) => void;
};

export default function MarkSelector({ horses, value, onChange }: Props) {
    const handleMarkClick = (horseNum: number, markLabel: string) => {
        // If clicking same mark, remove it (toggle off)
        // If clicking different mark, update it
        const current = value[horseNum.toString()];
        const newVal = { ...value };

        if (current === markLabel) {
            delete newVal[horseNum.toString()];
        } else {
            newVal[horseNum.toString()] = markLabel;
        }
        onChange(newVal);
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 border-b">
                        <th className="px-3 py-2 text-left">番</th>
                        <th className="px-3 py-2 text-left">馬名</th>
                        <th className="px-3 py-2 text-center">印</th>
                    </tr>
                </thead>
                <tbody>
                    {horses.map((horse) => {
                        const horseNum = horse.number || 0; // fallback if no number scraped (Monday)
                        const currentMark = value[horseNum.toString()];

                        return (
                            <tr key={horse.name} className="border-b hover:bg-gray-50">
                                <td className="px-3 py-2 font-mono">{horseNum || "-"}</td>
                                <td className="px-3 py-2 font-medium">{horse.name}</td>
                                <td className="px-3 py-2">
                                    <div className="flex justify-center gap-2">
                                        {MARKS.map((m) => (
                                            <button
                                                key={m.label}
                                                type="button"
                                                onClick={() => handleMarkClick(horseNum, m.label)}
                                                className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold border transition
                          ${currentMark === m.label
                                                        ? `bg-white border-2 border-current ${m.color} shadow-sm transform scale-110`
                                                        : "bg-transparent border-gray-200 text-gray-300 hover:text-gray-400"}
                        `}
                                            >
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
