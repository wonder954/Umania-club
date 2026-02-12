"use client";

import { useState, useRef } from "react";
import HorseTable from "@/components/race/HorseTable";
import PredictionForm from "@/components/prediction/PredictionForm";
import { Bet } from "@/types/bet";
import type { Race } from "@/lib/races";

export default function PredictionArea({ race }: { race: Race }) {
    const [prediction, setPrediction] = useState<Record<string, string>>({});
    const [bets, setBets] = useState<Bet[]>([]);
    const [comment, setComment] = useState("");

    const horseTableRef = useRef<HTMLDivElement>(null);

    const handleReset = () => {
        setPrediction({});
        setBets([]);
        setComment("");

        setTimeout(() => {
            horseTableRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 0);
    };

    return (
        <div className="space-y-10">

            {/* 出馬表 */}
            <div ref={horseTableRef} className="scroll-mt-24">
                <HorseTable
                    race={race}
                    prediction={prediction}
                    onPredictionChange={setPrediction}
                />
            </div>

            {/* 予想フォーム */}
            <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                    <span className="text-slate-500 text-2xl">🐎</span>
                    あなたの予想
                    <span className="text-slate-500 text-2xl">🐎</span>
                </h2>

                <PredictionForm
                    race={race}
                    prediction={prediction}
                    setPrediction={setPrediction}
                    bets={bets}
                    setBets={setBets}
                    comment={comment}
                    setComment={setComment}
                    onReset={handleReset}
                />
            </section>
        </div>
    );
}