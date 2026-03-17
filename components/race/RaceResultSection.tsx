"use client";

import { useState } from "react";
import type { RaceResult, RacePayout } from "@/lib/race/types";

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
const payoutLabels: Record<keyof RacePayout, string> = {
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
    const [showMorePayouts, setShowMorePayouts] = useState(false);

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
        <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-purple-600 text-2xl animate-result">🏇</span>
                レース結果
                <span className="text-purple-600 text-2xl animate-result">🏇</span>
            </h2>

            <div className="space-y-6">
                {/* 競走成績 */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden border border-white/40">

                    {/* 見出し（紫を薄く残す） */}
                    <div className="px-4 py-3 bg-purple-500/20 backdrop-blur-sm border-b border-purple-300/30">
                        <h3 className="text-purple-800 font-bold">競走成績</h3>
                    </div>


                    {/* PC用テーブル（sm以上） */}
                    <div className="overflow-x-auto hidden sm:block">
                        <table className="w-full text-sm text-slate-800" style={{ minWidth: "800px" }}>
                            <colgroup>
                                <col style={{ width: "5%" }} />
                                <col style={{ width: "5%" }} />
                                <col style={{ width: "5%" }} />
                                <col style={{ width: "25%" }} />
                                <col style={{ width: "10%" }} />
                                <col style={{ width: "10%" }} />
                                <col style={{ width: "20%" }} />
                                <col style={{ width: "8%" }} />
                                <col style={{ width: "12%" }} />
                            </colgroup>

                            {/* ヘッダー（薄いグレーに変更） */}
                            <thead className="bg-slate-100/60 border-b border-slate-300/40">
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
                                        className={`
                            border-t border-slate-300/30
                            ${horse.rank <= 3 ? "bg-yellow-100/40" : "bg-white/40"}
                        `}
                                    >
                                        {/* 着順（薄い色に変更） */}
                                        <td className="px-3 py-2 text-center font-bold">
                                            {horse.rank <= 3 ? (
                                                <span
                                                    className={`
                                        inline-flex items-center justify-center w-7 h-7 rounded-full font-bold
                                        ${horse.rank === 1 ? "bg-yellow-400/70 text-yellow-900" : ""}
                                        ${horse.rank === 2 ? "bg-gray-300/70 text-gray-700" : ""}
                                        ${horse.rank === 3 ? "bg-orange-300/70 text-orange-900" : ""}
                                    `}
                                                >
                                                    {horse.rank}
                                                </span>
                                            ) : (
                                                horse.rank
                                            )}
                                        </td>

                                        {/* 枠色（薄く） */}
                                        <td className="px-3 py-2 text-center">
                                            <span
                                                className={`
                                    inline-block px-2 py-1 rounded text-xs font-bold 
                                    ${frameColors[horse.frame]} opacity-80
                                `}
                                            >
                                                {horse.frame}
                                            </span>
                                        </td>

                                        <td className="px-3 py-2 text-center font-mono">{horse.number}</td>
                                        <td className="px-3 py-2 font-medium">{horse.name}</td>
                                        <td className="px-3 py-2 text-center font-mono">{horse.time}</td>

                                        <td className="px-3 py-2 text-center text-slate-500">{horse.margin}</td>
                                        <td className="px-3 py-2">{horse.jockey}</td>

                                        {/* 人気（元の色を薄く） */}
                                        <td className="px-3 py-2 text-center">
                                            <span
                                                className={`
                                    font-bold
                                    ${horse.popular === 1 ? "text-red-600/80" : ""}
                                    ${horse.popular === 2 ? "text-blue-600/80" : ""}
                                    ${horse.popular === 3 ? "text-green-600/80" : ""}
                                `}
                                            >
                                                {horse.popular}
                                            </span>
                                        </td>

                                        <td className="px-3 py-2 text-right font-mono">{horse.odds}</td>
                                    </tr>
                                ))}

                                {/* 6着以降 */}
                                {showAll &&
                                    others.map((horse) => (
                                        <tr
                                            key={horse.number}
                                            className="border-t border-slate-300/30 bg-slate-50/40 animate-slideFadeDown"
                                        >
                                            <td className="px-3 py-2 text-center">{horse.rank}</td>
                                            <td className="px-3 py-2 text-center">
                                                <span
                                                    className={`
                                        inline-block px-2 py-1 rounded text-xs font-bold 
                                        ${frameColors[horse.frame]} opacity-80
                                    `}
                                                >
                                                    {horse.frame}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center font-mono">{horse.number}</td>
                                            <td className="px-3 py-2 font-medium">{horse.name}</td>
                                            <td className="px-3 py-2 text-center font-mono">{horse.time}</td>
                                            <td className="px-3 py-2 text-center text-slate-500">{horse.margin}</td>
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
                                className={`
                border rounded-xl p-4 shadow-sm 
                bg-white/70 backdrop-blur-sm 
                border-white/40
                ${horse.rank <= 3 ? "bg-yellow-100/40" : ""}
            `}
                            >
                                {/* 上段：着順・枠・馬番・馬名・騎手 */}
                                <div className="flex items-center gap-2 mb-3">

                                    {/* 着順バッジ（薄い色に変更） */}
                                    <div className="font-bold w-8 text-center text-lg">
                                        {horse.rank <= 3 ? (
                                            <span
                                                className={`
                                inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm
                                ${horse.rank === 1 ? "bg-yellow-400/70 text-yellow-900" : ""}
                                ${horse.rank === 2 ? "bg-gray-300/70 text-gray-700" : ""}
                                ${horse.rank === 3 ? "bg-orange-300/70 text-orange-900" : ""}
                            `}
                                            >
                                                {horse.rank}
                                            </span>
                                        ) : (
                                            horse.rank
                                        )}
                                    </div>

                                    {/* 枠色（元の色を薄く） */}
                                    <span
                                        className={`
                        px-2 py-1 rounded text-xs font-bold 
                        ${frameColors[horse.frame]} 
                        opacity-80
                    `}
                                    >
                                        {horse.frame}
                                    </span>

                                    {/* 馬番 */}
                                    <span className="font-mono font-bold text-base text-slate-800">
                                        {horse.number}
                                    </span>

                                    {/* 馬名 */}
                                    <span className="font-bold text-base truncate flex-1 min-w-0 text-slate-800">
                                        {horse.name}
                                    </span>

                                    {/* 騎手 */}
                                    <span className="text-sm text-slate-600 shrink-0 ml-2">
                                        {horse.jockey}
                                    </span>
                                </div>

                                {/* データグリッド */}
                                <div className="grid grid-cols-2 gap-2 text-sm">

                                    {/* タイム */}
                                    <div className="grid grid-cols-[auto_auto] gap-1 justify-end">
                                        <span className="text-slate-500 text-right">タイム:</span>

                                        {horse.rank === 1 ? (
                                            <span className="px-3 py-1 rounded-full bg-yellow-200/60 text-yellow-900 text-sm font-mono font-bold shadow-sm">
                                                {horse.time}
                                            </span>
                                        ) : (
                                            <span className="font-mono font-medium text-right text-slate-700">
                                                {horse.time}
                                            </span>
                                        )}
                                    </div>

                                    {/* オッズ（元の色を薄く） */}
                                    <div className="grid grid-cols-[auto_auto] gap-1 justify-end">
                                        <span className="text-slate-500 text-right">オッズ:</span>

                                        <span
                                            className={`
      px-2 py-0.5 rounded-full text-xs font-mono font-bold
      ${horse.odds != null
                                                    ? horse.odds >= 100
                                                        ? "bg-red-100/60 text-red-700"
                                                        : horse.odds > 10
                                                            ? "bg-blue-100/60 text-blue-700"
                                                            : "bg-green-100/60 text-green-700"
                                                    : "bg-slate-100/60 text-slate-500"
                                                }
    `}
                                        >
                                            {horse.odds != null ? `${horse.odds}倍` : "-"}
                                        </span>
                                    </div>

                                    {/* 着差 */}
                                    <div className="grid grid-cols-[auto_auto] gap-1 justify-end">
                                        <span className="text-slate-500 text-right">着差:</span>
                                        <span className="font-medium text-right text-slate-700">
                                            {horse.margin ?? "-"}
                                        </span>
                                    </div>

                                    {/* 人気（元の色を薄く） */}
                                    <div className="grid grid-cols-[auto_auto] gap-1 justify-end">
                                        <span className="text-slate-500 text-right">人気:</span>

                                        <span
                                            className={`
      px-2 py-0.5 rounded-full text-xs font-bold text-right
      ${horse.popular === 1
                                                    ? "bg-red-100/60 text-red-700"
                                                    : horse.popular === 2
                                                        ? "bg-blue-100/60 text-blue-700"
                                                        : horse.popular === 3
                                                            ? "bg-green-100/60 text-green-700"
                                                            : horse.popular != null
                                                                ? "bg-slate-100/60 text-slate-700"
                                                                : "bg-slate-100/60 text-slate-400"
                                                }
    `}
                                        >
                                            {horse.popular != null ? `${horse.popular}人気` : "-"}
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
                                className="
                text-sm font-bold 
                text-blue-600/80 hover:text-blue-700 
                hover:underline transition
            "
                            >
                                {showAll ? "▲ 閉じる" : `▼ 6着以降を表示(${others.length}頭)`}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}