"use client";
import { useState, useEffect } from "react";
import { Horse } from "@/types/horse";
import { NagashiSelectorValue } from "@/types/bet";
import NumberButton from "@/components/prediction/ui/NumberButton";
import {
    toggleSingle,
    toggleMulti,
    toggleAll
} from "@/components/prediction/utils/toggle";

type Props = {
    horses: Horse[];
    allowedNumbers: number[];
    onChange: (v: NagashiSelectorValue) => void;
};

export default function UmatanSelector({
    horses,
    allowedNumbers,
    onChange,
}: Props) {
    const [axis, setAxis] = useState<number | null>(null);
    const [opponents, setOpponents] = useState<number[]>([]);
    const [isAllOpponents, setIsAllOpponents] = useState(false);

    // ★ 軸：印ありだけ
    const axisCandidates = horses.filter(h =>
        allowedNumbers.includes(Number(h.number))
    );

    // ★ 相手：全馬（軸だけ除外）
    const opponentCandidates = horses.filter(
        h => Number(h.number) !== axis
    );

    // 軸（単一選択）
    const toggleAxis = (num: number) => {
        const next = toggleSingle(axis, num);
        setAxis(next);
        setOpponents([]);
        setIsAllOpponents(false);
    };

    // 相手（複数選択）
    const toggleOpponent = (num: number) => {
        setOpponents(toggleMulti(opponents, num));
    };

    // ★ 総流し：全馬対象（軸以外）
    const toggleAllOpponents = () => {
        const allNums = opponentCandidates.map(h => Number(h.number));
        const next = toggleAll(opponents, allNums);
        setOpponents(next);
        setIsAllOpponents(next.length === allNums.length);
    };

    useEffect(() => {
        onChange({ axis, opponents });
    }, [axis, opponents]);

    return (
        <div className="space-y-6">

            {/* 軸馬（1着固定） */}
            <div>
                <p className="font-bold mb-2">1着（軸・印のみ）</p>
                <div className="grid grid-cols-6 gap-2">
                    {axisCandidates.map(h => {
                        const num = Number(h.number);
                        return (
                            <NumberButton
                                key={num}
                                num={num}
                                name={h.name}
                                selected={axis === num}
                                color="red"
                                onClick={() => toggleAxis(num)}
                            />
                        );
                    })}
                </div>
            </div>

            {/* 相手（2着） */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="font-bold">2着（相手・全馬）</p>

                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isAllOpponents}
                            onChange={toggleAllOpponents}
                        />
                        総流し
                    </label>
                </div>

                <div className="grid grid-cols-6 gap-2">
                    {opponentCandidates.map(h => {
                        const num = Number(h.number);

                        return (
                            <NumberButton
                                key={num}
                                num={num}
                                name={h.name}
                                selected={opponents.includes(num)}
                                color="blue"
                                onClick={() => toggleOpponent(num)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}