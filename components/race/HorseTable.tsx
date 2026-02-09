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
 * PC版：従来のテーブル表示
 * スマホ版：netkeiba式（枠→馬番→印→馬名1行）
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
            <p className="text-sm text-gray-500 px-1 mt-1 mb-2">
                ※買い目を追加するには、まず出馬表で印をつけてください
            </p>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">

                {/* スマホ版（md未満） */}
                <div className="md:hidden">
                    {race.horses.map((horse) => {
                        const frame = Number(horse.frame);

                        // 騎手名を3文字に整形（空白・ドット除去）
                        const jockeyShort =
                            horse.jockey?.replace(/[\s.]/g, "").slice(0, 3) || "---";

                        return (
                            <div
                                key={horse.number || horse.name}
                                className="flex items-center gap-2 py-2 border-b px-3"
                            >
                                {/* 枠番 */}
                                <div
                                    className={`w-8 h-8 flex items-center justify-center rounded font-bold ${frameColors[frame]}`}
                                >
                                    {horse.frame}
                                </div>

                                {/* 馬番 */}
                                <div className="w-8 text-center font-medium">
                                    {horse.number}
                                </div>

                                {/* 印 */}
                                <div className="flex gap-1">
                                    <MarkSelector
                                        prediction={prediction}
                                        targetKey={horse.name}
                                        onChange={onPredictionChange}
                                    />
                                </div>

                                {/* 馬名 + 斤量/騎手（右側2行） */}
                                <div className="flex-1 flex items-center justify-between">
                                    {/* 馬名（1行固定） */}
                                    <div className="font-bold whitespace-nowrap overflow-hidden text-ellipsis text-[14px]">
                                        {horse.name}
                                    </div>

                                    {/* 斤量 / 騎手（縦2行・小さく） */}
                                    <div className="text-[13px] text-gray-600 text-right leading-tight ml-2 shrink-0">
                                        <div>{horse.weight}</div>
                                        <div>{jockeyShort}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* PC版（md以上） */}
                <div className="hidden md:block">
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
                                            <span
                                                className={`px-3 py-1 rounded font-bold inline-block text-center ${frameColors[frame]}`}
                                            >
                                                {horse.frame}
                                            </span>
                                        </td>

                                        <td className="px-3 py-2">{horse.number || "-"}</td>

                                        <td className="px-3 py-2">
                                            <MarkSelector
                                                prediction={prediction}
                                                targetKey={horse.name}
                                                onChange={onPredictionChange}
                                            />
                                        </td>

                                        <td className="px-3 py-2 whitespace-nowrap">
                                            {horse.name}
                                        </td>

                                        <td className="px-3 py-2">{horse.weight}</td>
                                        <td className="px-3 py-2">{horse.jockey}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}