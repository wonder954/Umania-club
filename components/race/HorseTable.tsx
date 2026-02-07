"use client";

import MarkSelector from "@/components/prediction/MarkSelector";
import type { Race } from "@/lib/races";

type Props = {
    race: Race;
    prediction: Record<string, string>;
    onPredictionChange: (prediction: Record<string, string>) => void;
};

/**
 * 出馬表コンポーネント（印選択付き）
 * 
 * 責務:
 * - レースの出馬表を表示
 * - 各馬に印を選択できる機能を提供
 */
export default function HorseTable({ race, prediction, onPredictionChange }: Props) {
    // 枠番の色
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
        <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-blue-500 text-2xl">🏇</span>
                出馬表
                <span className="text-blue-500 text-2xl">🏇</span>
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
                                            onChange={onPredictionChange}
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
    );
}
