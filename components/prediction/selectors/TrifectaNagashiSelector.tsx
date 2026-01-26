"use client";
import React, { useState, useEffect } from "react";

type TrifectaPattern = "1" | "2" | "3" | "12" | "13" | "23";

type Props = {
    horses: { number?: number | string; name: string }[];
    allowedNumbers: number[];
    onChange: (bet: {
        pattern: TrifectaPattern;
        first: number | null;
        second: number | null;
        third: number | null;
        wings: number[];
    }) => void;
};

export default function TrifectaNagashiSelector({
    horses,
    allowedNumbers,
    onChange,
}: Props) {
    const [pattern, setPattern] = useState<TrifectaPattern>("1");

    const [first, setFirst] = useState<number | null>(null);
    const [second, setSecond] = useState<number | null>(null);
    const [third, setThird] = useState<number | null>(null);

    const [wings, setWings] = useState<number[]>([]);
    const [isAllWings, setIsAllWings] = useState(false);

    // パターンに応じて必要な着順を判定
    const needFirst = pattern === "1" || pattern === "12" || pattern === "13";
    const needSecond = pattern === "2" || pattern === "12" || pattern === "23";
    const needThird = pattern === "3" || pattern === "13" || pattern === "23";

    // 軸馬は allowedNumbers のみ
    const axisCandidates = horses.filter((h) =>
        allowedNumbers.includes(Number(h.number))
    );

    // 相手は全馬（軸は除外）
    const wingCandidates = horses.filter(
        (h) => ![first, second, third].includes(Number(h.number))
    );

    // 単一選択
    const toggleSingle = (
        value: number,
        current: number | null,
        setter: (n: number | null) => void
    ) => {
        setter(current === value ? null : value);
    };

    // 複数選択（流す馬）
    const toggleWings = (num: number) => {
        if (wings.includes(num)) {
            setWings(wings.filter((n) => n !== num));
        } else {
            setWings([...wings, num]);
        }
    };

    // 総流し
    const toggleAllWings = () => {
        if (isAllWings) {
            setWings([]);
            setIsAllWings(false);
        } else {
            setWings(wingCandidates.map((h) => Number(h.number)));
            setIsAllWings(true);
        }
    };

    // 親へ通知
    useEffect(() => {
        onChange({ pattern, first, second, third, wings });
    }, [pattern, first, second, third, wings]);

    return (
        <div className="space-y-6">
            {/* パターン選択 */}
            <div>
                <p className="font-bold mb-2">固定パターン</p>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { key: "1", label: "1着固定" },
                        { key: "2", label: "2着固定" },
                        { key: "3", label: "3着固定" },
                        { key: "12", label: "1・2着固定" },
                        { key: "13", label: "1・3着固定" },
                        { key: "23", label: "2・3着固定" },
                    ].map((p) => (
                        <button
                            key={p.key}
                            type="button"
                            onClick={() => {
                                setPattern(p.key as TrifectaPattern);
                                setFirst(null);
                                setSecond(null);
                                setThird(null);
                                setWings([]);
                                setIsAllWings(false);
                            }}
                            className={`py-2 rounded text-sm font-bold ${pattern === p.key
                                ? "bg-blue-500 text-white"
                                : "bg-white border text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 1着 */}
            {needFirst && (
                <div>
                    <p className="font-bold mb-2">1着（印のみ）</p>
                    <div className="grid grid-cols-6 gap-2">
                        {axisCandidates.map((h) => {
                            const num = Number(h.number);
                            return (
                                <button
                                    key={num}
                                    onClick={() => toggleSingle(num, first, setFirst)}
                                    className={`aspect-square rounded flex items-center justify-center font-mono font-bold text-lg ${first === num
                                        ? "bg-red-500 text-white"
                                        : "bg-white border text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    {num}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 2着 */}
            {needSecond && (
                <div>
                    <p className="font-bold mb-2">2着（印のみ）</p>
                    <div className="grid grid-cols-6 gap-2">
                        {axisCandidates.map((h) => {
                            const num = Number(h.number);
                            return (
                                <button
                                    key={num}
                                    onClick={() => toggleSingle(num, second, setSecond)}
                                    className={`aspect-square rounded flex items-center justify-center font-mono font-bold text-lg ${second === num
                                        ? "bg-red-500 text-white"
                                        : "bg-white border text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    {num}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 3着 */}
            {needThird && (
                <div>
                    <p className="font-bold mb-2">3着（印のみ）</p>
                    <div className="grid grid-cols-6 gap-2">
                        {axisCandidates.map((h) => {
                            const num = Number(h.number);
                            return (
                                <button
                                    key={num}
                                    onClick={() => toggleSingle(num, third, setThird)}
                                    className={`aspect-square rounded flex items-center justify-center font-mono font-bold text-lg ${third === num
                                        ? "bg-red-500 text-white"
                                        : "bg-white border text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    {num}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 流す馬 */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="font-bold">流す馬（全馬）</p>

                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isAllWings}
                            onChange={toggleAllWings}
                        />
                        総流し
                    </label>
                </div>

                <div className="grid grid-cols-6 gap-2">
                    {wingCandidates.map((h) => {
                        const num = Number(h.number);
                        return (
                            <button
                                key={num}
                                onClick={() => toggleWings(num)}
                                className={`aspect-square rounded flex items-center justify-center font-mono font-bold text-lg ${wings.includes(num)
                                    ? "bg-blue-500 text-white"
                                    : "bg-white border text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                {num}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}