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

    const calculatedPoints = useMemo(() => {
        // ▼ BOX / NORMAL
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

        // ▼ 流し
        if (inputMode === "nagashi") {
            // 3連単流し（特殊）
            if (selectedType === "3連単") {
                const base = calcTrifectaNagashiPoints(trifectaNagashi);
                return isMulti ? base * 6 : base;
            }

            // 通常の流し
            if (axis.length === 0 || wings.length === 0) return 0;

            if (selectedType === "馬連" || selectedType === "ワイド")
                return wings.length;

            if (selectedType === "馬単") {
                const base = wings.length;
                return isMulti ? base * 2 : base;
            }

            if (selectedType === "3連複") {
                return axis.length * ((wings.length * (wings.length - 1)) / 2);
            }
        }

        // ▼ フォーメーション（ここが重要）
        if (inputMode === "formation") {
            const expanded = expandFormation({
                type: selectedType,
                mode: inputMode,
                formation,
            });

            return expanded.length;
        }

        return 0;
    }, [
        selectedType,
        inputMode,
        boxSelected,
        axis,
        wings,
        formation,
        isMulti,
        trifectaNagashi,
    ]);

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
                <div className="border rounded-lg overflow-hidden">
                    {bets.map((bet) => (
                        <div
                            key={bet.id}
                            className="flex justify-between items-center p-3 border-b bg-white"
                        >
                            <div>
                                <span className="inline-block bg-gray-200 text-gray-700 text-xs px-1.5 rounded mr-2">
                                    {bet.type} / {bet.mode}
                                    {bet.isMulti ? " / マルチ" : ""}
                                </span>

                                {/* ボックス */}
                                {bet.box && (
                                    <span className="text-sm font-mono">
                                        {bet.box.join("-")}
                                    </span>
                                )}

                                {/* 馬単（新ロジック） */}
                                {bet.type === "馬単" && bet.axis && bet.wings && (
                                    <span className="text-sm font-mono">
                                        1着軸: {bet.axis.join(",")} / 相手: {bet.wings.join(",")}
                                    </span>
                                )}

                                {/* 馬連（新ロジック） */}
                                {bet.type === "馬連" && bet.axis && bet.wings && (
                                    <span className="text-sm font-mono">
                                        軸: {bet.axis.join(",")} / 相手: {bet.wings.join(",")}
                                    </span>
                                )}

                                {/* 3連複（新ロジック） */}
                                {bet.type === "3連複" && bet.axis && bet.wings && (
                                    <span className="text-sm font-mono">
                                        軸: {bet.axis.join(",")} / 相手: {bet.wings.join(",")}
                                    </span>
                                )}

                                {/* ワイド（新ロジック） */}
                                {bet.type === "ワイド" && bet.axis && bet.wings && (
                                    <span className="text-sm font-mono">
                                        軸: {bet.axis.join(",")} / 相手: {bet.wings.join(",")}
                                    </span>
                                )}

                                {/* 3連単流し（特殊） */}
                                {bet.trifectaNagashi && (
                                    <div className="mt-2">
                                        <button
                                            onClick={() =>
                                                setOpenBetId(openBetId === bet.id ? null : bet.id)
                                            }
                                            className="
        flex items-center gap-1 
        text-xs font-semibold
        text-blue-600 hover:text-blue-800 
        transition-colors
      "
                                        >
                                            <span className="text-sm">
                                                {openBetId === bet.id ? "▼" : "▶"}
                                            </span>
                                            <span className="underline">
                                                {openBetId === bet.id ? "買い目を隠す" : "買い目を表示"}
                                            </span>
                                        </button>

                                        {openBetId === bet.id && (
                                            <div
                                                className="
          mt-2 p-3 
          bg-gray-50 
          border border-gray-200 
          rounded-lg 
          shadow-sm
          space-y-1 
          text-xs font-mono text-gray-700
        "
                                            >
                                                {(() => {
                                                    const expanded = expandNagashi(bet);

                                                    return expanded.map((arr, i) => (
                                                        <div key={i} className="flex items-center gap-2">
                                                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700">
                                                                {arr[0]}
                                                            </span>
                                                            <span className="text-gray-500">→</span>
                                                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                                                                {arr[1]}
                                                            </span>
                                                            <span className="text-gray-500">→</span>
                                                            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700">
                                                                {arr[2]}
                                                            </span>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* フォーメーション */}
                                {bet.formation && (
                                    <span className="text-sm font-mono">
                                        [{bet.formation.first.join(",")}] →
                                        [{bet.formation.second.join(",")}] →
                                        [{bet.formation.third.join(",")}]
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold">{bet.points}点</span>
                                <button
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