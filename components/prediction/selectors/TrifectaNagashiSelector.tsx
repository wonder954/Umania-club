"use client";
import { useState, useEffect } from "react";
import NumberButton from "@/components/prediction/ui/NumberButton";
import {
    toggleSingle,
    toggleMulti,
    toggleAll
} from "@/components/prediction/utils/toggle";
import { Horse } from "@/types/horse";

type TrifectaPattern = "1" | "2" | "3" | "12" | "13" | "23";

type Props = {
    horses: Horse[];
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

    const needFirst = pattern === "1" || pattern === "12" || pattern === "13";
    const needSecond = pattern === "2" || pattern === "12" || pattern === "23";
    const needThird = pattern === "3" || pattern === "13" || pattern === "23";

    // 軸候補: 印ありだけ
    const axisCandidates = horses.filter(h =>
        allowedNumbers.includes(Number(h.number))
    );

    // 相手候補: 選ばれた軸以外すべて
    const wingCandidates = horses.filter(
        h => ![first, second, third].includes(Number(h.number))
    );

    // 単一選択（1着/2着/3着）
    const toggleAxis = (
        value: number,
        current: number | null,
        setter: (n: number | null) => void
    ) => {
        setter(toggleSingle(current, value));
        setWings([]);
        setIsAllWings(false);
    };

    // 流す馬（複数選択）
    const toggleWing = (num: number) => {
        setWings(toggleMulti(wings, num));
    };

    // 総流し
    const toggleAllWings = () => {
        const allNums = wingCandidates.map(h => Number(h.number));
        const next = toggleAll(wings, allNums);
        setWings(next);
        setIsAllWings(next.length === allNums.length && allNums.length > 0);
    };

    // 総流しチェックボックスの同期
    useEffect(() => {
        const allNums = wingCandidates.map(h => Number(h.number));
        setIsAllWings(allNums.length > 0 && wings.length === allNums.length);
    }, [wingCandidates, wings]);

    useEffect(() => {
        onChange({ pattern, first, second, third, wings });
    }, [pattern, first, second, third, wings]);

    return (
        <div className="space-y-6">

            {/* パターン選択 */}
            <div>
                <p className="font-bold mb-2 text-sm md:text-base">固定パターン</p>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { key: "1", label: "1着固定" },
                        { key: "2", label: "2着固定" },
                        { key: "3", label: "3着固定" },
                        { key: "12", label: "1・2着固定" },
                        { key: "13", label: "1・3着固定" },
                        { key: "23", label: "2・3着固定" },
                    ].map(p => (
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
                            className={`py-2 rounded text-xs md:text-sm font-bold ${pattern === p.key
                                ? "bg-blue-600 text-white"
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
                    <p className="font-bold mb-2 text-sm md:text-base">1着（印のみ）</p>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-2">
                        {axisCandidates.map(h => {
                            const num = Number(h.number);
                            return (
                                <NumberButton
                                    key={num}
                                    num={num}
                                    name={h.name}
                                    selected={first === num}
                                    color="red"
                                    onClick={() => toggleAxis(num, first, setFirst)}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 2着 */}
            {needSecond && (
                <div>
                    <p className="font-bold mb-2 text-sm md:text-base">2着（印のみ）</p>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-2">
                        {axisCandidates.map(h => {
                            const num = Number(h.number);
                            return (
                                <NumberButton
                                    key={num}
                                    num={num}
                                    name={h.name}
                                    selected={second === num}
                                    color="red"
                                    onClick={() => toggleAxis(num, second, setSecond)}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 3着 */}
            {needThird && (
                <div>
                    <p className="font-bold mb-2 text-sm md:text-base">3着（印のみ）</p>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-2">
                        {axisCandidates.map(h => {
                            const num = Number(h.number);
                            return (
                                <NumberButton
                                    key={num}
                                    num={num}
                                    name={h.name}
                                    selected={third === num}
                                    color="red"
                                    onClick={() => toggleAxis(num, third, setThird)}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 流す馬 */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-sm md:text-base">流す馬（全馬）</p>

                    <label className="flex items-center gap-1 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={isAllWings}
                            onChange={toggleAllWings}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-bold text-gray-700">総流し</span>
                    </label>
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-2">
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