"use client";

import { useState } from "react";
import HorseTable from "@/components/race/HorseTable";
import PredictionForm from "@/components/prediction/PredictionForm";
import { Bet } from "@/types/bet";
import type { Race } from "@/lib/races";

type Props = {
    race: Race;
};

/**
 * 予想エリアコンポーネント
 * 
 * 責務:
 * - 出馬表（印選択）の表示
 * - 予想フォームの表示
 * - 予想入力に関するstate管理
 */
export default function PredictionArea({ race }: Props) {
    const [prediction, setPrediction] = useState<Record<string, string>>({});
    const [bets, setBets] = useState<Bet[]>([]);
    const [comment, setComment] = useState("");

    return (
        <div className="space-y-8">
            {/* 出馬表（印選択） */}
            <HorseTable
                race={race}
                prediction={prediction}
                onPredictionChange={setPrediction}
            />

            {/* 予想フォーム */}
            <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-blue-500 text-2xl">🐎</span>
                    あなたの予想
                    <span className="text-blue-500 text-2xl">🐎</span>
                </h2>

                <PredictionForm
                    race={race}
                    prediction={prediction}
                    setPrediction={setPrediction}
                    bets={bets}
                    setBets={setBets}
                    comment={comment}
                    setComment={setComment}
                />
            </section>
        </div>
    );
}
