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
    onChange
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

    const axisCandidates = horses.filter(h =>
        allowedNumbers.includes(Number(h.number))
    );

    const wingCandidates = horses.filter(
        h => ![first, second, third].includes(Number(h.number))
    );

    const toggleAxis = (
        value: number,
        current: number | null,
        setter: (n: number | null) => void
    ) => {
        setter(toggleSingle(current, value));
        setWings([]);
        setIsAllWings(false);
    };

    const toggleWing = (num: number) => {
        setWings(toggleMulti(wings, num));
    };

    const toggleAllWings = () => {
        const allNums = wingCandidates.map(h => Number(h.number));
        const next = toggleAll(wings, allNums);
        setWings(next);
        setIsAllWings(next.length === allNums.length && allNums.length > 0);
    };

    useEffect(() => {
        const allNums = wingCandidates.map(h => Number(h.number));
        setIsAllWings(allNums.length > 0 && wings.length === allNums.length);
    }, [wingCandidates, wings]);

    useEffect(() => {
        onChange({ pattern, first, second, third, wings });
    }, [pattern, first, second, third, wings]);

    /** 透明白カードの共通ラッパ */
    const Card = ({ children }: { children: React.ReactNode }) => (
        <div
            className="
                bg-white/60 backdrop-blur-sm 
                p-4 rounded-xl 
                border border-white/40 shadow-sm
            "
        >
            {children}
        </div>
    );

    return (
        <div className="space-y-6">

            {/* パターン選択 */}
            <Card>
                <p className="font-bold mb-3 text-slate-800 text-sm md:text-base">
                    固定パターン
                </p>

                <div className="grid grid-cols-3 gap-2">
                    {[
                        { key: "1", label: "1着固定" },
                        { key: "2", label: "2着固定" },
                        { key: "3", label: "3着固定" },
                        { key: "12", label: "1・2着固定" },
                        { key: "13", label: "1・3着固定" },
                        { key: "23", label: "2・3着固定" }
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
                            className={`
                                py-2 rounded-xl text-xs md:text-sm font-bold transition shadow-sm
                                ${pattern === p.key
                                    ? "bg-blue-500/80 text-white"
                                    : "bg-white/70 backdrop-blur-sm border border-white/40 text-slate-700 hover:bg-white/90"
                                }
                            `}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </Card>

            {/* 1着 */}
            {needFirst && (
                <Card>
                    <p className="font-bold mb-3 text-slate-800 text-sm md:text-base">
                        1着（印のみ）
                    </p>
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
                </Card>
            )}

            {/* 2着 */}
            {needSecond && (
                <Card>
                    <p className="font-bold mb-3 text-slate-800 text-sm md:text-base">
                        2着（印のみ）
                    </p>
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
                </Card>
            )}

            {/* 3着 */}
            {needThird && (
                <Card>
                    <p className="font-bold mb-3 text-slate-800 text-sm md:text-base">
                        3着（印のみ）
                    </p>
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
                </Card>
            )}

            {/* 流す馬 */}
            <Card>
                <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-slate-800 text-sm md:text-base">
                        流す馬（全馬）
                    </p>

                    <label className="flex items-center gap-1 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={isAllWings}
                            onChange={toggleAllWings}
                            className="
                                w-4 h-4 
                                text-blue-600/80 
                                rounded 
                                focus:ring-blue-300
                            "
                        />
                        <span className="text-sm font-bold text-slate-700">
                            総流し
                        </span>
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
            </Card>
        </div>
    );
}