"use client";

import { useRef, useEffect, useMemo } from "react";
import { Bet } from "@/types/bet";
import { Horse } from "@/types/horse";

import { useBettingInput } from "@/components/prediction/hooks/useBettingInput";
import { AVAILABLE_MODES, isMultiAvailable } from "@/components/prediction/utils/bettingFormConstants";
import { calculateCurrentPoints } from "@/components/prediction/utils/bettingCalculations";
import { createBetsFromInput, isBetValid } from "@/components/prediction/utils/createBet";

import {
    BetTypeSelector,
    InputModeSelector,
    MultiCheckbox,
    PointsDisplay,
} from "@/components/prediction/components/BettingFormComponents";

import { BettingSelector } from "@/components/prediction/selectors/BettingSelector";
import { BetList } from "@/components/prediction/components/BetList";
import type { RaceViewModel } from "@/viewmodels/raceViewModel";

interface BettingFormProps {
    horses: { number: number | null; name: string }[];
    bets: Bet[];
    onChange: (bets: Bet[]) => void;
    allowedNumbers?: number[];
    race: RaceViewModel;   // ← ここを変更
}

export default function BettingForm({
    horses,
    bets,
    onChange,
    allowedNumbers,
    race,
}: BettingFormProps) {
    const { state, actions } = useBettingInput();

    const numberSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (state.selectedType === "単勝" || state.selectedType === "複勝") {
            numberSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
            return;
        }

        if (state.selectedType && state.inputMode) {
            numberSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }, [state.selectedType, state.inputMode]);

    const betListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bets.length > 0) {
            betListRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }, [bets.length]);

    const normalizedHorses: Horse[] = useMemo(() => {
        return horses.map((h) => ({
            number: Number(h.number),
            name: h.name,
        }));
    }, [horses]);

    const calculatedPoints = useMemo(() => {
        return calculateCurrentPoints(state.selectedType, state.inputMode, state);
    }, [
        state.selectedType,
        state.inputMode,
        state.boxSelected,
        state.formation,
        state.axis,
        state.wings,
        state.trifectaNagashi,
        state.isMulti,
    ]);

    const handleAddBet = () => {
        if (calculatedPoints === 0) return;

        const newBets = createBetsFromInput(state);

        if (!newBets.every((bet) => isBetValid(bet))) {
            alert("選択内容が不完全です。馬券を追加できません。");
            return;
        }

        onChange([...bets, ...newBets]);
        actions.resetInput();
    };

    const handleRemoveBet = (id: string) => {
        onChange(bets.filter((bet) => bet.id !== id));
    };

    const multiAvailable = isMultiAvailable(state.selectedType, state.inputMode);
    const availableModes = AVAILABLE_MODES[state.selectedType];

    return (
        <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-sm text-gray-700">買い目追加</h3>

                <BetTypeSelector
                    selectedType={state.selectedType}
                    onChange={actions.setSelectedType}
                />

                <InputModeSelector
                    availableModes={availableModes}
                    selectedMode={state.inputMode}
                    onChange={actions.setInputMode}
                />

                {multiAvailable && (
                    <MultiCheckbox
                        checked={state.isMulti}
                        onChange={actions.setIsMulti}
                    />
                )}

                <div ref={numberSectionRef}></div>

                <BettingSelector
                    betType={state.selectedType}
                    inputMode={state.inputMode}
                    horses={normalizedHorses}
                    allowedNumbers={allowedNumbers}
                    state={state}
                    onBoxChange={actions.setBoxSelected}
                    onFormationChange={actions.setFormation}
                    onNagashiChange={actions.handleNagashiChange}
                    onTrifectaNagashiChange={actions.setTrifectaNagashi}
                />

                <PointsDisplay
                    points={calculatedPoints}
                    betType={state.selectedType}
                    inputMode={state.inputMode}
                    onAdd={handleAddBet}
                />
            </div>

            <div ref={betListRef}></div>

            <BetList bets={bets} onRemove={handleRemoveBet} race={race} />
        </div>
    );
}