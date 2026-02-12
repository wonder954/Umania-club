/** 馬券入力セレクター統合コンポーネント */

import React from "react";
import { BetType, InputMode, NagashiSelectorValue } from "@/types/bet";
import { Horse } from "@/types/horse";
import BoxSelector from "./BoxSelector";
import FormationSelector from "./FormationSelector";
import TrifectaNagashiSelector from "./TrifectaNagashiSelector";
import UmatanSelector from "./UmatanSelector";
import UmarenSelector from "./UmarenSelector";
import SanrenpukuSelector from "./SanrenpukuSelector";
import { BettingInputState } from "../hooks/useBettingInput";

interface BettingSelectorProps {
    betType: BetType;
    inputMode: InputMode | null;
    horses: Horse[];
    allowedNumbers?: number[];
    state: BettingInputState;
    onBoxChange: (selected: number[]) => void;
    onFormationChange: (formation: {
        first: number[];
        second: number[];
        third: number[];
    }) => void;
    onNagashiChange: (value: NagashiSelectorValue) => void;
    onTrifectaNagashiChange: (value: {
        pattern: "1" | "2" | "3" | "12" | "13" | "23";
        first: number | null;
        second: number | null;
        third: number | null;
        wings: number[];
    }) => void;
}

export function BettingSelector({
    betType,
    inputMode,
    horses,
    allowedNumbers,
    state,
    onBoxChange,
    onFormationChange,
    onNagashiChange,
    onTrifectaNagashiChange,
}: BettingSelectorProps) {

    /** 💡 共通の説明 UI（細田守風） */
    const Hint = ({ children }: { children: React.ReactNode }) => (
        <div
            className="
                text-xs text-slate-600 mb-3 
                bg-white/60 backdrop-blur-sm 
                p-3 rounded-xl 
                border border-white/40 shadow-sm
            "
        >
            {children}
        </div>
    );

    // 通常買い
    if (inputMode === null) {
        if (betType === "馬単" || betType === "3連単") {
            return (
                <>
                    <Hint>
                        💡 {betType === "馬単" ? "1着、2着" : "1着、2着、3着"} の順に1頭ずつ選択
                    </Hint>

                    <FormationSelector
                        horses={horses}
                        formation={state.formation}
                        onChange={onFormationChange}
                        allowedNumbers={allowedNumbers}
                        selectedType={betType}
                        isSingleMode={true}
                    />
                </>
            );
        }

        return (
            <>
                <Hint>
                    💡 {betType === "単勝" || betType === "複勝"
                        ? "選んだ馬を1点ずつ購入"
                        : "選んだ馬の組み合わせを1点として購入"}
                </Hint>

                <BoxSelector
                    horses={horses.map((h) => ({ number: h.number, name: h.name }))}
                    selected={state.boxSelected}
                    onChange={onBoxChange}
                    allowedNumbers={allowedNumbers}
                    maxCount={
                        betType === "馬連" || betType === "ワイド"
                            ? 2
                            : betType === "3連複"
                                ? 3
                                : undefined
                    }
                />
            </>
        );
    }

    // ボックス
    if (inputMode === "box") {
        return (
            <BoxSelector
                horses={horses.map((h) => ({ number: h.number, name: h.name }))}
                selected={state.boxSelected}
                onChange={onBoxChange}
                allowedNumbers={allowedNumbers}
            />
        );
    }

    // フォーメーション
    if (inputMode === "formation") {
        return (
            <FormationSelector
                horses={horses}
                formation={state.formation}
                onChange={onFormationChange}
                allowedNumbers={allowedNumbers}
                selectedType={betType}
            />
        );
    }

    // 流し
    if (inputMode === "nagashi") {
        return renderNagashiSelector(
            betType,
            horses,
            allowedNumbers,
            onNagashiChange,
            onTrifectaNagashiChange
        );
    }

    return null;
}

/** 流しセレクター */
function renderNagashiSelector(
    betType: BetType,
    horses: Horse[],
    allowedNumbers: number[] | undefined,
    onNagashiChange: (value: NagashiSelectorValue) => void,
    onTrifectaNagashiChange: (value: {
        pattern: "1" | "2" | "3" | "12" | "13" | "23";
        first: number | null;
        second: number | null;
        third: number | null;
        wings: number[];
    }) => void
): React.ReactNode {
    const selectorMap: Record<BetType, React.ReactNode> = {
        馬単: (
            <UmatanSelector
                horses={horses}
                allowedNumbers={allowedNumbers ?? []}
                onChange={onNagashiChange}
            />
        ),
        馬連: (
            <UmarenSelector
                horses={horses}
                allowedNumbers={allowedNumbers ?? []}
                onChange={onNagashiChange}
            />
        ),
        ワイド: (
            <UmarenSelector
                horses={horses}
                allowedNumbers={allowedNumbers ?? []}
                onChange={onNagashiChange}
            />
        ),
        "3連複": (
            <SanrenpukuSelector
                horses={horses}
                allowedNumbers={allowedNumbers ?? []}
                onChange={onNagashiChange}
            />
        ),
        "3連単": (
            <TrifectaNagashiSelector
                horses={horses}
                allowedNumbers={allowedNumbers ?? []}
                onChange={onTrifectaNagashiChange}
            />
        ),
        単勝: null,
        複勝: null,
    };

    return selectorMap[betType];
}