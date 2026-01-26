import { useState, useEffect } from "react";
import { Horse } from "@/types/horse";
import { NagashiSelectorValue } from "@/types/bet";

type Props = {
    horses: Horse[];
    allowedNumbers: number[];
    onChange: (v: NagashiSelectorValue) => void;
};

export default function SanrenpukuSelector({
    horses,
    allowedNumbers,
    onChange,
}: Props) {
    const [axis, setAxis] = useState<number[]>([]); // 軸1〜2頭
    const [opponents, setOpponents] = useState<number[]>([]);
    const [isAllOpponents, setIsAllOpponents] = useState(false);

    // 軸馬は印のみ
    const axisCandidates = horses.filter((h) =>
        allowedNumbers.includes(Number(h.number))
    );

    // 相手は全馬（軸は除外）
    const opponentCandidates = horses.filter(
        (h) => !axis.includes(Number(h.number))
    );

    // 軸の選択（最大2頭）
    const toggleAxis = (num: number) => {
        if (axis.includes(num)) {
            setAxis(axis.filter((n) => n !== num));
            return;
        }
        if (axis.length < 2) {
            setAxis([...axis, num]);
            setOpponents([]); // 軸変更時に相手リセット
            setIsAllOpponents(false);
        }
    };

    // 相手の選択
    const toggleOpponent = (num: number) => {
        if (opponents.includes(num)) {
            setOpponents(opponents.filter((n) => n !== num));
        } else {
            setOpponents([...opponents, num]);
        }
    };

    // 総流し
    const toggleAllOpponents = () => {
        if (isAllOpponents) {
            setOpponents([]);
            setIsAllOpponents(false);
        } else {
            setOpponents(opponentCandidates.map((h) => Number(h.number)));
            setIsAllOpponents(true);
        }
    };

    // 親へ通知（統一型）
    useEffect(() => {
        onChange({
            axis,        // ← number[] のままでOK（BettingForm 側で吸収）
            opponents,
        });
    }, [axis, opponents]);

    return (
        <div className="space-y-6">

            {/* 軸馬（1〜2頭） */}
            <div>
                <p className="font-bold mb-2">軸馬（印のみ・最大2頭）</p>
                <div className="grid grid-cols-6 gap-2">
                    {axisCandidates.map((h) => {
                        const num = Number(h.number);
                        const selected = axis.includes(num);
                        return (
                            <button
                                key={num}
                                onClick={() => toggleAxis(num)}
                                className={`aspect-square rounded flex items-center justify-center font-mono font-bold text-lg ${selected
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

            {/* 相手馬 */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="font-bold">相手（全馬）</p>

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
                    {opponentCandidates.map((h) => {
                        const num = Number(h.number);
                        return (
                            <button
                                key={num}
                                onClick={() => toggleOpponent(num)}
                                className={`aspect-square rounded flex items-center justify-center font-mono font-bold text-lg ${opponents.includes(num)
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