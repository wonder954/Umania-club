"use client";

import { useState, useRef } from "react";
import HorseTable from "@/components/race/HorseTable";
import PredictionForm from "@/components/prediction/PredictionForm";
import { Bet } from "@/types/bet";
import type { FirestoreRace } from "@/lib/race/types";
import Image from "next/image";
import type { Mark } from "@/types/mark";


export default function PredictionArea({ race }: { race: FirestoreRace }) {
    const [prediction, setPrediction] = useState<Record<string, Mark>>({});
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
        <div className="space-y-10 relative overflow-visible">

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
                    <Image
                        src="/prediction.png"
                        alt="prediction"
                        width={28}
                        height={28}
                        className="h-7 w-auto object-contain drop-shadow-sm"
                    />
                    あなたの予想
                    <Image
                        src="/prediction.png"
                        alt="prediction"
                        width={28}
                        height={28}
                        className="h-7 w-auto object-contain drop-shadow-sm"
                    />
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