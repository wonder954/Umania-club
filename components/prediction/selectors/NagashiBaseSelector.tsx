"use client";
import { useRef, useEffect, useState } from "react";

import { Horse } from "@/types/horse";
import NumberButton from "@/components/prediction/ui/NumberButton";
import {
    toggleSingle,
    toggleMulti,
    toggleMultiWithLimit,
    toggleAll
} from "@/components/prediction/utils/toggle";

type Props = {
    horses: Horse[];
    allowedNumbers: number[];
    onChange: (value: { axis: number[]; opponents: number[] }) => void;
    axisLimit: number;
};

export default function NagashiBaseSelector({
    horses,
    allowedNumbers,
    onChange,
    axisLimit
}: Props) {
    const [axis, setAxis] = useState<number[]>([]);
    const [opponents, setOpponents] = useState<number[]>([]);
    const [isAllOpponents, setIsAllOpponents] = useState(false);

    const axisCandidates = horses.filter(h =>
        allowedNumbers.includes(Number(h.number))
    );

    const opponentCandidates = horses.filter(
        h => !axis.includes(Number(h.number))
    );

    const handleToggleAxis = (num: number) => {
        let nextAxis: number[];

        if (axis.includes(num)) {
            nextAxis = axis.filter(n => n !== num);
        } else {
            nextAxis =
                axisLimit === 1
                    ? [num]
                    : toggleMultiWithLimit(axis, num, axisLimit);
        }

        setAxis(nextAxis);

        if (opponents.includes(num)) {
            setOpponents(opponents.filter(n => n !== num));
        }
    };

    const handleToggleOpponent = (num: number) => {
        setOpponents(toggleMulti(opponents, num));
    };

    const opponentSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (axis.length === axisLimit) {
            opponentSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }, [axis, axisLimit]);

    const handleToggleAllOpponents = () => {
        const allNums = opponentCandidates.map(h => Number(h.number));
        const next = toggleAll(opponents, allNums);
        setOpponents(next);
        setIsAllOpponents(
            next.length === allNums.length && allNums.length > 0
        );
    };

    useEffect(() => {
        onChange({ axis, opponents });
    }, [axis, opponents]);

    useEffect(() => {
        const allNums = opponentCandidates.map(h => Number(h.number));
        setIsAllOpponents(
            allNums.length > 0 && opponents.length === allNums.length
        );
    }, [opponentCandidates, opponents]);

    return (
        <div className="space-y-6">

            {/* 軸エリア */}
            <div
                className="
                    bg-white/60 backdrop-blur-sm 
                    p-4 rounded-xl 
                    border border-white/40 shadow-sm
                "
            >
                <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-slate-800 text-sm md:text-base">
                        軸馬{" "}
                        <span className="text-xs font-normal text-slate-500">
                            （印のみ・{axisLimit}頭まで）
                        </span>
                    </p>
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-2">
                    {axisCandidates.map(h => {
                        const num = Number(h.number);
                        return (
                            <NumberButton
                                key={num}
                                num={num}
                                name={h.name}
                                selected={axis.includes(num)}
                                color="red"
                                onClick={() => handleToggleAxis(num)}
                            />
                        );
                    })}
                </div>
            </div>

            {/* 相手エリア */}
            <div
                className="
                    bg-white/60 backdrop-blur-sm 
                    p-4 rounded-xl 
                    border border-white/40 shadow-sm
                "
            >
                <div ref={opponentSectionRef}></div>

                <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-slate-800 text-sm md:text-base">
                        相手{" "}
                        <span className="text-xs font-normal text-slate-500">
                            （全馬）
                        </span>
                    </p>

                    <label className="flex items-center gap-1 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={isAllOpponents}
                            onChange={handleToggleAllOpponents}
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
                    {opponentCandidates.map(h => {
                        const num = Number(h.number);
                        return (
                            <NumberButton
                                key={num}
                                num={num}
                                name={h.name}
                                selected={opponents.includes(num)}
                                color="blue"
                                onClick={() => handleToggleOpponent(num)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}