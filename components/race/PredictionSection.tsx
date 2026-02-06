"use client";

import { useState } from "react";
import MarkSelector from "@/components/prediction/MarkSelector";
import PredictionForm from "@/components/prediction/PredictionForm";
import PostList from "@/components/community/PostList/index";
import { Bet } from "@/types/bet";
import type { Race } from "@/lib/races";

type Props = {
    race: Race;
};

/**
 * 予想入力セクション（クライアントコンポーネント）
 * 
 * インタラクティブな機能:
 * - 印選択
 * - 買い目入力
 * - コメント入力
 * - 投稿
 */
export default function PredictionSection({ race }: Props) {
    const [prediction, setPrediction] = useState<Record<string, string>>({});
    const [bets, setBets] = useState<Bet[]>([]);
    const [comment, setComment] = useState("");

    return (
        <div className="space-y-8">
            {/* 出馬表（印選択付き） */}
            <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
                    出馬表
                </h2>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-3 py-2 text-left">枠</th>
                                <th className="px-3 py-2 text-left">馬番</th>
                                <th className="px-3 py-2 text-left">印</th>
                                <th className="px-3 py-2 text-left">馬名</th>
                                <th className="px-3 py-2 text-left">斤量</th>
                                <th className="px-3 py-2 text-left">騎手</th>
                            </tr>
                        </thead>

                        <tbody>
                            {race.horses.map((horse) => {
                                const frame = Number(horse.frame);
                                const frameColors: Record<number, string> = {
                                    1: "bg-white text-black border",
                                    2: "bg-black text-white",
                                    3: "bg-red-600 text-white",
                                    4: "bg-blue-600 text-white",
                                    5: "bg-yellow-400 text-black",
                                    6: "bg-green-600 text-white",
                                    7: "bg-orange-500 text-white",
                                    8: "bg-pink-500 text-white",
                                };

                                return (
                                    <tr key={horse.number || horse.name} className="border-t">
                                        <td className="px-3 py-2">
                                            {horse.frame && (
                                                <span
                                                    className={`px-3 py-1 rounded font-bold inline-block text-center ${frameColors[frame] || ""}`}
                                                >
                                                    {horse.frame}
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-3 py-2">{horse.number || "-"}</td>

                                        <td className="px-3 py-2">
                                            <MarkSelector
                                                prediction={prediction}
                                                targetKey={horse.name}
                                                onChange={setPrediction}
                                            />
                                        </td>

                                        <td className="px-3 py-2">{horse.name}</td>
                                        <td className="px-3 py-2">{horse.weight}</td>
                                        <td className="px-3 py-2">{horse.jockey}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 予想フォーム */}
            <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                    あなたの予想
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

            {/* コミュニティ */}
            <section id="post-section">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                    みんなの予想
                </h2>
                <PostList raceId={race.id} race={race} />
            </section>
        </div>
    );
}
