"use client";
import { useRef, useEffect, useState } from "react";

import { Horse } from "@/types/horse";
import NumberButton from "@/components/prediction/ui/NumberButton";
import { toggleSingle, toggleMulti, toggleMultiWithLimit, toggleAll } from "@/components/prediction/utils/toggle";

type Props = {
    horses: Horse[];
    allowedNumbers: number[]; // 軸にのみ適用
    onChange: (value: { axis: number[]; opponents: number[] }) => void;
    axisLimit: number;
};

export default function NagashiBaseSelector({
    horses,
    allowedNumbers,
    onChange,
    axisLimit,
}: Props) {
    const [axis, setAxis] = useState<number[]>([]);
    const [opponents, setOpponents] = useState<number[]>([]);
    const [isAllOpponents, setIsAllOpponents] = useState(false);

    // 軸候補: allowedNumbersに含まれる馬のみ
    const axisCandidates = horses.filter(h => allowedNumbers.includes(Number(h.number)));

    // 相手候補: 全馬 (ただし軸に選ばれた馬は除く)
    const opponentCandidates = horses.filter(h => !axis.includes(Number(h.number)));

    const handleToggleAxis = (num: number) => {
        let nextAxis: number[];
        if (axis.includes(num)) {
            nextAxis = axis.filter(n => n !== num);
        } else {
            // axisLimit が 1 の場合は入れ替え（toggleSingle的な挙動）
            if (axisLimit === 1) {
                nextAxis = [num];
            } else {
                nextAxis = toggleMultiWithLimit(axis, num, axisLimit);
            }
        }
        setAxis(nextAxis);

        // 軸に選ばれた馬が相手に含まれていたら削除
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
                block: "start",
            });
        }
    }, [axis, axisLimit]);


    const handleToggleAllOpponents = () => {
        // 総流しの対象は「相手候補」の全馬
        const allNums = opponentCandidates.map(h => Number(h.number));

        // 現在の選択状態と比較してトグル
        const next = toggleAll(opponents, allNums);
        setOpponents(next);
        setIsAllOpponents(next.length === allNums.length && allNums.length > 0);
    };

    useEffect(() => {
        onChange({ axis, opponents });
    }, [axis, opponents]);

    // 総流しチェックボックスの状態更新
    useEffect(() => {
        const allNums = opponentCandidates.map(h => Number(h.number));
        setIsAllOpponents(allNums.length > 0 && opponents.length === allNums.length);
    }, [opponentCandidates, opponents]);

    return (
        <div className="space-y-6">
            {/* 軸選択エリア */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-sm md:text-base">
                        軸馬 <span className="text-xs font-normal text-gray-500">（印のみ・{axisLimit}頭まで）</span>
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

            {/* 相手選択エリア */}
            <div>
                {/* ★ ここにスクロール先を置く */}
                <div ref={opponentSectionRef}></div>

                <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-sm md:text-base">
                        相手 <span className="text-xs font-normal text-gray-500">（全馬）</span>
                    </p>
                    <label className="flex items-center gap-1 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={isAllOpponents}
                            onChange={handleToggleAllOpponents}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-bold text-gray-700">総流し</span>
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
