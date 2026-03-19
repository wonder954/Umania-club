/**
 * 追加済み馬券リスト表示コンポーネント
 */

import React from "react";
import { Bet } from "@/types/bet";
import BetCard from "../../common/BetCard";
import type { RaceViewModel } from "@/viewmodels/raceViewModel";

interface BetListProps {
    bets: Bet[];
    onRemove: (id: string) => void;
    race: RaceViewModel;
}

export function BetList({ bets, onRemove, race }: BetListProps) {
    if (bets.length === 0) {
        return null;
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
                            w-6 h-6 
                            flex items-center justify-center
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

/**
 * 空の状態表示コンポーネント
 */
export function EmptyBetList() {
    return (
        <div className="text-center py-8 text-gray-400">
            <p className="text-sm">まだ馬券が追加されていません</p>
            <p className="text-xs mt-1">上のフォームから馬券を追加してください</p>
        </div>
    );
}