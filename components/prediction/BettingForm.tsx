"use client";
import { useState, useMemo } from "react";


type BetType = "単勝" | "複勝" | "馬連" | "馬単" | "ワイド" | "3連複" | "3連単";

const BET_TYPES: BetType[] = ["単勝", "複勝", "馬連", "馬単", "ワイド", "3連複", "3連単"];

export type Bet = {
    id: string;
    type: BetType;
    numbers: number[]; // stored as simple array for simplicity, assume box/formation logic handled in UI input
    points?: number; // Calculated points
};

type Props = {
    horses: { number?: number | string; name: string }[];
    bets: Bet[];
    onChange: (bets: Bet[]) => void;
};

// Simplified bet input: Assume "Main selection" style or "Box" for demo
// For a full app, we need Formation/Box/Nagashi tabs. 
// Let's implement a simple "Select horses" -> Calculate points for "Box" (easiest to implement for POC)
export default function BettingForm({ horses, bets, onChange }: Props) {
    const [selectedType, setSelectedType] = useState<BetType>("3連単");
    const [selectedHorses, setSelectedHorses] = useState<number[]>([]);

    // Simple Box calculation logic
    const calculatedPoints = useMemo(() => {
        const n = selectedHorses.length;
        if (n === 0) return 0;

        switch (selectedType) {
            case "単勝": return n;
            case "複勝": return n;
            case "馬連": return n >= 2 ? (n * (n - 1)) / 2 : 0;
            case "ワイド": return n >= 2 ? (n * (n - 1)) / 2 : 0;
            case "馬単": return n >= 2 ? n * (n - 1) : 0;
            case "3連複": return n >= 3 ? (n * (n - 1) * (n - 2)) / 6 : 0;
            case "3連単": return n >= 3 ? n * (n - 1) * (n - 2) : 0;
            default: return 0;
        }
    }, [selectedType, selectedHorses]);

    const toggleHorse = (numStr: number | string) => {
        const num = Number(numStr);
        if (isNaN(num)) return; // 数値化できない場合は無視

        if (selectedHorses.includes(num)) {
            setSelectedHorses(selectedHorses.filter(n => n !== num));
        } else {
            setSelectedHorses([...selectedHorses, num].sort((a, b) => a - b));
        }
    };

    const addBet = () => {
        if (calculatedPoints === 0) return;

        // Create a new bet entry
        const newBet: Bet = {
            id: Math.random().toString(36).substr(2, 9),
            type: selectedType,
            numbers: [...selectedHorses], // Snapshot
            points: calculatedPoints
        };

        onChange([...bets, newBet]);
        // Reset selection
        setSelectedHorses([]);
    };

    const removeBet = (id: string) => {
        onChange(bets.filter(b => b.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-sm text-gray-700">買い目追加（ボックス）</h3>

                {/* Type Selector */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {BET_TYPES.map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedType(t)}
                            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${selectedType === t
                                ? "bg-blue-600 text-white shadow"
                                : "bg-white border text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Horse Selector Grid */}
                <div className="grid grid-cols-6 gap-2 mb-4">
                    {horses.map(h => (
                        <button
                            key={h.number}
                            type="button"
                            onClick={() => toggleHorse(h.number!)} // assume number exists
                            disabled={!h.number}
                            className={`
                aspect-square rounded flex items-center justify-center font-mono font-bold text-lg
                ${selectedHorses.includes(Number(h.number))
                                    ? "bg-blue-500 text-white shadow-inner"
                                    : "bg-white border text-gray-700 hover:bg-gray-100"}
              `}
                        >
                            {h.number || "-"}
                        </button>
                    ))}
                </div>

                <div className="flex justify-between items-center bg-white p-3 rounded border">
                    <div className="text-sm">
                        <span className="font-bold text-lg text-blue-600">{calculatedPoints}</span> 点
                        <span className="text-gray-400 text-xs ml-2">（{selectedType} ボックス）</span>
                    </div>
                    <button
                        type="button"
                        onClick={addBet}
                        disabled={calculatedPoints === 0}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
                    >
                        追加する
                    </button>
                </div>
            </div>

            {/* Added Bets List */}
            {bets.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                    {bets.map(bet => (
                        <div key={bet.id} className="flex justify-between items-center p-3 border-b last:border-0 bg-white">
                            <div>
                                <span className="inline-block bg-gray-200 text-gray-700 text-xs px-1.5 rounded mr-2">
                                    {bet.type}
                                </span>
                                <span className="text-sm font-mono text-gray-800">
                                    {bet.numbers.join("-")}
                                </span>
                                <span className="text-xs text-gray-500 ml-2">
                                    (Box)
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold">{bet.points}点</span>
                                <button
                                    type="button"
                                    onClick={() => removeBet(bet.id)}
                                    className="text-red-400 hover:text-red-600 p-1"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
