"use client";
import { useState, useMemo } from "react";
import BoxSelector from "./selectors/BoxSelector";
import FormationSelector from "./selectors/FormationSelector";
import TrifectaNagashiSelector from "./selectors/TrifectaNagashiSelector";
import UmatanSelector from "./selectors/UmatanSelector";
import UmarenSelector from "./selectors/UmarenSelector";
import SanrenpukuSelector from "./selectors/SanrenpukuSelector";
import { expandNagashi } from "@/utils/expandNagashi";
import { BetType, Bet, InputMode, TrifectaPattern, NagashiSelectorValue } from "@/types/bet";
import { Horse } from "@/types/horse";
import { expandFormation } from "@/utils/expandFormation";
import BetCard from "@/components/common/BetCard";

const BET_TYPES: BetType[] = ["単勝", "複勝", "馬連", "馬単", "ワイド", "3連複", "3連単"];

const AVAILABLE_MODES: Record<BetType, InputMode[]> = {
    "単勝": ["normal"],
    "複勝": ["normal"],
    "馬連": ["box", "nagashi", "formation"],
    "馬単": ["box", "nagashi", "formation"],
    "ワイド": ["box", "nagashi", "formation"],
    "3連複": ["box", "nagashi", "formation"],
    "3連単": ["box", "nagashi", "formation"],
};

type Props = {
    horses: { number?: number | string; name: string }[];
    bets: Bet[];
    onChange: (bets: Bet[]) => void;
    allowedNumbers?: number[];
};

// 3連単流しの点数計算
function calcTrifectaNagashiPoints({
    pattern,
    first,
    second,
    third,
    wings,
}: {
    pattern: TrifectaPattern;
    first: number | null;
    second: number | null;
    third: number | null;
    wings: number[];
}) {
    const n = wings.length;

    // 必須の固定馬が選ばれていない場合は 0 点
    if (pattern === "1" && !first) return 0;
    if (pattern === "2" && !second) return 0;
    if (pattern === "3" && !third) return 0;
    if (pattern === "12" && (!first || !second)) return 0;
    if (pattern === "13" && (!first || !third)) return 0;
    if (pattern === "23" && (!second || !third)) return 0;

    if (n === 0) return 0;

    switch (pattern) {
        case "1":
        case "2":
        case "3":
            return n * (n - 1); // 2着・3着に流すパターン
        case "12":
        case "13":
        case "23":
            return n; // 1着 or 2着 or 3着に流すパターン
        default:
            return 0;
    }
}

export default function BettingForm({ horses, bets, onChange, allowedNumbers }: Props) {
    const [selectedType, setSelectedType] = useState<BetType>("3連単");
    const [inputMode, setInputMode] = useState<InputMode>("box");
    const [isMulti, setIsMulti] = useState(false);
    const [openBetId, setOpenBetId] = useState<string | null>(null);
    const [singleSelected, setSingleSelected] = useState<number | null>(null);
    // Box
    const [boxSelected, setBoxSelected] = useState<number[]>([]);

    // Formation
    const [formation, setFormation] = useState({
        first: [] as number[],
        second: [] as number[],
        third: [] as number[],
    });

    // Nagashi（通常）
    const [axis, setAxis] = useState<number[]>([]);
    const [wings, setWings] = useState<number[]>([]);
    const handleNagashiChange = (v: NagashiSelectorValue) => {
        if (Array.isArray(v.axis)) {
            setAxis(v.axis);          // 3連複（複数軸）
        } else if (v.axis) {
            setAxis([v.axis]);        // 馬単・馬連（単一軸）
        } else {
            setAxis([]);              // 軸なし
        }

        setWings(v.opponents);
    };


    // 3連単流し専用
    const [trifectaNagashi, setTrifectaNagashi] = useState<{
        pattern: TrifectaPattern;
        first: number | null;
        second: number | null;
        third: number | null;
        wings: number[];
    }>({
        pattern: "1",
        first: null,
        second: null,
        third: null,
        wings: [],
    });

    // BettingForm.tsx の calculatedPoints を修正

    const calculatedPoints = useMemo(() => {
        // BOX / NORMAL
        if (inputMode === "box" || inputMode === "normal") {
            const n = boxSelected.length;

            if (selectedType === "単勝" || selectedType === "複勝") return n;
            if (selectedType === "馬連" || selectedType === "ワイド")
                return n >= 2 ? (n * (n - 1)) / 2 : 0;
            if (selectedType === "馬単")
                return n >= 2 ? n * (n - 1) : 0;
            if (selectedType === "3連複")
                return n >= 3 ? (n * (n - 1) * (n - 2)) / 6 : 0;
            if (selectedType === "3連単")
                return n >= 3 ? n * (n - 1) * (n - 2) : 0;
        }

        // ★ フォーメーション・流しは必ず展開して数える
        const tempBet: Bet = {
            id: 'temp',
            type: selectedType,
            mode: inputMode,
            isMulti,
            points: 0,
            numbers: [],
        };

        if (inputMode === "formation") {
            tempBet.formation = formation;
            return expandFormation(tempBet).length;
        }

        if (inputMode === "nagashi") {
            if (selectedType === "3連単") {
                tempBet.trifectaNagashi = trifectaNagashi;
            } else {
                tempBet.axis = axis;
                tempBet.wings = wings;
            }
            return expandNagashi(tempBet).length;
        }

        return 0;
    }, [selectedType, inputMode, boxSelected, formation, axis, wings, isMulti, trifectaNagashi]);

    const addBet = () => {
        if (calculatedPoints === 0) return;

        const newBet: Bet = {
            id: Math.random().toString(36).substr(2, 9),
            type: selectedType,
            mode: inputMode,
            isMulti,
            points: 0,
            numbers: [], // ← 必須
        };

        // ▼ 入力内容を newBet に詰める
        if (inputMode === "box" || inputMode === "normal") {
            newBet.box = [...boxSelected];
            newBet.numbers = [...boxSelected]; // ← 追加
        }

        if (inputMode === "nagashi") {
            if (selectedType === "3連単") {
                newBet.trifectaNagashi = { ...trifectaNagashi };
            } else {
                newBet.axis = [...axis];
                newBet.wings = [...wings];
            }
        }

        if (inputMode === "formation") {
            newBet.formation = {
                first: [...formation.first],
                second: [...formation.second],
                third: formation.third ? [...formation.third] : [],
            };

            newBet.numbers = [
                ...formation.first,
                ...formation.second,
                ...(formation.third ?? []),
            ];
        }





        let expanded: number[][] = [];

        // ▼ box / normal の場合 → 点数は選択頭数そのまま
        if (inputMode === "box" || inputMode === "normal") {
            newBet.points = boxSelected.length;
            newBet.numbers = [...boxSelected];
        }
        // ▼ フォーメーションの場合
        else if (inputMode === "formation") {
            expanded = expandFormation(newBet);
            newBet.points = expanded.length;
            newBet.numbers = expanded[0] ?? [];
        }
        // ▼ 流し（nagashi / 3連単流し）の場合
        else {
            expanded = expandNagashi(newBet);
            newBet.points = expanded.length;
            newBet.numbers = expanded[0] ?? [];
        }

        onChange([...bets, newBet]);

        // ▼ リセット
        setBoxSelected([]);
        setAxis([]);
        setWings([]);
        setFormation({ first: [], second: [], third: [] });
        setIsMulti(false);
        setTrifectaNagashi({
            pattern: "1",
            first: null,
            second: null,
            third: null,
            wings: [],
        });
    };

    const removeBet = (id: string) => {
        onChange(bets.filter((b) => b.id !== id));
    };

    const trifectaPatternLabel = (p: TrifectaPattern) => {
        switch (p) {
            case "1":
                return "1着固定";
            case "2":
                return "2着固定";
            case "3":
                return "3着固定";
            case "12":
                return "1・2着固定";
            case "13":
                return "1・3着固定";
            case "23":
                return "2・3着固定";
            default:
                return "";
        }
    };

    const normalizedHorses: Horse[] = useMemo(() => {
        return horses.map(h => ({
            number: Number(h.number),
            name: h.name,
        }));
    }, [horses]);

    return (
        <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-sm text-gray-700">買い目追加</h3>

                {/* 買い目タイプ */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {BET_TYPES.map((t) => (
                        <button
                            key={t}
                            onClick={() => {
                                setSelectedType(t);
                                setInputMode(AVAILABLE_MODES[t][0]);
                                setIsMulti(false);
                            }}
                            className={`px-3 py-1 rounded-full text-sm ${selectedType === t
                                ? "bg-blue-600 text-white"
                                : "bg-white border text-gray-600"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* 買い方（単勝・複勝以外で表示） */}
                {selectedType !== "単勝" && selectedType !== "複勝" && (
                    <div className="flex gap-2 mb-4">
                        {AVAILABLE_MODES[selectedType].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => {
                                    setInputMode(mode);
                                    setIsMulti(false);
                                }}
                                className={`px-3 py-1 rounded-full text-sm ${inputMode === mode ? "bg-green-600 text-white" : "bg-white border"
                                    }`}
                            >
                                {mode === "box" && "ボックス"}
                                {mode === "formation" && "フォーメーション"}
                                {mode === "nagashi" && "流し"}
                            </button>
                        ))}
                    </div>
                )}

                {/* マルチ（3連単はフォーメーションのみ、馬単はフォーメーション・流し） */}
                {(
                    (selectedType === "3連単" && (inputMode === "formation" || inputMode === "nagashi")) ||
                    (selectedType === "馬単" && (inputMode === "formation" || inputMode === "nagashi"))
                ) && (
                        <label className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                checked={isMulti}
                                onChange={(e) => setIsMulti(e.target.checked)}
                            />
                            <span className="text-sm font-bold">マルチにする</span>
                        </label>
                    )}

                {/* 入力 UI */}
                {(inputMode === "box" || inputMode === "normal") && (
                    <BoxSelector
                        horses={horses}
                        selected={boxSelected}
                        onChange={setBoxSelected}
                        allowedNumbers={allowedNumbers}
                    />
                )}

                {/* ▼▼ 買い方ごとの Selector 切り替え ▼▼ */}

                {inputMode === "nagashi" && (() => {

                    const selectorMap: Record<BetType, JSX.Element | null> = {
                        "馬単": (
                            <UmatanSelector
                                horses={normalizedHorses}
                                allowedNumbers={allowedNumbers ?? []}
                                onChange={handleNagashiChange}
                            />
                        ),
                        "馬連": (
                            <UmarenSelector
                                horses={normalizedHorses}
                                allowedNumbers={allowedNumbers ?? []}
                                onChange={handleNagashiChange}
                            />
                        ),
                        "3連複": (
                            <SanrenpukuSelector
                                horses={normalizedHorses}
                                allowedNumbers={allowedNumbers ?? []}
                                onChange={handleNagashiChange}
                            />
                        ),
                        "3連単": (
                            <TrifectaNagashiSelector
                                horses={normalizedHorses}
                                allowedNumbers={allowedNumbers ?? []}
                                onChange={setTrifectaNagashi}
                            />
                        ),

                        // ▼ nagashi では使わない買い方は null
                        "単勝": null,
                        "複勝": null,
                        "ワイド": (
                            <UmarenSelector
                                horses={normalizedHorses}
                                allowedNumbers={allowedNumbers ?? []}
                                onChange={handleNagashiChange}
                            />
                        ),
                    };

                    return selectorMap[selectedType];
                })()}

                {inputMode === "formation" && (
                    <FormationSelector
                        horses={normalizedHorses}
                        formation={formation}
                        onChange={setFormation}
                        allowedNumbers={allowedNumbers}
                        selectedType={selectedType}
                    />
                )}

                {/* 点数表示 */}
                <div className="flex justify-between items-center bg-white p-3 rounded border">
                    <div className="text-sm">
                        <span className="font-bold text-lg text-blue-600">
                            {calculatedPoints}
                        </span>{" "}
                        点
                        <span className="text-gray-400 text-xs ml-2">
                            （{selectedType} / {inputMode}
                            {isMulti ? " / マルチ" : ""}）
                        </span>
                    </div>
                    <button
                        onClick={addBet}
                        disabled={calculatedPoints === 0}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                    >
                        追加する
                    </button>
                </div>
            </div>

            {/* 追加済み買い目 */}
            {bets.length > 0 && (
                <div className="space-y-3">
                    {bets.map((bet) => (
                        <div key={bet.id} className="relative">
                            <BetCard bet={bet} />

                            {/* 削除ボタンだけは BetCard の外側に残す */}
                            <button
                                onClick={() => removeBet(bet.id)}
                                className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}