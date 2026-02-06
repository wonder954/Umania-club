"use client";

import { useState } from "react";
import type { RaceResult, Payout } from "@/types/race";

type Props = {
    result: RaceResult | null | undefined;
};

// 枠番の色
const frameColors: Record<number, string> = {
    1: "bg-white text-black border border-gray-300",
    2: "bg-black text-white",
    3: "bg-red-600 text-white",
    4: "bg-blue-600 text-white",
    5: "bg-yellow-400 text-black",
    6: "bg-green-600 text-white",
    7: "bg-orange-500 text-white",
    8: "bg-pink-500 text-white",
};

// 券種の日本語名
const payoutLabels: Record<keyof Payout, string> = {
    win: "単勝",
    place: "複勝",
    bracket: "枠連",
    quinella: "馬連",
    wide: "ワイド",
    exacta: "馬単",
    trio: "3連複",
    trifecta: "3連単",
};

export default function RaceResultSection({ result }: Props) {
    const [showAll, setShowAll] = useState(false);

    if (!result) {
        return (
            <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300">
                <div className="text-4xl mb-3">🏇</div>
                <p className="text-gray-500 font-medium">結果はまだありません</p>
                <p className="text-gray-400 text-sm mt-1">レース終了後に更新されます</p>
            </div>
        );
    }

    const top5 = result.order.slice(0, 5);
    const others = result.order.slice(5);

    return (
        <div className="space-y-6">

            {/* 競走成績 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3">
                    <h3 className="text-white font-bold">競走成績</h3>
                </div>

                {/* PC用テーブル（sm以上） */}
                <div className="overflow-x-auto hidden sm:block">
                    <table className="w-full text-sm" style={{ minWidth: '800px' }}>
                        <colgroup>
                            <col style={{ width: '5%' }} />
                            <col style={{ width: '5%' }} />
                            <col style={{ width: '5%' }} />
                            <col style={{ width: '25%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '20%' }} />
                            <col style={{ width: '8%' }} />
                            <col style={{ width: '12%' }} />
                        </colgroup>

                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-3 py-2 text-center">着</th>
                                <th className="px-3 py-2 text-center">枠</th>
                                <th className="px-3 py-2 text-center">馬番</th>
                                <th className="px-3 py-2 text-left">馬名</th>
                                <th className="px-3 py-2 text-center">タイム</th>
                                <th className="px-3 py-2 text-center">着差</th>
                                <th className="px-3 py-2 text-left">騎手</th>
                                <th className="px-3 py-2 text-center">人気</th>
                                <th className="px-3 py-2 text-right">オッズ</th>
                            </tr>
                        </thead>

                        <tbody>
                            {/* 1〜5着 */}
                            {top5.map((horse) => (
                                <tr
                                    key={horse.number}
                                    className={`border-t ${horse.rank <= 3 ? "bg-yellow-50" : ""}`}
                                >
                                    <td className="px-3 py-2 text-center font-bold">
                                        {horse.rank <= 3 ? (
                                            <span
                                                className={`
                                                    inline-flex items-center justify-center w-7 h-7 rounded-full font-bold
                                                    ${horse.rank === 1 ? "bg-yellow-400 text-yellow-900" : ""}
                                                    ${horse.rank === 2 ? "bg-gray-300 text-gray-700" : ""}
                                                    ${horse.rank === 3 ? "bg-orange-300 text-orange-900" : ""}
                                                `}
                                            >
                                                {horse.rank}
                                            </span>
                                        ) : (
                                            horse.rank
                                        )}
                                    </td>

                                    <td className="px-3 py-2 text-center">
                                        <span
                                            className={`inline-block px-2 py-1 rounded text-xs font-bold ${frameColors[horse.frame]}`}
                                        >
                                            {horse.frame}
                                        </span>
                                    </td>

                                    <td className="px-3 py-2 text-center font-mono">{horse.number}</td>
                                    <td className="px-3 py-2 font-medium">{horse.name}</td>
                                    <td className="px-3 py-2 text-center font-mono">{horse.time}</td>
                                    <td className="px-3 py-2 text-center text-gray-500">{horse.margin}</td>
                                    <td className="px-3 py-2">{horse.jockey}</td>

                                    <td className="px-3 py-2 text-center">
                                        <span
                                            className={`
                                                ${horse.popular === 1 ? "text-red-600 font-bold" : ""}
                                                ${horse.popular === 2 ? "text-blue-600 font-bold" : ""}
                                                ${horse.popular === 3 ? "text-green-600 font-bold" : ""}
                                            `}
                                        >
                                            {horse.popular}
                                        </span>
                                    </td>

                                    <td className="px-3 py-2 text-right font-mono">{horse.odds}</td>
                                </tr>
                            ))}

                            {/* 6着以降 */}
                            {showAll && others.map((horse) => (
                                <tr key={horse.number} className="border-t bg-gray-50 animate-slideFadeDown">
                                    <td className="px-3 py-2 text-center">{horse.rank}</td>
                                    <td className="px-3 py-2 text-center">
                                        <span
                                            className={`inline-block px-2 py-1 rounded text-xs font-bold ${frameColors[horse.frame]}`}
                                        >
                                            {horse.frame}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-center font-mono">{horse.number}</td>
                                    <td className="px-3 py-2 font-medium">{horse.name}</td>
                                    <td className="px-3 py-2 text-center font-mono">{horse.time}</td>
                                    <td className="px-3 py-2 text-center text-gray-500">{horse.margin}</td>
                                    <td className="px-3 py-2">{horse.jockey}</td>
                                    <td className="px-3 py-2 text-center">{horse.popular}</td>
                                    <td className="px-3 py-2 text-right font-mono">{horse.odds}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* スマホ用カードレイアウト（sm未満） */}
                <div className="sm:hidden p-3 space-y-3">
                    {(showAll ? result.order : top5).map((horse) => (
                        <div
                            key={horse.number}
                            className={`border rounded-lg p-3 shadow-sm ${horse.rank <= 3 ? "bg-yellow-50" : "bg-white"}`}
                        >
                            {/* 上段：着順・枠・馬番・馬名 */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="font-bold w-8 text-center text-lg">
                                    {horse.rank <= 3 ? (
                                        <span
                                            className={`
                                                inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm
                                                ${horse.rank === 1 ? "bg-yellow-400 text-yellow-900" : ""}
                                                ${horse.rank === 2 ? "bg-gray-300 text-gray-700" : ""}
                                                ${horse.rank === 3 ? "bg-orange-300 text-orange-900" : ""}
                                            `}
                                        >
                                            {horse.rank}
                                        </span>
                                    ) : (
                                        horse.rank
                                    )}
                                </div>

                                <span className={`px-2 py-1 rounded text-xs font-bold ${frameColors[horse.frame]}`}>
                                    {horse.frame}
                                </span>

                                <span className="font-mono font-bold text-base">{horse.number}</span>

                                <span className="font-bold text-base flex-1">{horse.name}</span>
                            </div>

                            {/* 騎手 */}
                            <div className="text-sm text-gray-700 mb-2">
                                騎手: {horse.jockey}
                            </div>

                            {/* データグリッド：タイム・着差・人気・オッズを縦揃え */}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {/* 1行目 左: タイム */}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">タイム:</span>
                                    <span className="font-mono font-medium">{horse.time}</span>
                                </div>

                                {/* 1行目 右: オッズ */}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">オッズ:</span>
                                    <span className="font-mono font-medium">{horse.odds}倍</span>
                                </div>

                                {/* 2行目 左: 着差 */}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">着差:</span>
                                    <span className="font-medium">{horse.margin}</span>
                                </div>

                                {/* 2行目 右: 人気（ラベル付きにするならここで整形） */}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">人気:</span>
                                    <span
                                        className={`
                font-medium
                ${horse.popular === 1 ? "text-red-600 font-bold" : ""}
                ${horse.popular === 2 ? "text-blue-600 font-bold" : ""}
                ${horse.popular === 3 ? "text-green-600 font-bold" : ""}
            `}
                                    >
                                        {horse.popular}番人気
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 折りたたみボタン */}
                {others.length > 0 && (
                    <div className="p-3 text-center">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="text-sm text-blue-600 font-bold hover:underline"
                        >
                            {showAll ? "▲ 閉じる" : `▼ 6着以降を表示(${others.length}頭)`}
                        </button>
                    </div>
                )}
            </div>

            {/* 払戻金テーブル */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3">
                    <h3 className="text-white font-bold">払戻金</h3>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(Object.keys(payoutLabels) as Array<keyof Payout>).map((key) => {
                            const items = result.payout[key];
                            if (!items || items.length === 0) return null;

                            return (
                                <div key={key} className="border rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 px-3 py-2 font-bold text-sm">
                                        {payoutLabels[key]}
                                    </div>

                                    <table className="w-full text-sm table-fixed">
                                        <tbody>
                                            {items.map((item, idx) => (
                                                <tr key={idx} className="border-t">
                                                    <td className="px-3 py-2 font-mono text-center">
                                                        {item.numbers.join(" - ")}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-bold text-blue-600 tabular-nums">
                                                        ¥{item.amount.toLocaleString()}
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-gray-500 text-xs tabular-nums">
                                                        {item.popular}人気
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}