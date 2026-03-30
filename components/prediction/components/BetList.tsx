/**
 * 追加済み馬券リスト表示コンポーネント
 */

import React from "react";
import { Bet } from "@/types/bet";
import BetCard from "../../common/BetCard";
import type { RaceViewModel } from "@/viewmodels/raceViewModel";
import { EmptyBetList } from "./EmptyBetList";

interface BetListProps {
    bets: Bet[];
    onRemove: (id: string) => void;
    race: RaceViewModel;
}

export function BetList({ bets, onRemove, race }: BetListProps) {
    if (bets.length === 0) {
        return <EmptyBetList />;
    }

    return (
        <div className="space-y-3" role="list" aria-label="追加済み馬券一覧">
            {bets.map((bet) => (
                <div key={bet.id} className="relative" role="listitem">
                    <BetCard bet={bet} race={race} />

                    <button
                        onClick={() => onRemove(bet.id)}
                        aria-label={`${bet.type}の馬券を削除`}
                        className="
                            absolute top-2 right-2
                            w-6 h-6 flex items-center justify-center
                            text-red-400 hover:text-red-600
                            hover:bg-red-50
                            rounded-full
                            transition-colors duration-200
                            font-bold text-lg
                        "
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}