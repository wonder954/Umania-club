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

    // ★ 出馬表のセクションへのref
    const horseTableRef = useRef<HTMLDivElement>(null);

    /**
     * 新しい投稿ボタンが押されたときの処理
     * 出馬表の先頭にスムーズにスクロールする
     */
    const handleReset = () => {
        // 状態をリセット
        setPrediction({});
        setBets([]);
        setComment("");

        // 次のレンダリング後にスクロール実行
        setTimeout(() => {
            horseTableRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",  // 画面の上端に配置
            });
        }, 0);
    };

    return (
        <div className="space-y-8">
            {/* 出馬表セクション - ここにrefを設定 */}
            <div ref={horseTableRef} className="scroll-mt-24">
                <HorseTable
                    race={race}
                    prediction={prediction}
                    onPredictionChange={setPrediction}
                />
            </div>


            {/* 予想フォームセクション */}
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
                    onReset={handleReset}
                />
            </section>
        </div>
    );
}